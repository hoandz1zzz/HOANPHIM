'use client';

import {
  Bookmark,
  Check,
  Lightbulb,
  LightbulbOff,
  Play,
  Search,
  SkipForward,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { EpisodeItem, MovieDetail, WatchlistItem } from '@/types/movie';

const CHUNK_SIZE = 100;

interface CinemaPlayerProps {
  movie: MovieDetail;
}

export default function CinemaPlayer({ movie }: CinemaPlayerProps) {
  const { user } = useAuth();
  const router = useRouter();

  const servers = useMemo(() => movie.episodes || [], [movie.episodes]);
  const [selectedServerIdx, setSelectedServerIdx] = useState(0);
  const [currentEpisodeIdx, setCurrentEpisodeIdx] = useState(0);
  const [activeChunkIdx, setActiveChunkIdx] = useState(0);
  const [episodeSearch, setEpisodeSearch] = useState('');
  const [highlightedSlug, setHighlightedSlug] = useState<string | null>(null);

  const [cinemaMode, setCinemaMode] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  const activeServer = servers[selectedServerIdx];
  const episodes = useMemo(() => activeServer?.items || [], [activeServer]);
  const currentEpisode: EpisodeItem | undefined = episodes[currentEpisodeIdx];

  // Reset episode when movie changes
  useEffect(() => {
    setSelectedServerIdx(0);
    setCurrentEpisodeIdx(0);
    setActiveChunkIdx(0);
    setEpisodeSearch('');
    setHighlightedSlug(null);
  }, [movie.slug]);

  // Keep active chunk synced when currentEpisodeIdx changes
  useEffect(() => {
    if (episodes.length > 0) {
      setActiveChunkIdx(Math.floor(currentEpisodeIdx / CHUNK_SIZE));
    }
  }, [currentEpisodeIdx, episodes.length]);

  // Check watchlist status
  useEffect(() => {
    if (!user || !movie.slug) {
      setInWatchlist(false);
      return;
    }

    apiFetch<{ items: WatchlistItem[] }>('/api/interactions/watchlist')
      .then((res) => {
        setInWatchlist(res.items.some((item) => item.movieSlug === movie.slug));
      })
      .catch(() => setInWatchlist(false));
  }, [user, movie.slug]);

  // Auto-save watch history on page enter or episode change
  const saveWatchHistory = useCallback(
    async (episode: EpisodeItem) => {
      if (!user) return;
      try {
        await apiFetch('/api/interactions/history', {
          method: 'POST',
          body: JSON.stringify({
            movieSlug: movie.slug,
            movieName: movie.name,
            thumbUrl: movie.thumb_url_webp || movie.thumb_url,
            posterUrl: movie.poster_url_webp || movie.poster_url,
            episodeSlug: episode.slug,
            episodeName: episode.name,
          }),
        });
      } catch {
        // Ignore history sync errors
      }
    },
    [user, movie]
  );

  useEffect(() => {
    if (user && currentEpisode) {
      saveWatchHistory(currentEpisode);
    }
  }, [user, currentEpisode, saveWatchHistory]);

  const chunks = useMemo(() => {
    const result: { label: string; start: number; items: EpisodeItem[] }[] = [];
    for (let i = 0; i < episodes.length; i += CHUNK_SIZE) {
      const slice = episodes.slice(i, i + CHUNK_SIZE);
      result.push({
        label: `${i + 1} - ${i + slice.length}`,
        start: i,
        items: slice,
      });
    }
    return result;
  }, [episodes]);

  const handleEpisodeSearchChange = (value: string) => {
    setEpisodeSearch(value);
    const trimmed = value.trim();
    if (!trimmed) {
      setHighlightedSlug(null);
      return;
    }

    const numeric = Number(trimmed);
    let matchIdx = episodes.findIndex(
      (ep) => ep.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (matchIdx === -1) {
      matchIdx = episodes.findIndex((ep) =>
        ep.name.toLowerCase().includes(trimmed.toLowerCase())
      );
    }
    if (matchIdx === -1 && Number.isInteger(numeric) && numeric >= 1 && numeric <= episodes.length) {
      matchIdx = numeric - 1;
    }

    if (matchIdx !== -1) {
      setActiveChunkIdx(Math.floor(matchIdx / CHUNK_SIZE));
      setHighlightedSlug(episodes[matchIdx].slug);
    } else {
      setHighlightedSlug(null);
    }
  };

  const handleEpisodeSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!highlightedSlug) return;
    const idx = episodes.findIndex((ep) => ep.slug === highlightedSlug);
    if (idx !== -1) {
      setCurrentEpisodeIdx(idx);
    }
  };

  const handleToggleWatchlist = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setWatchlistLoading(true);
    try {
      const res = await apiFetch<{ inWatchlist: boolean }>('/api/interactions/watchlist/toggle', {
        method: 'POST',
        body: JSON.stringify({
          movieSlug: movie.slug,
          movieName: movie.name,
          thumbUrl: movie.thumb_url_webp || movie.thumb_url,
          posterUrl: movie.poster_url_webp || movie.poster_url,
          quality: movie.quality,
          currentEpisode: movie.current_episode,
        }),
      });
      setInWatchlist(res.inWatchlist);
    } finally {
      setWatchlistLoading(false);
    }
  };

  const hasNextEpisode = currentEpisodeIdx < episodes.length - 1;
  const activeChunk = chunks[activeChunkIdx];

  return (
    <>
      {cinemaMode && (
        <div
          onClick={() => setCinemaMode(false)}
          className="fixed inset-0 bg-black/95 z-40 transition-opacity"
        />
      )}

      <section className={`space-y-4 ${cinemaMode ? 'relative z-50' : ''}`}>
        {/* Video Player */}
        <div>
          {currentEpisode?.embed ? (
            <iframe
              key={currentEpisode.embed}
              src={currentEpisode.embed}
              title={`${movie.name} - ${currentEpisode.name}`}
              allowFullScreen
              className="w-full aspect-video bg-black rounded-lg shadow-2xl border border-zinc-800/80"
            />
          ) : (
            <div className="w-full aspect-video bg-black rounded-lg shadow-2xl border border-zinc-800/80 flex flex-col items-center justify-center text-zinc-400 gap-2">
              <Play className="w-12 h-12 text-zinc-600" />
              <p>Chưa có nguồn phát cho phim này</p>
            </div>
          )}

          {/* Control Bar */}
          <div className="bg-[#181818] px-4 py-3 rounded-b-lg flex flex-wrap items-center justify-between gap-4 border-x border-b border-zinc-800/80">
            {/* Server Selector */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-zinc-400 mr-1">
                Server:
              </span>
              {servers.map((server, idx) => (
                <button
                  key={server.server_name}
                  type="button"
                  onClick={() => {
                    setSelectedServerIdx(idx);
                    setCurrentEpisodeIdx(0);
                    setActiveChunkIdx(0);
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                    selectedServerIdx === idx
                      ? 'bg-[#E50914] text-white'
                      : 'bg-[#242424] text-zinc-300 hover:bg-[#333333]'
                  }`}
                >
                  {server.server_name}
                </button>
              ))}
            </div>

            {/* Action Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={!hasNextEpisode}
                onClick={() => setCurrentEpisodeIdx((prev) => prev + 1)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#242424] hover:bg-[#333333] disabled:opacity-40 text-xs font-medium text-zinc-200 transition-colors"
              >
                <SkipForward className="w-4 h-4" />
                <span>Tập tiếp theo</span>
              </button>

              <button
                type="button"
                onClick={() => setCinemaMode((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  cinemaMode
                    ? 'bg-amber-500 text-black font-semibold'
                    : 'bg-[#242424] hover:bg-[#333333] text-zinc-200'
                }`}
              >
                {cinemaMode ? (
                  <Lightbulb className="w-4 h-4" />
                ) : (
                  <LightbulbOff className="w-4 h-4" />
                )}
                <span>{cinemaMode ? 'Bật đèn' : 'Tắt đèn'}</span>
              </button>

              <button
                type="button"
                disabled={watchlistLoading}
                onClick={handleToggleWatchlist}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  inWatchlist
                    ? 'bg-[#E50914] text-white'
                    : 'bg-[#242424] hover:bg-[#333333] text-zinc-200'
                }`}
              >
                {inWatchlist ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                <span>{inWatchlist ? 'Đã yêu thích' : 'Yêu thích'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Chunked Episode Selector */}
        {episodes.length > 0 && (
          <div className="bg-[#181818] border border-zinc-800/80 rounded-lg p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Chunk Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                {chunks.map((chunk, idx) => (
                  <button
                    key={chunk.label}
                    type="button"
                    onClick={() => setActiveChunkIdx(idx)}
                    className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                      activeChunkIdx === idx
                        ? 'bg-white text-black'
                        : 'bg-[#242424] text-zinc-300 hover:bg-[#333333]'
                    }`}
                  >
                    {chunk.label}
                  </button>
                ))}
              </div>

              {/* Episode Number Jump Input */}
              <form onSubmit={handleEpisodeSearchSubmit} className="relative">
                <input
                  type="text"
                  value={episodeSearch}
                  onChange={(e) => handleEpisodeSearchChange(e.target.value)}
                  placeholder="Nhập số tập..."
                  className="w-40 sm:w-48 bg-[#242424] border border-zinc-700 rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-[#E50914]"
                />
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </form>
            </div>

            {/* Episode Grid (max 100 items rendered) */}
            {activeChunk && (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-2 max-h-[300px] overflow-y-auto pr-1">
                {activeChunk.items.map((ep, offset) => {
                  const globalIdx = activeChunk.start + offset;
                  const isPlaying = globalIdx === currentEpisodeIdx;
                  const isHighlighted = highlightedSlug === ep.slug && !isPlaying;

                  return (
                    <button
                      key={`${ep.slug}-${globalIdx}`}
                      type="button"
                      onClick={() => {
                        setCurrentEpisodeIdx(globalIdx);
                        setHighlightedSlug(null);
                      }}
                      className={`text-sm py-2 rounded text-center transition ${
                        isPlaying
                          ? 'bg-[#E50914] text-white font-bold'
                          : isHighlighted
                            ? 'bg-[#333333] text-white font-semibold ring-2 ring-amber-400'
                            : 'bg-[#242424] hover:bg-[#333333] text-zinc-300'
                      }`}
                    >
                      {ep.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
}
