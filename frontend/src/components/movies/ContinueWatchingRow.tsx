'use client';

import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { WatchHistoryItem } from '@/types/movie';

export default function ContinueWatchingRow() {
  const { user } = useAuth();
  const [items, setItems] = useState<WatchHistoryItem[]>([]);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }

    let active = true;
    apiFetch<{ items: WatchHistoryItem[] }>('/api/interactions/history')
      .then((res) => {
        if (active) setItems(res.items || []);
      })
      .catch(() => {
        if (active) setItems([]);
      });

    return () => {
      active = false;
    };
  }, [user]);

  if (!user || items.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (!rowRef.current) return;
    const distance = rowRef.current.clientWidth * 0.8;
    rowRef.current.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  return (
    <section className="relative group/row py-3">
      <div className="px-6 md:px-14 flex items-center justify-between mb-2">
        <h2 className="text-lg md:text-xl font-bold text-white">Tiếp tục xem cho bạn</h2>
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
          className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar scroll-smooth px-6 md:px-14 py-3"
        >
          {items.map((item) => {
            const imgSrc = item.posterUrl || item.thumbUrl || '';
            return (
              <Link
                key={item.id}
                href={`/xem-phim/${item.movieSlug}`}
                className="flex-shrink-0 w-[220px] sm:w-[250px] aspect-video rounded-md overflow-hidden bg-[#1f1f1f] relative group cursor-pointer transition-all duration-300 hover:scale-105 hover:z-20"
              >
                {imgSrc && (
                  <Image
                    src={imgSrc}
                    alt={item.movieName}
                    fill
                    sizes="250px"
                    className="object-cover"
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* Episode badge */}
                <span className="absolute top-2 right-2 bg-black/75 backdrop-blur-md text-white text-[11px] font-semibold px-2 py-0.5 rounded">
                  {item.episodeName}
                </span>

                {/* Center Play icon on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 fill-black ml-0.5" />
                  </div>
                </div>

                {/* Movie name */}
                <div className="absolute bottom-2.5 left-3 right-3">
                  <p className="text-sm font-bold text-white truncate">{item.movieName}</p>
                </div>

                {/* Red progress bar at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-700">
                  <div className="h-full w-2/3 bg-[#E50914]" />
                </div>
              </Link>
            );
          })}
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
