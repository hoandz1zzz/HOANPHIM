'use client';

import { Bookmark, History } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { WatchHistoryItem, WatchlistItem } from '@/types/movie';

export default function MyListPage() {
  const { user, loading: authLoading } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    Promise.all([
      apiFetch<{ items: WatchlistItem[] }>('/api/interactions/watchlist'),
      apiFetch<{ items: WatchHistoryItem[] }>('/api/interactions/history'),
    ])
      .then(([wl, hist]) => {
        setWatchlist(wl.items || []);
        setHistory(hist.items || []);
      })
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-netflix-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold">Danh sách của tôi</h1>
        <p className="text-neutral-400">Vui lòng đăng nhập để xem phim đã lưu và lịch sử xem.</p>
        <Link
          href="/login"
          className="inline-block bg-netflix-red hover:bg-red-700 text-white font-medium px-5 py-2.5 rounded"
        >
          Đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-netflix-red" />
          <h1 className="text-2xl font-bold">Phim yêu thích ({watchlist.length})</h1>
        </div>

        {watchlist.length === 0 ? (
          <p className="text-sm text-neutral-400">Bạn chưa lưu phim nào.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {watchlist.map((item) => (
              <Link
                key={item.id}
                href={`/movie/${item.movieSlug}`}
                className="group rounded-md overflow-hidden bg-neutral-900 hover:scale-105 transition-transform"
              >
                <div className="relative aspect-[2/3] bg-neutral-800">
                  {(item.thumbUrl || item.posterUrl) && (
                    <Image
                      src={item.thumbUrl || item.posterUrl || ''}
                      alt={item.movieName}
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="p-2.5">
                  <h3 className="text-sm font-medium truncate">{item.movieName}</h3>
                  {item.currentEpisode && (
                    <p className="text-xs text-neutral-400 truncate">{item.currentEpisode}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-netflix-red" />
          <h2 className="text-2xl font-bold">Lịch sử xem gần đây ({history.length})</h2>
        </div>

        {history.length === 0 ? (
          <p className="text-sm text-neutral-400">Bạn chưa xem phim nào.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {history.map((item) => (
              <Link
                key={item.id}
                href={`/movie/${item.movieSlug}`}
                className="group rounded-md overflow-hidden bg-neutral-900 hover:scale-105 transition-transform"
              >
                <div className="relative aspect-[2/3] bg-neutral-800">
                  {(item.thumbUrl || item.posterUrl) && (
                    <Image
                      src={item.thumbUrl || item.posterUrl || ''}
                      alt={item.movieName}
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                  )}
                  <span className="absolute bottom-2 left-2 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded">
                    Đang xem: {item.episodeName}
                  </span>
                </div>
                <div className="p-2.5">
                  <h3 className="text-sm font-medium truncate">{item.movieName}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
