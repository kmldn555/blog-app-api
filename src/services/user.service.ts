import { Prisma, User } from "../../generated/prisma/client.js";
import { SortOrder } from "../../generated/prisma/internal/prismaNamespace.js";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";

interface GetUserQuery {
  page: number;
  take: number;
  sortOrder: string; //asc or des
  sortBy: string; //
  search: string;
}

export const getUsersService = async (query: GetUserQuery) => {
  const { page, take, sortOrder, sortBy, search } = query;

  const whereClause: Prisma.UserWhereInput = {
    deletedAt: null,
  };

  if (search) {
    whereClause.email = { contains: search, mode: "insensitive" };
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    include: {
      posts: {
        select: { id: true, content: true },
      },
    },
    skip: (page - 1) * take,
    take: take,
    orderBy: { [sortBy]: sortOrder },
    omit: { password: true },
  });

  const total = await prisma.user.count({ where: whereClause });

  return {
    data: users,
    meta: { page, take, total },
  };
};

export const getUserService = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: { id: id },
  });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  return user;
};

// database transaction
export const createUserService = async (body: User) => {
  await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({ data: body });

    await tx.post.create({
      data: {
        content: "lorem ipsum",
        userId: newUser.id,
      },
    });
  });

  return { message: "create user success" };
};

// export const createUserService = async (body: User) => {
//   await prisma.user.create({ data: body });

//   return { message: "create user success" };
// };

export const updateUserService = async (id: number, body: Partial<User>) => {
  await getUserService(id);

  await prisma.user.update({
    where: { id: id },
    data: body,
  });

  return { message: "update user success" };
};

export const deletUserService = async (id: number) => {
  await getUserService(id);

  // soft delete ->
  await prisma.user.update({
    where: { id: id },
    data: { deletedAt: new Date() },
  });

  //hard delete -> Benar-benar menghapus pada database
  // await prisma.user.delete({
  //   where: { id: id },
  // });

  return { message: "delete user success" };
};
