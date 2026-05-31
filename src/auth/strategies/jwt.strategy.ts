import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'), 
    });
  }

  async validate(payload: any) {
    const sub = Number(payload?.sub);

    if (sub === undefined || sub === null || Number.isNaN(sub)) {
      throw new UnauthorizedException();
    }

    const user = await this.usersService.findById(sub);
    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      sub: user.id,
      id: user.id,
      username: user.username,
      role: user.userinfo[0]?.role ?? 'default_user',
    };
  }
}
