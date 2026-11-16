'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(name, email, password);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-black/80 border border-white/10 rounded-lg p-8 space-y-6">
        <h1 className="text-2xl font-bold">Đăng ký tài khoản</h1>

        {error && (
          <div className="bg-red-950/70 border border-red-600 text-red-200 text-sm px-4 py-2.5 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Họ tên</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-netflix-red"
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-netflix-red"
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1">Mật khẩu (tối thiểu 6 ký tự)</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-netflix-red"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-netflix-red hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded transition-colors"
          >
            {submitting ? 'Đang tạo tài khoản...' : 'Đăng ký'}
          </button>
        </form>

        <p className="text-sm text-neutral-400 text-center">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-white hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
