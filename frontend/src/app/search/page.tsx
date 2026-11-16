'use client';

import { Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import MovieCard from '@/components/MovieCard';
import { apiFetch } from '@/lib/api';
import { MovieItem, NguoncListResponse } from '@/types/movie';

function SearchContent() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get('keyword')?.trim() || '';

  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!keyword) {
      setMovies([]);
      return;
    }

    let active = true;
    setLoading(true);
    apiFetch<NguoncListResponse>(`/api/catalog/search?keyword=${encodeURIComponent(keyword)}`)
      .then((res) => {
        if (active) setMovies(res.items || []);
      })
      .catch(() => {
        if (active) setMovies([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [keyword]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center gap-2">
        <Search className="w-6 h-6 text-netflix-red" />
        <h1 className="text-2xl font-bold">
          {keyword ? `Kết quả tìm kiếm: "${keyword}"` : 'Tìm kiếm phim'}
        </h1>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-netflix-red border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !keyword ? (
        <p className="text-neutral-400">Nhập từ khóa vào thanh tìm kiếm ở trên.</p>
      ) : movies.length === 0 ? (
        <p className="text-neutral-400">Không tìm thấy phim phù hợp.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {movies.map((movie) => (
            <MovieCard key={movie.slug} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-netflix-red border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
