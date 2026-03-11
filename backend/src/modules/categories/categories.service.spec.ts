import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { CategoriesRepository } from './categories.repository';
import { Category } from './entities/category.entity';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: CategoriesRepository;

  const mockCategories: Category[] = [
    { id: '1', slug: 'CAT', label: 'Gato' },
    { id: '2', slug: 'DOG', label: 'Perro' },
    { id: '3', slug: 'OTHER', label: 'Otros' },
    { id: '4', slug: 'RABBIT', label: 'Conejo' },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: CategoriesRepository,
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    repository = module.get<CategoriesRepository>(CategoriesRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll: returns all categories from the repository', async () => {
    jest.spyOn(repository, 'findAll').mockResolvedValue(mockCategories);

    const result = await service.findAll();

    expect(repository.findAll).toHaveBeenCalled();
    expect(result).toHaveLength(4);
  });

  it('findAll: maps repository result correctly (id, slug, label)', async () => {
    jest.spyOn(repository, 'findAll').mockResolvedValue(mockCategories);

    const result = await service.findAll();

    expect(result).toHaveLength(4);
    result.forEach((category, index) => {
      expect(category.id).toBe(mockCategories[index].id);
      expect(category.slug).toBe(mockCategories[index].slug);
      expect(category.label).toBe(mockCategories[index].label);
    });
  });

  it('should return empty array when repository returns empty result', async () => {
    jest.spyOn(repository, 'findAll').mockResolvedValue([]);

    const result = await service.findAll();

    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should propagate repository errors', async () => {
    const mockError = new Error('Database error');
    jest.spyOn(repository, 'findAll').mockRejectedValue(mockError);

    await expect(service.findAll()).rejects.toThrow(mockError);
  });
});
