import { IsString, IsOptional, IsEmail } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Updated Name', description: 'Полное имя' })
  @IsOptional()
  @IsString()
  fullname?: string;

  @ApiPropertyOptional({
    example: 'Saint Petersburg',
    description: 'Местоположение',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    example: 'http://example.com/avatar.jpg',
    description: 'URL аватара',
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({
    example: 'newemail@mail.com',
    description: 'Email адрес',
  })
  @IsOptional()
  @IsEmail()
  email?: string;
}
