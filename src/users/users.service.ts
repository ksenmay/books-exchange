import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
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

    async updateProfile(userId: number, dto: UpdateProfileDto) {
    // 1. Проверка на уникальность email, если он передан
    if (dto.email) {
      const existingEmail = await this.prisma.userinfo.findFirst({
        where: {
          email: dto.email,
          NOT: { userid: userId }, // Исключаем текущего пользователя
        },
      });
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    try {
      // 2. Находим запись userinfo по userid (так как это не unique key для findUnique)
      const userInfoRecord = await this.prisma.userinfo.findFirst({
        where: { userid: userId },
      });

      if (!userInfoRecord) {
        // Если записи нет, можно создать её или выбросить ошибку
        // В данном случае создадим, если логика позволяет, или выбросим 404
        throw new NotFoundException('User profile not found');
      }

      // 3. Обновляем запись по её первичному ключу (id)
      const updatedUserInfo = await this.prisma.userinfo.update({
        where: { id: userInfoRecord.id },
        data: {
          fullname: dto.fullname,
          location: dto.location,
          avatarurl: dto.avatarUrl, // Обратите внимание: в БД поле avatarurl (lowercase)
          email: dto.email,
        },
      });

      // 4. Возвращаем обновленные данные пользователя целиком
      return this.prisma.users.findUnique({
        where: { id: userId },
        include: { userinfo: true },
      });
    } catch (error: any) {
      if (error.code === 'P2025' || error instanceof NotFoundException) {
        throw new NotFoundException('User profile not found');
      }
      throw new InternalServerErrorException('Could not update profile');
    }
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
    } catch (error: any) {
      throw new InternalServerErrorException('Could not create user');
    }
  }
}