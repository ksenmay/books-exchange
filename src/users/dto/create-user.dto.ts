import { IsString, MinLength, IsEmail, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  username!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  fullname?: string;

  @IsOptional()
  @IsString()
  location?: string;
}