import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Heart, Sparkles } from "lucide-react";

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
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-4">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>

                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    {/* Main Title */}
                    <div className="mb-8">
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 font-roboto tracking-tight">
                            Momentos
                            <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Inolvidables
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed">
                            Más de 10 años capturando la magia de tus celebraciones más especiales
                        </p>
                    </div>

                    {/* Service Selection */}
                    <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
                        {/* Fifteens Card */}
                        <Link
                            href="/fifteens"
                            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 p-8 transition-all duration-300 hover:scale-105 hover:border-pink-400/40 hover:shadow-2xl hover:shadow-pink-500/10"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-center mb-4">
                                    <div className="p-3 rounded-full bg-pink-500/20 group-hover:bg-pink-500/30 transition-colors duration-300">
                                        <Sparkles className="w-8 h-8 text-pink-400" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-pink-300 transition-colors duration-300">
                                    XV Años
                                </h3>
                                <p className="text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300">
                                    Celebra tu transición a mujer con elegancia y estilo único
                                </p>
                            </div>
                        </Link>

                        {/* Weddings Card */}
                        <Link
                            href="/weddings"
                            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500/10 to-red-500/10 border border-rose-500/20 p-8 transition-all duration-300 hover:scale-105 hover:border-rose-400/40 hover:shadow-2xl hover:shadow-rose-500/10"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-center mb-4">
                                    <div className="p-3 rounded-full bg-rose-500/20 group-hover:bg-rose-500/30 transition-colors duration-300">
                                        <Heart className="w-8 h-8 text-rose-400" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-rose-300 transition-colors duration-300">
                                    Bodas
                                </h3>
                                <p className="text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300">
                                    Tu día perfecto merece ser recordado para siempre
                                </p>
                            </div>
                        </Link>
                    </div>

                    {/* CTA */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            href="/contacto"
                            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:from-purple-500 hover:to-pink-500 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
                        >
                            Consulta Disponibilidad
                        </Link>
                        <div className="flex items-center text-zinc-500 text-sm">
                            <Calendar className="w-4 h-4 mr-2" />
                            Fechas limitadas 2025
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 border-2 border-zinc-600 rounded-full flex justify-center">
                        <div className="w-1 h-3 bg-zinc-600 rounded-full mt-2 animate-pulse"></div>
                    </div>
                </div>
            </section>
        </div>
    );
}
