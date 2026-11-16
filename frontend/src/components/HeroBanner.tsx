import { Info, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { MovieItem } from '@/types/movie';

interface HeroBannerProps {
  movie?: MovieItem;
}

export default function HeroBanner({ movie }: HeroBannerProps) {
  if (!movie) return null;

  const backdrop = movie.poster_url_webp || movie.poster_url || movie.thumb_url;

  return (
    <section className="relative w-full h-[65vh] min-h-[420px] max-h-[680px] overflow-hidden">
      {backdrop && (
        <Image
          src={backdrop}
          alt={movie.name}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/40" />

      <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 flex flex-col justify-end pb-14">
        <div className="max-w-xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold">
            {movie.quality && (
              <span className="bg-netflix-red text-white px-2 py-0.5 rounded">
                {movie.quality}
              </span>
            )}
            {movie.current_episode && (
              <span className="bg-white/15 text-neutral-100 px-2 py-0.5 rounded">
                {movie.current_episode}
              </span>
            )}
            {movie.language && (
              <span className="text-neutral-300">{movie.language}</span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
            {movie.name}
          </h1>
          <p className="text-sm sm:text-base text-neutral-300 font-medium">
            {movie.original_name}
          </p>

          {movie.description && (
            <p className="text-sm text-neutral-300 line-clamp-3">{movie.description}</p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Link
              href={`/movie/${movie.slug}`}
              className="inline-flex items-center gap-2 bg-white hover:bg-neutral-200 text-black font-semibold px-5 py-2.5 rounded transition-colors"
            >
              <Play className="w-5 h-5 fill-black" />
              <span>Xem ngay</span>
            </Link>
            <Link
              href={`/movie/${movie.slug}`}
              className="inline-flex items-center gap-2 bg-neutral-700/80 hover:bg-neutral-600 text-white font-semibold px-5 py-2.5 rounded transition-colors"
            >
              <Info className="w-5 h-5" />
              <span>Chi tiết</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
