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

  async findByUsername(username: string) {
    return this.prisma.users.findUnique({
      where: { username },
      include: { userinfo: true },
    });
  }

  async findById(id: number) {
    if (id === undefined || id === null || Number.isNaN(id)) {
      throw new NotFoundException(`User not found. id=${id}`);
    }

    const user = await this.prisma.users.findUnique({
      where: { id: Number(id) },
      include: { userinfo: true },
    });

    if (!user) {
      throw new NotFoundException(`User not found. id=${id}`);
    }

    return user;
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    if (dto.email) {
      const existingEmail = await this.prisma.userinfo.findFirst({
        where: {
          email: dto.email,
          NOT: { userid: userId }, 
        },
      });
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    try {
      const userInfoRecord = await this.prisma.userinfo.findFirst({
        where: { userid: userId },
      });

      if (!userInfoRecord) {
        
        throw new NotFoundException('User profile not found');
      }

      const updatedUserInfo = await this.prisma.userinfo.update({
        where: { id: userInfoRecord.id },
        data: {
          fullname: dto.fullname,
          location: dto.location,
          avatarurl: dto.avatarUrl,
          email: dto.email,
        },
      });

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

  async create(dto: CreateUserDto) {
    const existingUser = await this.prisma.users.findUnique({
      where: { username: dto.username },
    });
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const existingEmail = await this.prisma.userinfo.findFirst({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

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
              role: 'default_user',  
            },
          },
        },
        include: { userinfo: true },
      });

      const { password, ...result } = user;
      return result;
    } catch (error: any) {
      throw new InternalServerErrorException('Could not create user');
    }
  }
}
