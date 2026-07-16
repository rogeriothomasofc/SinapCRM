import { Router, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import User from "../models/User";
import Company from "../models/Company";
import { createAccessToken, createRefreshToken } from "../helpers/CreateTokens";
import { SendRefreshToken } from "../helpers/SendRefreshToken";
import { SerializeUser } from "../helpers/SerializeUser";
import Queue from "../models/Queue";
import Setting from "../models/Setting";

const ssoRoutes = Router();

// GET /auth/sso?token=xxx
// Valida o token SSO gerado pelo WhatsApp Store e redireciona pro frontend
// com as credenciais do CRM no hash da URL — sem expor tokens na query string.
ssoRoutes.get("/auth/sso", async (req: Request, res: Response) => {
  const { token } = req.query as { token: string };
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const ssoSecret = process.env.WS_SSO_SECRET;

  if (!token) {
    return res.redirect(`${frontendUrl}/login?sso_error=missing_token`);
  }
  if (!ssoSecret) {
    return res.redirect(`${frontendUrl}/login?sso_error=not_configured`);
  }

  let payload: { email: string; crmCompanyId: number; name?: string; isOwner?: boolean; avatarUrl?: string } | null = null;
  try {
    payload = verify(token, ssoSecret) as { email: string; crmCompanyId: number; name?: string; isOwner?: boolean; avatarUrl?: string };
  } catch {
    return res.redirect(`${frontendUrl}/login?sso_error=invalid_token`);
  }

  try {
    let user = await User.findOne({
      where: { email: payload.email, companyId: payload.crmCompanyId },
      include: ["queues", { model: Company, include: [{ model: Setting }] }],
    });

    if (!user) {
      // Auto-provisiona o usuário na primeira vez que acessa via SSO
      const tempPassword = Math.random().toString(36).slice(-12) + "!A1";
      user = await User.create({
        name: payload.name || payload.email.split("@")[0],
        email: payload.email,
        password: tempPassword,
        profile: "admin",
        companyId: payload.crmCompanyId,
        avatarUrl: payload.avatarUrl || null,
      });
      await user.reload({ include: ["queues", { model: Company, include: [{ model: Setting }] }] });
    } else if (payload.avatarUrl && user.avatarUrl !== payload.avatarUrl) {
      // Sincroniza o avatar se foi atualizado no catálogo
      await user.update({ avatarUrl: payload.avatarUrl });
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    const serialized = await SerializeUser(user);

    SendRefreshToken(res, refreshToken);

    const hash = new URLSearchParams({
      token: accessToken,
      user: JSON.stringify({ ...serialized, avatarUrl: payload.avatarUrl || "" }),
    }).toString();

    return res.redirect(`${frontendUrl}/sso#${hash}`);
  } catch (err: any) {
    console.error("[SSO] erro interno:", err?.message || err);
    return res.redirect(`${frontendUrl}/login?sso_error=server_error`);
  }
});

export default ssoRoutes;
