import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface AuthTokenPayload extends JwtPayload {
  userId?: string | number;
  name?: string;
  email?: string;
  avatar?: string;
}

const HEADER_USER_ID = 'x-user-id';
const HEADER_USER_NAME = 'x-user-name';
const HEADER_USER_AVATAR = 'x-user-avatar';

function toSafeHeaderValue(value: string): string {
  // HTTP headers only permit visible ASCII characters; encode non-ASCII (e.g. Vietnamese names).
  return /[^\x20-\x7E]/.test(value) ? encodeURIComponent(value) : value;
}

/**
 * Extracts and verifies a Bearer JWT if present, forwarding user identity
 * via x-user-* headers. Strips incoming x-user-* headers first to prevent spoofing.
 * Requests without a token or with an invalid token still pass through.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  delete req.headers[HEADER_USER_ID];
  delete req.headers[HEADER_USER_NAME];
  delete req.headers[HEADER_USER_AVATAR];

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    next();
    return;
  }

  const jwtSecret = process.env.JWT_SECRET || 'supersecret';

  try {
    const decoded = jwt.verify(token, jwtSecret) as AuthTokenPayload;

    if (decoded.userId !== undefined && decoded.userId !== null) {
      req.headers[HEADER_USER_ID] = String(decoded.userId);
    }
    if (typeof decoded.name === 'string' && decoded.name.length > 0) {
      req.headers[HEADER_USER_NAME] = toSafeHeaderValue(decoded.name);
    }
    if (typeof decoded.avatar === 'string' && decoded.avatar.length > 0) {
      req.headers[HEADER_USER_AVATAR] = toSafeHeaderValue(decoded.avatar);
    }
  } catch {
    // Optional auth: ignore invalid/expired tokens and continue as anonymous.
  }

  next();
}
