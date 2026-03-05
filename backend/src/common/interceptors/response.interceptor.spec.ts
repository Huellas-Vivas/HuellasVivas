import { CallHandler, ExecutionContext } from '@nestjs/common';
import { ResponseInterceptor } from './response.interceptor';
import { of } from 'rxjs';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor<any>;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(() => {
    interceptor = new ResponseInterceptor();
    mockExecutionContext = {} as ExecutionContext;
  });

  it('should wrap a plain object in { data, meta: { timestamp } }', (done) => {
    const mockData = { id: 1, name: 'Test' };
    mockCallHandler = {
      handle: () => of(mockData),
    };

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (response) => {
        expect(response.data).toEqual(mockData);
        expect(response.meta).toHaveProperty('timestamp');
        expect(typeof response.meta.timestamp).toBe('string');
        done();
      },
    });
  });

  it('should pass through an already-paginated response without double wrapping', (done) => {
    const mockPaginatedData = {
      data: [{ id: 1 }],
      meta: { limit: 10, hasMore: false },
    };
    mockCallHandler = {
      handle: () => of(mockPaginatedData),
    };

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (response) => {
        expect(response.data).toEqual(mockPaginatedData.data);
        expect(response.meta).toHaveProperty('limit', 10);
        expect(response.meta).toHaveProperty('hasMore', false);
        expect(response.meta).toHaveProperty('timestamp');
        done();
      },
    });
  });
});
