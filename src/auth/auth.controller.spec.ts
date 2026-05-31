import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

jest.mock('../prisma/prisma.service', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  })),
}));

jest.mock('../users/users.service', () => ({
  UsersService: jest.fn().mockImplementation(() => ({
    create: jest.fn(),
    findByUsername: jest.fn(),
    findById: jest.fn(),
  })),
}));

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    getProfile: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('должен зарегистрировать пользователя', async () => {
      const dto = {
        username: 'reader1',
        password: '12345678',
        email: 'reader@mail.com',
        fullname: 'Reader One',
      };

      const result = {
        user: {
          id: 1,
          username: 'reader1',
        },
        access_token: 'token',
      };

      mockAuthService.register.mockResolvedValue(result);

      expect(await controller.register(dto)).toEqual(result);

      expect(authService.register).toHaveBeenCalledWith(dto);
    });

    it('должен обработать ошибку регистрации', async () => {
      const dto = {
        username: 'reader1',
        password: '12345678',
        email: 'reader@mail.com',
        fullname: 'Reader One',
      };

      mockAuthService.register.mockRejectedValue(
        new Error('Username already exists'),
      );

      await expect(controller.register(dto)).rejects.toThrow(
        'Username already exists',
      );
    });
  });

  describe('login', () => {
    it('должен авторизовать пользователя', async () => {
      const dto = {
        username: 'admin',
        password: 'pass123',
      };

      const result = {
        access_token: 'jwt-token',
      };

      mockAuthService.login.mockResolvedValue(result);

      expect(await controller.login(dto)).toEqual(result);

      expect(authService.login).toHaveBeenCalledWith(
        dto.username,
        dto.password,
      );
    });

    it('должен обработать неверные учетные данные', async () => {
      const dto = {
        username: 'admin',
        password: 'wrong',
      };

      mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      await expect(controller.login(dto)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });

  describe('getProfile', () => {
    it('должен вернуть профиль пользователя', async () => {
      const user = {
        sub: 1,
        username: 'reader1',
        role: 'default_user',
      };

      const profile = {
        id: 1,
        username: 'reader1',
        email: 'reader@mail.com',
        fullName: 'Reader One',
      };

      mockAuthService.getProfile.mockResolvedValue(profile);

      const result = await controller.getProfile(user);

      console.log('Результат getProfile:', result);
      console.log('Вызов authService.getProfile с аргументом:', user.sub);

      expect(result).toEqual(profile);
      expect(authService.getProfile).toHaveBeenCalledWith(user.sub);
    });

    it('должен обработать случай, когда пользователь не найден', async () => {
      const user = {
        sub: 999,
        username: 'unknown',
        role: 'default_user',
      };

      mockAuthService.getProfile.mockRejectedValue(new Error('User not found'));

      await expect(controller.getProfile(user)).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('logout', () => {
    it('должен выйти из системы', async () => {
      const result = {
        message: 'Успешный выход',
      };

      mockAuthService.logout.mockResolvedValue(result);

      expect(await controller.logout()).toEqual(result);

      expect(authService.logout).toHaveBeenCalled();
    });
  });
});
