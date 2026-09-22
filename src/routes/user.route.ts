import express from "express";
import {
  createUserController,
  deleteUserController,
  getUserController,
  getUsersController,
  updateUserController,
} from "../controllers/user.controller.js";

const userRoutes = express.Router();

userRoutes.get("/", getUsersController);
userRoutes.get("/:id", getUserController);
userRoutes.post("/", createUserController);
userRoutes.patch("/:id", updateUserController);
userRoutes.delete("/:id", deleteUserController);


export { userRoutes };
