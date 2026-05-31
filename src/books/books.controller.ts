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
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';

import { FilesInterceptor } from '@nestjs/platform-express';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { QueryBooksDto } from './dto/query-books.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OwnerOrAdminGuard } from '../common/guards/owner-or-admin.guard';
import { diskStorage } from 'multer'
import { extname, join } from 'path'; 
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';

@ApiTags('Books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @ApiOperation({ summary: 'Создать новую книгу' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateBookDto })
  @ApiResponse({ status: 201, description: 'Книга успешно создана' })
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createBookDto: CreateBookDto, @Request() req) {
    return this.booksService.create(createBookDto, req.user.sub);
  }

  @ApiOperation({ summary: 'Получить список всех книг' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Поиск по названию или автору',
  })
  @ApiQuery({ name: 'genre', required: false, description: 'Фильтр по жанру' })
  @ApiQuery({
    name: 'ownerId',
    required: false,
    description: 'Фильтр по владельцу',
  })
  @ApiQuery({
    name: 'exchangeable',
    required: false,
    description: 'Только для обмена',
  })
  @ApiResponse({ status: 200, description: 'Список книг' })
  @Get()
  findAll(@Query() query: QueryBooksDto) {
    return this.booksService.findAll(query);
  }

  @ApiOperation({ summary: 'Получить книгу по ID' })
  @ApiResponse({ status: 200, description: 'Книга найдена' })
  @ApiResponse({ status: 404, description: 'Книга не найдена' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(+id);
  }

  @ApiOperation({ summary: 'Обновить книгу' })
  @ApiBearerAuth()
  @ApiBody({ type: UpdateBookDto })
  @ApiResponse({ status: 200, description: 'Книга обновлена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Нет прав на редактирование' })
  @ApiResponse({ status: 404, description: 'Книга не найдена' })
  @Patch(':id')
  @UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
  update(
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto,
    @Request() req,
  ) {
    return this.booksService.update(+id, updateBookDto, req.user.sub);
  }

  @ApiOperation({ summary: 'Удалить книгу' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Книга удалена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Нет прав на удаление' })
  @ApiResponse({ status: 404, description: 'Книга не найдена' })
  @Delete(':id')
  @UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.booksService.remove(+id, req.user.sub);
  }

@ApiOperation({ summary: 'Загрузить изображения книги' })
@ApiBearerAuth()
@ApiConsumes('multipart/form-data')
@ApiResponse({ status: 201, description: 'Изображения загружены' })
@ApiResponse({ status: 401, description: 'Не авторизован' })
@ApiResponse({ status: 403, description: 'Нет прав' })
@Post(':id/images')
@UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
@UseInterceptors(FilesInterceptor('images', 5, {
  storage: diskStorage({
      destination: join(process.cwd(), 'uploads', 'books'),      filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
}))
async uploadImages(
  @Param('id', ParseIntPipe) id: number,
  @UploadedFiles() files: Express.Multer.File[],
) {
  if (!files || files.length === 0) {
    throw new BadRequestException('Файлы не загружены');
  }
  return this.booksService.uploadImages(id, files);
}

@ApiOperation({ summary: 'Зарезервировать книгу (смена владельца)' })
@ApiBearerAuth()
@ApiResponse({ status: 200, description: 'Книга зарезервирована' })
@ApiResponse({ status: 400, description: 'Нельзя зарезервировать свою книгу' })
@ApiResponse({ status: 401, description: 'Не авторизован' })
@Post(':id/reserve')
@UseGuards(JwtAuthGuard)
reserve(
  @Param('id', ParseIntPipe) id: number,
  @Request() req,
) {
  return this.booksService.reserve(id, req.user.sub);
}

}
