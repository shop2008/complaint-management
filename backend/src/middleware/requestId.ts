import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

/**
 * Middleware that adds a unique request ID to each request
 * This helps with tracing requests across logs
 */
export const addRequestId = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Check if request already has an ID (e.g., from a proxy)
  if (!req.headers["x-request-id"]) {
    const requestId = uuidv4();
    req.headers["x-request-id"] = requestId;
    // Also add it to the response headers for client tracing
    res.setHeader("X-Request-ID", requestId);
  }

  next();
};
