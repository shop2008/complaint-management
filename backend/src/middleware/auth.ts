import { NextFunction, Request, Response } from "express";
import { firebaseAdmin } from "../config/firebase";
import { HttpStatus } from "../types/api.types";
import { createErrorResponse } from "./errorHandler";

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(
          createErrorResponse(
            "No token provided",
            "No token provided",
            HttpStatus.UNAUTHORIZED
          )
        );
    }

    const idToken = authHeader.split("Bearer ")[1];
    try {
      // Verify the ID token
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || "",
      };
      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(
          createErrorResponse(
            "Invalid token",
            "Invalid token",
            HttpStatus.UNAUTHORIZED
          )
        );
    }
  } catch (error) {
    console.error("Auth error:", error);
    res
      .status(HttpStatus.UNAUTHORIZED)
      .json(
        createErrorResponse(
          "Invalid token",
          "Invalid token",
          HttpStatus.UNAUTHORIZED
        )
      );
  }
};
