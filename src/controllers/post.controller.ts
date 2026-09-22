import { Request, Response } from "express";
import { getPostService } from "../services/post.service.js";


export const getPostsController = async (req: Request, res: Response) => {
  const query = {
    page: parseInt(req.query.page as string) || 1,
    take: parseInt(req.query.take as string) || 2,
    sortOrder: (req.query.sortOrder as string) || "desc",
    sortBy: (req.query.sortBy as string) || "createdAt",
    search: (req.query.search as string) || "",
  };

  const result = await getPostService(query);
  res.status(200).send(result);
};
