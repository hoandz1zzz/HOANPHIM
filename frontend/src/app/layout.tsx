import type { Metadata } from 'next';
import { Bebas_Neue } from 'next/font/google';
import HoanPhimChatWidget from '@/components/chat/HoanPhimChatWidget';
import Navbar from '@/components/layout/Navbar';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
});

export const metadata: Metadata = {
  title: 'HoanPhim - Xem Phim Trực Tuyến Chất Lượng Cao',
  description: 'HoanPhim - Hệ thống xem phim trực tuyến chất lượng cao',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={bebas.variable}>
      <body className="font-sans bg-[#141414] text-white antialiased min-h-screen">
        <AuthProvider>
          <Navbar />
          <main className="pt-16">{children}</main>
          <HoanPhimChatWidget />
        </AuthProvider>
      </body>
    </html>
  );
}
