import { Controller, Get } from '@nestjs/common';
import { ErrorLoggerService } from './error-logger.service';

@Controller('error-logs')
export class ErrorLoggerController {
  constructor(private readonly errorLoggerService: ErrorLoggerService) {}

  @Get()
  findAll() {
    return this.errorLoggerService.getAllLogs();
  }
}