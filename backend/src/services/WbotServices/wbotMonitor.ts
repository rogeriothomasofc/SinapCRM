import {
  WASocket,
  BinaryNode,
  Contact as BContact,
  WAMessage,
} from "baileys";
import * as Sentry from "@sentry/node";

import { Op } from "sequelize";
// import { getIO } from "../../libs/socket";
import { Store } from "../../libs/store";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import Setting from "../../models/Setting";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";
import createOrUpdateBaileysService from "../BaileysServices/CreateOrUpdateBaileysService";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";
import CreateMessageService from "../MessageServices/CreateMessageService";
import Company from "../../models/Company";
import { getBodyMessage, getTypeMessage } from "./wbotMessageListener";

const parseImportDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  const [datePart, timePart] = dateStr.split(" ");
  const parts = datePart.split("/");
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  const [hour, minute] = (timePart || "00:00").split(":");
  const d = new Date(+year, +month - 1, +day, +hour || 0, +minute || 0);
  return isNaN(d.getTime()) ? null : d;
};

const getMsgTimestamp = (msg: WAMessage): number => {
  const ts = msg.messageTimestamp;
  if (!ts) return 0;
  if (typeof ts === "number") return ts;
  return (ts as any).low ?? (ts as any).toNumber?.() ?? 0;
};

const resolveContactForJid = async (
  jid: string,
  companyId: number
): Promise<Contact | null> => {
  const number = jid.replace(/\D/g, "");
  if (!number) return null;

  let contact = await Contact.findOne({ where: { number, companyId } });
  if (contact) return contact;

  // Try alternate Brazilian 8↔9 digit format
  let alt: string | null = null;
  if (/^55\d{11}$/.test(number)) {
    alt = number.slice(0, 4) + number.slice(5); // 9-digit → 8-digit
  } else if (/^55\d{10}$/.test(number)) {
    alt = number.slice(0, 4) + "9" + number.slice(4); // 8-digit → 9-digit
  }
  if (alt) contact = await Contact.findOne({ where: { number: alt, companyId } });
  return contact || null;
};

type Session = WASocket & {
  id?: number;
  store?: Store;
};

interface IContact {
  contacts: BContact[];
}

const wbotMonitor = async (
  wbot: Session,
  whatsapp: Whatsapp,
  companyId: number
): Promise<void> => {
  try {
    wbot.ws.on("CB:call", async (node: BinaryNode) => {
      const content = node.content[0] as any;

      if (content.tag === "offer") {
        const { from, id } = node.attrs;

      }

      if (content.tag === "terminate") {
        const sendMsgCall = await Setting.findOne({
          where: { key: "call", companyId },
        });

        const translatedMessage = {
          'pt': "*Mensagem Automática:*\n\nAs chamadas de voz e vídeo estão desabilitas para esse WhatsApp, favor enviar uma mensagem de texto. Obrigado",
          'en': "*Automatic Message:*\n\nVoice and video calls are disabled for this WhatsApp, please send a text message. Thank you",
          'es': "*Mensaje Automático:*\n\nLas llamadas de voz y video están deshabilitadas para este WhatsApp, por favor envía un mensaje de texto. Gracias"
        }

        if (sendMsgCall.value === "disabled") {

          const company = await Company.findByPk(companyId);

          await wbot.sendMessage(node.attrs.from, {
            text:
              translatedMessage[company.language],
          });

          const number = node.attrs.from.replace(/\D/g, "");

          const contact = await Contact.findOne({
            where: { companyId, number },
          });

          const ticket = await Ticket.findOne({
            where: {
              contactId: contact.id,
              whatsappId: wbot.id,
              //status: { [Op.or]: ["close"] },
              companyId
            },
          });
          // se não existir o ticket não faz nada.
          if (!ticket) return;

          const date = new Date();
          const hours = date.getHours();
          const minutes = date.getMinutes();

          const body = `Chamada de voz/vídeo perdida às ${hours}:${minutes}`;
          const messageData = {
            id: content.attrs["call-id"],
            ticketId: ticket.id,
            contactId: contact.id,
            body,
            fromMe: false,
            mediaType: "call_log",
            read: true,
            quotedMsgId: null,
            ack: 1,
          };

          await ticket.update({
            lastMessage: body,
          });


          if(ticket.status === "closed") {
            await ticket.update({
              status: "pending",
            });
          }

          return CreateMessageService({ messageData, companyId: companyId });
        }
      }
    });

    wbot.ev.process(async (events) => {
      if (!events["messaging-history.set"]) return;
      const { messages } = events["messaging-history.set"] as { messages: WAMessage[] };
      logger.info(`messaging-history.set: ${messages?.length ?? 0} msgs recebidas para whatsapp ${whatsapp.id}`);
      if (!messages?.length) return;

      const freshWhatsapp = await Whatsapp.findByPk(whatsapp.id);
      const importFromTs = freshWhatsapp?.importOldMessages
        ? Math.floor((parseImportDate(freshWhatsapp.importOldMessages)?.getTime() ?? 0) / 1000)
        : null;
      const importToTs = freshWhatsapp?.importRecentMessages
        ? Math.floor((parseImportDate(freshWhatsapp.importRecentMessages)?.getTime() ?? 0) / 1000)
        : null;

      let saved = 0;
      for (const msg of messages) {
        try {
          const jid = msg.key?.remoteJid;
          if (!jid || !msg.message) continue;
          if (jid.endsWith("@broadcast")) continue;
          const msgId = msg.key.id;
          if (!msgId) continue;

          if (importFromTs || importToTs) {
            const ts = getMsgTimestamp(msg);
            if (importFromTs && ts < importFromTs) continue;
            if (importToTs && ts > importToTs) continue;
          }

          const contact = await resolveContactForJid(jid, companyId);
          if (!contact) continue;

          const exists = await Message.count({ where: { id: msgId, companyId } });
          if (exists) continue;

          let ticket = await Ticket.findOne({
            where: { contactId: contact.id, companyId },
            order: [["updatedAt", "DESC"]],
          });
          if (!ticket) {
            ticket = await Ticket.create({
              contactId: contact.id,
              companyId,
              whatsappId: whatsapp.id,
              status: "closed",
              isGroup: contact.isGroup,
              lastMessage: "Histórico importado",
            } as any);
          }

          const body = getBodyMessage(msg as any) || "";
          const mediaType = getTypeMessage(msg as any);
          const ts = getMsgTimestamp(msg);
          const msgDate = ts ? new Date(ts * 1000) : new Date();

          await Message.create({
            id: msgId,
            ticketId: ticket.id,
            contactId: msg.key.fromMe ? null : contact.id,
            body,
            fromMe: !!msg.key.fromMe,
            read: true,
            mediaType,
            ack: 3,
            companyId,
            createdAt: msgDate,
            updatedAt: msgDate,
          } as any);

          saved++;
        } catch (err) {
          logger.warn(`messaging-history.set: erro msg ${msg.key?.id}: ${err.message}`);
        }
      }

      if (saved > 0) {
        logger.info(`messaging-history.set: ${saved} mensagens salvas para whatsapp ${whatsapp.id}`);
      }
    });

    wbot.ev.on("contacts.upsert", async (contacts: BContact[]) => {

      await createOrUpdateBaileysService({
        whatsappId: whatsapp.id,
        contacts,
      });

      for (const bContact of contacts) {
        try {
          if (!bContact.id) continue;
          if (bContact.id.endsWith("@broadcast")) continue;

          const isGroup = bContact.id.endsWith("@g.us");
          const number = bContact.id.replace(/\D/g, "");
          if (!number) continue;

          const name = bContact.name || bContact.notify || bContact.verifiedName || number;

          await CreateOrUpdateContactService({
            name,
            number,
            isGroup,
            companyId,
            whatsappId: whatsapp.id,
          });
        } catch (err) {
          logger.warn(`contacts.upsert: erro ao sincronizar contato ${bContact.id}: ${err.message}`);
        }
      }
    });

  } catch (err) {
    Sentry.captureException(err);
    logger.error(err);
  }
};

export default wbotMonitor;
