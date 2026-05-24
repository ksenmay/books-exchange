import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

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
    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [AuthController],
        providers: [
          {
            provide: AuthService,
            useValue: mockAuthService,
          },
        ],
      }).compile();

    controller =
      module.get<AuthController>(
        AuthController,
      );

    authService =
      module.get<AuthService>(
        AuthService,
      );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register user', async () => {
      const dto = {
        username: 'reader1',
        password: '12345678',
        email: 'reader@mail.com',
      };

      const result = {
        user: {
          id: 1,
          username: 'reader1',
        },
        access_token: 'token',
      };

      mockAuthService.register.mockResolvedValue(
        result,
      );

      expect(
        await controller.register(dto),
      ).toEqual(result);

      expect(
        authService.register,
      ).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should login user', async () => {
      const dto = {
        username: 'admin',
        password: 'pass123',
      };

      const result = {
        access_token: 'jwt-token',
      };

      mockAuthService.login.mockResolvedValue(
        result,
      );

      expect(
        await controller.login(dto),
      ).toEqual(result);

      expect(
        authService.login,
      ).toHaveBeenCalledWith(
        dto.username,
        dto.password,
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const user = {
        sub: 1,
      };

      const profile = {
        id: 1,
        username: 'reader1',
      };

      mockAuthService.getProfile.mockResolvedValue(
        profile,
      );

      expect(
        await controller.getProfile(user),
      ).toEqual(profile);

      expect(
        authService.getProfile,
      ).toHaveBeenCalledWith(1);
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      const result = {
        message: 'Успешный выход',
      };

      mockAuthService.logout.mockResolvedValue(
        result,
      );

      expect(
        await controller.logout(),
      ).toEqual(result);

      expect(
        authService.logout,
      ).toHaveBeenCalled();
    });
  });
});