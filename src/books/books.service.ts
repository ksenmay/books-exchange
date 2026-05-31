import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException
} from '@nestjs/common';
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
        ownerid: userId, 
      },
      include: {
        users: true,
      },
    });
  }

  async findAll(query: QueryBooksDto) {
    const where: any = {};

    if (query.status) {
    }

    if (query.exchangeable !== undefined) {
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
        images: true,
      },
    });
  }

  async findOne(id: number) {
    const book = await this.prisma.books.findUnique({
      where: { id },
      include: {
        users: true,
        images: true,
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

    if (book.ownerid !== userId) {
      throw new ForbiddenException(
        'У вас нет прав на редактирование этой книги',
      );
    }

    return this.prisma.books.update({
      where: { id },
      data: updateBookDto,
      include: { users: true },
    });
  }

  async remove(id: number, userId: number) {
    const book = await this.findOne(id);

    if (book.ownerid !== userId) {
      throw new ForbiddenException('У вас нет прав на удаление этой книги');
    }

    await this.prisma.books.delete({
      where: { id },
    });
    return { message: 'Книга успешно удалена' };
  }

  async uploadImages(bookId: number, files: Express.Multer.File[]) {
  const urls = files.map(f => `/uploads/books/${f.filename}`);
  
  await this.prisma.images.createMany({
    data: urls.map(url => ({ bookid: bookId, url })),
  });
  
  return { uploaded: files.length, urls };
}

async reserve(bookId: number, newOwnerId: number) {
  const book = await this.findOne(bookId);

  if (book.ownerid === newOwnerId) {
    throw new BadRequestException('Нельзя зарезервировать свою книгу');
  }

  const oldOwner = book.ownerid != null
    ? await this.prisma.users.findUnique({
        where: { id: book.ownerid },
        include: { userinfo: true },
      })
    : null;

  const updatedBook = await this.prisma.books.update({
    where: { id: bookId },
    data: { ownerid: newOwnerId },
    include: { users: true },
  });

  return {
    book: updatedBook,
    previousOwner: oldOwner ? {
      username: oldOwner.username,
      email: oldOwner.userinfo?.[0]?.email ?? null,
      fullName: oldOwner.userinfo?.[0]?.fullname ?? null,
    } : null,
  };
}

}
