import * as Yup from "yup";
import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import SyncContactMessagesService from "../services/WbotServices/SyncContactMessagesService";

import ListContactsService from "../services/ContactServices/ListContactsService";
import CreateContactService from "../services/ContactServices/CreateContactService";
import ShowContactService from "../services/ContactServices/ShowContactService";
import UpdateContactService from "../services/ContactServices/UpdateContactService";
import DeleteContactService from "../services/ContactServices/DeleteContactService";
import GetContactService from "../services/ContactServices/GetContactService";

import CheckContactNumber from "../services/WbotServices/CheckNumber";
import CheckIsValidContact from "../services/WbotServices/CheckIsValidContact";
import GetProfilePicUrl from "../services/WbotServices/GetProfilePicUrl";
import AppError from "../errors/AppError";
import SimpleListService, {
  SearchContactParams
} from "../services/ContactServices/SimpleListService";
import ContactCustomField from "../models/ContactCustomField";
import { logger } from "../utils/logger";
import ToggleDisableBotContactService from "../services/ContactServices/ToggleDisableBotContactService";
import Ticket from "../models/Ticket";
import Queue from "../models/Queue";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

type IndexGetContactQuery = {
  name: string;
  number: string;
};

interface ExtraInfo extends ContactCustomField {
  name: string;
  value: string;
}
interface ContactData {
  name: string;
  number: string;
  email?: string;
  extraInfo?: ExtraInfo[];
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { contacts, count, hasMore } = await ListContactsService({
    searchParam,
    pageNumber,
    companyId
  });

  return res.json({ contacts, count, hasMore });
};

export const getContact = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { name, number } = req.body as IndexGetContactQuery;
  const { companyId } = req.user;

  const contact = await GetContactService({
    name,
    number,
    companyId
  });

  return res.status(200).json(contact);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const newContact: ContactData = req.body;
  newContact.number = newContact.number.replace(/\D/g, '');

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    number: Yup.string()
      .required()
      .matches(/^\d+$/, "Invalid number format. Only numbers is allowed.")
  });

  const contact = await createNewContact(newContact,companyId,schema);

  return res.status(200).json(contact);
};

export const storeUpload = async (req: Request, res: Response) : Promise<Response> => {

  const {companyId} = req.user;
  const contacts = req.body;

  let errorBag = [];
  let contactAdded = [];

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    number: Yup.string().required()
  });

  const promises = contacts.map(async contact => {

    const newContact : ContactData = {name: contact.Nome, number: contact.Telefone.replace(/\D/g, '')}

    try{

      const contact = await createUploadedContact( newContact, companyId, schema )
      contactAdded.push( {contactName: contact.name, contactId: contact.id} );

    }catch(e){
      errorBag.push({contactName: contact.Nome, error: e || e.message});
    }
  });

  await Promise.all(promises);

  return res.status(200).json({newContacts: contactAdded, errorBag: errorBag});
}

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { contactId } = req.params;
  const { companyId } = req.user;

  const contact = await ShowContactService(contactId, companyId);

  return res.status(200).json(contact);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const contactData: ContactData = req.body;
  const { companyId } = req.user;

  contactData.number = contactData.number.replace(/\D/g, '');

  const schema = Yup.object().shape({
    name: Yup.string(),
    number: Yup.string().matches(
      /^\d+$/,
      "Invalid number format. Only numbers is allowed."
    )
  });

  try {
    await schema.validate(contactData);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  contactData.number = contactData.number.replace(/\D/g, "");

  const { contactId } = req.params;

  // Only validate number via WhatsApp if it actually changed
  const existingContact = await ShowContactService(contactId, companyId);
  const numberChanged = existingContact.number !== contactData.number;

  if (numberChanged) {
    await CheckIsValidContact(contactData.number, companyId);
    try {
      const validNumber = await CheckContactNumber(contactData.number, companyId);
      contactData.number = validNumber.jid.replace(/\D/g, "");
    } catch (err) {
      logger.warn(`CheckContactNumber falhou para ${contactData.number}: ${err}`);
    }
  }

  const contact = await UpdateContactService({
    contactData,
    contactId,
    companyId
  });

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact`, {
    action: "update",
    contact
  });

  return res.status(200).json(contact);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { contactId } = req.params;
  const { companyId } = req.user;

  await ShowContactService(contactId, companyId);

  await DeleteContactService(contactId);

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact`, {
    action: "delete",
    contactId
  });

  return res.status(200).json({ message: "Contact deleted" });
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { name } = req.query as unknown as SearchContactParams;
  const { companyId } = req.user;

  const contacts = await SimpleListService({ name, companyId });

  return res.json(contacts);
};

const createNewContact = async ( newContact : ContactData, companyId : number, schema : any ) => {

    try{
      await schema.validate(newContact);
    }catch(err:any){
      throw new AppError(err.message);
    }

    logger.info(newContact);

    await CheckIsValidContact(newContact.number, companyId);
    const number = newContact.number.replace(/\D/g, "");
    const validNumber = await CheckContactNumber(number, companyId);

    if( !validNumber )
      throw new AppError("Não foi possível localizar o número informado no Whatsapp");

    newContact.number = number;

    /**
     * Código desabilitado por demora no retorno
     */
    // const profilePicUrl = await GetProfilePicUrl(validNumber.jid, companyId);

    const contact = await CreateContactService({
      ...newContact,
      // profilePicUrl,
      companyId
    });

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact`, {
      action: "create",
      contact
    });

    return contact;
}

const createUploadedContact = async ( newContact : ContactData, companyId : number, schema : any) => {

  try{
    await schema.validate(newContact);
  }catch(err:any){
    throw new AppError(err.message);
  }

  newContact.number = newContact.number.replace(/\D/g, "");
  const contact = await CreateContactService({
    ...newContact,
    companyId
  });

  const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact`, {
      action: "create",
      contact
    });

  return contact;
}

export const syncWhatsapp = async (req: Request, res: Response): Promise<Response> => {
  const { contactId } = req.params;
  const { companyId } = req.user;

  const contact = await ShowContactService(contactId, companyId);

  const profilePicUrl = await GetProfilePicUrl(contact.number, companyId);

  await contact.update({ profilePicUrl });

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact`, {
    action: "update",
    contact: { ...contact.toJSON(), profilePicUrl }
  });

  return res.status(200).json({ profilePicUrl });
};

export const listContactTickets = async (req: Request, res: Response): Promise<Response> => {
  const { contactId } = req.params;
  const { companyId } = req.user;

  const tickets = await Ticket.findAll({
    where: { contactId, companyId },
    include: [{ model: Queue, as: "queue", attributes: ["id", "name"] }],
    attributes: ["id", "status", "lastMessage", "updatedAt", "queueId"],
    order: [["updatedAt", "DESC"]],
    limit: 50
  });

  return res.status(200).json(tickets);
};

export const toggleDisableBot = async (req: Request, res: Response): Promise<Response> => {
  var { contactId } = req.params;
  const { companyId } = req.user;
  const contact = await ToggleDisableBotContactService({ contactId });

  const io = getIO();
  io.of(String(companyId))
    .emit(`company-${companyId}-contact`, {
      action: "update",
      contact
    });

  return res.status(200).json(contact);
};

export const syncMessages = async (req: Request, res: Response): Promise<Response> => {
  const { contactId } = req.params;
  const { dateFrom, dateTo } = req.body;
  const { companyId } = req.user;

  const result = await SyncContactMessagesService({
    contactId: Number(contactId),
    dateFrom,
    dateTo,
    companyId,
  });

  return res.status(200).json(result);
};
