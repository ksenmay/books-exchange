import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OwnerOrAdminGuard
  implements CanActivate
{
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request =
      context.switchToHttp().getRequest();

    const user = request.user;

    const bookId = Number(
      request.params.id,
    );

    const book =
      await this.prisma.books.findUnique({
        where: {
          id: bookId,
        },
      });

    if (!book) {
      throw new ForbiddenException(
        'Book not found',
      );
    }

    if (
      book.ownerid === user.sub ||
      user.role === 'admin'
    ) {
      return true;
    }

    throw new ForbiddenException(
      'Access denied',
    );
  }
}