import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { requestLogger } from "./middleware/logger";
import { apiLimiter, authLimiter } from "./middleware/rateLimit";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { addRequestId } from "./middleware/requestId";
import usersRouter from "./routes/users";
import complaintsRouter from "./routes/complaints";
import feedbackRouter from "./routes/feedback";
import complaintUpdatesRouter from "./routes/complaintUpdates";
import attachmentsRouter from "./routes/attachments";
import logger from "./config/logger";

// Load environment variables
dotenv.config();

// Create logs directory if it doesn't exist
const logDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
  logger.info(`Created logs directory at ${logDir}`);
}

const app = express();
const port = process.env.PORT || 3000;

// Add CORS middleware
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Add request ID before anything else
app.use(addRequestId);

// Add the logger middleware before the routes
app.use(requestLogger);

// Log application startup
logger.info(
  `Starting application in ${process.env.NODE_ENV || "development"} mode`
);

// Apply rate limiting to all routes
app.use("/api/", apiLimiter);

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Apply specific rate limits to routes
app.use("/api/users/register", authLimiter);
app.use("/api/users/login", authLimiter);

// Apply routes
app.use("/api/complaints", complaintsRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/users", usersRouter);
app.use("/api/complaint-updates", complaintUpdatesRouter);
app.use("/api/attachments", attachmentsRouter);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handling middleware
app.use(errorHandler);

// Start the server
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
  logger.info(
    `API Documentation available at http://localhost:${port}/api-docs`
  );
});

export default app;
