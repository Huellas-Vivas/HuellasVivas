import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { AppException } from '../../common/exceptions/app.exception';
import { User } from '../users/entities/user.entity';
import { UsersRepository } from '../users/users.repository';
import { WalletsService } from '../wallets/wallets.service';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: jest.Mocked<UsersRepository>;
  let authRepository: jest.Mocked<AuthRepository>;
  let walletsService: jest.Mocked<WalletsService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser: User = {
    id: 'user-uuid-123',
    username: 'juan_perez',
    email: 'juan@example.com',
    passwordHash: '$2b$12$hashed_password',
    firstName: 'Juan',
    lastName: 'Pérez',
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersRepository,
          useValue: {
            findByUsername: jest.fn(),
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: AuthRepository,
          useValue: {
            saveRefreshToken: jest.fn(),
          },
        },
        {
          provide: WalletsService,
          useValue: {
            generateAndSave: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersRepository = module.get(UsersRepository);
    authRepository = module.get(AuthRepository);
    walletsService = module.get(WalletsService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      username: 'juan_perez',
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@example.com',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
    };

    it('throws PASSWORDS_DO_NOT_MATCH when passwords differ', async () => {
      await expect(
        service.register({ ...registerDto, confirmPassword: 'Different123!' }),
      ).rejects.toMatchObject({
        code: 'PASSWORDS_DO_NOT_MATCH',
      });
    });

    it('throws USERNAME_TAKEN when username already exists', async () => {
      usersRepository.findByUsername.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toMatchObject({
        code: 'USERNAME_TAKEN',
      });
    });

    it('throws EMAIL_TAKEN when email already exists', async () => {
      usersRepository.findByUsername.mockResolvedValue(null);
      usersRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toMatchObject({
        code: 'EMAIL_TAKEN',
      });
    });

    it('calls bcrypt.hash with cost 12 before saving user', async () => {
      usersRepository.findByUsername.mockResolvedValue(null);
      usersRepository.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$12$hashed');
      usersRepository.create.mockResolvedValue(mockUser);
      walletsService.generateAndSave.mockResolvedValue(undefined);

      await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 12);
      expect(usersRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ passwordHash: '$2b$12$hashed' }),
      );
    });

    it('calls walletsService.generateAndSave fire-and-forget after user creation', async () => {
      usersRepository.findByUsername.mockResolvedValue(null);
      usersRepository.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$12$hashed');
      usersRepository.create.mockResolvedValue(mockUser);
      walletsService.generateAndSave.mockResolvedValue(undefined);

      await service.register(registerDto);

      expect(walletsService.generateAndSave).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('login', () => {
    const loginDto = {
      username: 'juan_perez',
      password: 'SecurePass123!',
    };

    it('throws INVALID_CREDENTIALS when user not found', async () => {
      usersRepository.findByUsername.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toMatchObject({
        code: 'INVALID_CREDENTIALS',
      });
    });

    it('throws INVALID_CREDENTIALS when password does not match', async () => {
      usersRepository.findByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toMatchObject({
        code: 'INVALID_CREDENTIALS',
      });
    });

    it('returns { accessToken, refreshToken } on valid credentials', async () => {
      usersRepository.findByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('mock_access_token');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_refresh_token');
      authRepository.saveRefreshToken.mockResolvedValue(undefined);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken', 'mock_access_token');
      expect(result).toHaveProperty('refreshToken');
      expect(typeof result.refreshToken).toBe('string');
      expect(result.refreshToken.length).toBeGreaterThan(0);
    });

    it('access token payload contains { sub: user.id, username: user.username }', async () => {
      usersRepository.findByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('mock_access_token');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_refresh_token');
      authRepository.saveRefreshToken.mockResolvedValue(undefined);

      await service.login(loginDto);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        username: mockUser.username,
      });
    });
  });
});
