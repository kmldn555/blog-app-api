import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";
import argon from "argon2";
import {
  ChangePasswordSchema,
  ForgotPasswordSchema,
  GoogleSchema,
  LoginSchema,
  RegisterSchema,
  ResetPasswordSchema,
} from "../validators/auth.validator.js";
import axios from "axios";
import jwt from "jsonwebtoken";
import { sendMail } from "../lib/mail.js";
import { getUserService } from "./user.service.js";

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
    context: {
      nama: body.nama,
    },
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
    expiresIn: "15m",
  });

  // 6. generate refresh token
  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET_REFRESH!, {
    expiresIn: "7d",
  });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiredAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  // 6. return message login success + data user + access tokennya
  return {
    message: "Login success",
    accessToken: accessToken,
    refreshToken: refreshToken,
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

export const googleService = async (body: GoogleSchema) => {
  const response = await axios.get(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: {
        Authorization: `Bearer ${body.accessToken}`,
      },
    },
  );

  let user = await prisma.user.findUnique({
    where: { email: response.data.email },
  });

  //kalo emailnya udah ada dan providernya bukan google, throw error
  if (!!user && user.provider !== "GOOGLE") {
    throw new ApiError("Please login using credentials", 400);
  }

  // kalo emailnya belum kepake sama sekali
  if (!user) {
    user = await prisma.user.create({
      data: {
        nama: response.data.name,
        email: response.data.email,
        password: "",
        profilePic: response.data.picture,
        provider: "GOOGLE",
      },
    });
  }
  // generate accessToken (jwt)
  const payload = { id: user.id, role: user.role };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });

  // return message login success + data user + access tokennya
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
export const resetPasswordService = async (
  body: ResetPasswordSchema,
  userId: number,
) => {
  await getUserService(userId);

  const hashedPassword = await argon.hash(body.password);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { message: "Reset email success" };
};

export const changePasswordService = async (
  body: ChangePasswordSchema,
  userId: number,
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError("User not found", 404);
  }
  const isPassMatch = await argon.verify(user.password, body.oldPassword);

  if (!isPassMatch) {
    throw new ApiError("Pasword do not match", 400);
  }

  const newPassword = await argon.hash(body.newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { password: newPassword },
  });

  return { message: "change password success" };
};

export const refreshService = async (refreshToken?: string) => {
  if (!refreshToken) {
    throw new ApiError("No refresh token", 400);
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: {
      user: true,
    },
  });

  if (!storedToken) {
    throw new ApiError("Refresh token not found", 400);
  }

  if (storedToken.expiredAt < new Date()) {
    throw new ApiError("Refresh token expired", 400);
  }

  const payload = { id: storedToken.user.id, role: storedToken.user.role };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "15m",
  });

  return { accessToken };
};

export const logoutService = async (refreshToken?: string) => {
  if (!refreshToken) {
    throw new ApiError("No refresh token", 400);
  }

  await prisma.refreshToken.delete({
    where: { token: refreshToken },
  });

  return { message: "logout success" };
};
