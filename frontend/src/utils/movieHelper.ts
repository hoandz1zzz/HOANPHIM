import { MovieDetail, MovieItem } from '@/types/movie';

export function getPoster(movie: Pick<MovieItem, 'poster_url' | 'poster_url_webp' | 'thumb_url' | 'thumb_url_webp'>): string {
  return movie.poster_url_webp || movie.poster_url || movie.thumb_url_webp || movie.thumb_url || '';
}

export function getThumb(movie: Pick<MovieItem, 'thumb_url' | 'thumb_url_webp' | 'poster_url' | 'poster_url_webp'>): string {
  return movie.thumb_url_webp || movie.thumb_url || movie.poster_url_webp || movie.poster_url || '';
}

export function cleanDescription(raw?: string | null): string {
  if (!raw) return '';
  return raw
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export interface ExtractedMovieMetadata {
  formats: string[];
  genres: string[];
  year: string;
  countries: string[];
  duration: string;
  director: string;
  casts: string;
  imdbUrl: string | null;
}

export function extractMetadata(movie: MovieDetail): ExtractedMovieMetadata {
  const formats = movie.category?.['1']?.list?.map((i) => i.name) || [];
  const genres = movie.category?.['2']?.list?.map((i) => i.name) || [];
  const yearList = movie.category?.['3']?.list?.map((i) => i.name) || [];
  const countries = movie.category?.['4']?.list?.map((i) => i.name) || [];

  return {
    formats,
    genres,
    year: yearList.join(', ') || (movie.year ? String(movie.year) : ''),
    countries,
    duration: movie.time || '',
    director: movie.director || '',
    casts: movie.casts || '',
    imdbUrl: movie.imdb?.url || null,
  };
}

