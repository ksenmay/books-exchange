import { IsString, IsOptional, IsNumber, Min, IsBoolean, IsEnum, IsArray } from 'class-validator';

// Используем enum из схемы Prisma (в нижнем регистре, как в schema.prisma)
export enum BookCondition {
  new = 'new',
  medium = 'medium',
  with_a_defect = 'with_a_defect',
  old = 'old',
}

export class CreateBookDto {
  @IsString()
  title!: string;

  @IsString()
  authorsnames!: string; // В схеме Prisma поле называется authorsnames

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsEnum(BookCondition)
  condition?: BookCondition;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsBoolean()
  exchangeable!: boolean; // Добавлено поле, так как оно часто нужно, но проверьте схему
}