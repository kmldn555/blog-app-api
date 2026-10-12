import express from "express";
import {
  forgotPasswordController,
  googleController,
  loginController,
  registerController,
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  forgotPasswordSchema,
  googleSchema,
  loginSchema,
  registerSchema,
} from "../validators/auth.validator.js";

const authRoutes = express.Router();

authRoutes.post("/register", validate(registerSchema), registerController);
authRoutes.post("/login", validate(loginSchema), loginController);
authRoutes.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  forgotPasswordController,
);
authRoutes.post("/google", validate(googleSchema), googleController);

export { authRoutes };
