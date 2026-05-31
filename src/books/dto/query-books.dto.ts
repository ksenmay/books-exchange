import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryBooksDto {
  @ApiPropertyOptional({
    example: 'Фантастика',
    description: 'Фильтр по жанру',
  })
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiPropertyOptional({
    example: 'Мастер',
    description: 'Поиск по названию или автору',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 1, description: 'Фильтр по ID владельца' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  ownerId?: number;

  @ApiPropertyOptional({ example: true, description: 'Только для обмена' })
  @IsOptional()
  @IsBoolean()
  exchangeable?: boolean;

  @ApiPropertyOptional({ example: 'active', description: 'Статус книги' })
  @IsOptional()
  @IsString()
  status?: string;
}
