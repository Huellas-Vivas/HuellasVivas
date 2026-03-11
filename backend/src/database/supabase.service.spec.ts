import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ mocked: true })),
}));

describe('SupabaseService', () => {
  let configService: ConfigService;
  let createClientMock: jest.MockedFunction<typeof createClient>;

  const mockUrl = 'https://test.supabase.co';
  const mockAnonKey = 'anon-key-123';
  const mockServiceRoleKey = 'service-role-key-456';

  beforeEach(() => {
    createClientMock = createClient as jest.MockedFunction<typeof createClient>;
    createClientMock.mockClear();

    configService = {
      getOrThrow: jest.fn((key: string) => {
        const values: Record<string, string> = {
          'supabase.url': mockUrl,
          'supabase.anonKey': mockAnonKey,
          'supabase.serviceRoleKey': mockServiceRoleKey,
        };
        const value = values[key];
        if (value === undefined) {
          throw new Error(`Missing required config: ${key}`);
        }
        return value;
      }),
    } as unknown as ConfigService;
  });

  it('creates client with the anon key value from ConfigService', () => {
    new SupabaseService(configService);

    expect(createClientMock).toHaveBeenCalledWith(mockUrl, mockAnonKey);
  });

  it('creates adminClient with the service_role key value', () => {
    new SupabaseService(configService);

    expect(createClientMock).toHaveBeenCalledWith(mockUrl, mockServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  });

  it('adminClient has autoRefreshToken: false and persistSession: false', () => {
    new SupabaseService(configService);

    const adminCall = createClientMock.mock.calls.find(
      (call) => call[2]?.auth !== undefined,
    );
    expect(adminCall).toBeDefined();
    expect(adminCall![2]).toEqual({
      auth: { autoRefreshToken: false, persistSession: false },
    });
  });

  it('throws if ConfigService.getOrThrow throws (missing env var)', () => {
    const failingConfig = {
      getOrThrow: jest.fn().mockImplementation(() => {
        throw new Error('Missing required config: supabase.url');
      }),
    } as unknown as ConfigService;

    expect(() => new SupabaseService(failingConfig)).toThrow(
      'Missing required config: supabase.url',
    );
  });
});
