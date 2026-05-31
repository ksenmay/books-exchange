import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OwnerOrAdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const user = request.user as { sub?: unknown; role?: unknown } | undefined;

    const bookIdRaw = request.params.id;
    const bookId = Number(bookIdRaw);

    if (!user || user.sub === undefined || user.role === undefined) {
      throw new ForbiddenException('Access denied');
    }

    if (!Number.isFinite(bookId)) {
      throw new ForbiddenException('Access denied');
    }

    const book = await this.prisma.books.findUnique({
      where: {
        id: bookId,
      },
    });

    if (!book) {
      throw new ForbiddenException('Book not found');
    }

    const isAdmin = user.role === 'admin' || user.role === 'ADMIN';

    if (book.ownerid === user.sub || isAdmin) {
      return true;
    }

    throw new ForbiddenException('Access denied');
  }
}
