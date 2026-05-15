// src/users/users.service.ts
import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Найти пользователя по username вместе с его userinfo (роль, email)
  async findByUsername(username: string) {
    return this.prisma.users.findUnique({
      where: { username },
      include: { userinfo: true },
    });
  }

  // Найти по id (для JWT стратегии)
  async findById(id: number) {
    return this.prisma.users.findUnique({
      where: { id },
      include: { userinfo: true },
    });
  }

  // Регистрация
  async create(dto: CreateUserDto) {
    // Проверим, не занят ли username
    const existingUser = await this.prisma.users.findUnique({
      where: { username: dto.username },
    });
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Проверим email (можно поискать по userinfo.email)
    const existingEmail = await this.prisma.userinfo.findFirst({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Создаём пользователя и сразу связанную запись userinfo
    try {
      const user = await this.prisma.users.create({
        data: {
          username: dto.username,
          password: hashedPassword,
          userinfo: {
            create: {
              email: dto.email,
              fullname: dto.fullname,
              location: dto.location,
              role: 'default_user', // роль по умолчанию
            },
          },
        },
        include: { userinfo: true },
      });

      // Не возвращаем пароль
      const { password, ...result } = user;
      return result;
    } catch (error) {
      throw new InternalServerErrorException('Could not create user');
    }
  }
}