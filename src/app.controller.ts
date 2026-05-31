import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { CurrentUser } from './auth/decorators/current-user.decorator';
import { Role } from './auth/roles/roles.enum';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Главная страница' })
  @ApiResponse({ status: 200, description: 'Приветственное сообщение' })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @ApiOperation({ summary: 'Тестовый маршрут' })
  @ApiResponse({ status: 200, description: 'Список пользователей' })
  @Get('/test')
  test() {
    return this.appService.test();
  }

  @ApiOperation({ summary: 'Профиль авторизованного пользователя' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Данные профиля' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return { message: 'Ваш профиль', user };
  }

  @ApiOperation({ summary: 'Админ-панель (только для администраторов)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Данные админ-панели' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get('admin')
  getAdminData(@CurrentUser() user: any) {
    return { message: 'Привет, админ!', user };
  }
}
