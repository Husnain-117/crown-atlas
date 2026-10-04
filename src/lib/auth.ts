import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
}

export interface JWTPayload {
  userId: number | string; // Support both numeric IDs and UUIDs
  email: string;
  name: string;
  isAdmin?: boolean;
  dateOfBirth?: string;
  createdAt?: string;
  updatedAt?: string;
  iat?: number;
  exp?: number;
}

export class AuthService {
  // Generate JWT token
  static generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, getJwtSecret(), {
      expiresIn: JWT_EXPIRES_IN,
    });
  }

  // Verify JWT token
  static verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, getJwtSecret()) as JWTPayload;
      // Keep userId as-is because legacy numeric IDs and UUID strings are both supported.
      return decoded;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  // Get current user from request (for API routes)
  static getCurrentUser(request: NextRequest): JWTPayload | null {
    try {
      const token = request.cookies.get('auth-token')?.value;

      if (!token) {
        return null;
      }

      return this.verifyToken(token);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Check if user is authenticated (for API routes)
  static isAuthenticated(request: NextRequest): boolean {
    return this.getCurrentUser(request) !== null;
  }

  // Middleware helper for protecting routes
  static requireAuth(request: NextRequest): JWTPayload | null {
    const user = this.getCurrentUser(request);
    if (!user) {
      throw new Error('Authentication required');
    }
    return user;
  }
}

export default AuthService;
