import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';
import { User } from './entities/user.entity';

interface CreateUserPayload {
  username: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
}

const USER_COLUMNS =
  'id, username, email, password_hash, first_name, last_name, avatar_url, created_at, updated_at';

@Injectable()
export class UsersRepository {
  private readonly logger = new Logger(UsersRepository.name);

  constructor(private readonly supabase: SupabaseService) {}

  async findByUsername(username: string): Promise<User | null> {
    const { data, error } = await this.supabase.adminClient
      .from('users')
      .select(USER_COLUMNS)
      .eq('username', username)
      .maybeSingle();

    if (error) {
      this.logger.error('Failed to find user by username', error);
      throw error;
    }

    return data ? this.mapRow(data) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.supabase.adminClient
      .from('users')
      .select(USER_COLUMNS)
      .eq('email', email)
      .maybeSingle();

    if (error) {
      this.logger.error('Failed to find user by email', error);
      throw error;
    }

    return data ? this.mapRow(data) : null;
  }

  async create(payload: CreateUserPayload): Promise<User> {
    const { data, error } = await this.supabase.adminClient
      .from('users')
      .insert({
        username: payload.username,
        email: payload.email,
        password_hash: payload.passwordHash,
        first_name: payload.firstName,
        last_name: payload.lastName,
      })
      .select(USER_COLUMNS)
      .single();

    if (error) {
      this.logger.error('Failed to create user', error);
      throw error;
    }

    return this.mapRow(data);
  }

  private mapRow(row: Record<string, unknown>): User {
    return {
      id: row['id'] as string,
      username: row['username'] as string,
      email: row['email'] as string,
      passwordHash: row['password_hash'] as string,
      firstName: row['first_name'] as string,
      lastName: row['last_name'] as string,
      avatarUrl: (row['avatar_url'] as string) ?? null,
      createdAt: new Date(row['created_at'] as string),
      updatedAt: new Date(row['updated_at'] as string),
    };
  }
}
