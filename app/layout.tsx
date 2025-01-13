import Script from "next/script";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/logos/isotipo_gris.svg"
          style={{ width: 'auto', height: 'auto' }} type="image/svg+xml"
        />
        <Script
          id="fontawesome"
          src="https://kit.fontawesome.com/74d1405387.js">
        </Script>
      </head>
      <body
        className={'antialiased h-screen bg-zinc-950/95'}
      >
        {children}
      </body>
    </html>
  );
}
