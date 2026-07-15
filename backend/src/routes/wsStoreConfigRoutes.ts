import { Router, Request, Response } from "express";
import isAuth from "../middleware/isAuth";

const wsStoreConfigRoutes = Router();

async function proxyToWs(method: "GET" | "PATCH", companyId: number, body?: object) {
  const baseUrl = process.env.WS_API_URL;
  const token = process.env.ENV_TOKEN;

  if (!baseUrl || !token) throw new Error("WS_API_URL ou ENV_TOKEN não configurado");

  const url = `${baseUrl}/api/crm-internal/store-automation-config?crmCompanyId=${companyId}`;

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  if (method === "PATCH" && body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);

  if (!res.ok) {
    const err = await res.text().catch(() => "Erro desconhecido");
    throw new Error(`WS respondeu ${res.status}: ${err}`);
  }

  return res.json();
}

wsStoreConfigRoutes.get(
  "/ws-store-config",
  isAuth,
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const data = await proxyToWs("GET", req.user.companyId);
      return res.json(data);
    } catch (err: any) {
      return res.status(502).json({ error: err.message || "Erro ao buscar config da loja" });
    }
  }
);

wsStoreConfigRoutes.patch(
  "/ws-store-config",
  isAuth,
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const data = await proxyToWs("PATCH", req.user.companyId, req.body);
      return res.json(data);
    } catch (err: any) {
      return res.status(502).json({ error: err.message || "Erro ao salvar config da loja" });
    }
  }
);

export default wsStoreConfigRoutes;
