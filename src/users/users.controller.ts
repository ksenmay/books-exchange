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
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Получить профиль текущего пользователя' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Профиль пользователя' })
  @ApiResponse({ status: 400, description: 'Пользователь не найден' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@CurrentUser() user: any) {
    const fullUser = await this.usersService.findById(user.id);

    if (!fullUser) {
      throw new BadRequestException('User not found');
    }

    const { password, ...result } = fullUser;
    return result;
  }

  @ApiOperation({ summary: 'Обновить профиль пользователя' })
  @ApiBearerAuth()
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ status: 200, description: 'Профиль обновлен' })
  @ApiResponse({ status: 400, description: 'Не удалось обновить профиль' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 409, description: 'Email уже занят' })
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    const updatedUser = await this.usersService.updateProfile(user.id, dto);

    if (!updatedUser) {
      throw new BadRequestException('Failed to update profile');
    }

    const { password, ...result } = updatedUser;
    return result;
  }
}
