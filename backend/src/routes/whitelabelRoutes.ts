import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import isAuth from "../middleware/isAuth";
import isSuper from "../middleware/isSuper";
import * as WhitelabelController from "../controllers/WhitelabelController";

const whitelabelFolder = path.resolve(__dirname, "..", "..", "public", "whitelabel");
if (!fs.existsSync(whitelabelFolder)) {
  fs.mkdirSync(whitelabelFolder, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: whitelabelFolder,
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/svg+xml", "image/x-icon", "image/vnd.microsoft.icon"];
    cb(null, allowed.includes(file.mimetype));
  },
});

const whitelabelRoutes = Router();

// GET é público para que logo/cores carreguem sem autenticação
whitelabelRoutes.get("/whitelabel", WhitelabelController.index);
whitelabelRoutes.put("/whitelabel", isAuth, isSuper, WhitelabelController.update);
whitelabelRoutes.post("/whitelabel/logo", isAuth, isSuper, upload.single("logo"), WhitelabelController.uploadLogo);
whitelabelRoutes.post("/whitelabel/favicon", isAuth, isSuper, upload.single("favicon"), WhitelabelController.uploadFavicon);

export default whitelabelRoutes;
