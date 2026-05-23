import { Module } from '@nestjs/common';
import { ErrorLoggerService } from './error-logger.service';
import { ErrorLoggerController } from './error-logger.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Или там, где у вас объявлен PrismaModule

@Module({
  imports: [PrismaModule],
  controllers: [ErrorLoggerController],
  providers: [ErrorLoggerService],
  exports: [ErrorLoggerService], 
})
export class ErrorLoggerModule {}