import { prisma  } from "../lib/prisma.js";
import { Blog } from "../../generated/prisma/client.js";
import { ApiError } from "../utils/api-error.js";

export const getBlogsService = async () => {

  const blogs = await prisma.blog.findMany();

  return blogs;
};

export const createBlogService = async (body: Blog) => {
    
  await prisma.blog.create({ data: body });

  return { message: "create blog success" };
};

export const getBlogService = async (id: number) => {
  const blog = await prisma.blog.findUnique({
    where: { id: id },
  });

  if (!blog) {
    throw new ApiError("blog not found", 404);
  }

  return blog;
};