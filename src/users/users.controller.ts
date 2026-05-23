// src/users/users.controller.ts
import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users/me - Получение данных текущего пользователя
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@CurrentUser() user: any) {
    // user.id приходит из payload токена (см. JwtStrategy.validate)
    const fullUser = await this.usersService.findById(user.id);
    
    if (!fullUser) {
      throw new BadRequestException('User not found');
    }

    const { password, ...result } = fullUser;
    return result;
  }

  // PATCH /users/profile - Обновление профиля
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @CurrentUser() user: any,
    @Body() dto: UpdateProfileDto,
  ) {
    const updatedUser = await this.usersService.updateProfile(user.id, dto);
    
    if (!updatedUser) {
      throw new BadRequestException('Failed to update profile');
    }

    const { password, ...result } = updatedUser;
    return result;
  }
}