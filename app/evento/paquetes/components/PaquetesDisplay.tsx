'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Package, Eye, DollarSign, Users, Calendar } from 'lucide-react'

// Tipos para la estructura de datos
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
    PaqueteServicio: PaqueteServicio[];
}

interface TipoEvento {
    id: string;
    nombre: string;
    Paquete: Paquete[];
}

interface Props {
    tiposEventoConPaquetes: TipoEvento[];
}

export default function PaquetesDisplay({ tiposEventoConPaquetes }: Props) {
    const [tipoEventoSeleccionado, setTipoEventoSeleccionado] = useState<string>(
        tiposEventoConPaquetes[0]?.id || ''
    )

    // Función para agrupar servicios usando la misma lógica exitosa
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

            // Obtener posiciones
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

    const tipoEventoActual = tiposEventoConPaquetes.find(tipo => tipo.id === tipoEventoSeleccionado);

    return (
        <div className="space-y-8">
            {/* Selector de tipo de evento */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-6">
                    Selecciona el tipo de evento
                </h2>
                <div className="flex flex-wrap justify-center gap-4">
                    {tiposEventoConPaquetes.map((tipoEvento) => (
                        <button
                            key={tipoEvento.id}
                            onClick={() => setTipoEventoSeleccionado(tipoEvento.id)}
                            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${tipoEventoSeleccionado === tipoEvento.id
                                    ? 'bg-purple-600 text-white shadow-lg transform scale-105'
                                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                                }`}
                        >
                            <Calendar className="w-5 h-5 inline mr-2" />
                            {tipoEvento.nombre}
                        </button>
                    ))}
                </div>
            </div>

            {/* Paquetes del tipo de evento seleccionado */}
            {tipoEventoActual && (
                <div className="space-y-8">
                    <h3 className="text-3xl font-bold text-white text-center">
                        Paquetes para {tipoEventoActual.nombre}
                    </h3>

                    {tipoEventoActual.Paquete.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="w-16 h-16 text-zinc-500 mx-auto mb-4" />
                            <p className="text-zinc-400 text-lg">
                                Próximamente tendremos paquetes disponibles para {tipoEventoActual.nombre}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                            {tipoEventoActual.Paquete.map((paquete) => {
                                const serviciosAgrupados = agruparServicios(paquete.PaqueteServicio);
                                const totalServicios = paquete.PaqueteServicio.reduce(
                                    (total, ps) => total + ps.cantidad, 0
                                );

                                return (
                                    <div key={paquete.id} className="bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700 hover:border-purple-500 transition-all duration-300 hover:transform hover:scale-105">
                                        {/* Header del paquete */}
                                        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6">
                                            <h4 className="text-xl font-bold text-white mb-2">
                                                {paquete.nombre}
                                            </h4>
                                            <div className="flex items-center justify-between text-purple-100">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4" />
                                                    <span className="text-sm">{totalServicios} servicios</span>
                                                </div>
                                                {paquete.precio && (
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="w-4 h-4" />
                                                        <span className="text-lg font-bold">
                                                            ${paquete.precio.toLocaleString('es-MX')}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Servicios agrupados */}
                                        <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                                            {Object.entries(serviciosAgrupados)
                                                .sort(([, a], [, b]) => (a.posicion || 0) - (b.posicion || 0))
                                                .map(([seccionNombre, seccionData]) => (
                                                    <div key={seccionNombre} className="space-y-3">
                                                        {/* Nombre de sección */}
                                                        <h5 className="text-purple-300 font-semibold text-sm flex items-center gap-2">
                                                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                                            {seccionNombre}
                                                        </h5>

                                                        {/* Categorías */}
                                                        <div className="ml-4 space-y-2">
                                                            {Object.entries(seccionData.categorias)
                                                                .sort(([, a], [, b]) => (a.posicion || 0) - (b.posicion || 0))
                                                                .map(([categoriaNombre, categoriaData]) => (
                                                                    <div key={categoriaNombre} className="space-y-1">
                                                                        {/* Nombre de categoría */}
                                                                        <h6 className="text-zinc-300 font-medium text-xs">
                                                                            {categoriaNombre}
                                                                        </h6>

                                                                        {/* Servicios */}
                                                                        <div className="ml-3 space-y-1">
                                                                            {categoriaData.servicios.map((servicio) => (
                                                                                <div key={servicio.id} className="text-zinc-400 text-xs flex items-center justify-between">
                                                                                    <span>{servicio.nombre}</span>
                                                                                    <span className="text-zinc-500">x{servicio.cantidad}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>

                                        {/* Footer con acciones */}
                                        <div className="p-6 pt-0">
                                            <Link
                                                href={`/evento/paquetes/${paquete.id}`}
                                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Ver detalles completos
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
