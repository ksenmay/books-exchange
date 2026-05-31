import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable, 
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorLoggerService } from '../../error-logger/error-logger.service';

@Catch()
@Injectable() 
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly errorLoggerService: ErrorLoggerService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let stack = '';
    let context = '';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || message;
      stack = exception.stack || '';
      context = exception.constructor.name;
    } else if (exception instanceof Error) {
      message = exception.message;
      stack = exception.stack || '';
      context = 'UnknownError';
    }

    const errorContext = `${request.method} ${request.url}`;

    await this.errorLoggerService.logError({
      message,
      stack,
      context: errorContext,
    });

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
