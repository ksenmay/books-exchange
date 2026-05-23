// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: CreateUserDto) {
    // Сервис создания пользователя должен возвращать созданного юзера и токен (или только юзера, а токен здесь)
    // Предположим, usersService.create возвращает объект пользователя без пароля
    const user = await this.usersService.create(dto);
    
    // Генерируем токен сразу после регистрации (опционально, зависит от требований)
    const role = user.userinfo?.[0]?.role ?? 'default_user';
    const payload = { sub: user.id, username: user.username, role };
    
    return {
      user,
      access_token: this.jwtService.sign(payload),
    };
  }

  async login(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Неверное имя пользователя или пароль');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверное имя пользователя или пароль');
    }

    const role = user.userinfo?.[0]?.role ?? 'default_user';

    const payload = {
      sub: user.id,
      username: user.username,
      role: role,
    };

    // Формируем объект пользователя для ответа (без чувствительных данных)
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.userinfo?.[0]?.email,
      fullName: user.userinfo?.[0]?.fullname,
      role: role,
      // ... другие поля профиля
    };

    return {
      user: userResponse,
      access_token: this.jwtService.sign(payload),
    };
  }

  async getProfile(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const role = user.userinfo?.[0]?.role ?? 'default_user';

    return {
      id: user.id,
      username: user.username,
      email: user.userinfo?.[0]?.email,
      fullName: user.userinfo?.[0]?.fullname,
      avatarUrl: user.userinfo?.[0]?.avatarurl,
      location: user.userinfo?.[0]?.location,
      role: role,
      createdAt: user.createdat,
    };
  }
  
  // Logout на стороне сервера (stateless JWT) обычно пустой метод, 
  // так как клиент просто удаляет токен у себя.
  // Если нужен blacklist токенов, нужна БД и дополнительная логика.
  async logout() {
    return { message: 'Успешный выход' };
  }
}