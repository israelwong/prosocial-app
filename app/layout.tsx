import Script from "next/script";
import type { Metadata } from "next";
import { Roboto } from 'next/font/google';
import "./globals.css";

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://prosocial.mx'),
  title: {
    template: '%s | ProSocial',
    default: 'ProSocial - Plataforma Integral para Eventos'
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
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: 'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/logos/isotipo_gris.svg', type: 'image/svg+xml' }
    ],
    apple: [
      { url: 'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/logos/isotipo_gris.svg', sizes: '180x180' }
    ],
  },
  manifest: '/manifest.json',
  verification: {
    google: '', // Agregar cuando tengas Google Search Console
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX">
      <body className={`antialiased min-h-screen bg-zinc-950/95 ${roboto.variable}`}>
        {children}

        {/* FontAwesome Script al final del body para mejor performance */}
        <Script
          id="fontawesome"
          src="https://kit.fontawesome.com/74d1405387.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
