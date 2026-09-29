import express from "express";
import { getPostBySlugController, getPostsController } from "../controllers/post.controller.js";


const postRoutes = express.Router();

postRoutes.get("/", getPostsController);
postRoutes.get("/:slug", getPostBySlugController);

export { postRoutes };
