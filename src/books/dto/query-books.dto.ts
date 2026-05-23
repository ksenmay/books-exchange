import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryBooksDto {
  @IsOptional()
  @IsString()
  status?: string; // фильтрация по статусу (если есть в БД)

  @IsOptional()
  @IsBoolean()
  exchangeable?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  ownerId?: number;

  @IsOptional()
  @IsString()
  search?: string; // поиск по названию или автору

  @IsOptional()
  @IsString()
  genre?: string;
}