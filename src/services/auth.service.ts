import { User } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";
import argon from "argon2";

export const registerService = async (
  body: Pick<User, "nama" | "email" | "password">,
) => {
  // 1. cek dulu emailnya sudah kepake atau belom
  const user = await prisma.user.findUnique({
    where: { email: body.email },
  });

  // 2. kalo udah kepake, throw error
  if (user) {
    throw new ApiError("Email already exist", 400);
  }

  // 3. kalo belom, hash passwordnya
  const hashedPassword = await argon.hash(body.password);

  // 4. create data usernya
  await prisma.user.create({
    data: {
      nama: body.nama,
      email: body.email,
      password: hashedPassword,
    },
  });
  // 5. return success
  return { message: "register success" };
};
