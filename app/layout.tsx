import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { CartProvider } from '@/components/cart/CartProvider';
import { DemoModeProvider } from '@/components/account/DemoModeProvider';
import { SavedItemsProvider } from '@/components/account/SavedItemsProvider';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { MobileTabBar } from '@/components/layout/MobileTabBar';
import { JsonLd } from '@/components/seo/JsonLd';
import { site } from '@/lib/site';
import { organizationJsonLd, pageTitle } from '@/lib/seo';

const DEFAULT_TITLE = 'Avtomobil, elektronika va moliyalashtirish';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  // Pages override this. It exists so nothing can ship without a title.
  title: {
    default: pageTitle(DEFAULT_TITLE),
    template: '%s | Markab',
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  alternates: { canonical: site.url },
  openGraph: {
    type: 'website',
    url: site.url,
    siteName: site.name,
    title: pageTitle(DEFAULT_TITLE),
    description: site.description,
    locale: 'uz_UZ',
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle(DEFAULT_TITLE),
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
      <head>
        {/* Organization and WebSite only — the two nodes whose fields are all
            actually published. No logo, contact points or social profiles:
            none is available, and guessing them would be worse than omitting
            them. */}
        <JsonLd data={organizationJsonLd()} />
      </head>
      <body className="min-h-dvh bg-surface font-sans">
        {/* Scroll-reveal wrappers start hidden; without JS they must not stay hidden. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important;}`}</style>
        </noscript>

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-ink-900 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          Asosiy tarkibga o‘tish
        </a>

        <AuthProvider>
          <DemoModeProvider>
            <SavedItemsProvider>
              <CartProvider>
                <SiteHeader />
                {/* Bottom padding reserves space for the mobile tab bar. */}
                <main id="main" className="pb-[76px] md:pb-0">
                  {children}
                </main>
                <SiteFooter />
                <MobileTabBar />
              </CartProvider>
            </SavedItemsProvider>
          </DemoModeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
