import Contact from "../models/Contact";

const getContactJid = (contact: Contact | { number: string; lidJid?: string }, isGroup: boolean = false): string => {
  if (isGroup) return `${contact.number}@g.us`;
  if (contact.lidJid) return contact.lidJid;
  return `${contact.number}@s.whatsapp.net`;
};

export default getContactJid;
