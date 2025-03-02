import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import logger, { formatErrorForLog } from "../config/logger";
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
  // Log the error with detailed information
  const errorObject = formatErrorForLog(err, req);

  // Log error with appropriate level
  if (err instanceof AppError && err.statusCode < 500) {
    // Client errors (4xx) are logged as warnings
    logger.warn(`Client Error: ${err.message}`, errorObject);
  } else {
    // Server errors (5xx) and uncategorized errors are logged as errors
    logger.error(`Server Error: ${err.message}`, errorObject);
  }

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

  // For database errors
  if (
    err.name === "SequelizeError" ||
    (err.message && err.message.includes("SQL"))
  ) {
    response.error = {
      code: ErrorCode.DATABASE_ERROR,
      message: "Database error occurred",
    };
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
  }

  // Default to 500 for unhandled errors
  response.error = {
    code: ErrorCode.INTERNAL_ERROR,
    message: "Internal server error",
  };

  // Include stack trace in development mode but not in production
  if (process.env.NODE_ENV === "development") {
    response.error.details = err.stack;
  }

  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
};

/**
 * Not found middleware - handles 404 errors
 */
export const notFoundHandler = (req: Request, res: Response) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    requestId: req.headers["x-request-id"],
  });

  const response: ApiResponse = {
    success: false,
    timestamp: new Date().toISOString(),
    error: {
      code: ErrorCode.RESOURCE_NOT_FOUND,
      message: "Resource not found",
    },
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
    timestamp: new Date().toISOString(),
    message,
    data,
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
  // Log this error with the appropriate level
  const isServerError = statusCode >= 500;
  isServerError
    ? logger.error(`Error Response: ${message}`, { code, statusCode, details })
    : logger.warn(`Error Response: ${message}`, { code, statusCode, details });

  return {
    statusCode,
    body: {
      success: false,
      timestamp: new Date().toISOString(),
      error: {
        code,
        message,
        details,
      },
    },
  };
};
