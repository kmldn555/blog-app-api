import { NextFunction, Request, Response } from "express";
import multer from "multer";
import fileType from "file-type";
import { ApiError } from "../utils/api-error.js";

export const upload = (maxSize: number = 2) => {
  const storage = multer.memoryStorage();

  const limits = {
    fileSize: maxSize * 1024 * 1024, // 2mb default
  };

  return multer({ storage, limits });
};

export const fileFilter = (allowedTypes: fileType.MimeType[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.files) {
        return next();
      }

      // Cast req.files ke struktur objek Multer
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      for (const fieldname in files) {
        const fileArray = files[fieldname];

        for (const file of fileArray) {
          // Deteksi tipe file asli berdasarkan buffer
          const type = await fileType.fromBuffer(file.buffer);

          if (!type || !allowedTypes.includes(type.mime)) {
            throw new ApiError("File type is not allowed", 400);
          }
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
