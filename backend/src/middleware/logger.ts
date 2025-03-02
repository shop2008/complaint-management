import { NextFunction, Request, Response } from "express";
import { performance } from "perf_hooks";
import logger, { formatRequestForLog } from "../config/logger";

/**
 * Middleware to log incoming HTTP requests with timing information
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Capture request start time for performance measurement
  const start = performance.now();

  // Store original end function to intercept it
  const originalEnd = res.end;

  // Override end function to capture response info and timing
  // @ts-ignore - TypeScript doesn't like us modifying the response object
  res.end = function (chunk?: any, encoding?: any) {
    // Calculate response time
    const responseTime = Math.round(performance.now() - start);

    // Format the log message with request details
    const logData = {
      ...formatRequestForLog(req, true),
      status: res.statusCode,
      responseTime: `${responseTime}ms`,
    };

    // Log at appropriate level based on status code
    if (res.statusCode >= 500) {
      logger.error(
        `${req.method} ${req.originalUrl} ${res.statusCode} [${responseTime}ms]`,
        { ...logData }
      );
    } else if (res.statusCode >= 400) {
      logger.warn(
        `${req.method} ${req.originalUrl} ${res.statusCode} [${responseTime}ms]`,
        { ...logData }
      );
    } else {
      logger.info(
        `${req.method} ${req.originalUrl} ${res.statusCode} [${responseTime}ms]`,
        { ...logData }
      );
    }

    // Call original end function
    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Middleware for API debugging - logs detailed request information
 * Use this for routes that need detailed debugging
 */
export const debugLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.debug("DEBUG REQUEST", {
    ...formatRequestForLog(req, true),
    headers: req.headers,
    params: req.params,
    query: req.query,
  });

  next();
};
