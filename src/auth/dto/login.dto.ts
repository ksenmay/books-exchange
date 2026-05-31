import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'testuser', description: 'Имя пользователя' })
  @IsString()
  username!: string;

  @ApiProperty({ example: '123456', description: 'Пароль' })
  @IsString()
  password!: string;
}
