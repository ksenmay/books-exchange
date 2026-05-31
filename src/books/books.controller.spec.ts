import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { OwnerOrAdminGuard } from '../common/guards/owner-or-admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

jest.mock('../prisma/prisma.service', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    books: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  })),
}));

describe('BooksController', () => {
  let controller: BooksController;
  let booksService: BooksService;

  const mockBooksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockOwnerOrAdminGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        {
          provide: BooksService,
          useValue: mockBooksService,
        },
      ],
    })
      .overrideGuard(OwnerOrAdminGuard)
      .useValue(mockOwnerOrAdminGuard)
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<BooksController>(BooksController);

    booksService = module.get<BooksService>(BooksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('должен создать книгу', async () => {
      const dto = {
        title: 'Война и мир',
        authorsnames: 'Лев Толстой',
        description: 'Великий роман',
        genre: 'Роман',
        condition: 'new' as any,
        price: 500,
        exchangeable: true,
      };

      const req = {
        user: {
          sub: 1,
          username: 'reader1',
          role: 'default_user',
        },
      };

      const result = {
        id: 1,
        title: 'Война и мир',
        authorsnames: 'Лев Толстой',
        ownerid: 1,
        users: {
          id: 1,
          username: 'reader1',
        },
        createdat: new Date(),
      };

      mockBooksService.create.mockResolvedValue(result);

      expect(await controller.create(dto, req)).toEqual(result);

      expect(booksService.create).toHaveBeenCalledWith(dto, req.user.sub);
    });

    it('должен обработать ошибку создания книги', async () => {
      const dto = {
        title: '',
        authorsnames: '',
        exchangeable: true,
      };

      const req = {
        user: {
          sub: 1,
        },
      };

      mockBooksService.create.mockRejectedValue(
        new Error('Некорректные данные книги'),
      );

      await expect(controller.create(dto, req)).rejects.toThrow(
        'Некорректные данные книги',
      );
    });
  });

  describe('findAll', () => {
    it('должен вернуть все книги', async () => {
      const query = {};

      const result = [
        {
          id: 1,
          title: 'Война и мир',
          authorsnames: 'Лев Толстой',
          users: {
            id: 1,
            username: 'reader1',
          },
        },
        {
          id: 2,
          title: 'Преступление и наказание',
          authorsnames: 'Фёдор Достоевский',
          users: {
            id: 2,
            username: 'reader2',
          },
        },
      ];

      mockBooksService.findAll.mockResolvedValue(result);

      expect(await controller.findAll(query)).toEqual(result);

      expect(booksService.findAll).toHaveBeenCalledWith(query);
    });

    it('должен вернуть книги с фильтрацией', async () => {
      const query = {
        genre: 'Роман',
        search: 'Война',
      };

      const result = [
        {
          id: 1,
          title: 'Война и мир',
          authorsnames: 'Лев Толстой',
          genre: 'Роман',
        },
      ];

      mockBooksService.findAll.mockResolvedValue(result);

      expect(await controller.findAll(query)).toEqual(result);

      expect(booksService.findAll).toHaveBeenCalledWith(query);
    });

    it('должен вернуть пустой массив если книг нет', async () => {
      const query = {};

      mockBooksService.findAll.mockResolvedValue([]);

      expect(await controller.findAll(query)).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('должен вернуть книгу по id', async () => {
      const id = '1';

      const result = {
        id: 1,
        title: 'Война и мир',
        authorsnames: 'Лев Толстой',
        users: {
          id: 1,
          username: 'reader1',
        },
        reviews: [],
        quotes: [],
      };

      mockBooksService.findOne.mockResolvedValue(result);

      expect(await controller.findOne(id)).toEqual(result);

      expect(booksService.findOne).toHaveBeenCalledWith(1);
    });

    it('должен обработать ошибку если книга не найдена', async () => {
      const id = '999';

      mockBooksService.findOne.mockRejectedValue(
        new Error('Книга с ID 999 не найдена'),
      );

      await expect(controller.findOne(id)).rejects.toThrow(
        'Книга с ID 999 не найдена',
      );
    });
  });

  describe('update', () => {
    it('должен обновить книгу', async () => {
      const id = '1';

      const updateDto = {
        title: 'Война и мир (обновленное)',
        price: 600,
      };

      const req = {
        user: {
          sub: 1,
          username: 'reader1',
          role: 'default_user',
        },
      };

      const result = {
        id: 1,
        title: 'Война и мир (обновленное)',
        price: 600,
        users: {
          id: 1,
          username: 'reader1',
        },
      };

      mockBooksService.update.mockResolvedValue(result);

      expect(await controller.update(id, updateDto, req)).toEqual(result);

      expect(booksService.update).toHaveBeenCalledWith(
        1,
        updateDto,
        req.user.sub,
      );
    });

    it('должен обработать ошибку прав доступа', async () => {
      const id = '1';

      const updateDto = {
        title: 'Обновление',
      };

      const req = {
        user: {
          sub: 2,
        },
      };

      mockBooksService.update.mockRejectedValue(
        new Error('У вас нет прав на редактирование этой книги'),
      );

      await expect(controller.update(id, updateDto, req)).rejects.toThrow(
        'У вас нет прав на редактирование этой книги',
      );
    });
  });

  describe('remove', () => {
    it('должен удалить книгу', async () => {
      const id = '1';

      const req = {
        user: {
          sub: 1,
          username: 'reader1',
          role: 'default_user',
        },
      };

      const result = {
        message: 'Книга успешно удалена',
      };

      mockBooksService.remove.mockResolvedValue(result);

      expect(await controller.remove(id, req)).toEqual(result);

      expect(booksService.remove).toHaveBeenCalledWith(1, req.user.sub);
    });

    it('должен обработать ошибку прав доступа при удалении', async () => {
      const id = '1';

      const req = {
        user: {
          sub: 2,
        },
      };

      mockBooksService.remove.mockRejectedValue(
        new Error('У вас нет прав на удаление этой книги'),
      );

      await expect(controller.remove(id, req)).rejects.toThrow(
        'У вас нет прав на удаление этой книги',
      );
    });
  });

  describe('uploadImages', () => {
    it('должен загрузить изображения', async () => {
      const files = [
        { filename: 'image1.jpg' },
        { filename: 'image2.jpg' },
      ] as Express.Multer.File[];

      const result = {
        uploaded: 2,
        files: files,
      };

      expect(await controller.uploadImages(files)).toEqual(result);
    });

    it('должен обработать загрузку без файлов', async () => {
      const files = [] as Express.Multer.File[];

      const result = {
        uploaded: 0,
        files: [],
      };

      expect(await controller.uploadImages(files)).toEqual(result);
    });
  });
});
