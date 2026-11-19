'use client';

import { Bot, Film, Loader2, MessageSquare, Send, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';

interface RecommendedMovie {
  name?: string;
  title?: string;
  slug?: string;
  original_name?: string;
  quality?: string;
  year?: number | string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  movies?: RecommendedMovie[];
}

const AI_API_BASE = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:8001';

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Chào bạn! Bạn đang muốn tìm phim thể loại gì hay có tâm trạng ra sao? Cứ nhắn mình tư vấn nhé!',
};

const QUICK_SUGGESTIONS = [
  'Phim hài lãng mạn Thái Lan',
  'Anime chuyển sinh',
  'Phim hành động kịch tính',
];

export default function HoanPhimChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const sendMessage = async (rawText: string) => {
    const query = rawText.trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${AI_API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          top_k: 5,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI service returned ${response.status}`);
      }

      const data = await response.json();
      const replyText: string =
        data.answer ||
        data.reply ||
        data.response ||
        data.message ||
        'Mình đã tìm thấy một vài gợi ý phim phù hợp cho bạn!';

      const movies: RecommendedMovie[] | undefined = Array.isArray(data.movies)
        ? data.movies
        : Array.isArray(data.recommendations)
          ? data.recommendations
          : Array.isArray(data.results)
            ? data.results
            : undefined;

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: replyText,
          movies,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content:
            'Xin lỗi, HoanPhim AI hiện đang bận hoặc chưa kết nối được tới máy chủ tư vấn. Bạn thử lại sau nhé!',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-[calc(100vw-2rem)] sm:w-[380px] h-[550px] max-h-[80vh] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3.5 bg-zinc-950/90 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#E50914] flex items-center justify-center text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white">HoanPhim AI</h3>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Trực tuyến</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Đóng khung chat"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-[#E50914] text-white rounded-br-sm'
                      : 'bg-zinc-800 text-zinc-100 rounded-bl-sm border border-zinc-700/60'
                  }`}
                >
                  {msg.content}
                </div>

                {/* Optional recommended movies from RAG response */}
                {msg.movies && msg.movies.length > 0 && (
                  <div className="mt-2 w-[85%] space-y-1.5">
                    {msg.movies.map((m, idx) => {
                      const title = m.name || m.title || 'Phim gợi ý';
                      const cardContent = (
                        <div className="flex items-center gap-2.5 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700 rounded-lg px-3 py-2 transition-colors">
                          <Film className="w-4 h-4 text-[#E50914] shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-white truncate">{title}</p>
                            {(m.original_name || m.year || m.quality) && (
                              <p className="text-[11px] text-zinc-400 truncate">
                                {[m.original_name, m.year, m.quality].filter(Boolean).join(' • ')}
                              </p>
                            )}
                          </div>
                        </div>
                      );

                      return m.slug ? (
                        <Link
                          key={`${m.slug}-${idx}`}
                          href={`/xem-phim/${m.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="block"
                        >
                          {cardContent}
                        </Link>
                      ) : (
                        <div key={`${title}-${idx}`}>{cardContent}</div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {/* Quick Suggestions (shown when conversation only has welcome message) */}
            {messages.length === 1 && !isLoading && (
              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => sendMessage(suggestion)}
                    className="text-xs bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-full px-3 py-1.5 transition-colors text-left"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-start">
                <div className="bg-zinc-800 border border-zinc-700/60 text-zinc-300 rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#E50914]" />
                  <span>Đang tìm phim phù hợp...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-zinc-950/90 border-t border-zinc-800 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập thể loại, tên phim, tâm trạng..."
              disabled={isLoading}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-[#E50914] disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label="Gửi tin nhắn"
              className="w-10 h-10 rounded-xl bg-[#E50914] hover:bg-red-700 disabled:opacity-40 disabled:hover:bg-[#E50914] text-white flex items-center justify-center transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Đóng HoanPhim AI' : 'Mở HoanPhim AI'}
        className="w-14 h-14 rounded-full bg-[#E50914] hover:bg-red-700 text-white shadow-[0_4px_20px_rgba(229,9,20,0.5)] flex items-center justify-center transition-transform duration-200 hover:scale-105 active:scale-95"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
}
