import { SignJWT, jwtVerify } from 'jose';
import type { User } from './db';

const JWT_ALGORITHM = 'HS256';

// Session payload interface
export interface SessionPayload {
  userId: string;
  email: string;
  githubId: number;
  iat?: number;
  exp?: number;
}

// Create JWT secret key from string
function getSecretKey(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

// Sign a new JWT token
export async function signToken(
  payload: Omit<SessionPayload, 'iat' | 'exp'>,
  secret: string,
  expiresIn: string = '7d'
): Promise<string> {
  const secretKey = getSecretKey(secret);
  
  const token = await new SignJWT(payload as any)
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey);

  return token;
}

// Verify and decode JWT token
export async function verifyToken(
  token: string,
  secret: string
): Promise<SessionPayload | null> {
  try {
    const secretKey = getSecretKey(secret);
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as SessionPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// Create session cookie header
export function createSessionCookie(token: string, maxAge: number = 60 * 60 * 24 * 7): string {
  return `session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

// Delete session cookie header
export function deleteSessionCookie(): string {
  return 'session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0';
}

// Extract token from cookie string
export function getTokenFromCookies(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  return cookies.session || null;
}

// Get user from request
export async function getUserFromRequest(
  request: Request,
  jwtSecret: string
): Promise<SessionPayload | null> {
  const cookieHeader = request.headers.get('Cookie');
  const token = getTokenFromCookies(cookieHeader);
  
  if (!token) return null;
  
  return await verifyToken(token, jwtSecret);
}

// Generate user ID from GitHub ID
export function generateUserId(githubId: number): string {
  return `github_${githubId}`;
}
