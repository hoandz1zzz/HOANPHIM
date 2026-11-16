'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';
import { MovieItem } from '@/types/movie';
import MovieCard from './MovieCard';

interface MovieRowProps {
  title: string;
  movies: MovieItem[];
  viewAllHref?: string;
}

export default function MovieRow({ title, movies, viewAllHref }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!rowRef.current) return;
    const distance = rowRef.current.clientWidth * 0.8;
    rowRef.current.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  if (!movies || movies.length === 0) return null;

  return (
    <section className="relative group/row py-3">
      <div className="px-6 md:px-14 flex items-center justify-between mb-2">
        <h2 className="text-lg md:text-xl font-bold text-white">{title}</h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-xs md:text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Xem tất cả →
          </Link>
        )}
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => scroll('left')}
          aria-label="Cuộn sang trái"
          className="hidden md:flex items-center justify-center absolute left-0 top-0 bottom-0 z-30 w-12 bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>

        <div
          ref={rowRef}
          className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth px-4 sm:px-8 md:px-14 py-3"
        >
          {movies.map((movie) => (
            <MovieCard key={movie.slug} movie={movie} />
          ))}
        </div>

        <button
          type="button"
          onClick={() => scroll('right')}
          aria-label="Cuộn sang phải"
          className="hidden md:flex items-center justify-center absolute right-0 top-0 bottom-0 z-30 w-12 bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-7 h-7" />
        </button>
      </div>
    </section>
  );
}
