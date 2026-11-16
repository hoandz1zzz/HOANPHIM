import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const JWT_EXPIRES_IN = '7d';

interface SafeUser {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  createdAt: Date;
}

function toSafeUser(user: {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  createdAt: Date;
}): SafeUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    createdAt: user.createdAt,
  };
}

function signAccessToken(user: SafeUser): string {
  return jwt.sign(
    {
      userId: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar ?? '',
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const avatar = typeof req.body?.avatar === 'string' ? req.body.avatar.trim() || null : null;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'email, password, and name are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'password must be at least 6 characters' });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Email is already registered' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const created = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        avatar,
      },
    });

    const user = toSafeUser(created);
    const accessToken = signAccessToken(user);

    res.status(201).json({ accessToken, user });
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      res.status(400).json({ error: 'email and password are required' });
      return;
    }

    const found = await prisma.user.findUnique({ where: { email } });
    if (!found) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isValid = await bcrypt.compare(password, found.password);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const user = toSafeUser(found);
    const accessToken = signAccessToken(user);

    res.json({ accessToken, user });
  })
);

router.get(
  '/me',
  asyncHandler(async (req, res) => {
    const userId = req.header('x-user-id')?.trim();
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: missing x-user-id header' });
      return;
    }

    const found = await prisma.user.findUnique({ where: { id: userId } });
    if (!found) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user: toSafeUser(found) });
  })
);

router.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[auth-service] Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err instanceof Error ? err.message : 'Unknown error',
  });
});

export default router;
