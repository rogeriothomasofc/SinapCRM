import { Response } from "express";

export const SendRefreshToken = (res: Response, token: string): void => {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("jrt", token, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
  });
};
