import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';

@ApiTags('Reviews')
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiOperation({
    summary: 'Get reviews by book',
  })
  @Get('books/:bookId/reviews')
  async findByBook(
    @Param('bookId', ParseIntPipe)
    bookId: number,
  ) {
    return this.reviewsService.findByBook(bookId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create review',
  })
  @UseGuards(JwtAuthGuard)
  @Post('books/:bookId/reviews')
  async create(
    @Param('bookId', ParseIntPipe)
    bookId: number,

    @Body()
    dto: CreateReviewDto,

    @Req()
    req: any,
  ) {
    return this.reviewsService.create(bookId, req.user.sub, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete review',
  })
  @UseGuards(JwtAuthGuard)
  @Delete('reviews/:reviewId')
  async delete(
    @Param('reviewId', ParseIntPipe)
    reviewId: number,

    @Req()
    req: any,
  ) {
    return this.reviewsService.delete(reviewId, req.user.sub, req.user.role);
  }
}
