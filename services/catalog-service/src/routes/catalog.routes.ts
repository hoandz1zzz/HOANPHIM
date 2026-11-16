import { NextFunction, Request, Response, Router } from 'express';
import {
  getCountryMovies,
  getGenreMovies,
  getHomeFeed,
  getListMovies,
  getMovieDetail,
  getNewMovies,
  searchMovies,
  UpstreamError,
} from '../services/nguonc.service';

const router = Router();

function parsePage(rawPage: unknown): number {
  const parsed = Number(rawPage);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

router.get(
  '/new',
  asyncHandler(async (req, res) => {
    const page = parsePage(req.query.page);
    const data = await getNewMovies(page);
    res.json(data);
  })
);

router.get(
  '/list/:slug',
  asyncHandler(async (req, res) => {
    const page = parsePage(req.query.page);
    const data = await getListMovies(req.params.slug, page);
    res.json(data);
  })
);

router.get(
  '/genre/:slug',
  asyncHandler(async (req, res) => {
    const page = parsePage(req.query.page);
    const data = await getGenreMovies(req.params.slug, page);
    res.json(data);
  })
);

router.get(
  '/country/:slug',
  asyncHandler(async (req, res) => {
    const page = parsePage(req.query.page);
    const data = await getCountryMovies(req.params.slug, page);
    res.json(data);
  })
);

router.get(
  '/movie/:slug',
  asyncHandler(async (req, res) => {
    const data = await getMovieDetail(req.params.slug);
    res.json(data);
  })
);

router.get(
  '/search',
  asyncHandler(async (req, res) => {
    const keyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim() : '';
    if (!keyword) {
      res.status(400).json({ error: 'Query parameter "keyword" is required' });
      return;
    }

    const data = await searchMovies(keyword);
    res.json(data);
  })
);

router.get(
  '/home-feed',
  asyncHandler(async (_req, res) => {
    const data = await getHomeFeed();
    res.json(data);
  })
);

router.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof UpstreamError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.error('[catalog-service] Unhandled error:', err);
  res.status(502).json({
    error: 'Failed to fetch data from catalog upstream',
    message: err instanceof Error ? err.message : 'Unknown error',
  });
});

export default router;
