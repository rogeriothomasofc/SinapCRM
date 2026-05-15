import { Request, Response } from "express";
import GetWhitelabelService from "../services/WhitelabelService/GetWhitelabelService";
import UpdateWhitelabelService from "../services/WhitelabelService/UpdateWhitelabelService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const config = await GetWhitelabelService();
  return res.json(config);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { name, primaryColor, secondaryColor } = req.body;
  const config = await UpdateWhitelabelService({ name, primaryColor, secondaryColor });
  return res.json(config);
};

export const uploadLogo = async (req: Request, res: Response): Promise<Response> => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const logoUrl = `/public/whitelabel/${req.file.filename}`;
  const config = await UpdateWhitelabelService({ logoUrl });
  return res.json(config);
};

export const uploadFavicon = async (req: Request, res: Response): Promise<Response> => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const faviconUrl = `/public/whitelabel/${req.file.filename}`;
  const config = await UpdateWhitelabelService({ faviconUrl });
  return res.json(config);
};
