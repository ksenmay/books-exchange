import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuoteDto } from './dto/create-quote.dto';

@Injectable()
export class QuotesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    bookId: number,
    userId: number,
    dto: CreateQuoteDto,
  ) {
    const book = await this.prisma.books.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    return this.prisma.quotes.create({
      data: {
        text: dto.text,
        bookid: bookId,
        userid: userId,
      },
      include: {
        users: true,
      },
    });
  }

  async findByBook(bookId: number) {
    return this.prisma.quotes.findMany({
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
    quoteId: number,
    currentUserId: number,
    role: string,
  ) {
    const quote = await this.prisma.quotes.findUnique({
      where: {
        id: quoteId,
      },
    });

    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

    if (
      quote.userid !== currentUserId &&
      role !== 'admin'
    ) {
      throw new ForbiddenException(
        'You cannot delete this quote',
      );
    }

    await this.prisma.quotes.delete({
      where: {
        id: quoteId,
      },
    });

    return {
      message: 'Quote deleted',
    };
  }
}