import { createHash } from "crypto";
import Setting from "../models/Setting";
import CAPIEvent from "../models/CAPIEvent";

interface CTWALeadEvent {
  ctwaClid: string;
  phoneNumber?: string;
  companyId: number;
  ticketId?: number;
  eventName?: "Lead" | "Contact" | "CompleteRegistration" | "Purchase";
  value?: number;
  currency?: string;
}

export interface CAPIRules {
  leadOnNewFromAd: boolean;
  completeOnClose: boolean;
  eventOnClose: "Lead" | "CompleteRegistration" | "Purchase";
}

export interface ErrorDiagnosis {
  code: string;
  label: string;
  fix: string;
}

const META_GRAPH_VERSION = "v19.0";

export function diagnoseError(errorMessage: string | null): ErrorDiagnosis | null {
  if (!errorMessage) return null;
  const msg = errorMessage.toLowerCase();

  if (msg.includes("ctwa_clid") || msg.includes("ctwaclid")) {
    return {
      code: "ctwa_clid_expired",
      label: "CTWA Click ID expirado",
      fix: "O ctwa_clid expira em 7 dias após o clique no anúncio. Eventos de anúncios antigos não podem ser reenviados."
    };
  }
  if ((msg.includes("invalid") || msg.includes("expired")) && (msg.includes("token") || msg.includes("access"))) {
    return {
      code: "invalid_token",
      label: "Token de acesso inválido ou expirado",
      fix: "Gere um novo token na Meta for Developers e atualize em Configurações → Meta CAPI."
    };
  }
  if (msg.includes("waba") || msg.includes("whatsapp_business_account")) {
    return {
      code: "no_waba_linked",
      label: "WABA não vinculado ao pixel",
      fix: "Acesse Meta Events Manager e vincule sua conta WhatsApp Business ao pixel."
    };
  }
  if (msg.includes("pixel") || msg.includes("dataset") || msg.includes("\"code\":190")) {
    return {
      code: "pixel_not_found",
      label: "Pixel não encontrado",
      fix: "Verifique se o Pixel ID está correto em Configurações → Meta CAPI."
    };
  }
  if (msg.includes("permission") || msg.includes("403")) {
    return {
      code: "permission_denied",
      label: "Sem permissão",
      fix: "O token não tem permissão ads_management. Gere um novo token com as permissões corretas."
    };
  }
  return {
    code: "unknown",
    label: "Erro desconhecido",
    fix: "Verifique as credenciais do Meta CAPI em Configurações."
  };
}

async function getCredentials(companyId: number) {
  const [pixelSetting, tokenSetting, enabledSetting] = await Promise.all([
    Setting.findOne({ where: { companyId, key: "metaPixelId" } }),
    Setting.findOne({ where: { companyId, key: "metaAccessToken" } }),
    Setting.findOne({ where: { companyId, key: "metaCAPIEnabled" } })
  ]);
  return {
    pixelId: pixelSetting?.value || "",
    accessToken: tokenSetting?.value || "",
    enabled: enabledSetting?.value === "enabled"
  };
}

export async function getCAPIRules(companyId: number): Promise<CAPIRules> {
  const defaults: CAPIRules = {
    leadOnNewFromAd: true,
    completeOnClose: true,
    eventOnClose: "CompleteRegistration"
  };
  const setting = await Setting.findOne({ where: { companyId, key: "capiRules" } });
  if (!setting?.value) return defaults;
  try {
    return { ...defaults, ...JSON.parse(setting.value) };
  } catch {
    return defaults;
  }
}

async function dispatchToMeta(
  pixelId: string,
  accessToken: string,
  eventPayload: Record<string, unknown>
): Promise<{ status: "sent" | "failed"; responsePayload: string | null; errorMessage: string | null }> {
  const url = `https://graph.facebook.com/${META_GRAPH_VERSION}/${pixelId}/events?access_token=${accessToken}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [eventPayload] })
    });
    const resText = await res.text();
    if (!res.ok) {
      return { status: "failed", responsePayload: resText, errorMessage: resText };
    }
    return { status: "sent", responsePayload: resText, errorMessage: null };
  } catch (e: any) {
    const msg = e?.message || String(e);
    return { status: "failed", responsePayload: null, errorMessage: msg };
  }
}

function buildUserData(ctwaClid: string, phoneNumber?: string | null): Record<string, string> {
  const userData: Record<string, string> = { ctwa_clid: ctwaClid };
  if (phoneNumber) {
    const normalized = phoneNumber.replace(/\D/g, "");
    userData.ph = createHash("sha256").update(normalized).digest("hex");
  }
  return userData;
}

export async function sendCAPIEvent(data: CTWALeadEvent): Promise<void> {
  const { ctwaClid, phoneNumber, companyId, ticketId, eventName = "Lead", value, currency } = data;
  if (!ctwaClid) return;

  const { pixelId, accessToken, enabled } = await getCredentials(companyId);
  if (!enabled || !pixelId || !accessToken) return;

  const eventPayload: Record<string, unknown> = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    action_source: "business_messaging",
    messaging_channel: "whatsapp",
    user_data: buildUserData(ctwaClid, phoneNumber)
  };
  if (value !== undefined && currency) {
    eventPayload.custom_data = { value, currency };
  }

  const { status, responsePayload, errorMessage } = await dispatchToMeta(pixelId, accessToken, eventPayload);

  if (status === "failed") {
    console.error(`[MetaCAPI] Erro ao enviar evento ${eventName}:`, errorMessage);
  } else {
    console.log(`[MetaCAPI] Evento ${eventName} enviado — ctwa_clid: ${ctwaClid}`);
  }

  if (ticketId) {
    try {
      await CAPIEvent.create({
        ticketId,
        companyId,
        ctwaClid,
        eventName,
        phoneNumber: phoneNumber || null,
        status,
        responsePayload,
        errorMessage
      });
    } catch (logErr) {
      console.error("[MetaCAPI] Falha ao salvar log do evento:", logErr);
    }
  }
}

export async function retryCAPIEvent(eventId: number, companyId: number): Promise<CAPIEvent> {
  const original = await CAPIEvent.findOne({ where: { id: eventId, companyId } });
  if (!original) throw new Error("Evento não encontrado");

  const { pixelId, accessToken, enabled } = await getCredentials(companyId);
  if (!enabled || !pixelId || !accessToken) throw new Error("Meta CAPI não está configurado. Verifique as credenciais em Configurações.");

  const eventPayload: Record<string, unknown> = {
    event_name: original.eventName,
    event_time: Math.floor(Date.now() / 1000),
    action_source: "business_messaging",
    messaging_channel: "whatsapp",
    user_data: buildUserData(original.ctwaClid, original.phoneNumber)
  };

  const { status, responsePayload, errorMessage } = await dispatchToMeta(pixelId, accessToken, eventPayload);

  const retryEvent = await CAPIEvent.create({
    ticketId: original.ticketId,
    companyId,
    ctwaClid: original.ctwaClid,
    eventName: original.eventName,
    phoneNumber: original.phoneNumber,
    status,
    responsePayload,
    errorMessage
  });

  return retryEvent;
}
