import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { EmailPublisher } from '../email/email.publisher';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailPublisher: EmailPublisher,
  ) {}

  async register(dto: CreateUserDto) {
    const user = await this.usersService.create(dto);

    try {
      const email = user.userinfo?.[0]?.email;
      if (email) {
        await this.emailPublisher.publishUserRegistered({
          email,
          username: user.username,
          fullname: user.userinfo?.[0]?.fullname ?? undefined,
        });
      }
    } catch (err: any) {
      console.error('Failed to publish email event:', err?.message ?? err);
    }

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

    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.userinfo?.[0]?.email,
      fullName: user.userinfo?.[0]?.fullname,
      role: role,
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

  async logout() {
    return { message: 'Успешный выход' };
  }
}
