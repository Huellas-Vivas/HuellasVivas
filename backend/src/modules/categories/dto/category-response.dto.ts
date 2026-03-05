import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CategoryResponseDto {
  @ApiProperty({
    description: 'Unique category identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Category slug (uppercase)',
    example: 'DOG',
    enum: ['DOG', 'CAT', 'RABBIT', 'OTHER'],
  })
  @Expose()
  slug: string;

  @ApiProperty({
    description: 'Human-readable category label',
    example: 'Perro',
  })
  @Expose()
  label: string;
}
