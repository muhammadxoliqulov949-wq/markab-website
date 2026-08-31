import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { CartProvider } from '@/components/cart/CartProvider';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { MobileTabBar } from '@/components/layout/MobileTabBar';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: 'Markab — Avtomobil, elektronika va shaffof investitsiya',
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  openGraph: {
    type: 'website',
    url: site.url,
    siteName: site.name,
    title: 'Markab — Avtomobil, elektronika va shaffof investitsiya',
    description: site.description,
    locale: 'uz_UZ',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Markab — Avtomobil, elektronika va shaffof investitsiya',
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0C1116',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body className="min-h-dvh bg-surface font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-ink-900 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          Asosiy tarkibga o‘tish
        </a>

        <AuthProvider>
          <CartProvider>
            <SiteHeader />
            {/* Bottom padding reserves space for the mobile tab bar. */}
            <main id="main" className="pb-[76px] md:pb-0">
              {children}
            </main>
            <SiteFooter />
            <MobileTabBar />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
