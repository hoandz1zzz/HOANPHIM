'use client';

import { Calendar, Clock, Globe } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import CinemaPlayer from '@/components/movies/CinemaPlayer';
import CommentSection from '@/components/movies/CommentSection';
import { apiFetch } from '@/lib/api';
import { MovieDetail, NguoncDetailResponse } from '@/types/movie';
import { cleanDescription, extractMetadata, getThumb } from '@/utils/movieHelper';

export default function WatchMoviePage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setLoading(true);
    setError(null);

    apiFetch<NguoncDetailResponse>(`/api/catalog/movie/${slug}`)
      .then((res) => {
        if (active) setMovie(res.movie);
      })
      .catch((err: Error) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-3">
        <h1 className="text-xl font-bold text-[#E50914]">Không tìm thấy phim</h1>
        <p className="text-sm text-zinc-400">{error || 'Phim không tồn tại hoặc đã bị gỡ.'}</p>
        <Link href="/" className="inline-block text-sm text-white underline pt-2">
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  const meta = extractMetadata(movie);
  const thumb = getThumb(movie);
  const description = cleanDescription(movie.description);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-8">
      {/* Player + Controls + Chunked Episode Selector */}
      <CinemaPlayer movie={movie} />

      {/* Movie Metadata */}
      <section className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 bg-[#181818] border border-zinc-800/80 rounded-lg p-6">
        <div className="relative aspect-[2/3] w-full max-w-[200px] mx-auto rounded-md overflow-hidden bg-zinc-900">
          {thumb && (
            <Image
              src={thumb}
              alt={movie.name}
              fill
              sizes="200px"
              className="object-cover"
            />
          )}
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white">{movie.name}</h1>
              {movie.original_name && (
                <p className="text-sm text-zinc-400 mt-1">{movie.original_name}</p>
              )}
            </div>

            {meta.imdbUrl && (
              <a
                href={meta.imdbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#F5C518] text-black font-black text-xs px-2.5 py-1 rounded tracking-wide hover:brightness-110 transition"
              >
                IMDb
              </a>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {movie.quality && (
              <span className="bg-[#E50914] text-white font-bold px-2 py-0.5 rounded">
                {movie.quality}
              </span>
            )}
            {movie.language && (
              <span className="bg-zinc-800 text-zinc-200 px-2.5 py-0.5 rounded">
                {movie.language}
              </span>
            )}
            {meta.year && (
              <span className="bg-zinc-800 text-zinc-200 px-2.5 py-0.5 rounded inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                {meta.year}
              </span>
            )}
            {meta.countries.length > 0 && (
              <span className="bg-zinc-800 text-zinc-200 px-2.5 py-0.5 rounded inline-flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-zinc-400" />
                {meta.countries.join(', ')}
              </span>
            )}
            {meta.duration && (
              <span className="bg-zinc-800 text-zinc-200 px-2.5 py-0.5 rounded inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                {meta.duration}
              </span>
            )}
          </div>

          {description && (
            <p className="text-sm text-zinc-300 leading-relaxed">{description}</p>
          )}

          {/* Genre tags */}
          {meta.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {meta.genres.map((genre) => (
                <span
                  key={genre}
                  className="text-xs bg-[#242424] border border-zinc-700 text-zinc-300 px-2.5 py-1 rounded-full"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Director & Casts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-zinc-300 pt-3 border-t border-zinc-800">
            {meta.director && (
              <p>
                <span className="text-zinc-500">Đạo diễn: </span>
                {meta.director}
              </p>
            )}
            {meta.casts && (
              <p>
                <span className="text-zinc-500">Diễn viên: </span>
                {meta.casts}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Comments */}
      <CommentSection movieSlug={movie.slug} />
    </div>
  );
}
