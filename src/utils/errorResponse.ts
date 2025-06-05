import { Response } from "express";
import { logger } from "./logger.js";

export interface ErrorResponseData {
  status: number;
  message: string;
  details?: any;
}

export const errorResponse = (
  res: Response,
  status: number,
  message: string,
  details?: any
): Response => {
  const errorData: ErrorResponseData = {
    status,
    message,
  };

  if (details) {
    errorData.details = details;
  }

  logger.error(
    `Error ${status}: ${message}${
      details ? " - " + JSON.stringify(details) : ""
    }`
  );

  return res.status(status).json({
    success: false,
    error: errorData,
  });
};

export const ErrorTypes = {
  BAD_REQUEST: { status: 400, message: "Bad request" },
  UNAUTHORIZED: { status: 401, message: "Unauthorized access" },
  FORBIDDEN: { status: 403, message: "Forbidden access" },
  NOT_FOUND: { status: 404, message: "Resource not found" },
  VALIDATION_ERROR: { status: 422, message: "Validation error" },
  INTERNAL_SERVER: { status: 500, message: "Internal server error" },
};

export const ErrorUtils = {
  badRequest: (
    res: Response,
    message = ErrorTypes.BAD_REQUEST.message,
    details?: any
  ) => errorResponse(res, ErrorTypes.BAD_REQUEST.status, message, details),

  unauthorized: (
    res: Response,
    message = ErrorTypes.UNAUTHORIZED.message,
    details?: any
  ) => errorResponse(res, ErrorTypes.UNAUTHORIZED.status, message, details),

  forbidden: (
    res: Response,
    message = ErrorTypes.FORBIDDEN.message,
    details?: any
  ) => errorResponse(res, ErrorTypes.FORBIDDEN.status, message, details),

  notFound: (
    res: Response,
    message = ErrorTypes.NOT_FOUND.message,
    details?: any
  ) => errorResponse(res, ErrorTypes.NOT_FOUND.status, message, details),

  validationError: (
    res: Response,
    message = ErrorTypes.VALIDATION_ERROR.message,
    details?: any
  ) => errorResponse(res, ErrorTypes.VALIDATION_ERROR.status, message, details),

  internal: (
    res: Response,
    message = ErrorTypes.INTERNAL_SERVER.message,
    details?: any
  ) => errorResponse(res, ErrorTypes.INTERNAL_SERVER.status, message, details),
};
