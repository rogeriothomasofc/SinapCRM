import { Router, Request, Response, NextFunction } from "express";
import Whatsapp from "../models/Whatsapp";
import WsAutomation, { WS_DEFAULT_TEMPLATES, WsEventType } from "../models/WsAutomation";
import { getWbot } from "../libs/wbot";

const wsInternalRoutes = Router();

function envTokenAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || token !== process.env.ENV_TOKEN) {
    res.status(401).json({ error: "Não autorizado" });
    return;
  }
  next();
}

function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
}

// Retorna o token da conexão WhatsApp ativa de uma empresa.
wsInternalRoutes.get(
  "/ws-internal/whatsapp-token/:companyId",
  envTokenAuth,
  async (req: Request, res: Response): Promise<Response> => {
    const companyId = parseInt(req.params.companyId, 10);
    if (!companyId) return res.status(400).json({ error: "companyId inválido" });

    const whatsapp = await Whatsapp.findOne({
      where: { companyId, status: "CONNECTED" },
      attributes: ["token"],
    });

    if (!whatsapp) {
      return res.status(404).json({ error: "Nenhuma conexão WhatsApp ativa para esta empresa" });
    }

    return res.json({ token: whatsapp.token });
  }
);

// Dispara uma automação WS: busca o template configurado, renderiza e envia via Baileys.
// Body: { companyId, eventType, phone, vars }
wsInternalRoutes.post(
  "/ws-internal/trigger-automation",
  envTokenAuth,
  async (req: Request, res: Response): Promise<Response> => {
    const { companyId, eventType, phone, vars = {} } = req.body;

    if (!companyId || !eventType || !phone) {
      return res.status(400).json({ error: "companyId, eventType e phone são obrigatórios" });
    }

    // Busca configuração da automação (usa default se não configurada)
    const automation = await WsAutomation.findOne({
      where: { companyId, eventType },
    });

    const enabled = automation ? automation.enabled : true;
    if (!enabled) return res.json({ sent: false, reason: "disabled" });

    const template =
      automation?.message || WS_DEFAULT_TEMPLATES[eventType as WsEventType] || "";
    if (!template) return res.json({ sent: false, reason: "no_template" });

    const message = renderTemplate(template, vars);

    // Busca a conexão WhatsApp ativa da empresa
    const whatsapp = await Whatsapp.findOne({
      where: { companyId, status: "CONNECTED" },
    });

    if (!whatsapp) return res.json({ sent: false, reason: "no_whatsapp" });

    try {
      const wbot = getWbot(whatsapp.id);
      const number = phone.replace(/\D/g, "");
      const jid = `${number}@s.whatsapp.net`;
      await wbot.sendMessage(jid, { text: message });
      return res.json({ sent: true });
    } catch (err) {
      return res.status(500).json({ sent: false, error: "Falha ao enviar mensagem" });
    }
  }
);

export default wsInternalRoutes;
