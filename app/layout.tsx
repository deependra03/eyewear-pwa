import type { Metadata, Viewport } from 'next';
import { Playfair_Display } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'EyeWear Store — Premium Glasses & Sunglasses',
    template: '%s | EyeWear Store',
  },
  description:
    'Shop premium eyeglasses, sunglasses and contact lenses. 3D try-on, 360° view. Free delivery. COD available.',
  keywords: ['eyeglasses', 'sunglasses', 'contact lenses', 'spectacles', 'frames', 'optical'],
  authors: [{ name: 'EyeWear Store' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'EyeWear Store',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: process.env.NEXTAUTH_URL,
    siteName: 'EyeWear Store',
    title: 'EyeWear Store — Premium Glasses & Sunglasses',
    description: 'Shop premium eyewear with 3D try-on technology',
  },
};

export const viewport: Viewport = {
  themeColor: '#f97316',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={playfair.variable}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <script
          type="module"
          src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"
          async
        />
      </head>
      <body className="font-body bg-dark-900 text-white antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#1a1a1a',
                color: '#fff',
                border: '1px solid #2a2a2a',
              },
              success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
