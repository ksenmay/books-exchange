import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

jest.mock('./prisma/prisma.service', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    users: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  })),
}));

describe('AppController', () => {
  let controller: AppController;
  let appService: AppService;

  const mockAppService = {
    getHello: jest.fn(),
    test: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  const mockRolesGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getHello', () => {
    it('должен вернуть Hello World!', () => {
      mockAppService.getHello.mockReturnValue('Hello World!');

      expect(controller.getHello()).toBe('Hello World!');
      expect(appService.getHello).toHaveBeenCalled();
    });
  });

  describe('test', () => {
    it('должен вернуть список пользователей', async () => {
      const users = [
        { id: 1, username: 'user1' },
        { id: 2, username: 'user2' },
      ];

      mockAppService.test.mockResolvedValue(users);

      const result = await controller.test();

      expect(result).toEqual(users);
      expect(appService.test).toHaveBeenCalled();
    });

    it('должен вернуть пустой массив если пользователей нет', async () => {
      mockAppService.test.mockResolvedValue([]);

      const result = await controller.test();

      expect(result).toEqual([]);
    });
  });

  describe('getProfile', () => {
    it('должен вернуть профиль пользователя', () => {
      const user = {
        id: 1,
        username: 'reader1',
        role: 'default_user',
      };

      const result = controller.getProfile(user);

      expect(result).toEqual({
        message: 'Ваш профиль',
        user,
      });
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('user');
    });

    it('должен работать с разными пользователями', () => {
      const adminUser = {
        id: 2,
        username: 'admin',
        role: 'admin',
      };

      const result = controller.getProfile(adminUser);

      expect(result.user.role).toBe('admin');
    });
  });

  describe('getAdminData', () => {
    it('должен вернуть приветствие для админа', () => {
      const adminUser = {
        id: 2,
        username: 'admin',
        role: 'admin',
      };

      const result = controller.getAdminData(adminUser);

      expect(result).toEqual({
        message: 'Привет, админ!',
        user: adminUser,
      });
    });

    it('должен содержать данные пользователя', () => {
      const user = {
        id: 3,
        username: 'superadmin',
        role: 'admin',
      };

      const result = controller.getAdminData(user);

      expect(result.user.id).toBe(3);
      expect(result.user.username).toBe('superadmin');
    });
  });
});
