import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ErrorLoggerService } from './error-logger/error-logger.service';
import { join } from 'path'; 
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors();

 app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  const config = new DocumentBuilder()
    .setTitle('Book Exchange Platform API')
    .setDescription('API документация для платформы обмена книгами')
    .setVersion('1.0')
    .addTag('Auth', 'Аутентификация и регистрация')
    .addTag('Users', 'Управление пользователями')
    .addTag('Books', 'Операции с книгами')
    .addTag('Reviews', 'Отзывы о книгах')
    .addTag('Quotes', 'Цитаты из книг')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const errorLoggerService = app.get(ErrorLoggerService);
  app.useGlobalFilters(new AllExceptionsFilter(errorLoggerService));

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: http://localhost:3000`);
  console.log(`Swagger documentation: http://localhost:3000/api/docs`);
  console.log(`Error Logs: http://localhost:3000/error-logs`);
}
bootstrap();
