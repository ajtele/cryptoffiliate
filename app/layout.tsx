import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'Cryptoffiliate - G2 + Crunchbase for Crypto',
    template: '%s | Cryptoffiliate',
  },
  description:
    'Compare crypto exchanges, hardware wallets, tax software, trading bots, and more. Your trusted guide to crypto products with transparent affiliate recommendations.',
  keywords: [
    'crypto exchange',
    'hardware wallet',
    'crypto tax software',
    'trading bots',
    'cloud mining',
    'crypto comparison',
    'cryptocurrency reviews',
  ],
  authors: [{ name: 'Cryptoffiliate' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://cryptoffiliate.com',
    siteName: 'Cryptoffiliate',
    title: 'Cryptoffiliate - G2 + Crunchbase for Crypto',
    description:
      'Compare crypto exchanges, hardware wallets, tax software, trading bots, and more.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Cryptoffiliate',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cryptoffiliate - G2 + Crunchbase for Crypto',
    description:
      'Compare crypto exchanges, hardware wallets, tax software, trading bots, and more.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
