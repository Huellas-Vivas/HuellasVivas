import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesRepository {
  private readonly logger = new Logger(CategoriesRepository.name);

  constructor(private readonly supabase: SupabaseService) {}

  async findAll(): Promise<Category[]> {
    const { data, error } = await this.supabase.client
      .from('categories')
      .select('id, slug, label')
      .order('slug', { ascending: true });

    if (error) {
      this.logger.error('Failed to fetch categories', error);
      throw error;
    }

    return (data || []).map((row) => this.mapRow(row));
  }

  private mapRow(row: Record<string, unknown>): Category {
    return {
      id: row['id'] as string,
      slug: row['slug'] as string,
      label: row['label'] as string,
    };
  }
}
