import type { Metadata } from "next";
import { ComingSoon } from '@/app/components/shared/announcements';

export const metadata: Metadata = {
    title: "ProSocial - Fotografía y Video Profesional | Especialistas en Bodas y XV Años",
    description: "Más de 10 años especializados en fotografía y video profesional para bodas y XV años. Entrega en 48hrs. Fechas limitadas 2025. ¡Contáctanos HOY!",
    keywords: ["fotografía profesional", "video profesional", "bodas México", "XV años", "especialistas", "entrega rápida", "2025"],
    openGraph: {
        title: "ProSocial - Especialistas en Fotografía y Video Profesional",
        description: "10+ años capturando momentos únicos. Entrega en 48hrs. Fechas limitadas 2025. ¡Reserva HOY!",
        images: [
            {
                url: "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/logos/logotipo_blanco.svg",
                width: 1200,
                height: 630,
                alt: "ProSocial Logotipo",
            },
        ],
    },
};

export default function Home() {
    return (
        <div className="bg-zinc-950 min-h-screen">


            {/* Coming Soon Section */}
            <section className="py-16 lg:py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <ComingSoon />
                </div>
            </section>

        </div>
    );
}
