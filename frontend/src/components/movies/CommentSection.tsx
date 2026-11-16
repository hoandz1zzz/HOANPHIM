'use client';

import { MessageSquare, Send } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { CommentItem } from '@/types/movie';

interface CommentSectionProps {
  movieSlug: string;
}

export default function CommentSection({ movieSlug }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    apiFetch<{ comments: CommentItem[] }>(`/api/interactions/comments/${movieSlug}`)
      .then((res) => {
        if (active) setComments(res.comments || []);
      })
      .catch(() => {
        if (active) setComments([]);
      });

    return () => {
      active = false;
    };
  }, [movieSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!user || !trimmed) return;

    setSubmitting(true);
    try {
      const res = await apiFetch<{ comment: CommentItem }>('/api/interactions/comments', {
        method: 'POST',
        body: JSON.stringify({ movieSlug, content: trimmed }),
      });
      setComments((prev) => [res.comment, ...prev]);
      setContent('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-[#181818] border border-zinc-800/80 rounded-lg p-6 space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-[#E50914]" />
        <h2 className="text-lg font-bold text-white">Bình luận ({comments.length})</h2>
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Chia sẻ cảm nhận của bạn về bộ phim..."
            className="flex-1 bg-[#242424] border border-zinc-700 rounded-md px-4 py-2.5 text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-[#E50914]"
          />
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="inline-flex items-center gap-2 bg-[#E50914] hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2.5 rounded-md transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Gửi</span>
          </button>
        </form>
      ) : (
        <p className="text-sm text-zinc-400">
          Vui lòng{' '}
          <Link href="/login" className="text-[#E50914] font-semibold hover:underline">
            đăng nhập
          </Link>{' '}
          để tham gia bình luận.
        </p>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-zinc-500">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="flex gap-3 border-b border-zinc-800 pb-3 last:border-b-0">
              <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold uppercase text-white flex-shrink-0">
                {c.userName.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{c.userName}</span>
                  <span className="text-xs text-zinc-500">
                    {new Date(c.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
                <p className="text-sm text-zinc-300">{c.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
