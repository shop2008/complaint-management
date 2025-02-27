import { Request, Response, NextFunction } from "express";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;

  console.log(`[${timestamp}] ${method} ${url}`);

  // Log request body if it exists and isn't a file upload
  if (
    req.body &&
    Object.keys(req.body).length > 0 &&
    !req.is("multipart/form-data")
  ) {
    console.log("Request Body:", JSON.stringify(req.body, null, 2));
  }

  next();
};
