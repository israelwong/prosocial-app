'use client';

import Link from 'next/link';
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

export default function ClienteFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-zinc-900 border-t border-zinc-800 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Información de la empresa */}
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <img
                                src="https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/logos/isotipo_gris.svg"
                                alt="ProSocial"
                                className="w-8 h-8 mr-3"
                            />
                            <span className="text-xl font-bold text-white">ProSocial</span>
                        </div>
                        <p className="text-zinc-400 text-sm">
                            Creamos experiencias únicas e inolvidables para tus eventos especiales.
                        </p>
                        <div className="flex space-x-4">
                            <a
                                href="https://facebook.com/prosocialmx"
                                className="text-zinc-400 hover:text-white transition-colors"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a
                                href="https://www.instagram.com/prosocialmx"
                                className="text-zinc-400 hover:text-white transition-colors"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a
                                href="https://www.tiktok.com/@prosocialmx"
                                className="text-zinc-400 hover:text-white transition-colors"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <TikTokIcon className="w-5 h-5" />
                            </a>
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
                            <div className="flex items-center text-zinc-400 text-sm">
                                <Mail className="w-4 h-4 mr-3 text-zinc-500" />
                                <a href="mailto:contacto@prosocial.mx" className="hover:text-white transition-colors">
                                    contacto@prosocial.mx
                                </a>
                            </div>
                            <div className="flex items-center text-zinc-400 text-sm">
                                <Phone className="w-4 h-4 mr-3 text-zinc-500" />
                                <a href="tel:+525544546582" className="hover:text-white transition-colors">
                                    (55) 4454 6582
                                </a>
                            </div>
                            <div className="flex items-start text-zinc-400 text-sm">
                                <MapPin className="w-4 h-4 mr-3 text-zinc-500 mt-0.5" />
                                <span>
                                    Estado de México, México
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Línea divisoria y copyright */}
                <div className="mt-8 pt-6 border-t border-zinc-800">
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                        <p className="text-zinc-500 text-sm">
                            © {currentYear} ProSocial. Todos los derechos reservados.
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
