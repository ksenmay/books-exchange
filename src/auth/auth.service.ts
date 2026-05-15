// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
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
    return this.usersService.create(dto);
  }

  async login(username: string, password: string) {
    // Ищем пользователя вместе с userinfo
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Неверное имя пользователя или пароль');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверное имя пользователя или пароль');
    }

    // Роль берём из первой (и единственной) записи userinfo
    const role = user.userinfo[0]?.role ?? 'default_user';

    const payload = {
      sub: user.id,
      username: user.username,
      role: role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}