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
    const offset = direction === 'left' ? -600 : 600;
    rowRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  if (!movies || movies.length === 0) return null;

  return (
    <section className="relative group/row py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between mb-3">
        <h2 className="text-lg sm:text-xl font-bold text-white">{title}</h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-xs sm:text-sm text-neutral-400 hover:text-netflix-red transition-colors"
          >
            Xem tất cả →
          </Link>
        )}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <button
          type="button"
          onClick={() => scroll('left')}
          aria-label="Cuộn trái"
          className="hidden md:flex items-center justify-center absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-16 bg-black/70 hover:bg-black/90 text-white rounded opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div
          ref={rowRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2"
        >
          {movies.map((movie) => (
            <MovieCard key={movie.slug} movie={movie} />
          ))}
        </div>

        <button
          type="button"
          onClick={() => scroll('right')}
          aria-label="Cuộn phải"
          className="hidden md:flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-16 bg-black/70 hover:bg-black/90 text-white rounded opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
}
