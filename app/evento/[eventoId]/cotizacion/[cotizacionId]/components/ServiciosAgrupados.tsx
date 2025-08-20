'use client'
import React from 'react'
import type { ServicioDetalle } from '@/app/admin/_lib/actions/seguimiento/seguimiento-detalle.schemas'

interface ServiciosAgrupados {
    [seccion: string]: {
        posicion: number
        categorias: {
            [categoria: string]: {
                posicion: number
                servicios: ServicioDetalle[]
            }
        }
    }
}

interface Props {
    serviciosAgrupados: ServiciosAgrupados
    loading: boolean
    esRealtime: boolean
}

export default function ServiciosAgrupados({ serviciosAgrupados, loading, esRealtime }: Props) {
    return (
        <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white text-lg">
                    📋 Servicios incluidos
                </h3>
                <div className="text-xs text-zinc-400 bg-zinc-700 px-2 py-1 rounded">
                    {Object.keys(serviciosAgrupados).length} sección{Object.keys(serviciosAgrupados).length !== 1 ? 'es' : ''}
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-4 bg-zinc-700 rounded w-1/3 mb-2"></div>
                            <div className="h-3 bg-zinc-600 rounded w-full mb-1"></div>
                            <div className="h-3 bg-zinc-600 rounded w-2/3"></div>
                        </div>
                    ))}
                </div>
            ) : Object.keys(serviciosAgrupados).length === 0 ? (
                <div className="text-center py-8">
                    <div className="text-zinc-400 mb-2">📦</div>
                    <div className="text-zinc-300 font-medium">No hay servicios disponibles</div>
                    <div className="text-zinc-500 text-sm mt-1">
                        Los servicios aparecerán aquí una vez que se agreguen a la cotización
                    </div>
                    {esRealtime && (
                        <div className="text-xs text-zinc-500">
                            Los servicios aparecerán conforme se agreguen
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(serviciosAgrupados)
                        .sort(([, a], [, b]) => (a.posicion || 0) - (b.posicion || 0))
                        .map(([seccionNombre, seccionData]) => (
                            <div key={seccionNombre} className="border border-zinc-600 rounded-lg overflow-hidden">
                                {/* Header de la sección */}
                                <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-2">
                                    <h4 className="text-sm font-medium text-white">
                                        {seccionNombre}
                                    </h4>
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
                                                    <h5 className="text-base font-semibold text-blue-300">
                                                        {categoriaNombre}
                                                    </h5>
                                                </div>

                                                {/* Lista de servicios */}
                                                <div className="space-y-2">
                                                    {/* 🔧 ORDENAMIENTO DESHABILITADO TEMPORALMENTE PARA DIAGNÓSTICO */}
                                                    {categoriaData.servicios
                                                        .map((cotizacionServicio) => (
                                                            <div key={cotizacionServicio.id} className="bg-gradient-to-r from-zinc-900/50 to-zinc-800/50 rounded-lg p-3 border border-zinc-600/30 hover:border-zinc-500/50 transition-all duration-200">
                                                                <div className="flex items-center justify-between gap-4">
                                                                    {/* Información del servicio */}
                                                                    <div className="flex-1 min-w-0">
                                                                        <h6 className="text-white font-medium text-sm leading-tight">
                                                                            {cotizacionServicio.nombre}
                                                                        </h6>
                                                                        <div className="text-xs text-zinc-400 mt-1">
                                                                            Cantidad: {cotizacionServicio.cantidad}
                                                                        </div>
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
            )}
        </div>
    )
}
