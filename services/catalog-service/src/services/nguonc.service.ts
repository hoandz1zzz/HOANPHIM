import { getCachedJson, setCachedJson } from '../config/redis';

const NGUONC_API_BASE = process.env.NGUONC_API_BASE || 'https://phim.nguonc.com/api';
const CACHE_TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS) || 1800;
const REQUEST_TIMEOUT_MS = 25000;

export class UpstreamError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 502
  ) {
    super(message);
    this.name = 'UpstreamError';
  }
}

async function fetchJsonFromNguonc<T>(url: string, retries = 1): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new UpstreamError(
        `NguonC API returned ${response.status} ${response.statusText}`,
        response.status === 404 ? 404 : 502
      );
    }

    return (await response.json()) as T;
  } catch (err) {
    if (retries > 0 && !(err instanceof UpstreamError)) {
      return fetchJsonFromNguonc<T>(url, retries - 1);
    }
    throw err;
  }
}

async function fetchWithCache<T>(cacheKey: string, url: string): Promise<T> {
  const cached = await getCachedJson<T>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  const data = await fetchJsonFromNguonc<T>(url);
  await setCachedJson(cacheKey, data, CACHE_TTL_SECONDS);
  return data;
}

export function getNewMovies(page: number) {
  const url = `${NGUONC_API_BASE}/films/phim-moi-cap-nhat?page=${page}`;
  return fetchWithCache<unknown>(`catalog:new:page:${page}`, url);
}

export function getListMovies(slug: string, page: number) {
  const safeSlug = encodeURIComponent(slug);
  const url = `${NGUONC_API_BASE}/films/danh-sach/${safeSlug}?page=${page}`;
  return fetchWithCache<unknown>(`catalog:list:${safeSlug}:page:${page}`, url);
}

export function getGenreMovies(slug: string, page: number) {
  const safeSlug = encodeURIComponent(slug);
  const url = `${NGUONC_API_BASE}/films/the-loai/${safeSlug}?page=${page}`;
  return fetchWithCache<unknown>(`catalog:genre:${safeSlug}:page:${page}`, url);
}

export function getCountryMovies(slug: string, page: number) {
  const safeSlug = encodeURIComponent(slug);
  const url = `${NGUONC_API_BASE}/films/quoc-gia/${safeSlug}?page=${page}`;
  return fetchWithCache<unknown>(`catalog:country:${safeSlug}:page:${page}`, url);
}

export function getMovieDetail(slug: string) {
  const safeSlug = encodeURIComponent(slug);
  const url = `${NGUONC_API_BASE}/film/${safeSlug}`;
  return fetchWithCache<unknown>(`catalog:movie:${safeSlug}`, url);
}

export function searchMovies(keyword: string) {
  const encodedKeyword = encodeURIComponent(keyword);
  const url = `${NGUONC_API_BASE}/films/search?keyword=${encodedKeyword}`;
  return fetchWithCache<unknown>(`catalog:search:${encodedKeyword}`, url);
}

export interface HomeFeedResponse {
  newMovies: unknown;
  seriesMovies: unknown;
  singleMovies: unknown;
  animeMovies: unknown;
  actionMovies: unknown;
}

export async function getHomeFeed(): Promise<HomeFeedResponse> {
  const cacheKey = 'catalog:home-feed';
  const cached = await getCachedJson<HomeFeedResponse>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  const [newMovies, seriesMovies, singleMovies, animeMovies, actionMovies] = await Promise.all([
    getNewMovies(1),
    getListMovies('phim-bo', 1),
    getListMovies('phim-le', 1),
    getListMovies('hoat-hinh', 1),
    getGenreMovies('hanh-dong', 1),
  ]);

  const feed: HomeFeedResponse = {
    newMovies,
    seriesMovies,
    singleMovies,
    animeMovies,
    actionMovies,
  };

  await setCachedJson(cacheKey, feed, CACHE_TTL_SECONDS);
  return feed;
}
