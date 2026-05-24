import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FavoritesService } from './favorites.service';

@ApiTags('Favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(
    private readonly favoritesService: FavoritesService,
  ) {}

  @ApiOperation({
    summary:
      'Get current user favorites',
  })
  @Get()
  async getMyFavorites(
    @Req()
    req: any,
  ) {
    return this.favoritesService.getUserFavorites(
      req.user.sub,
    );
  }

  @ApiOperation({
    summary:
      'Add book to favorites',
  })
  @Post(':bookId')
  async add(
    @Param('bookId', ParseIntPipe)
    bookId: number,

    @Req()
    req: any,
  ) {
    return this.favoritesService.add(
      req.user.sub,
      bookId,
    );
  }

  @ApiOperation({
    summary:
      'Remove book from favorites',
  })
  @Delete(':bookId')
  async remove(
    @Param('bookId', ParseIntPipe)
    bookId: number,

    @Req()
    req: any,
  ) {
    return this.favoritesService.remove(
      req.user.sub,
      bookId,
    );
  }
}