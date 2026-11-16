import { NextFunction, Request, Response } from 'express';

export interface GatewayUser {
  id: string;
  name: string;
  avatar: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: GatewayUser;
}

function safeDecodeHeader(value: string | undefined): string {
  if (!value) return '';
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function requireUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const userId = req.header('x-user-id')?.trim();
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized: missing x-user-id header' });
    return;
  }

  const userName = safeDecodeHeader(req.header('x-user-name')).trim() || 'Anonymous';
  const userAvatar = safeDecodeHeader(req.header('x-user-avatar')).trim() || null;

  req.user = {
    id: userId,
    name: userName,
    avatar: userAvatar,
  };

  next();
}
