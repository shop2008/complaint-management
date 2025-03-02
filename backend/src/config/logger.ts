import dotenv from "dotenv";
import { Request } from "express";
import path from "path";
import winston from "winston";
import "winston-daily-rotate-file";

// Make sure env variables are loaded
dotenv.config();

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || "development";
  const logLevel = process.env.LOG_LEVEL || "info";

  // Use explicitly set LOG_LEVEL or default based on environment
  return logLevel || (env === "development" ? "debug" : "info");
};

// Define colors for each level (for console output)
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

// Add colors to Winston
winston.addColors(colors);

// Create log directory if it doesn't exist
const logDir = "logs";

// Custom format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Custom json format for structured logging
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define file transports for different log levels
const fileTransports = [
  // Daily rotate file for all logs
  new winston.transports.DailyRotateFile({
    filename: path.join(logDir, "application-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
    format: jsonFormat,
  }),
  // Separate file for error logs
  new winston.transports.DailyRotateFile({
    filename: path.join(logDir, "error-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "30d",
    level: "error",
    format: jsonFormat,
  }),
];

// Console transport with pretty formatting for development
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
  ),
});

// Determine which transports to use based on environment variables
const transports = [];

// Add console transport unless disabled
if (process.env.LOG_DISABLE_CONSOLE !== "true") {
  transports.push(consoleTransport);
}

// Add file transports unless disabled
if (process.env.LOG_DISABLE_FILE !== "true") {
  transports.push(...fileTransports);
}

// Create the logger instance
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  exitOnError: false,
});

// Helper function to extract request details for logs
export const formatRequestForLog = (req: Request, includeBody = false) => {
  const requestId = req.headers["x-request-id"] || "";
  const userAgent = req.headers["user-agent"] || "";
  const ip = (
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    ""
  ).toString();
  const user = (req as any).user?.uid
    ? `User: ${(req as any).user.uid}`
    : "Unauthenticated";

  let logData = {
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip,
    userAgent,
    user,
  };

  if (
    includeBody &&
    req.body &&
    Object.keys(req.body).length > 0 &&
    !req.is("multipart/form-data")
  ) {
    // Add request body but sanitize sensitive fields
    const sanitizedBody = { ...req.body };

    // Remove sensitive information
    if (sanitizedBody.password) sanitizedBody.password = "[REDACTED]";
    if (sanitizedBody.token) sanitizedBody.token = "[REDACTED]";
    if (sanitizedBody.authorization) sanitizedBody.authorization = "[REDACTED]";

    // @ts-ignore
    logData.body = sanitizedBody;
  }

  return logData;
};

// Format error object for logging
export const formatErrorForLog = (err: any, req?: Request) => {
  const baseErrorObject: any = {
    message: err.message || "Unknown error",
    stack: err.stack,
    name: err.name,
  };

  // Add custom properties
  if (err.code) baseErrorObject.code = err.code;
  if (err.statusCode) baseErrorObject.statusCode = err.statusCode;
  if (err.details) baseErrorObject.details = err.details;

  // Add request information if available
  if (req) {
    baseErrorObject.request = formatRequestForLog(req);
  }

  return baseErrorObject;
};

export default logger;
