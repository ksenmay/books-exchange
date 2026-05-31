import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum BookCondition {
  new = 'new',
  medium = 'medium',
  with_a_defect = 'with_a_defect',
  old = 'old',
}

export class CreateBookDto {
  @ApiProperty({ example: 'Мастер и Маргарита', description: 'Название книги' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Михаил Булгаков', description: 'Автор(ы) книги' })
  @IsString()
  authorsnames!: string;

  @ApiPropertyOptional({
    example: 'Классика русской литературы',
    description: 'Описание',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Роман', description: 'Жанр' })
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiPropertyOptional({
    enum: BookCondition,
    example: 'new',
    description: 'Состояние книги',
  })
  @IsOptional()
  @IsEnum(BookCondition)
  condition?: BookCondition;

  @ApiPropertyOptional({ example: 500, description: 'Цена', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ example: true, description: 'Доступна для обмена' })
  @IsBoolean()
  exchangeable!: boolean;
}
