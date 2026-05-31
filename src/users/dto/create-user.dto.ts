import { IsString, MinLength, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'testuser',
    description: 'Имя пользователя',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  username!: string;

  @ApiProperty({
    example: '123456',
    description: 'Пароль',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({
    example: 'test@mail.com',
    description: 'Email адрес',
  })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({
    example: 'Test User',
    description: 'Полное имя',
  })
  @IsOptional()
  @IsString()
  fullname?: string;

  @ApiPropertyOptional({
    example: 'Moscow',
    description: 'Местоположение',
  })
  @IsOptional()
  @IsString()
  location?: string;
}
