'use client';

import { ChevronDown, LogOut, Menu, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const GENRES = [
  { label: 'Hành động', slug: 'hanh-dong' },
  { label: 'Tình cảm', slug: 'tinh-cam' },
  { label: 'Kinh dị', slug: 'kinh-di' },
  { label: 'Viễn tưởng', slug: 'vien-tuong' },
  { label: 'Cổ trang', slug: 'co-trang' },
  { label: 'Hài', slug: 'hai' },
];

const COUNTRIES = [
  { label: 'Hàn Quốc', slug: 'han-quoc' },
  { label: 'Trung Quốc', slug: 'trung-quoc' },
  { label: 'Âu Mỹ', slug: 'au-my' },
  { label: 'Nhật Bản', slug: 'nhat-ban' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [keyword, setKeyword] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = keyword.trim();
    if (!trimmed) return;
    setIsMobileMenuOpen(false);
    router.push(`/search?keyword=${encodeURIComponent(trimmed)}`);
  };

  const handleSearchBlur = () => {
    if (!keyword.trim()) {
      setIsSearchOpen(false);
    }
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full max-w-[100vw] h-16 px-4 md:px-8 flex items-center justify-between box-border bg-gradient-to-b from-black/90 via-black/75 to-transparent backdrop-blur-sm border-b border-white/10">
        {/* Left: Hamburger (Mobile) + Logo + Desktop Menu */}
        <div className="flex items-center gap-3 lg:gap-6 min-w-0">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Mở menu"
            className="lg:hidden text-white p-1.5 rounded hover:bg-white/10 transition"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link
            href="/"
            onClick={closeMobileMenu}
            style={{ fontFamily: 'var(--font-bebas), sans-serif' }}
            className="text-[#E50914] text-3xl md:text-4xl font-normal tracking-[0.06em] uppercase select-none leading-none drop-shadow-[0_2px_10px_rgba(229,9,20,0.5)] hover:brightness-110 transition-all shrink-0 mr-2 whitespace-nowrap"
          >
            HOANPHIM
          </Link>

          <nav className="hidden lg:flex items-center gap-5">
            <Link
              href="/"
              className="text-[13px] lg:text-sm font-medium text-zinc-200 hover:text-white whitespace-nowrap transition"
            >
              Trang chủ
            </Link>
            <Link
              href="/danh-muc/phim-bo"
              className="text-[13px] lg:text-sm font-medium text-zinc-200 hover:text-white whitespace-nowrap transition"
            >
              Phim bộ
            </Link>
            <Link
              href="/danh-muc/phim-le"
              className="text-[13px] lg:text-sm font-medium text-zinc-200 hover:text-white whitespace-nowrap transition"
            >
              Phim lẻ
            </Link>
            <Link
              href="/danh-muc/hoat-hinh"
              className="text-[13px] lg:text-sm font-medium text-zinc-200 hover:text-white whitespace-nowrap transition"
            >
              Hoạt hình
            </Link>

            {/* Dropdown Thể loại */}
            <div className="relative group py-2">
              <button
                type="button"
                className="text-[13px] lg:text-sm font-medium text-zinc-200 hover:text-white whitespace-nowrap transition flex items-center gap-1"
              >
                <span>Thể loại</span>
                <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
              </button>
              <div className="absolute left-0 top-full pt-1 hidden group-hover:block z-50">
                <div className="bg-[#181818] border border-zinc-800 rounded shadow-2xl p-2 w-44 grid grid-cols-1 gap-0.5">
                  {GENRES.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/danh-muc/${item.slug}`}
                      className="whitespace-nowrap text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 px-3 py-1.5 rounded transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Dropdown Quốc gia */}
            <div className="relative group py-2">
              <button
                type="button"
                className="text-[13px] lg:text-sm font-medium text-zinc-200 hover:text-white whitespace-nowrap transition flex items-center gap-1"
              >
                <span>Quốc gia</span>
                <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
              </button>
              <div className="absolute left-0 top-full pt-1 hidden group-hover:block z-50">
                <div className="bg-[#181818] border border-zinc-800 rounded shadow-2xl p-2 w-40 grid grid-cols-1 gap-0.5">
                  {COUNTRIES.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/danh-muc/${item.slug}`}
                      className="whitespace-nowrap text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 px-3 py-1.5 rounded transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Right: Expandable Search + User Avatar */}
        <div className="flex items-center gap-3 shrink-0">
          {isSearchOpen ? (
            <form
              onSubmit={handleSearch}
              className="w-36 sm:w-44 md:w-56 h-8 bg-black/80 border border-white/60 px-2.5 text-xs text-white rounded flex items-center gap-2"
            >
              <Search className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onBlur={handleSearchBlur}
                placeholder="Tìm phim..."
                className="w-full bg-transparent text-xs text-white placeholder-zinc-400 focus:outline-none"
              />
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Tìm kiếm"
              className="w-8 h-8 flex items-center justify-center text-zinc-200 hover:text-white transition"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {user ? (
            <div
              className="relative group py-1"
              onMouseLeave={() => setProfileOpen(false)}
            >
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                className="flex items-center gap-1 focus:outline-none"
              >
                <span className="w-8 h-8 rounded bg-[#E50914] text-white font-bold text-sm flex items-center justify-center shrink-0 uppercase">
                  {user.name.charAt(0)}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-zinc-300 transition-transform duration-200 group-hover:rotate-180 ${
                    profileOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <div
                className={`absolute right-0 top-full pt-2 z-50 ${
                  profileOpen ? 'block' : 'hidden group-hover:block'
                }`}
              >
                <div className="bg-[#181818] border border-zinc-800 rounded shadow-2xl p-2 w-48 space-y-1">
                  <div className="px-3 py-1.5 border-b border-zinc-800">
                    <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                    <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                  </div>

                  <Link
                    href="/my-list"
                    onClick={() => setProfileOpen(false)}
                    className="block whitespace-nowrap text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 px-3 py-2 rounded transition-colors"
                  >
                    Danh sách của tôi
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 whitespace-nowrap text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 px-3 py-2 rounded transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="whitespace-nowrap text-xs sm:text-sm font-medium bg-[#E50914] hover:bg-red-700 text-white px-3 sm:px-3.5 py-1.5 rounded transition-colors shrink-0"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed top-16 left-0 right-0 bg-[#141414]/95 backdrop-blur-md border-b border-zinc-800 p-4 flex flex-col gap-3 z-50 max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col gap-1">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="text-sm font-medium text-zinc-200 hover:text-white hover:bg-zinc-800/80 px-3 py-2 rounded"
            >
              Trang chủ
            </Link>
            <Link
              href="/danh-muc/phim-bo"
              onClick={closeMobileMenu}
              className="text-sm font-medium text-zinc-200 hover:text-white hover:bg-zinc-800/80 px-3 py-2 rounded"
            >
              Phim bộ
            </Link>
            <Link
              href="/danh-muc/phim-le"
              onClick={closeMobileMenu}
              className="text-sm font-medium text-zinc-200 hover:text-white hover:bg-zinc-800/80 px-3 py-2 rounded"
            >
              Phim lẻ
            </Link>
            <Link
              href="/danh-muc/hoat-hinh"
              onClick={closeMobileMenu}
              className="text-sm font-medium text-zinc-200 hover:text-white hover:bg-zinc-800/80 px-3 py-2 rounded"
            >
              Hoạt hình
            </Link>
          </div>

          <div className="border-t border-zinc-800 pt-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 px-3 mb-2">
              Thể loại
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {GENRES.map((item) => (
                <Link
                  key={item.slug}
                  href={`/danh-muc/${item.slug}`}
                  onClick={closeMobileMenu}
                  className="text-sm text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 px-3 py-2 rounded"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 px-3 mb-2">
              Quốc gia
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {COUNTRIES.map((item) => (
                <Link
                  key={item.slug}
                  href={`/danh-muc/${item.slug}`}
                  onClick={closeMobileMenu}
                  className="text-sm text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 px-3 py-2 rounded"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
