import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error.js";
import jwt from "jsonwebtoken";
import { UserRole } from "../../generated/prisma/enums.js";

export const verifyToken = (secretKey: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer tokennya

    if (!token) {
      throw new ApiError("No token provided", 401);
    }

    try {
      const payload = jwt.verify(token, secretKey);
      res.locals.user = payload;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return next(new ApiError("Token expired", 401));
      }

      return next(new ApiError("Token invalid", 401));
    }
  };
};

export const verifyRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = res.locals.user.role

    if(!userRole || !roles.includes(userRole)) {
      throw new ApiError("You do not have access", 403)
    }

    next()
  };
};
