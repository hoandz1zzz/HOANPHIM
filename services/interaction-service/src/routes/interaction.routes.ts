import { NextFunction, Request, Response, Router } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest, requireUser } from '../middleware/requireUser';

const router = Router();

function asyncHandler(
  fn: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

function optionalString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

// 1. Watchlist
router.get(
  '/watchlist',
  requireUser,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const items = await prisma.watchlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ items });
  })
);

router.post(
  '/watchlist/toggle',
  requireUser,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const movieSlug = optionalString(req.body?.movieSlug);
    const movieName = optionalString(req.body?.movieName);

    if (!movieSlug) {
      res.status(400).json({ error: 'movieSlug is required' });
      return;
    }

    const existing = await prisma.watchlist.findUnique({
      where: {
        userId_movieSlug: { userId, movieSlug },
      },
    });

    if (existing) {
      await prisma.watchlist.delete({
        where: { id: existing.id },
      });
      res.json({ action: 'removed', inWatchlist: false, movieSlug });
      return;
    }

    if (!movieName) {
      res.status(400).json({ error: 'movieName is required when adding to watchlist' });
      return;
    }

    const item = await prisma.watchlist.create({
      data: {
        userId,
        movieSlug,
        movieName,
        thumbUrl: optionalString(req.body?.thumbUrl),
        posterUrl: optionalString(req.body?.posterUrl),
        quality: optionalString(req.body?.quality),
        currentEpisode: optionalString(req.body?.currentEpisode),
      },
    });

    res.status(201).json({ action: 'added', inWatchlist: true, item });
  })
);

// 2. Watch History
router.get(
  '/history',
  requireUser,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const items = await prisma.watchHistory.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ items });
  })
);

router.post(
  '/history',
  requireUser,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const movieSlug = optionalString(req.body?.movieSlug);
    const movieName = optionalString(req.body?.movieName);
    const episodeSlug = optionalString(req.body?.episodeSlug);
    const episodeName = optionalString(req.body?.episodeName);

    if (!movieSlug || !movieName || !episodeSlug || !episodeName) {
      res.status(400).json({
        error: 'movieSlug, movieName, episodeSlug, and episodeName are required',
      });
      return;
    }

    const thumbUrl = optionalString(req.body?.thumbUrl);
    const posterUrl = optionalString(req.body?.posterUrl);

    const item = await prisma.watchHistory.upsert({
      where: {
        userId_movieSlug: { userId, movieSlug },
      },
      update: {
        movieName,
        thumbUrl,
        posterUrl,
        episodeSlug,
        episodeName,
      },
      create: {
        userId,
        movieSlug,
        movieName,
        thumbUrl,
        posterUrl,
        episodeSlug,
        episodeName,
      },
    });

    res.json({ item });
  })
);

// 3. Comments
router.get(
  '/comments/:movieSlug',
  asyncHandler(async (req, res) => {
    const movieSlug = req.params.movieSlug?.trim();
    if (!movieSlug) {
      res.status(400).json({ error: 'movieSlug is required' });
      return;
    }

    const comments = await prisma.comment.findMany({
      where: { movieSlug },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ comments });
  })
);

router.post(
  '/comments',
  requireUser,
  asyncHandler(async (req, res) => {
    const user = req.user!;
    const movieSlug = optionalString(req.body?.movieSlug);
    const content = optionalString(req.body?.content);

    if (!movieSlug || !content) {
      res.status(400).json({ error: 'movieSlug and content are required' });
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        movieSlug,
        content,
      },
    });

    res.status(201).json({ comment });
  })
);

router.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[interaction-service] Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err instanceof Error ? err.message : 'Unknown error',
  });
});

export default router;
