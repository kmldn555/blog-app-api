import { Request, Response } from "express";
import { forgotPasswordService, googleService, loginService, registerService } from "../services/auth.service.js";
import { forgotPasswordService, loginService, registerService, resetPasswordService } from "../services/auth.service.js";

export const registerController = async (req: Request, res: Response) => {
  const result = await registerService(req.body);
  res.status(200).send(result);
};

export const loginController = async (req: Request, res: Response) => {
  const result = await loginService(req.body);
  res.status(200).send(result);
};

export const forgotPasswordController = async (req: Request, res: Response) => {
  const result = await forgotPasswordService(req.body);
  res.status(200).send(result);
};

export const googleController = async (req: Request, res: Response) => {
  const result = await googleService(req.body);
export const resetPasswordController = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  const result = await resetPasswordService(req.body, userId);
  res.status(200).send(result);
};