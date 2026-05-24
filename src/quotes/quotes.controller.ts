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
import { QuotesService } from './quotes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateQuoteDto } from './dto/create-quote.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Quotes')
@Controller()
export class QuotesController {
  constructor(
    private readonly quotesService: QuotesService,
  ) {}

  @ApiOperation({
    summary: 'Get quotes by book',
  })
  @Get('books/:bookId/quotes')
  async findByBook(
    @Param('bookId', ParseIntPipe)
    bookId: number,
  ) {
    return this.quotesService.findByBook(bookId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create quote',
  })
  @UseGuards(JwtAuthGuard)
  @Post('books/:bookId/quotes')
  async create(
    @Param('bookId', ParseIntPipe)
    bookId: number,

    @Body()
    dto: CreateQuoteDto,

    @Req()
    req: any,
  ) {
    return this.quotesService.create(
      bookId,
      req.user.sub,
      dto,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete quote',
  })
  @UseGuards(JwtAuthGuard)
  @Delete('quotes/:quoteId')
  async delete(
    @Param('quoteId', ParseIntPipe)
    quoteId: number,

    @Req()
    req: any,
  ) {
    return this.quotesService.delete(
      quoteId,
      req.user.sub,
      req.user.role,
    );
  }
}