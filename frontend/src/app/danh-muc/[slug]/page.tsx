'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import MovieCard from '@/components/movies/MovieCard';
import { apiFetch } from '@/lib/api';
import { MovieItem, NguoncListResponse } from '@/types/movie';

const LIST_SLUGS = new Set(['phim-le', 'phim-bo', 'hoat-hinh', 'tv-shows']);
const COUNTRY_SLUGS = new Set(['han-quoc', 'trung-quoc', 'au-my', 'nhat-ban']);

const TITLE_MAP: Record<string, string> = {
  'phim-moi-cap-nhat': 'Phim mới cập nhật',
  'phim-bo': 'Phim bộ',
  'phim-le': 'Phim lẻ',
  'hoat-hinh': 'Hoạt hình',
  'tv-shows': 'TV Shows',
  'hanh-dong': 'Phim Hành động',
  'tinh-cam': 'Phim Tình cảm',
  'kinh-di': 'Phim Kinh dị',
  'vien-tuong': 'Phim Viễn tưởng',
  'co-trang': 'Phim Cổ trang',
  'phieu-luu': 'Phim Phiêu lưu',
  hai: 'Phim Hài',
  'han-quoc': 'Phim Hàn Quốc',
  'trung-quoc': 'Phim Trung Quốc',
  'au-my': 'Phim Âu Mỹ',
  'nhat-ban': 'Phim Nhật Bản',
};

function resolveCatalogEndpoint(slug: string, page: number): string {
  if (slug === 'phim-moi-cap-nhat') {
    return `/api/catalog/new?page=${page}`;
  }
  if (LIST_SLUGS.has(slug)) {
    return `/api/catalog/list/${slug}?page=${page}`;
  }
  if (COUNTRY_SLUGS.has(slug)) {
    return `/api/catalog/country/${slug}?page=${page}`;
  }
  return `/api/catalog/genre/${slug}?page=${page}`;
}

function DanhMucContent() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const slug = params?.slug || 'phim-moi-cap-nhat';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    apiFetch<NguoncListResponse>(resolveCatalogEndpoint(slug, page))
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
  }, [slug, page]);

  const goToPage = (nextPage: number) => {
    router.push(`/danh-muc/${slug}?page=${nextPage}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-14 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-white">{TITLE_MAP[slug] || slug}</h1>
        <span className="text-sm text-zinc-400">
          Trang {page} / {totalPages}
        </span>
      </div>

      {loading ? (
        <div className="min-h-[45vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : movies.length === 0 ? (
        <p className="text-zinc-400">Không có phim nào trong danh mục này.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {movies.map((movie) => (
            <MovieCard key={movie.slug} movie={movie} fullWidth />
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-3 pt-4">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => goToPage(page - 1)}
          className="inline-flex items-center gap-1 px-3.5 py-2 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-sm text-white"
        >
          <ChevronLeft className="w-4 h-4" />
          Trước
        </button>
        <span className="text-sm text-zinc-300">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => goToPage(page + 1)}
          className="inline-flex items-center gap-1 px-3.5 py-2 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-sm text-white"
        >
          Sau
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function DanhMucPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DanhMucContent />
    </Suspense>
  );
}
