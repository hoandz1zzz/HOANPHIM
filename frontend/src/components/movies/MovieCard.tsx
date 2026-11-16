import { Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { MovieItem } from '@/types/movie';
import { getThumb } from '@/utils/movieHelper';

interface MovieCardProps {
  movie: MovieItem;
  fullWidth?: boolean;
}

export default function MovieCard({ movie, fullWidth = false }: MovieCardProps) {
  const thumb = getThumb(movie);

  return (
    <Link
      href={`/xem-phim/${movie.slug}`}
      className={`block ${
        fullWidth ? 'w-full' : 'w-[130px] sm:w-[160px] md:w-[190px] shrink-0 snap-start'
      } aspect-[2/3] relative rounded-md overflow-hidden bg-[#1f1f1f] group cursor-pointer md:hover:z-20`}
    >
      {thumb && (
        <Image
          src={thumb}
          alt={movie.name}
          fill
          sizes="200px"
          className="object-cover md:group-hover:scale-105 transition-transform duration-300"
        />
      )}

      {/* Top-left: Quality badge */}
      {movie.quality && (
        <span className="absolute top-2 left-2 z-10 bg-[#E50914]/90 text-[10px] font-bold px-1.5 py-0.5 rounded text-white">
          {movie.quality}
        </span>
      )}

      {/* Top-right: Current episode badge */}
      {movie.current_episode && (
        <span className="absolute top-2 right-2 z-10 bg-black/75 backdrop-blur-md text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded text-white">
          {movie.current_episode}
        </span>
      )}

      {/* Center Play button on desktop hover */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 bg-white/90 text-black w-11 h-11 rounded-full flex items-center justify-center shadow-lg">
          <Play className="w-5 h-5 fill-black ml-0.5" />
        </div>
      </div>

      {/* Bottom gradient overlay: Always visible on Mobile & Desktop */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent pt-8 pb-2.5 px-2.5 flex flex-col justify-end z-10">
        <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1 drop-shadow">
          {movie.name}
        </h3>
        {movie.original_name && (
          <p className="text-[10px] sm:text-xs text-zinc-400 line-clamp-1 mt-0.5">
            {movie.original_name}
          </p>
        )}
      </div>
    </Link>
  );
}
