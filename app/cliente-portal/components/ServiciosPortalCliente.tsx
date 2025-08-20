'use client'
import React from 'react'

interface Servicio {
    id: string
    nombre: string
    cantidad: number
    precio_unitario?: number
    subtotal?: number
    seccion?: string
    categoria?: string
    seccionPosicion?: number
    categoriaPosicion?: number
    posicion?: number
}

interface ServiciosAgrupados {
    [seccion: string]: {
        posicion: number
        categorias: {
            [categoria: string]: {
                posicion: number
                servicios: Servicio[]
            }
        }
    }
}

interface Props {
    servicios?: Servicio[]
    loading?: boolean
}

export default function ServiciosPortalCliente({ servicios = [], loading = false }: Props) {
    // Agrupar servicios por sección y categoría
    const agruparServicios = (servicios: Servicio[]): ServiciosAgrupados => {
        const agrupados: ServiciosAgrupados = {}

        servicios.forEach((servicio) => {
            // Usar sección y categoría del servicio, o valores por defecto
            const seccion = servicio.seccion || 'Servicios Incluidos'
            const categoria = servicio.categoria || 'General'
            const seccionPosicion = servicio.seccionPosicion || 0
            const categoriaPosicion = servicio.categoriaPosicion || 0

            if (!agrupados[seccion]) {
                agrupados[seccion] = {
                    posicion: seccionPosicion,
                    categorias: {}
                }
            }

            if (!agrupados[seccion].categorias[categoria]) {
                agrupados[seccion].categorias[categoria] = {
                    posicion: categoriaPosicion,
                    servicios: []
                }
            }

            agrupados[seccion].categorias[categoria].servicios.push(servicio)
        })

        return agrupados
    }

    const serviciosAgrupados = agruparServicios(servicios)

    return (
        <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-zinc-100 text-lg">
                    📋 Servicios incluidos
                </h3>
                <div className="text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded">
                    {servicios.length} servicio{servicios.length !== 1 ? 's' : ''}
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-4 bg-zinc-800 rounded w-1/3 mb-2"></div>
                            <div className="h-3 bg-zinc-700 rounded w-full mb-1"></div>
                            <div className="h-3 bg-zinc-700 rounded w-2/3"></div>
                        </div>
                    ))}
                </div>
            ) : servicios.length === 0 ? (
                <div className="text-center py-8">
                    <div className="text-zinc-500 mb-2">📦</div>
                    <div className="text-zinc-300 font-medium">No hay servicios disponibles</div>
                    <div className="text-zinc-500 text-sm mt-1">
                        Los servicios aparecerán aquí una vez que se configuren en la cotización
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(serviciosAgrupados)
                        .sort(([, a], [, b]) => (a.posicion || 0) - (b.posicion || 0))
                        .map(([seccionNombre, seccionData]) => (
                            <div key={seccionNombre} className="border border-zinc-700 rounded-lg overflow-hidden">
                                {/* Header de la sección */}
                                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2">
                                    <h4 className="text-sm font-medium text-white">
                                        {seccionNombre}
                                    </h4>
                                </div>

                                {/* Contenido de la sección */}
                                <div className="bg-zinc-800/30 p-4 space-y-4">
                                    {Object.entries(seccionData.categorias)
                                        .sort(([, a], [, b]) => (a.posicion || 0) - (b.posicion || 0))
                                        .map(([categoriaNombre, categoriaData]) => (
                                            <div key={categoriaNombre} className="space-y-3">
                                                {/* Header de la categoría */}
                                                <div className="flex items-center gap-2 pb-2 border-b border-blue-500/50">
                                                    <div className="w-1 h-4 bg-blue-400 rounded"></div>
                                                    <h5 className="text-base font-semibold text-blue-300">
                                                        {categoriaNombre}
                                                    </h5>
                                                </div>

                                                {/* Lista de servicios */}
                                                <div className="space-y-2">
                                                    {/* Los servicios vienen ordenados del backend */}
                                                    {categoriaData.servicios.map((servicio) => (
                                                        <div key={servicio.id} className="bg-gradient-to-r from-zinc-900/50 to-zinc-800/50 rounded-lg p-3 border border-zinc-700/30 hover:border-zinc-600/50 transition-all duration-200">
                                                            <div className="flex items-center gap-4">
                                                                {/* Información del servicio - Solo nombre y cantidad */}
                                                                <div className="flex-1 min-w-0">
                                                                    <h6 className="text-zinc-100 font-medium text-sm leading-tight">
                                                                        {servicio.nombre}
                                                                    </h6>
                                                                    <div className="text-xs text-zinc-400 mt-1">
                                                                        Cantidad: {servicio.cantidad}
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
