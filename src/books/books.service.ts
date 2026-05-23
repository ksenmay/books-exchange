import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { QueryBooksDto } from './dto/query-books.dto';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async create(createBookDto: CreateBookDto, userId: number) {
    return this.prisma.books.create({
      data: {
        ...createBookDto,
        ownerid: userId, // Связь с пользователем
        // Если есть поле exchangeable в БД, добавьте его:
        // exchangeable: createBookDto.exchangeable, 
      },
      include: {
        users: true, // Включаем данные владельца
      },
    });
  }

  async findAll(query: QueryBooksDto) {
    const where: any = {};

    if (query.status) {
      // Если в БД есть поле status, раскомментируйте:
      // where.status = query.status;
    }

    if (query.exchangeable !== undefined) {
      // where.exchangeable = query.exchangeable;
    }

    if (query.ownerId) {
      where.ownerid = query.ownerId;
    }

    if (query.genre) {
      where.genre = query.genre;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { authorsnames: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.books.findMany({
      where,
      include: {
        users: true,
      },
    });
  }

  async findOne(id: number) {
    const book = await this.prisma.books.findUnique({
      where: { id },
      include: {
        users: true,
        reviews: true,
        quotes: true,
      },
    });
    if (!book) {
      throw new NotFoundException(`Книга с ID ${id} не найдена`);
    }
    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto, userId: number) {
    const book = await this.findOne(id);
    
    // Проверка прав: только владелец может редактировать
    if (book.ownerid !== userId) {
      throw new ForbiddenException('У вас нет прав на редактирование этой книги');
    }

    return this.prisma.books.update({
      where: { id },
      data: updateBookDto,
      include: { users: true },
    });
  }

  async remove(id: number, userId: number) {
    const book = await this.findOne(id);

    // Проверка прав: только владелец может удалять
    if (book.ownerid !== userId) {
      throw new ForbiddenException('У вас нет прав на удаление этой книги');
    }

    await this.prisma.books.delete({
      where: { id },
    });
    return { message: 'Книга успешно удалена' };
  }
}