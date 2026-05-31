import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; 
import { CreateErrorLogDto } from './dto/create-error-log.dto';

@Injectable()
export class ErrorLoggerService {
  constructor(private prisma: PrismaService) {}

  async logError(dto: CreateErrorLogDto) {
    try {
      await this.prisma.errorLog.create({
        data: {
          message: Array.isArray(dto.message)
            ? dto.message.join('\n')
            : dto.message,

          stack: dto.stack,
          context: dto.context,
        },
      });
      console.error(`[DB Error Log] Saved: ${dto.message}`);
    } catch (e) {
      console.error('[CRITICAL] Failed to save error log to DB:', e);
    }
  }

  async getAllLogs() {
    return this.prisma.errorLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50,
    });
  }
}
