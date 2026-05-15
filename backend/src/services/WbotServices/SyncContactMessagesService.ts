import { WAMessage } from "baileys";
import * as Sentry from "@sentry/node";

import Contact from "../../models/Contact";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import { getWbot } from "../../libs/wbot";
import { logger } from "../../utils/logger";
import { getBodyMessage, getTypeMessage } from "./wbotMessageListener";

interface Request {
  contactId: number;
  dateFrom: string;
  dateTo: string;
  companyId: number;
}

const getTimestamp = (msg: WAMessage): number => {
  const ts = msg.messageTimestamp;
  if (!ts) return 0;
  if (typeof ts === "number") return ts;
  return (ts as any).low ?? (ts as any).toNumber?.() ?? 0;
};

const SyncContactMessagesService = async ({
  contactId,
  dateFrom,
  dateTo,
  companyId,
}: Request): Promise<{ synced: number }> => {
  const contact = await Contact.findByPk(contactId);
  if (!contact) throw new Error("Contato não encontrado");
  if (!contact.whatsappId) throw new Error("Contato sem conexão WhatsApp associada");

  const wbot = getWbot(contact.whatsappId);

  // Suporta números brasileiros 8 e 9 dígitos (migração DDD)
  const buildJids = (number: string, isGroup: boolean): string[] => {
    if (isGroup) return [`${number}@g.us`];
    const jids = [`${number}@s.whatsapp.net`];
    // Se 12 dígitos: 55 + DDD(2) + 8 dígitos → tenta versão com 9 dígitos
    if (/^55\d{10}$/.test(number)) {
      const nineDigit = number.slice(0, 4) + "9" + number.slice(4);
      jids.push(`${nineDigit}@s.whatsapp.net`);
    }
    // Se 13 dígitos: 55 + DDD(2) + 9 dígitos → tenta versão com 8 dígitos
    if (/^55\d{11}$/.test(number)) {
      const eightDigit = number.slice(0, 4) + number.slice(5);
      jids.push(`${eightDigit}@s.whatsapp.net`);
    }
    return jids;
  };

  const jids = buildJids(contact.number, contact.isGroup);

  const fromTs = Math.floor(new Date(dateFrom).getTime() / 1000);
  // dateTo inclui o dia inteiro
  const toDate = new Date(dateTo);
  toDate.setHours(23, 59, 59, 999);
  const toTs = Math.floor(toDate.getTime() / 1000);
  const toTsMs = toDate.getTime();

  // Cursor: oldest existing message for this contact, or empty to get latest
  const oldestMsg = await Message.findOne({
    include: [{ model: Ticket, as: "ticket", where: { contactId, companyId }, required: true }],
    order: [["createdAt", "ASC"]],
  });

  const cursorId = oldestMsg ? oldestMsg.id : "";
  const cursorFromMe = oldestMsg ? !!oldestMsg.fromMe : false;

  const processMessages = async (messages: WAMessage[]): Promise<{ synced: number }> => {
    const filtered = messages.filter(m => {
      if (!m.key?.remoteJid || !m.message) return false;
      if (!jids.includes(m.key.remoteJid)) return false;
      const ts = getTimestamp(m);
      return ts >= fromTs && ts <= toTs;
    });

    if (filtered.length === 0) return { synced: 0 };

    let ticket = await Ticket.findOne({
      where: { contactId, companyId },
      order: [["updatedAt", "DESC"]],
    });

    if (!ticket) {
      ticket = await Ticket.create({
        contactId,
        companyId,
        whatsappId: contact.whatsappId,
        status: "closed",
        isGroup: contact.isGroup,
        lastMessage: "Histórico importado",
      } as any);
    }

    let synced = 0;
    for (const msg of filtered.sort((a, b) => getTimestamp(a) - getTimestamp(b))) {
      try {
        const msgId = msg.key.id;
        if (!msgId) continue;

        const exists = await Message.count({ where: { id: msgId, companyId } });
        if (exists) continue;

        const body = getBodyMessage(msg as any) || "";
        const mediaType = getTypeMessage(msg as any);
        const ts = getTimestamp(msg);
        const msgDate = ts ? new Date(ts * 1000) : new Date();

        await Message.create({
          id: msgId,
          ticketId: ticket.id,
          contactId: msg.key.fromMe ? null : contactId,
          body,
          fromMe: !!msg.key.fromMe,
          read: true,
          mediaType,
          ack: 3,
          companyId,
          createdAt: msgDate,
          updatedAt: msgDate,
        } as any);

        synced++;
      } catch (err) {
        Sentry.captureException(err);
        logger.warn(`SyncContactMessages: erro msg ${msg.key?.id}: ${err.message}`);
      }
    }

    if (synced > 0) {
      const last = filtered[filtered.length - 1];
      await ticket.update({ lastMessage: getBodyMessage(last as any) || "Mídia" });
    }

    return { synced };
  };

  return new Promise<{ synced: number }>(resolve => {
    let done = false;
    let timer: NodeJS.Timeout;

    const unsub = wbot.ev.process(async (events) => {
      if (!events["messaging-history.set"] || done) return;
      done = true;
      clearTimeout(timer);
      unsub();
      const msgs = events["messaging-history.set"].messages;
      logger.info(`SyncContactMessages: messaging-history.set recebido com ${msgs?.length ?? 0} msgs para contato ${contactId}`);
      const result = await processMessages(msgs);
      resolve(result);
    });

    timer = setTimeout(() => {
      if (!done) {
        done = true;
        unsub();
        logger.warn(`SyncContactMessages: timeout contato ${contactId} — celular principal pode estar offline ou não há histórico para este JID`);
        resolve({ synced: 0 });
      }
    }, 30000);

    // Tenta todos os JIDs possíveis (8 e 9 dígitos) em paralelo
    const fetchPromises = jids.map(jid =>
      wbot.fetchMessageHistory(
        100,
        { remoteJid: jid, fromMe: cursorFromMe, id: cursorId },
        toTsMs
      ).catch((err: any) => logger.warn(`SyncContactMessages: fetchMessageHistory ${jid}: ${err.message}`))
    );

    Promise.allSettled(fetchPromises).then(results => {
      const allFailed = results.every(r => r.status === "rejected");
      if (allFailed && !done) {
        done = true;
        clearTimeout(timer);
        unsub();
        logger.error(`SyncContactMessages: todos os fetchMessageHistory falharam para contato ${contactId}`);
        resolve({ synced: 0 });
      }
    });
  });
};

export default SyncContactMessagesService;
