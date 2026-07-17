import { getIO } from "../../libs/socket";
import Contact from "../../models/Contact";
import ContactCustomField from "../../models/ContactCustomField";
import { isNil } from "lodash";
interface ExtraInfo extends ContactCustomField {
  name: string;
  value: string;
}

interface Request {
  name: string;
  number: string;
  isGroup: boolean;
  email?: string;
  profilePicUrl?: string;
  companyId: number;
  extraInfo?: ExtraInfo[];
  whatsappId?: number;
  lidJid?: string;
}

const CreateOrUpdateContactService = async ({
  name,
  number: rawNumber,
  profilePicUrl,
  isGroup,
  email = "",
  companyId,
  extraInfo = [],
  whatsappId,
  lidJid
}: Request): Promise<Contact> => {
  const number = isGroup ? rawNumber : rawNumber.replace(/[^0-9]/g, "");

  // @lid IDs do WhatsApp chegam como sequências de 15+ dígitos — nenhum número real E.164 excede 13 dígitos na prática
  if (!isGroup && number.length >= 15) {
    throw new Error(`Número inválido (possível @lid): ${number}`);
  }

  const io = getIO();
  let contact: Contact | null;

  // Se temos um lidJid, procura por ele primeiro para evitar duplicatas
  if (lidJid) {
    const { Op } = require("sequelize");
    contact = await Contact.findOne({
      where: {
        companyId,
        [Op.or]: [{ lidJid }, { number }]
      }
    });
  } else {
    contact = await Contact.findOne({
      where: { number, companyId }
    });
  }

  if (contact) {
    const updateData: any = { profilePicUrl };
    if (lidJid && !contact.lidJid) updateData.lidJid = lidJid;
    if (!isNil(contact.whatsappId === null)) updateData.whatsappId = whatsappId;
    contact.update(updateData);
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact`, {
      action: "update",
      contact
    });
  } else {
    contact = await Contact.create({
      name,
      number,
      profilePicUrl,
      email,
      isGroup,
      extraInfo,
      companyId,
      whatsappId,
      lidJid
    });

    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact`, {
      action: "create",
      contact
    });
  }

  return contact;
};

export default CreateOrUpdateContactService;
