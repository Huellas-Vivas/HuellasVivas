import { Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CategoriesRepository } from './categories.repository';
import { CategoryResponseDto } from './dto/category-response.dto';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async findAll(): Promise<CategoryResponseDto[]> {
    this.logger.log('Fetching all categories');
    const categories = await this.categoriesRepository.findAll();
    return plainToInstance(CategoryResponseDto, categories, {
      excludeExtraneousValues: true,
    });
  }
}
