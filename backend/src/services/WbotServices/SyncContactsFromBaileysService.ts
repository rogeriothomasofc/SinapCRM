import Baileys from "../../models/Baileys";
import Whatsapp from "../../models/Whatsapp";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";
import { logger } from "../../utils/logger";

interface Request {
  whatsappId: number;
}

interface Response {
  synced: number;
  skipped: number;
}

const SyncContactsFromBaileysService = async ({ whatsappId }: Request): Promise<Response> => {
  const whatsapp = await Whatsapp.findByPk(whatsappId);
  if (!whatsapp) throw new Error("WhatsApp connection not found");

  const baileys = await Baileys.findOne({ where: { whatsappId } });
  if (!baileys || !baileys.contacts) return { synced: 0, skipped: 0 };

  let contactsRaw: any[];
  try {
    const raw = baileys.contacts;
    contactsRaw = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return { synced: 0, skipped: 0 };
  }

  if (!Array.isArray(contactsRaw)) return { synced: 0, skipped: 0 };

  let synced = 0;
  let skipped = 0;

  for (const c of contactsRaw) {
    try {
      if (!c.id) { skipped++; continue; }
      if (c.id.endsWith("@broadcast") || c.id === "status@broadcast") { skipped++; continue; }

      const isGroup = c.id.endsWith("@g.us");
      const number = c.id.replace(/[^0-9]/g, "");
      if (!number) { skipped++; continue; }

      const name = c.name || c.notify || c.verifiedName || number;

      await CreateOrUpdateContactService({
        name,
        number,
        isGroup,
        companyId: whatsapp.companyId,
        whatsappId,
      });

      synced++;
    } catch (err) {
      logger.warn(`SyncContacts: skipping ${c.id}: ${err.message}`);
      skipped++;
    }
  }

  logger.info(`SyncContacts whatsapp ${whatsappId}: ${synced} synced, ${skipped} skipped`);
  return { synced, skipped };
};

export default SyncContactsFromBaileysService;
