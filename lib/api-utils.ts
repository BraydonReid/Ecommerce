import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

/**
 * Standard API response types
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Create a successful API response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true as const,
      data,
      ...(message && { message }),
    },
    { status }
  );
}

/**
 * Create an error API response
 */
export function errorResponse(
  error: string,
  status: number = 400,
  code?: string,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false as const,
      error,
      ...(code && { code }),
      ...(details && { details }),
    },
    { status }
  );
}

/**
 * Common error responses
 */
export const ApiErrors = {
  unauthorized: () => errorResponse('Unauthorized', 401, 'UNAUTHORIZED'),
  forbidden: () => errorResponse('Forbidden', 403, 'FORBIDDEN'),
  notFound: (resource: string = 'Resource') =>
    errorResponse(`${resource} not found`, 404, 'NOT_FOUND'),
  badRequest: (message: string = 'Bad request') =>
    errorResponse(message, 400, 'BAD_REQUEST'),
  validationError: (errors: unknown) =>
    errorResponse('Validation failed', 400, 'VALIDATION_ERROR', errors),
  serverError: (message: string = 'Internal server error') =>
    errorResponse(message, 500, 'SERVER_ERROR'),
  conflict: (message: string = 'Resource already exists') =>
    errorResponse(message, 409, 'CONFLICT'),
  tooManyRequests: () =>
    errorResponse('Too many requests', 429, 'TOO_MANY_REQUESTS'),
};

/**
 * Handle errors uniformly across API routes
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  console.error('API Error:', error);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return ApiErrors.validationError(
      error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }))
    );
  }

  // Handle known error types
  if (error instanceof Error) {
    // Prisma unique constraint violation
    if (error.message.includes('Unique constraint')) {
      return ApiErrors.conflict('A record with this value already exists');
    }

    // Prisma record not found
    if (error.message.includes('Record to update not found')) {
      return ApiErrors.notFound();
    }

    // Return generic error in production, detailed in development
    if (process.env.NODE_ENV === 'development') {
      return errorResponse(error.message, 500, 'SERVER_ERROR');
    }
  }

  return ApiErrors.serverError();
}

/**
 * Wrap an API handler with error handling
 */
export function withErrorHandling<T>(
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T | ApiErrorResponse>> {
  return handler().catch(handleApiError);
}

/**
 * Parse and validate JSON body
 */
export async function parseBody<T>(
  request: Request,
  schema: { parse: (data: unknown) => T }
): Promise<T> {
  const body = await request.json();
  return schema.parse(body);
}

/**
 * Rate limiting helper (simple in-memory implementation)
 * For production, use Redis or a dedicated rate limiting service
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || record.resetTime < now) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Extract client IP from request headers
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

/**
 * Create pagination metadata
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function createPaginationMeta(
  page: number,
  pageSize: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / pageSize);
  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Parse pagination params from URL search params
 */
export function parsePaginationParams(
  searchParams: URLSearchParams,
  defaults: { page: number; pageSize: number } = { page: 1, pageSize: 20 }
): { page: number; pageSize: number; skip: number; take: number } {
  const page = Math.max(1, parseInt(searchParams.get('page') || String(defaults.page), 10));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get('pageSize') || String(defaults.pageSize), 10))
  );

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}
