import type { Metadata } from "next";

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
        <div className="bg-black min-h-screen">

            {/* Contenido Principal - Vacío por ahora */}
            <section className="min-h-screen flex items-center justify-center px-4">
                <div className="max-w-4xl mx-auto text-center">

                    {/* Placeholder - Aquí irá el contenido */}
                    <div className="text-white">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            Contenido Principal
                        </h1>
                        <p className="text-xl text-gray-300 mb-8">
                            Aquí irá el contenido del HOME
                        </p>
                    </div>

                </div>
            </section>

        </div>
    );
}
