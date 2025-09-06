import Script from "next/script";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://prosocial.mx'),
  title: {
    template: '%s | ProSocial',
    default: 'ProSocial - Fotografía y Video Profesional para Eventos Sociales'
  },
  description: 'Especialistas en fotografía y video profesional para bodas, XV años y eventos corporativos. Más de 10 años de experiencia capturando momentos únicos.',
  keywords: ['fotografía profesional', 'video profesional', 'bodas', 'XV años', 'eventos corporativos', 'México'],
  authors: [{ name: 'ProSocial' }],
  creator: 'ProSocial',
  publisher: 'ProSocial',
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
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: 'https://prosocial.mx',
    title: 'ProSocial - Fotografía y Video Profesional',
    description: 'Especialistas en fotografía y video profesional para bodas, XV años y eventos corporativos.',
    siteName: 'ProSocial',
    images: [
      {
        url: 'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/logos/logotipo_blanco.svg',
        width: 1200,
        height: 630,
        alt: 'ProSocial - Fotografía y Video Profesional',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ProSocial - Fotografía y Video Profesional',
    description: 'Especialistas en fotografía y video profesional para bodas, XV años y eventos corporativos.',
    images: ['https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/logos/logotipo_blanco.svg'],
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
      <body className="antialiased min-h-screen bg-zinc-950/95">
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
