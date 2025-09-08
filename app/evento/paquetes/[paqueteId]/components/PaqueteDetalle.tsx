'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Package, DollarSign, Calendar, Users, CheckCircle, MessageCircle, Scale, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import SolicitudPaqueteModal from '../../../[eventoId]/components/modals/SolicitudPaqueteModal'
import ValidacionFechaInfo from '@/app/evento/components/ui/ValidacionFechaInfo'
import type { EventoCompleto } from '@/app/admin/_lib/actions/evento/evento.schemas'

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
        posicion?: number;
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
    dias_minimos_contratacion?: number;
    dias_minimos_explicacion?: string;
}

interface Props {
    paquete: Paquete;
    eventoInfo?: EventoCompleto | null;
    eventoId?: string;
}

export default function PaqueteDetalle({ paquete, eventoInfo, eventoId }: Props) {
    const [mostrarModal, setMostrarModal] = useState(false)
    const router = useRouter();

    // Función para agrupar servicios usando la misma lógica exitosa de cotización y seguimiento
    const agruparServicios = (paqueteServicios: PaqueteServicio[]): ServiciosAgrupados => {
        const serviciosAgrupados: ServiciosAgrupados = {};

        paqueteServicios.forEach((paqueteServicio) => {
            // Usar la lógica exitosa: obtener sección y categoría con la estructura correcta
            const seccionNombre =
                paqueteServicio.ServicioCategoria?.seccionCategoria?.Seccion?.nombre ??
                paqueteServicio.Servicio?.ServicioCategoria?.seccionCategoria?.Seccion?.nombre ??
                'Servicios Generales';

            const categoriaNombre =
                paqueteServicio.ServicioCategoria?.nombre ??
                paqueteServicio.Servicio?.ServicioCategoria?.nombre ??
                'Sin categoría';

            // ✅ CORREGIR LA LECTURA DE POSICIONES - TRATAR 0 COMO VALOR VÁLIDO
            // El problema era que posición 0 se evaluaba como falsy con ||
            const seccionPosicion =
                paqueteServicio.ServicioCategoria?.seccionCategoria?.Seccion?.posicion !== undefined
                    ? paqueteServicio.ServicioCategoria?.seccionCategoria?.Seccion?.posicion
                    : paqueteServicio.Servicio?.ServicioCategoria?.seccionCategoria?.Seccion?.posicion !== undefined
                        ? paqueteServicio.Servicio?.ServicioCategoria?.seccionCategoria?.Seccion?.posicion
                        : 999;

            const categoriaPosicion =
                paqueteServicio.ServicioCategoria?.posicion !== undefined
                    ? paqueteServicio.ServicioCategoria?.posicion
                    : paqueteServicio.Servicio?.ServicioCategoria?.posicion !== undefined
                        ? paqueteServicio.Servicio?.ServicioCategoria?.posicion
                        : 999;

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
                cantidad: paqueteServicio.cantidad,
                posicionServicio: paqueteServicio.Servicio.posicion ?? 999
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

            {/* Información de validación de fechas */}
            {eventoInfo?.fecha_evento && paquete.dias_minimos_contratacion && (
                <div className="mb-8">
                    <ValidacionFechaInfo
                        fechaEvento={eventoInfo.fecha_evento}
                        diasMinimosContratacion={paquete.dias_minimos_contratacion}
                        explicacion={paquete.dias_minimos_explicacion}
                        tamaño="lg"
                    />
                </div>
            )}

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
                        .sort(([, a], [, b]) => a.posicion - b.posicion)
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
                                        .sort(([, a], [, b]) => a.posicion - b.posicion)
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
                                                    {categoriaData.servicios
                                                        .sort((a, b) => (a.posicionServicio ?? 999) - (b.posicionServicio ?? 999))
                                                        .map((servicio) => (
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
            <div className="mt-8">
                <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                    <h3 className="text-xl font-bold text-white mb-4 text-center">
                        ¿Te interesa este paquete?
                    </h3>
                    <p className="text-zinc-400 mb-6 text-center">
                        Explora tus opciones o solicita información personalizada
                    </p>

                    {/* Botones de acción */}
                    <div className="space-y-3">
                        {/* Botón comparar paquetes */}
                        {eventoId && (
                            <Link href={`/evento/${eventoId}/comparador`}>
                                <button className="w-full py-3 px-6 rounded-lg font-medium text-white bg-blue-600/80 hover:bg-blue-600 border border-blue-500/50 hover:border-blue-400 transition-all duration-200 flex items-center justify-center gap-2">
                                    <Scale className="w-5 h-5" />
                                    Comparar Paquetes
                                </button>
                            </Link>
                        )}

                        {/* Botón solicitar paquete */}
                        <button
                            onClick={() => setMostrarModal(true)}
                            className="w-full py-3 px-6 rounded-lg font-medium text-white bg-purple-600/80 hover:bg-purple-600 border border-purple-500/50 hover:border-purple-400 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Solicitar Este Paquete
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de solicitud */}
            {mostrarModal && (
                <SolicitudPaqueteModal
                    paquete={{
                        id: paquete.id,
                        nombre: paquete.nombre,
                        precio: paquete.precio || 0,
                        eventoTipo: paquete.EventoTipo.nombre,
                        dias_minimos_contratacion: paquete.dias_minimos_contratacion,
                        dias_minimos_explicacion: paquete.dias_minimos_explicacion
                    }}
                    eventoId={eventoId || ''}
                    cliente={eventoInfo?.Cliente ? {
                        nombre: eventoInfo.Cliente.nombre,
                        email: eventoInfo.Cliente.email || '',
                        telefono: eventoInfo.Cliente.telefono || undefined
                    } : undefined}
                    evento={eventoInfo ? {
                        fecha_evento: eventoInfo.fecha_evento,
                        tipo_evento: eventoInfo.EventoTipo?.nombre
                    } : undefined}
                    onClose={() => setMostrarModal(false)}
                    onSuccess={() => setMostrarModal(false)}
                />
            )}
        </div>
    );
}
