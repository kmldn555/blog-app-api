import express from "express";
import {
  createPostController,
  getPostBySlugController,
  getPostsController,
} from "../controllers/post.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import { createPostSchema } from "../validators/post.validator.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const postRoutes = express.Router();

postRoutes.get("/", getPostsController);
postRoutes.get("/:slug", getPostBySlugController);
postRoutes.post(
  "/",
  verifyToken(process.env.JWT_SECRET!),
  upload().fields([{name: "thumbnail", maxCount: 1}]),
  validate(createPostSchema),
  createPostController,
);

export { postRoutes };
