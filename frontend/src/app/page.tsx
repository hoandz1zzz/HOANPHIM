'use client';

import { useEffect, useState } from 'react';
import ContinueWatchingRow from '@/components/movies/ContinueWatchingRow';
import HeroBillboard from '@/components/movies/HeroBillboard';
import MovieRow from '@/components/movies/MovieRow';
import { apiFetch } from '@/lib/api';
import { HomeFeedResponse } from '@/types/movie';

export default function HomePage() {
  const [feed, setFeed] = useState<HomeFeedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiFetch<HomeFeedResponse>('/api/catalog/home-feed')
      .then((data) => {
        if (active) setFeed(data);
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
  }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !feed) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-3">
        <h1 className="text-xl font-bold text-[#E50914]">Không thể tải dữ liệu phim</h1>
        <p className="text-sm text-zinc-400">
          {error || 'Vui lòng kiểm tra API Gateway (cổng 8000) và Catalog Service (cổng 4002).'}
        </p>
      </div>
    );
  }

  const featuredMovie = feed.newMovies?.items?.[0];

  return (
    <div className="-mt-16 pb-16">
      <HeroBillboard movie={featuredMovie} />

      <div className="-mt-12 relative z-20 space-y-2">
        <ContinueWatchingRow />

        <MovieRow
          title="Phim mới cập nhật"
          movies={feed.newMovies?.items || []}
          viewAllHref="/danh-muc/phim-moi-cap-nhat"
        />
        <MovieRow
          title="Phim bộ đặc sắc"
          movies={feed.seriesMovies?.items || []}
          viewAllHref="/danh-muc/phim-bo"
        />
        <MovieRow
          title="Phim lẻ tuyển chọn"
          movies={feed.singleMovies?.items || []}
          viewAllHref="/danh-muc/phim-le"
        />
        <MovieRow
          title="Hoạt hình"
          movies={feed.animeMovies?.items || []}
          viewAllHref="/danh-muc/hoat-hinh"
        />
        <MovieRow
          title="Phim hành động"
          movies={feed.actionMovies?.items || []}
          viewAllHref="/danh-muc/hanh-dong"
        />
      </div>
    </div>
  );
}
