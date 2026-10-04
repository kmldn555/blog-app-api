import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { PaginationQueryParams } from "../types/pagination.js";
import { ApiError } from "../utils/api-error.js";
import { generateSlug } from "../utils/slug.js";
import { CreatePostSchema } from "../validators/post.service.js";

export const getPostService = async (query: PaginationQueryParams) => {
  const { page, take, sortOrder, sortBy, search } = query;

  const whereClause: Prisma.PostWhereInput = {};

  if (search) {
    whereClause.title = { contains: search, mode: "insensitive" };
  }

  const posts = await prisma.post.findMany({
    where: whereClause,
    skip: (page - 1) * take,
    take: take,
    orderBy: { [sortBy]: sortOrder },
    include: { user: { select: { nama: true } } },
  });

  const total = await prisma.post.count({ where: whereClause });

  return {
    data: posts,
    meta: { page, take, total },
  };
};

export const getPostBySlugService = async (slug: string) => {
  const blog = await prisma.post.findUnique({
    where: { slug },
    include: { user: { select: { nama: true } } },
  });

  if (!blog) {
    throw new ApiError("blog not found", 404);
  }
  return blog;
};

export const createPostService = async (
  body: CreatePostSchema,
  userId: number,
) => {
  const blog = await prisma.post.findUnique({
    where: { title: body.title },
  });

  if (blog) {
    throw new ApiError("Title already exist!", 400);
  }

  const slug = generateSlug(body.title);

  await prisma.post.create({
    data: {
      title: body.title,
      description: body.description,
      category: body.category,
      slug: slug,
      content: body.content,
      thumbnail: body.thumbnail,
      userId: userId,
    },
  });

  return { message: "create post success" };
};
