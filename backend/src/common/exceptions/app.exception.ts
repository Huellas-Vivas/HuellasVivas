import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Custom exception for domain-specific errors.
 * Carries a typed error `code` (SCREAMING_SNAKE_CASE) for machine-readable identification.
 */
export class AppException extends HttpException {
  constructor(
    public readonly code: string,
    message: string | string[],
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super({ code, message }, status);
  }
}