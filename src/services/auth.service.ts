import { User } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";
import argon from "argon2";
import { ForgotPasswordSchema, LoginSchema, RegisterSchema } from "../validators/auth.validator.js";
import jwt from "jsonwebtoken";
import { sendMail } from "../lib/mail.js";

export const registerService = async (body: RegisterSchema) => {
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

  // 5. kirim email welcoming
  await sendMail({
    to: body.email,
    subject: "Welcome to Blog App",
    templateName: "welcome.hbs",
    context:  {
      nama: body.nama,
    }
  });

  // 6. return success
  return { message: "register success" };
};

export const loginService = async (body: LoginSchema) => {
  // 1. cek dulu emailnya udah ada di db atau tidak
  const user = await prisma.user.findUnique({
    where: { email: body.email },
  });

  // 2. kalo emailnya tidak ada di db, throw error
  if (!user) {
    throw new ApiError("Invalid credentials", 400);
  }

  // 3. cek passwordnya, bener atau tidak
  const isPassMatch = await argon.verify(user.password, body.password);

  // 4. kalo passwordnya salah, throw error
  if (!isPassMatch) throw new ApiError("Invalid credentials", 400);

  // 5. generate accessToken (jwt)
  const payload = { id: user.id, role: user.role };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });

  // 6. return message login success + data user + access tokennya
  return {
    message: "Login success",
    accessToken: accessToken,
    user: {
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic,
    },
  };
};

export const forgotPasswordService = async (body: ForgotPasswordSchema) => {
  const user = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (!user) {
    return { message: "Send email success" };
  }

  const payload = { id: user.id, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET_RESET!, {
    expiresIn: "15m",
  });

  await sendMail({
    to: body.email,
    subject: "Reset Password Request",
    templateName: "reset-password.hbs",
    context: {
      linkReset: `${process.env.BASE_URL_FE}/reset-password?token=${token}`,
    },
  });

  return { message: "Send email success" };
};