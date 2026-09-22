import express from "express";
import {
  getBlogsController,
  createBlogController,
  getBlogController,
} from "../controllers/blog.controller.js";

const blogRoutes = express.Router();

blogRoutes.get("/", getBlogsController);
blogRoutes.post("/", createBlogController);
blogRoutes.get("/:id", getBlogController);

export { blogRoutes };
