import axios from "axios";

const WS_API_URL = process.env.WS_API_URL;
const ENV_TOKEN = process.env.ENV_TOKEN;

// Notifica o WhatsApp Store quando um ticket novo é criado no SinapCRM.
// Fire-and-forget — nunca bloqueia o fluxo principal.
export async function notifyWsNewTicket({
  companyId,
  ticketId,
  contactName,
  contactNumber,
}: {
  companyId: number;
  ticketId: number;
  contactName: string;
  contactNumber: string;
}): Promise<void> {
  if (!WS_API_URL) return;

  await axios.post(
    `${WS_API_URL}/api/crm-inbound/ticket`,
    { companyId, ticketId, contactName, contactNumber },
    {
      headers: { Authorization: `Bearer ${ENV_TOKEN}` },
      timeout: 8000,
    }
  );
}
