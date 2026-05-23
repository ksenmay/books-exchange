import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Убедитесь, что путь правильный
import { CreateErrorLogDto } from './dto/create-error-log.dto';

@Injectable()
export class ErrorLoggerService {
  constructor(private prisma: PrismaService) {}

  async logError(dto: CreateErrorLogDto) {
    try {
      await this.prisma.errorLog.create({
        data: {
          message: dto.message,
          stack: dto.stack,
          context: dto.context,
        },
      });
      // Опционально: вывод в консоль для отладки
      console.error(`[DB Error Log] Saved: ${dto.message}`);
    } catch (e) {
      // Важно: если сама запись лога упала, выводим ошибку в консоль, чтобы не зациклить
      console.error('[CRITICAL] Failed to save error log to DB:', e);
    }
  }

  async getAllLogs() {
    return this.prisma.errorLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50, // Возвращаем последние 50 ошибок
    });
  }
}