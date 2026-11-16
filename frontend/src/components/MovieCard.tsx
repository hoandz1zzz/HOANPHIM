import { Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { MovieItem } from '@/types/movie';

interface MovieCardProps {
  movie: MovieItem;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const imageSrc = movie.thumb_url_webp || movie.thumb_url || movie.poster_url;

  return (
    <Link
      href={`/movie/${movie.slug}`}
      className="group relative flex-shrink-0 w-[150px] sm:w-[180px] md:w-[200px] rounded-md overflow-hidden bg-neutral-900 transition-transform duration-300 hover:scale-105 hover:z-10"
    >
      <div className="relative aspect-[2/3] w-full bg-neutral-800">
        {imageSrc && (
          <Image
            src={imageSrc}
            alt={movie.name}
            fill
            sizes="200px"
            className="object-cover"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

        {movie.quality && (
          <span className="absolute top-2 left-2 bg-netflix-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            {movie.quality}
          </span>
        )}

        {movie.current_episode && (
          <span className="absolute top-2 right-2 bg-black/75 text-neutral-200 text-[10px] px-1.5 py-0.5 rounded border border-white/10">
            {movie.current_episode}
          </span>
        )}

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-11 h-11 rounded-full bg-netflix-red/90 flex items-center justify-center shadow-lg">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>
      </div>

      <div className="p-2.5">
        <h3 className="text-sm font-medium text-white truncate">{movie.name}</h3>
        <p className="text-xs text-neutral-400 truncate mt-0.5">{movie.original_name}</p>
      </div>
    </Link>
  );
}
