import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    bookId: number,
    userId: number,
    dto: CreateReviewDto,
  ) {
    const book = await this.prisma.books.findUnique({
      where: {
        id: bookId,
      },
    });

    if (!book) {
      throw new NotFoundException(
        'Book not found',
      );
    }

    return this.prisma.reviews.create({
      data: {
        rating: dto.rating,
        description: dto.description,
        bookid: bookId,
        userid: userId,
      },

      include: {
        users: true,
      },
    });
  }

  async findByBook(bookId: number) {
    return this.prisma.reviews.findMany({
      where: {
        bookid: bookId,
      },

      include: {
        users: true,
      },

      orderBy: {
        createdat: 'desc',
      },
    });
  }

  async delete(
    reviewId: number,
    currentUserId: number,
    role: string,
  ) {
    const review =
      await this.prisma.reviews.findUnique({
        where: {
          id: reviewId,
        },
      });

    if (!review) {
      throw new NotFoundException(
        'Review not found',
      );
    }

    if (
      review.userid !== currentUserId &&
      role !== 'admin'
    ) {
      throw new ForbiddenException(
        'You cannot delete this review',
      );
    }

    await this.prisma.reviews.delete({
      where: {
        id: reviewId,
      },
    });

    return {
      message: 'Review deleted',
    };
  }
}