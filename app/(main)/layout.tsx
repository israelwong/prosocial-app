import Navbar from "@/app/components/main/NavbarV2";
import { FooterMarketing } from "@/app/components/shared";
import { GoogleTagManager } from '@next/third-parties/google';
import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
    description: 'Especialistas en fotografía y video profesional para bodas, XV años y eventos corporativos. Más de 10 años de experiencia capturando momentos únicos.',
    keywords: ['fotografía profesional', 'video profesional', 'bodas', 'XV años', 'eventos corporativos', 'México', 'invitaciones digitales', 'almacenamiento multimedia'],
    authors: [{ name: 'ProSocial' }],
    creator: 'ProSocial',
    publisher: 'ProSocial',
    openGraph: {
        type: 'website',
        locale: 'es_MX',
        url: 'https://prosocial.mx',
        title: 'ProSocial - Plataforma Integral para Eventos',
        description: 'No solo capturamos momentos, creamos ecosistemas digitales. Desde fotografía profesional hasta servicios tecnológicos avanzados.',
        siteName: 'ProSocial',
        images: [
            {
                url: 'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/logos/logotipo_blanco.svg',
                width: 1200,
                height: 630,
                alt: 'ProSocial - Plataforma Integral para Eventos',
            },
        ],
    },
};

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="antialiased h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            <FooterMarketing />
            <GoogleTagManager gtmId="GTM-WCG8X7J" />
        </div>
    );
}