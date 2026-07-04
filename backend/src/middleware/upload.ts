import multer from "multer";
import path from "path";
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  UPLOAD_DIR,
  ensureUploadDir,
} from "../config/upload";
import { AppError } from "./errorHandler";

ensureUploadDir();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureUploadDir();
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${unique}${extension}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (
      ALLOWED_MIME_TYPES.includes(
        file.mimetype as (typeof ALLOWED_MIME_TYPES)[number]
      )
    ) {
      cb(null, true);
      return;
    }

    cb(new AppError("Only PDF, JPG, and PNG files are allowed", 400));
  },
});
