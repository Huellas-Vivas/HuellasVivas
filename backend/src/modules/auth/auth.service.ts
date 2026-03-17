import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { AppException } from '../../common/exceptions/app.exception';
import { UsersRepository } from '../users/users.repository';
import { WalletsService } from '../wallets/wallets.service';
import { AuthRepository } from './auth.repository';
import { AuthTokensDto } from './dto/auth-tokens.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const BCRYPT_ROUNDS = 12;
const REFRESH_TOKEN_BCRYPT_ROUNDS = 10;
const REFRESH_TOKEN_TTL_DAYS = 7;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly authRepository: AuthRepository,
    private readonly walletsService: WalletsService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<void> {
    if (dto.password !== dto.confirmPassword) {
      throw new AppException(
        'PASSWORDS_DO_NOT_MATCH',
        'Passwords do not match',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingByUsername = await this.usersRepository.findByUsername(dto.username);
    if (existingByUsername) {
      throw new AppException(
        'USERNAME_TAKEN',
        `Username '${dto.username}' is already taken`,
        HttpStatus.CONFLICT,
      );
    }

    const existingByEmail = await this.usersRepository.findByEmail(dto.email);
    if (existingByEmail) {
      throw new AppException(
        'EMAIL_TAKEN',
        `Email '${dto.email}' is already registered`,
        HttpStatus.CONFLICT,
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.usersRepository.create({
      username: dto.username,
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });

    this.walletsService
      .generateAndSave(user.id)
      .catch((error) =>
        this.logger.error(`Failed to generate wallet for user ${user.id}`, error),
      );
  }

  async login(dto: LoginDto): Promise<AuthTokensDto> {
    const user = await this.usersRepository.findByUsername(dto.username);
    if (!user) {
      throw new AppException(
        'INVALID_CREDENTIALS',
        'Invalid username or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppException(
        'INVALID_CREDENTIALS',
        'Invalid username or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      username: user.username,
    });

    const rawRefreshToken = crypto.randomBytes(64).toString('hex');
    const tokenHash = await bcrypt.hash(rawRefreshToken, REFRESH_TOKEN_BCRYPT_ROUNDS);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

    await this.authRepository.saveRefreshToken({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    return { accessToken, refreshToken: rawRefreshToken };
  }
}
