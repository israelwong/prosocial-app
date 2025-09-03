'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
    Mail,
    Phone,
    MapPin,
    Facebook,
    Instagram,
    Twitter,
    Heart
} from 'lucide-react';
import TikTokIcon from '@/app/components/ui/TikTokIcon';
import type { NegocioData, NegocioRRSSData } from '@/app/admin/_lib/actions/negocio/negocio.actions';

export default function ClienteFooter() {
    const currentYear = new Date().getFullYear();
    const [negocio, setNegocio] = useState<NegocioData | null>(null);
    const [redesSociales, setRedesSociales] = useState<NegocioRRSSData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarDatosNegocio = async () => {
            try {
                const response = await fetch('/api/negocio/info');
                if (response.ok) {
                    const data = await response.json();
                    setNegocio(data.negocio);
                    setRedesSociales(data.redesSociales || []);
                }
            } catch (error) {
                console.error('Error al cargar datos del negocio:', error);
            } finally {
                setLoading(false);
            }
        };

        cargarDatosNegocio();
    }, []);

    return (
        <footer className="bg-zinc-900 border-t border-zinc-800 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Información de la empresa */}
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <img
                                src={negocio?.isotipoUrl || "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/logos/isotipo_gris.svg"}
                                alt={negocio?.nombre || "ProSocial"}
                                className="w-8 h-8 mr-3"
                            />
                            <span className="text-xl font-bold text-white">{negocio?.nombre || "ProSocial"}</span>
                        </div>
                        <p className="text-zinc-400 text-sm">
                            {negocio?.descripcion || "Creamos experiencias únicas e inolvidables para tus eventos especiales."}
                        </p>
                        <div className="flex space-x-4">
                            {redesSociales.map((red) => {
                                // Mapear plataformas a iconos
                                const getIcon = (plataforma: string) => {
                                    switch (plataforma.toLowerCase()) {
                                        case 'facebook':
                                            return <Facebook className="w-5 h-5" />;
                                        case 'instagram':
                                            return <Instagram className="w-5 h-5" />;
                                        case 'tiktok':
                                            return <TikTokIcon className="w-5 h-5" />;
                                        case 'twitter':
                                        case 'x':
                                            return <Twitter className="w-5 h-5" />;
                                        default:
                                            return null;
                                    }
                                };

                                const icon = getIcon(red.plataforma);
                                if (!icon) return null;

                                return (
                                    <a
                                        key={red.id}
                                        href={red.url}
                                        className="text-zinc-400 hover:text-white transition-colors"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title={`Síguenos en ${red.plataforma}`}
                                    >
                                        {icon}
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Enlaces rápidos */}
                    <div className="space-y-4">
                        <h3 className="text-white font-semibold">Enlaces Rápidos</h3>
                        <div className="space-y-2">
                            <Link
                                href="/cliente/dashboard"
                                className="block text-zinc-400 hover:text-white transition-colors text-sm"
                            >
                                Mi Dashboard
                            </Link>
                            {/* <Link
                                href="/cliente/cotizaciones"
                                className="block text-zinc-400 hover:text-white transition-colors text-sm"
                            >
                                Mis Cotizaciones
                            </Link> */}
                            <Link
                                href="/cliente/pagos"
                                className="block text-zinc-400 hover:text-white transition-colors text-sm"
                            >
                                Historial de Pagos
                            </Link>
                            <Link
                                href="/aviso-de-privacidad"
                                className="block text-zinc-400 hover:text-white transition-colors text-sm"
                            >
                                Aviso de Privacidad
                            </Link>
                        </div>
                    </div>

                    {/* Información de contacto */}
                    <div className="space-y-4">
                        <h3 className="text-white font-semibold">Contacto</h3>
                        <div className="space-y-3">
                            {negocio?.email && (
                                <div className="flex items-center text-zinc-400 text-sm">
                                    <Mail className="w-4 h-4 mr-3 text-zinc-500" />
                                    <a href={`mailto:${negocio.email}`} className="hover:text-white transition-colors">
                                        {negocio.email}
                                    </a>
                                </div>
                            )}
                            {negocio?.telefono && (
                                <div className="flex items-center text-zinc-400 text-sm">
                                    <Phone className="w-4 h-4 mr-3 text-zinc-500" />
                                    <a href={`tel:${negocio.telefono.replace(/\D/g, '')}`} className="hover:text-white transition-colors">
                                        {negocio.telefono}
                                    </a>
                                </div>
                            )}
                            {negocio?.direccion && (
                                <div className="flex items-start text-zinc-400 text-sm">
                                    <MapPin className="w-4 h-4 mr-3 text-zinc-500 mt-0.5" />
                                    <span>
                                        {negocio.direccion}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Línea divisoria y copyright */}
                <div className="mt-8 pt-6 border-t border-zinc-800">
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                        <p className="text-zinc-500 text-sm">
                            © {currentYear} {negocio?.nombre || "ProSocial"}. Todos los derechos reservados.
                        </p>
                        <p className="text-zinc-500 text-sm flex items-center mt-2 sm:mt-0">
                            Hecho con <Heart className="w-4 h-4 mx-1 text-red-500" /> para crear momentos especiales
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
