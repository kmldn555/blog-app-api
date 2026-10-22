import express from "express";
import {
  createPostController,
  getPostBySlugController,
  getPostsController,
} from "../controllers/post.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import { createPostSchema } from "../validators/post.validator.js";
import { verifyRole, verifyToken } from "../middlewares/auth.middleware.js";
import { fileFilter, upload } from "../middlewares/upload.middleware.js";

const postRoutes = express.Router();

postRoutes.get("/", getPostsController);
postRoutes.get("/:slug", getPostBySlugController);
postRoutes.post(
  "/",
  verifyToken(process.env.JWT_SECRET!),
  verifyRole(["USER"]),
  upload().fields([{name: "thumbnail", maxCount: 1}]),
  fileFilter(["image/jpeg", "image/avif", "image/png"]),
  validate(createPostSchema),
  createPostController,
);

export { postRoutes };
