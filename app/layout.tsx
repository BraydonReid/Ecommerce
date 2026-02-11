import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: {
    default: 'GreenCommerce Intelligence - E-Commerce Carbon Footprint Tracking',
    template: '%s | GreenCommerce',
  },
  description:
    'Track and reduce your e-commerce carbon footprint with AI-powered insights. Integrate with Shopify to measure shipping and packaging emissions.',
  keywords: [
    'carbon footprint',
    'e-commerce sustainability',
    'shopify app',
    'carbon tracking',
    'emissions calculator',
    'sustainable e-commerce',
    'green commerce',
    'environmental impact',
  ],
  authors: [{ name: 'GreenCommerce Team' }],
  creator: 'GreenCommerce',
  publisher: 'GreenCommerce',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://greencommerces.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'GreenCommerce Intelligence - E-Commerce Carbon Footprint Tracking',
    description:
      'Track and reduce your e-commerce carbon footprint with AI-powered insights.',
    url: '/',
    siteName: 'GreenCommerce',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GreenCommerce - Track Your Carbon Footprint',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GreenCommerce Intelligence',
    description: 'Track and reduce your e-commerce carbon footprint.',
    creator: '@greencommerce',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#10b981' },
    { media: '(prefers-color-scheme: dark)', color: '#059669' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
