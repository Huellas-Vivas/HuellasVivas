import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesRepository } from './categories.repository';
import { SupabaseService } from '../../database/supabase.service';
import { Category } from './entities/category.entity';

describe('CategoriesRepository', () => {
  let repository: CategoriesRepository;
  let supabaseService: SupabaseService;

  const mockSupabaseClient = {
    from: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesRepository,
        {
          provide: SupabaseService,
          useValue: {
            client: mockSupabaseClient,
          },
        },
      ],
    }).compile();

    repository = module.get<CategoriesRepository>(CategoriesRepository);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should query the correct table with the correct fields (id, slug, label)', async () => {
    const mockSelect = jest.fn().mockReturnThis();
    const mockOrder = jest.fn().mockResolvedValue({
      data: [],
      error: null,
    });

    mockSupabaseClient.from.mockReturnValue({
      select: mockSelect,
      order: mockOrder,
    });

    mockSelect.mockReturnValue({
      order: mockOrder,
    });

    await repository.findAll();

    expect(mockSupabaseClient.from).toHaveBeenCalledWith('categories');
    expect(mockSelect).toHaveBeenCalledWith('id, slug, label');
  });

  it('should order results by slug ascending', async () => {
    const mockSelect = jest.fn().mockReturnThis();
    const mockOrder = jest.fn().mockResolvedValue({
      data: [],
      error: null,
    });

    mockSupabaseClient.from.mockReturnValue({
      select: mockSelect,
    });

    mockSelect.mockReturnValue({
      order: mockOrder,
    });

    await repository.findAll();

    expect(mockOrder).toHaveBeenCalledWith('slug', { ascending: true });
  });

  it('should map database rows to Category entities correctly', async () => {
    const mockData = [
      { id: '1', slug: 'CAT', label: 'Gato' },
      { id: '2', slug: 'DOG', label: 'Perro' },
    ];

    const mockSelect = jest.fn().mockReturnThis();
    const mockOrder = jest.fn().mockResolvedValue({
      data: mockData,
      error: null,
    });

    mockSupabaseClient.from.mockReturnValue({
      select: mockSelect,
    });

    mockSelect.mockReturnValue({
      order: mockOrder,
    });

    const result = await repository.findAll();

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: '1',
      slug: 'CAT',
      label: 'Gato',
    });
    expect(result[1]).toEqual({
      id: '2',
      slug: 'DOG',
      label: 'Perro',
    });
  });

  it('should throw when Supabase returns an error', async () => {
    const mockError = new Error('Database connection failed');

    const mockSelect = jest.fn().mockReturnThis();
    const mockOrder = jest.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });

    mockSupabaseClient.from.mockReturnValue({
      select: mockSelect,
    });

    mockSelect.mockReturnValue({
      order: mockOrder,
    });

    await expect(repository.findAll()).rejects.toThrow(mockError);
  });

  it('should return empty array when no data is returned', async () => {
    const mockSelect = jest.fn().mockReturnThis();
    const mockOrder = jest.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    mockSupabaseClient.from.mockReturnValue({
      select: mockSelect,
    });

    mockSelect.mockReturnValue({
      order: mockOrder,
    });

    const result = await repository.findAll();

    expect(result).toEqual([]);
  });
});
