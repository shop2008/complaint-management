import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import {
  ApiResponse,
  AppError,
  ErrorCode,
  HttpStatus,
} from "../types/api.types";

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`Error: ${err.message}`);
  console.error(err.stack);

  // Default error response
  const response: ApiResponse = {
    success: false,
    timestamp: new Date().toISOString(),
  };

  // Handle AppError (our custom error class)
  if (err instanceof AppError) {
    response.error = {
      code: err.code,
      message: err.message,
      details: err.details,
    };
    return res.status(err.statusCode).json(response);
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    response.error = {
      code: ErrorCode.VALIDATION_ERROR,
      message: "Validation error",
      details: err.errors,
    };
    return res.status(HttpStatus.BAD_REQUEST).json(response);
  }

  // Handle other known error types
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    response.error = {
      code: ErrorCode.AUTHENTICATION_ERROR,
      message: "Invalid or expired token",
    };
    return res.status(HttpStatus.UNAUTHORIZED).json(response);
  }

  // Default to internal server error for unhandled errors
  response.error = {
    code: ErrorCode.INTERNAL_ERROR,
    message: "An unexpected error occurred",
  };

  // In development, include the error message for debugging
  if (process.env.NODE_ENV !== "production") {
    response.error.details = {
      message: err.message,
      stack: err.stack,
    };
  }

  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
};

/**
 * Not found middleware - handles 404 errors
 */
export const notFoundHandler = (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: false,
    error: {
      code: ErrorCode.RESOURCE_NOT_FOUND,
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    },
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.NOT_FOUND).json(response);
};

/**
 * Helper function to create a success response
 */
export const createSuccessResponse = <T>(
  data: T,
  message?: string
): ApiResponse<T> => {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Helper function to create an error response
 */
export const createErrorResponse = (
  code: string,
  message: string,
  statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
  details?: any
): { statusCode: number; body: ApiResponse } => {
  return {
    statusCode,
    body: {
      success: false,
      error: {
        code,
        message,
        details,
      },
      timestamp: new Date().toISOString(),
    },
  };
};
