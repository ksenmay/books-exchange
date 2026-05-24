import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';

import { FilesInterceptor } from '@nestjs/platform-express';
import { BooksService } from './books.service';
import { Express } from 'express';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { QueryBooksDto } from './dto/query-books.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OwnerOrAdminGuard } from '../common/guards/owner-or-admin.guard';
import { Multer } from 'multer';

@Controller('books')
export class BooksController {
  constructor(
    private readonly booksService: BooksService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createBookDto: CreateBookDto,
    @Request() req,
  ) {
    return this.booksService.create(
      createBookDto,
      req.user.sub,
    );
  }

  @Get()
  findAll(@Query() query: QueryBooksDto) {
    return this.booksService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(
    JwtAuthGuard,
    OwnerOrAdminGuard,
  )
  update(
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto,
    @Request() req,
  ) {
    return this.booksService.update(
      +id,
      updateBookDto,
      req.user.sub,
    );
  }

  @Delete(':id')
  @UseGuards(
    JwtAuthGuard,
    OwnerOrAdminGuard,
  )
  remove(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.booksService.remove(
      +id,
      req.user.sub,
    );
  }

   @Post(':id/images')
  @UseGuards(
    JwtAuthGuard,
    OwnerOrAdminGuard,
  )
  @UseInterceptors(
    FilesInterceptor('images', 5),
  )
  uploadImages(
    @UploadedFiles()
    files: Express.Multer.File[],
  ) {
    return {
      uploaded: files.length,
      files,
    };
  }
}