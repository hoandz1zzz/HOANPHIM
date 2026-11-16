'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import MovieCard from '@/components/MovieCard';
import { apiFetch } from '@/lib/api';
import { MovieItem, NguoncListResponse } from '@/types/movie';

const TITLE_MAP: Record<string, string> = {
  'phim-moi-cap-nhat': 'Phim mới cập nhật',
  'phim-bo': 'Phim bộ',
  'phim-le': 'Phim lẻ',
  'hoat-hinh': 'Hoạt hình',
  'tv-shows': 'TV Shows',
  'hanh-dong': 'Hành động',
  'tinh-cam': 'Tình cảm',
  'kinh-di': 'Kinh dị',
  'vien-tuong': 'Viễn tưởng',
  'co-trang': 'Cổ trang',
  'phieu-luu': 'Phiêu lưu',
  hai: 'Hài',
  'han-quoc': 'Hàn Quốc',
  'trung-quoc': 'Trung Quốc',
  'au-my': 'Âu Mỹ',
  'nhat-ban': 'Nhật Bản',
};

function BrowseContent() {
  const params = useParams<{ type: string; slug: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const type = params?.type || 'list';
  const slug = params?.slug || 'phim-bo';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    const endpoint =
      type === 'new'
        ? `/api/catalog/new?page=${page}`
        : `/api/catalog/${type}/${slug}?page=${page}`;

    apiFetch<NguoncListResponse>(endpoint)
      .then((res) => {
        if (!active) return;
        setMovies(res.items || []);
        setTotalPages(res.paginate?.total_page || 1);
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
  }, [type, slug, page]);

  const goToPage = (nextPage: number) => {
    router.push(`/browse/${type}/${slug}?page=${nextPage}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{TITLE_MAP[slug] || slug}</h1>
        <span className="text-sm text-neutral-400">
          Trang {page} / {totalPages}
        </span>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-netflix-red border-t-transparent rounded-full animate-spin" />
        </div>
      ) : movies.length === 0 ? (
        <p className="text-neutral-400">Không có phim nào trong danh mục này.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {movies.map((movie) => (
            <MovieCard key={movie.slug} movie={movie} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-3 pt-4">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => goToPage(page - 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Trước
        </button>
        <span className="text-sm text-neutral-300">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => goToPage(page + 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-sm"
        >
          Sau
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-netflix-red border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <BrowseContent />
    </Suspense>
  );
}
