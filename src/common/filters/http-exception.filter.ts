import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Maintain Laravel-style response format
    const errorResponse = {
      type: 'error',
      message:
        typeof message === 'string'
          ? message
          : (message as any).message || 'Something went wrong',
      ...(process.env.NODE_ENV === 'development' && {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      }),
    };

    response.status(status).json(errorResponse);
  }
}
