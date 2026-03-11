import { HttpExceptionFilter } from './http-exception.filter';
import { AppException } from '../exceptions/app.exception';
import {
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockArgumentsHost: ArgumentsHost;
  let mockLogger: jest.SpyInstance;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    mockLogger = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockRequest = {
      url: '/test',
      method: 'GET',
    };
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should format 400 validation errors', () => {
    const exception = new HttpException(
      { message: ['Title is required'], error: 'Bad Request', statusCode: 400 },
      HttpStatus.BAD_REQUEST,
    );
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: ['Title is required'],
        }),
      }),
    );
    expect(mockLogger).not.toHaveBeenCalled();
  });

  it('should format 404 errors', () => {
    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          statusCode: 404,
          code: 'NOT_FOUND',
          message: 'Not Found',
          details: null,
        }),
      }),
    );
    expect(mockLogger).not.toHaveBeenCalled();
  });

  it('should format unhandled errors (500) and call logger', () => {
    const exception = new Error('Database connection failed');
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          statusCode: 500,
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Internal server error',
          details: null,
        }),
      }),
    );
    expect(mockLogger).toHaveBeenCalled();
  });

  it('should handle custom AppException properly', () => {
    const exception = new AppException(
      'CUSTOM_ERROR',
      'Something went wrong',
      HttpStatus.CONFLICT,
    );
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          statusCode: HttpStatus.CONFLICT,
          code: 'CUSTOM_ERROR',
          message: 'Something went wrong',
          details: null,
        }),
      }),
    );
  });
});
