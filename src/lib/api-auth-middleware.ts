import { NextRequest, NextResponse } from 'next/server';
import { AuthService, JWTPayload } from '@/lib/auth';
import { isServerRequestAuthorized } from '@/lib/server-route-auth';

/**
 * Standard API response types
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Array<{ field: string; message: string }>;
}

/**
 * Authentication result from middleware
 */
export interface AuthResult {
  user: JWTPayload | null;
  userId: string;
  isAuthenticated: boolean;
}

/**
 * Options for authentication middleware
 */
export interface AuthMiddlewareOptions {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  allowGuest?: boolean;
}

/**
 * Robust authentication middleware for API routes
 * Returns standardized responses and handles all auth edge cases
 */
export class ApiAuthMiddleware {
  /**
   * Get authenticated user from request
   * Handles the application's signed JWT cookie.
   */
  static async getAuthenticatedUser(
    request: NextRequest,
    options: AuthMiddlewareOptions = {}
  ): Promise<{ user: JWTPayload | null; error: NextResponse | null }> {
    try {
      // Try to get user from JWT token (primary method)
      const jwtUser = AuthService.getCurrentUser(request);

      if (jwtUser) {
        return { user: jwtUser, error: null };
      }

      // If auth is required and no user found
      if (options.requireAuth && !options.allowGuest) {
        return {
          user: null,
          error: this.unauthorizedResponse('Authentication required')
        };
      }

      // Allow guest access if specified
      return { user: null, error: null };
    } catch (error) {
      console.error('Auth middleware error:', error);
      return {
        user: null,
        error: this.errorResponse('Authentication verification failed', 500)
      };
    }
  }

  /**
   * Require authentication - throws error response if not authenticated
   */
  static async requireAuth(
    request: NextRequest,
    requireAdmin: boolean = false
  ): Promise<{ user: JWTPayload; userId: string; error: NextResponse | null }> {
    if (requireAdmin && isServerRequestAuthorized(request, 'admin').authorized) {
      return {
        user: {
          userId: 0,
          email: 'admin@local',
          name: 'Administrator',
          isAdmin: true,
        },
        userId: '0',
        error: null,
      };
    }

    const { user, error } = await this.getAuthenticatedUser(request, { requireAuth: true });

    if (error) {
      return { user: null as any, userId: '', error };
    }

    if (!user) {
      return {
        user: null as any,
        userId: '',
        error: this.unauthorizedResponse('Authentication required')
      };
    }

    // Check admin requirement
    if (requireAdmin && !user.isAdmin && user.userId !== 0) {
      return {
        user: null as any,
        userId: '',
        error: this.forbiddenResponse('Admin access required')
      };
    }

    return {
      user,
      userId: String(user.userId),
      error: null
    };
  }

  /**
   * Standardized success response (200)
   */
  static successResponse<T>(
    data?: T,
    message?: string,
    status: number = 200
  ): NextResponse<ApiResponse<T>> {
    return NextResponse.json(
      {
        success: true,
        ...(message && { message }),
        ...(data !== undefined && { data })
      } as ApiResponse<T>,
      { status }
    );
  }

  /**
   * Standardized error response
   */
  static errorResponse(
    message: string,
    status: number = 500,
    errors?: Array<{ field: string; message: string }>
  ): NextResponse<ApiResponse> {
    return NextResponse.json(
      {
        success: false,
        message,
        ...(errors && { errors })
      } as ApiResponse,
      { status }
    );
  }

  /**
   * Unauthorized response (401)
   */
  static unauthorizedResponse(message: string = 'Not authenticated'): NextResponse<ApiResponse> {
    return this.errorResponse(message, 401);
  }

  /**
   * Forbidden response (403)
   */
  static forbiddenResponse(message: string = 'Access forbidden'): NextResponse<ApiResponse> {
    return this.errorResponse(message, 403);
  }

  /**
   * Bad request response (400)
   */
  static badRequestResponse(
    message: string = 'Bad request',
    errors?: Array<{ field: string; message: string }>
  ): NextResponse<ApiResponse> {
    return this.errorResponse(message, 400, errors);
  }

  /**
   * Not found response (404)
   */
  static notFoundResponse(message: string = 'Resource not found'): NextResponse<ApiResponse> {
    return this.errorResponse(message, 404);
  }

  /**
   * Validation error response (422)
   */
  static validationErrorResponse(
    errors: Array<{ field: string; message: string }>
  ): NextResponse<ApiResponse> {
    return this.errorResponse('Validation failed', 422, errors);
  }

  /**
   * Wrapper for API route handlers with automatic auth handling
   */
  static async withAuth<T>(
    request: NextRequest,
    handler: (auth: AuthResult) => Promise<NextResponse<ApiResponse<T>>>,
    options: AuthMiddlewareOptions = { requireAuth: true }
  ): Promise<NextResponse<ApiResponse<T>>> {
    try {
      const { user, error } = await this.getAuthenticatedUser(request, options);

      if (error) {
        return error as NextResponse<ApiResponse<T>>;
      }

      if (options.requireAuth && !user) {
        return this.unauthorizedResponse() as NextResponse<ApiResponse<T>>;
      }

      if (options.requireAdmin && user && !user.isAdmin && user.userId !== 0) {
        return this.forbiddenResponse() as NextResponse<ApiResponse<T>>;
      }

      const authResult: AuthResult = {
        user: user || null,
        userId: user ? String(user.userId) : '',
        isAuthenticated: !!user
      };

      return await handler(authResult);
    } catch (error: any) {
      console.error('API route error:', error);
      return this.errorResponse(
        error.message || 'Internal server error',
        500
      ) as NextResponse<ApiResponse<T>>;
    }
  }
}

export default ApiAuthMiddleware;


