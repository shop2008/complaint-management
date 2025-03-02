import logger from "../config/logger";
import { AppError } from "../types/api.types";

/**
 * Utility class for tracking errors across the application
 * Can be expanded to integrate with external error monitoring services like Sentry
 */
export class ErrorTracker {
  /**
   * Track an error that occurred during application execution
   *
   * @param error The error object to track
   * @param context Additional context about where the error occurred
   * @param userId Optional user ID associated with the error
   */
  static trackError(error: Error, context: string, userId?: string) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      context,
      userId,
      timestamp: new Date().toISOString(),
    };

    // Additional properties for custom errors
    if (error instanceof AppError) {
      Object.assign(errorInfo, {
        code: error.code,
        statusCode: error.statusCode,
        details: error.details,
      });
    }

    // Log the error
    logger.error(`Error in ${context}: ${error.message}`, errorInfo);

    // Here could add integration with external services like Sentry
    // if (process.env.NODE_ENV === 'production') {
    //   Sentry.captureException(error, {
    //     extra: errorInfo,
    //     user: userId ? { id: userId } : undefined,
    //   });
    // }
  }

  /**
   * Track a handled exception that didn't cause a failure
   * but might be interesting for debugging
   *
   * @param message Description of the exception
   * @param context Where the exception occurred
   * @param data Additional data about the exception
   */
  static trackException(message: string, context: string, data?: any) {
    logger.warn(`Exception in ${context}: ${message}`, {
      context,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track critical errors that require immediate attention
   *
   * @param error The critical error
   * @param context Where the error occurred
   * @param userId Optional user ID
   */
  static trackCritical(error: Error, context: string, userId?: string) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      context,
      userId,
      timestamp: new Date().toISOString(),
      priority: "CRITICAL",
    };

    logger.error(`CRITICAL ERROR in ${context}: ${error.message}`, errorInfo);

    // Here could add alerting integration like sending emails,
    // SMS notifications or paging on-call staff
    this.sendAlert(error, context);
  }

  /**
   * Send an alert for critical errors
   * This is a placeholder for implementing actual alerting
   */
  private static sendAlert(error: Error, context: string) {
    // This would be replaced with actual alert mechanisms in production
    // Examples:
    // - Send email to admin
    // - Send SMS
    // - Post to Slack/Teams channel
    logger.info(`Would send alert for: ${error.message} in ${context}`);
  }
}
