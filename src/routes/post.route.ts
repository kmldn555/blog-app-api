import express from "express";
import { getPostsController } from "../controllers/post.controller.js";


const postRoutes = express.Router();

postRoutes.get("/", getPostsController);

export { postRoutes };
