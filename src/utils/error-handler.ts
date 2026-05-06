import { Prisma } from '@prisma/client';
import type { ErrorRequestHandler, RequestHandler } from 'express';
import { AppError } from './app-error';

export const notFoundHandler: RequestHandler = (_request, response) => {
  response.status(404).json({
    message: 'Route not found',
  });
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      message: error.message,
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      response.status(409).json({
        message: 'Resource already exists',
      });
      return;
    }
  }

  console.error(error);

  response.status(500).json({
    message: 'Internal server error',
  });
};
