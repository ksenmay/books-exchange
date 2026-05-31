import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async add(userId: number, bookId: number) {
    const book = await this.prisma.books.findUnique({
      where: {
        id: bookId,
      },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    const existing = await this.prisma.favorites.findFirst({
      where: {
        userid: userId,
        bookid: bookId,
      },
    });

    if (existing) {
      throw new ConflictException('Book already in favorites');
    }

    return this.prisma.favorites.create({
      data: {
        userid: userId,
        bookid: bookId,
      },
    });
  }

  async remove(userId: number, bookId: number) {
    const favorite = await this.prisma.favorites.findFirst({
      where: {
        userid: userId,
        bookid: bookId,
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.prisma.favorites.delete({
      where: {
        id: favorite.id,
      },
    });

    return {
      message: 'Book removed from favorites',
    };
  }

  async getUserFavorites(userId: number) {
    return this.prisma.favorites.findMany({
      where: {
        userid: userId,
      },

      include: {
        books: {
          include: {
            users: true,
          },
        },
      },

      orderBy: {
        createdat: 'desc',
      },
    });
  }
}
