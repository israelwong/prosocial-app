'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Package, DollarSign, Calendar, Users, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Tipos para la estructura de datos (reutilizando la lógica exitosa)
interface ServiciosAgrupados {
    [seccion: string]: {
        posicion: number;
        categorias: {
            [categoria: string]: {
                posicion: number;
                servicios: any[];
            };
        };
    };
}

interface PaqueteServicio {
    id: string;
    cantidad: number;
    posicion: number;
    Servicio: {
        id: string;
        nombre: string;
        ServicioCategoria: {
            nombre: string;
            posicion: number;
            seccionCategoria?: {
                Seccion: {
                    nombre: string;
                    posicion: number;
                };
            };
        };
    };
    ServicioCategoria: {
        nombre: string;
        posicion: number;
        seccionCategoria?: {
            Seccion: {
                nombre: string;
                posicion: number;
            };
        };
    };
}

interface Paquete {
    id: string;
    nombre: string;
    precio: number | null;
    EventoTipo: {
        nombre: string;
    };
    PaqueteServicio: PaqueteServicio[];
}

interface Props {
    paquete: Paquete;
}

export default function PaqueteDetalle({ paquete }: Props) {
    // Función para agrupar servicios usando la misma lógica exitosa de cotización y seguimiento
    const router = useRouter();
    const agruparServicios = (paqueteServicios: PaqueteServicio[]): ServiciosAgrupados => {
        const serviciosAgrupados: ServiciosAgrupados = {};

        paqueteServicios.forEach((paqueteServicio) => {
            // Usar la lógica exitosa: obtener sección y categoría
            const seccionNombre =
                paqueteServicio.Servicio?.ServicioCategoria?.seccionCategoria?.Seccion?.nombre ||
                paqueteServicio.ServicioCategoria?.seccionCategoria?.Seccion?.nombre ||
                'Servicios Generales';

            const categoriaNombre =
                paqueteServicio.Servicio?.ServicioCategoria?.nombre ||
                paqueteServicio.ServicioCategoria?.nombre ||
                'Sin categoría';

            // Obtener posiciones usando las relaciones correctas
            const seccionPosicion =
                paqueteServicio.Servicio?.ServicioCategoria?.seccionCategoria?.Seccion?.posicion ||
                paqueteServicio.ServicioCategoria?.seccionCategoria?.Seccion?.posicion || 0;

            const categoriaPosicion =
                paqueteServicio.Servicio?.ServicioCategoria?.posicion ||
                paqueteServicio.ServicioCategoria?.posicion || 0;

            // Inicializar sección si no existe
            if (!serviciosAgrupados[seccionNombre]) {
                serviciosAgrupados[seccionNombre] = {
                    posicion: seccionPosicion,
                    categorias: {}
                };
            }

            // Inicializar categoría si no existe
            if (!serviciosAgrupados[seccionNombre].categorias[categoriaNombre]) {
                serviciosAgrupados[seccionNombre].categorias[categoriaNombre] = {
                    posicion: categoriaPosicion,
                    servicios: []
                };
            }

            // Agregar el servicio a la categoría correspondiente
            serviciosAgrupados[seccionNombre].categorias[categoriaNombre].servicios.push({
                id: paqueteServicio.id,
                nombre: paqueteServicio.Servicio.nombre,
                cantidad: paqueteServicio.cantidad
            });
        });

        return serviciosAgrupados;
    };

    const serviciosAgrupados = agruparServicios(paquete.PaqueteServicio);
    const totalServicios = paquete.PaqueteServicio.reduce((total, ps) => total + ps.cantidad, 0);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header con navegación */}
            <div className="mb-8">


                <button
                    type="button"
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a paquetes
                </button>

                <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                                <Package className="w-6 h-6" />
                                <h1 className="text-2xl md:text-3xl font-bold truncate">{paquete.nombre}</h1>
                            </div>

                            <div className="flex items-center gap-2 text-purple-100">
                                <Calendar className="w-4 h-4" />
                                <span className="text-sm">Para {paquete.EventoTipo.nombre}</span>
                            </div>
                        </div>

                        {paquete.precio && (
                            <div className="text-left md:text-right flex-shrink-0">
                                <div className="text-purple-200 text-xs mb-1">Precio del paquete</div>
                                <div className="flex items-center gap-1 text-xl md:text-2xl font-bold">
                                    <DollarSign className="w-5 h-5 md:w-6 md:h-6" />
                                    <span className="break-all">{paquete.precio.toLocaleString('es-MX')}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Servicios incluidos agrupados jerárquicamente */}
            <div className="bg-zinc-800 rounded-xl border border-zinc-700">
                <div className="p-6 border-b border-zinc-700">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-green-400" />
                        Servicios incluidos
                    </h2>
                    <p className="text-zinc-400 mt-2">
                        Todos los servicios organizados por secciones y categorías
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    {Object.entries(serviciosAgrupados)
                        .sort(([, a], [, b]) => (a.posicion || 0) - (b.posicion || 0))
                        .map(([seccionNombre, seccionData]) => (
                            <div key={seccionNombre} className="border border-zinc-600 rounded-lg overflow-hidden">
                                {/* Header de la sección */}
                                <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-2">
                                    <h3 className="text-sm font-medium text-white">
                                        {seccionNombre}
                                    </h3>
                                </div>

                                {/* Contenido de la sección */}
                                <div className="bg-zinc-700/30 p-4 space-y-4">
                                    {Object.entries(seccionData.categorias)
                                        .sort(([, a], [, b]) => (a.posicion || 0) - (b.posicion || 0))
                                        .map(([categoriaNombre, categoriaData]) => (
                                            <div key={categoriaNombre} className="space-y-3">
                                                {/* Header de la categoría */}
                                                <div className="flex items-center gap-2 pb-2 border-b border-blue-500/50">
                                                    <div className="w-1 h-4 bg-blue-500 rounded"></div>
                                                    <h4 className="text-base font-semibold text-blue-300">
                                                        {categoriaNombre}
                                                    </h4>
                                                </div>

                                                {/* Lista de servicios */}
                                                <div className="space-y-2">
                                                    {categoriaData.servicios.map((servicio) => (
                                                        <div key={servicio.id} className="bg-gradient-to-r from-zinc-900/50 to-zinc-800/50 rounded-lg p-3 border border-zinc-600/30">
                                                            <div className="flex items-center justify-between gap-4">
                                                                {/* Información del servicio */}
                                                                <div className="flex-1 min-w-0">
                                                                    <h5 className="text-white font-medium text-sm leading-tight">
                                                                        {servicio.nombre}
                                                                    </h5>
                                                                    <div className="text-xs text-zinc-400 mt-1">
                                                                        Cantidad: {servicio.cantidad}
                                                                    </div>
                                                                </div>

                                                                {/* Indicador de incluido */}
                                                                <div className="flex items-center gap-2 text-green-400">
                                                                    <CheckCircle className="w-4 h-4" />
                                                                    <span className="text-xs font-medium">Incluido</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                </div>
            </div>

            {/* Footer con acción */}
            <div className="mt-8 text-center">
                <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                    <h3 className="text-xl font-bold text-white mb-4">
                        ¿Te interesa este paquete?
                    </h3>
                    <p className="text-zinc-400 mb-6">
                        Contáctanos para más información y para solicitar una cotización personalizada
                    </p>
                    <a
                        href="https://wa.me/5544546582?text=Hola, me interesa el paquete para XV años"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z" />
                        </svg>
                        Contactar por WhatsApp
                    </a>
                </div>
            </div>
        </div>
    );
}
