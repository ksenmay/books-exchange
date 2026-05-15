import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // удаляет поля, не описанные в DTO
      forbidNonWhitelisted: true, // выбрасывает ошибку при лишних полях
      transform: true,            // автоматически преобразует типы
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
