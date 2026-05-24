// src/app.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { CurrentUser } from './auth/decorators/current-user.decorator';
import { Role } from './auth/roles/roles.enum';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Пример открытого маршрута
  @Get('/test')
  test() {
    return this.appService.test();
  }

  // Только для авторизованных пользователей
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return { message: 'Ваш профиль', user };
  }

  // Только для администраторов
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get('admin')
  getAdminData(@CurrentUser() user: any) {
    return { message: 'Привет, админ!', user };
  }
  
}