import { Request, Response } from "express";
import {
  getBlogsService,
  createBlogService,
  getBlogService,
} from "../services/blog.service.js";

export const getBlogsController = async (req: Request, res: Response) => {
  const result = await getBlogsService();

  res.status(200).send(result);
};

export const createBlogController = async (req: Request, res: Response) => {
  const result = await createBlogService(req.body);
  res.status(200).send(result);
};

export const getBlogController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const result = await getBlogService(id);
  res.status(200).send(result);
};
