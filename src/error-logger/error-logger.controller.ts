import { Controller, Get } from '@nestjs/common';
import { ErrorLoggerService } from './error-logger.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Error Logs')
@Controller('error-logs')
export class ErrorLoggerController {
  constructor(private readonly errorLoggerService: ErrorLoggerService) {}

  @ApiOperation({ summary: 'Получить все логи ошибок' })
  @ApiResponse({ status: 200, description: 'Список последних 50 ошибок' })
  @Get()
  findAll() {
    return this.errorLoggerService.getAllLogs();
  }
}
