'use client';

import { Bookmark, Check, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { MovieItem, WatchlistItem } from '@/types/movie';
import { cleanDescription, getPoster } from '@/utils/movieHelper';

interface HeroBillboardProps {
  movie?: MovieItem;
}

export default function HeroBillboard({ movie }: HeroBillboardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!user || !movie?.slug) {
      setInWatchlist(false);
      return;
    }

    apiFetch<{ items: WatchlistItem[] }>('/api/interactions/watchlist')
      .then((res) => {
        setInWatchlist(res.items.some((item) => item.movieSlug === movie.slug));
      })
      .catch(() => setInWatchlist(false));
  }, [user, movie?.slug]);

  if (!movie) return null;

  const poster = getPoster(movie);
  const description = cleanDescription(movie.description);

  const handleToggleWatchlist = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setToggling(true);
    try {
      const res = await apiFetch<{ inWatchlist: boolean }>('/api/interactions/watchlist/toggle', {
        method: 'POST',
        body: JSON.stringify({
          movieSlug: movie.slug,
          movieName: movie.name,
          thumbUrl: movie.thumb_url_webp || movie.thumb_url,
          posterUrl: movie.poster_url_webp || movie.poster_url,
          quality: movie.quality,
          currentEpisode: movie.current_episode,
        }),
      });
      setInWatchlist(res.inWatchlist);
    } finally {
      setToggling(false);
    }
  };

  return (
    <section className="relative w-full min-h-[520px] h-[70vh] md:h-[82vh] flex items-end overflow-hidden bg-[#141414]">
      {poster && (
        <Image
          src={poster}
          alt={movie.name}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      )}

      {/* 2 gradient overlays blending into #141414 */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/70 to-transparent" />

      <div className="relative z-10 pt-24 md:pt-32 pb-10 md:pb-16 px-4 sm:px-8 md:px-12 w-full max-w-2xl">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-2.5 text-xs font-semibold">
          <span className="bg-[#E50914] text-white px-2 py-0.5 rounded font-bold tracking-wider">
            TOP 10
          </span>
          {movie.quality && (
            <span className="border border-white/40 px-1.5 py-0.5 text-xs text-white rounded-sm">
              {movie.quality}
            </span>
          )}
          {movie.current_episode && (
            <span className="text-zinc-200">{movie.current_episode}</span>
          )}
          {movie.language && (
            <span className="text-zinc-300">• {movie.language}</span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight line-clamp-2 text-white drop-shadow-md">
          {movie.name}
        </h1>
        {movie.original_name && (
          <p className="text-zinc-400 text-xs sm:text-sm mt-1 truncate">{movie.original_name}</p>
        )}

        {/* Description */}
        {description && (
          <p className="text-xs sm:text-sm md:text-base text-zinc-200 line-clamp-2 sm:line-clamp-3 my-3 md:my-4 leading-relaxed">
            {description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3 pt-1">
          <Link
            href={`/xem-phim/${movie.slug}`}
            className="bg-white text-black hover:bg-white/80 font-bold px-4 py-2 text-xs sm:px-6 sm:py-3 sm:text-sm rounded flex items-center gap-1.5 sm:gap-2 whitespace-nowrap transition-colors"
          >
            <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-black" />
            <span>Phát ngay</span>
          </Link>

          <button
            type="button"
            disabled={toggling}
            onClick={handleToggleWatchlist}
            className="bg-zinc-600/60 text-white hover:bg-zinc-600/40 backdrop-blur-md font-bold px-4 py-2 text-xs sm:px-6 sm:py-3 sm:text-sm rounded flex items-center gap-1.5 sm:gap-2 whitespace-nowrap transition-colors disabled:opacity-60"
          >
            {inWatchlist ? (
              <Check className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
            <span>{inWatchlist ? 'Đã thêm vào Tủ phim' : 'Thêm vào Tủ phim'}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
