'use client'

import React, { useState, useEffect } from 'react'
import { Trash2, Plus, Minus, TrendingUp, Eye, EyeOff, ChevronDown, ChevronRight } from 'lucide-react'
import type { ServicioCongelado } from '@/app/admin/_lib/cotizacion.congelada.actions'
import { obtenerCatalogoCompleto } from '@/app/admin/_lib/actions/catalogo/catalogo.actions'

interface Props {
    servicios: ServicioCongelado[]
    onServicioChange: (servicio: ServicioCongelado) => void
    onEliminarServicio: (servicioId: string) => void
    mostrarUtilidades?: boolean
}

interface ServicioAgrupado extends ServicioCongelado {
    seccionNombre?: string
    categoriaNombre?: string
}

export default function WishlistNestedCongelada({
    servicios,
    onServicioChange,
    onEliminarServicio,
    mostrarUtilidades = false
}: Props) {
    const [verUtilidades, setVerUtilidades] = useState(false)
    const [serviciosAgrupados, setServiciosAgrupados] = useState<{ [key: string]: { [key: string]: ServicioAgrupado[] } }>({})
    const [seccionesColapsadas, setSeccionesColapsadas] = useState<{ [key: string]: boolean }>({})
    const [categoriasColapsadas, setCategoriasColapsadas] = useState<{ [key: string]: boolean }>({})
    const [catalogoCompleto, setCatalogoCompleto] = useState<any[]>([])

    // Cargar catálogo para obtener información de secciones y categorías
    useEffect(() => {
        async function cargarCatalogo() {
            try {
                const catalogo = await obtenerCatalogoCompleto()
                setCatalogoCompleto(catalogo)
            } catch (error) {
                console.error('Error cargando catálogo:', error)
            }
        }
        cargarCatalogo()
    }, [])

    // Agrupar servicios por sección y categoría
    useEffect(() => {
        if (catalogoCompleto.length === 0) return

        const agrupados: { [key: string]: { [key: string]: ServicioAgrupado[] } } = {}

        servicios.forEach(servicio => {
            // Buscar información del servicio en el catálogo
            let seccionNombre = 'Sin Sección'
            let categoriaNombre = 'Sin Categoría'

            catalogoCompleto.forEach(seccion => {
                seccion.seccionCategorias?.forEach((relacion: any) => {
                    const categoria = relacion.ServicioCategoria
                    const servicioEncontrado = categoria.Servicio?.find((s: any) => s.id === servicio.servicioId)

                    if (servicioEncontrado) {
                        seccionNombre = seccion.nombre
                        categoriaNombre = categoria.nombre
                    }
                })
            })

            const servicioAgrupado: ServicioAgrupado = {
                ...servicio,
                seccionNombre,
                categoriaNombre
            }

            if (!agrupados[seccionNombre]) {
                agrupados[seccionNombre] = {}
            }
            if (!agrupados[seccionNombre][categoriaNombre]) {
                agrupados[seccionNombre][categoriaNombre] = []
            }

            agrupados[seccionNombre][categoriaNombre].push(servicioAgrupado)
        })

        setServiciosAgrupados(agrupados)
    }, [servicios, catalogoCompleto])

    const handleCantidadChange = (servicio: ServicioCongelado, nuevaCantidad: number) => {
        if (nuevaCantidad < 1) return

        const servicioActualizado = {
            ...servicio,
            cantidad: nuevaCantidad,
            subtotal: servicio.precioUnitario * nuevaCantidad
        }

        onServicioChange(servicioActualizado)
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount)
    }

    const calcularMetricas = () => {
        const subtotal = servicios.reduce((sum, s) => sum + s.subtotal, 0)
        const costoTotal = servicios.reduce((sum, s) => sum + (s.costo * s.cantidad), 0)
        const utilidadTotal = subtotal - costoTotal
        const margenPorcentaje = subtotal > 0 ? (utilidadTotal / subtotal) * 100 : 0

        return {
            subtotal,
            costoTotal,
            utilidadTotal,
            margenPorcentaje
        }
    }

    const metricas = calcularMetricas()

    const toggleSeccion = (seccionNombre: string) => {
        setSeccionesColapsadas(prev => ({
            ...prev,
            [seccionNombre]: !prev[seccionNombre]
        }))
    }

    const toggleCategoria = (seccionNombre: string, categoriaNombre: string) => {
        const key = `${seccionNombre}-${categoriaNombre}`
        setCategoriasColapsadas(prev => ({
            ...prev,
            [key]: !prev[key]
        }))
    }

    if (servicios.length === 0) {
        return (
            <div className="text-center py-8 text-zinc-500">
                <p>No hay servicios en la lista</p>
                <p className="text-sm">Agrega servicios desde el catálogo</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header con toggle de utilidades */}
            {mostrarUtilidades && (
                <div className="flex justify-end">
                    <button
                        onClick={() => setVerUtilidades(!verUtilidades)}
                        className="flex items-center gap-2 px-3 py-1 text-xs bg-zinc-700 text-zinc-300 rounded hover:bg-zinc-600"
                    >
                        {verUtilidades ? <EyeOff size={12} /> : <Eye size={12} />}
                        {verUtilidades ? 'Ocultar' : 'Ver'} utilidades
                    </button>
                </div>
            )}

            {/* Servicios agrupados */}
            <div className="space-y-6">
                {Object.entries(serviciosAgrupados).map(([seccionNombre, categorias]) => (
                    <div key={seccionNombre} className="bg-zinc-900 rounded-lg border border-zinc-700">
                        {/* Header de Sección */}
                        <button
                            onClick={() => toggleSeccion(seccionNombre)}
                            className="w-full flex items-center justify-between p-4 hover:bg-zinc-800 rounded-t-lg"
                        >
                            <div className="flex items-center gap-3">
                                {seccionesColapsadas[seccionNombre] ?
                                    <ChevronRight size={16} className="text-zinc-400" /> :
                                    <ChevronDown size={16} className="text-zinc-400" />
                                }
                                <h3 className="font-semibold text-white">{seccionNombre}</h3>
                                <span className="text-xs px-2 py-1 bg-zinc-700 text-zinc-300 rounded">
                                    {Object.values(categorias).flat().length} servicios
                                </span>
                            </div>
                            <div className="text-right">
                                <p className="text-white font-medium">
                                    {formatCurrency(Object.values(categorias).flat().reduce((sum, s) => sum + s.subtotal, 0))}
                                </p>
                            </div>
                        </button>

                        {/* Contenido de la Sección */}
                        {!seccionesColapsadas[seccionNombre] && (
                            <div className="px-4 pb-4 space-y-4">
                                {Object.entries(categorias).map(([categoriaNombre, serviciosCategoria]) => {
                                    const categoriaKey = `${seccionNombre}-${categoriaNombre}`

                                    return (
                                        <div key={categoriaNombre} className="bg-zinc-800 rounded-lg border border-zinc-600">
                                            {/* Header de Categoría */}
                                            <button
                                                onClick={() => toggleCategoria(seccionNombre, categoriaNombre)}
                                                className="w-full flex items-center justify-between p-3 hover:bg-zinc-700 rounded-t-lg"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {categoriasColapsadas[categoriaKey] ?
                                                        <ChevronRight size={14} className="text-zinc-400" /> :
                                                        <ChevronDown size={14} className="text-zinc-400" />
                                                    }
                                                    <h4 className="font-medium text-zinc-200">{categoriaNombre}</h4>
                                                    <span className="text-xs px-2 py-1 bg-zinc-600 text-zinc-300 rounded">
                                                        {serviciosCategoria.length}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-zinc-200 text-sm">
                                                        {formatCurrency(serviciosCategoria.reduce((sum, s) => sum + s.subtotal, 0))}
                                                    </p>
                                                </div>
                                            </button>

                                            {/* Items de la Categoría */}
                                            {!categoriasColapsadas[categoriaKey] && (
                                                <div className="p-3 space-y-2">
                                                    {serviciosCategoria.map(servicio => (
                                                        <div key={servicio.servicioId} className="flex items-center justify-between p-3 bg-zinc-700 rounded border border-zinc-600">
                                                            {/* Info del servicio */}
                                                            <div className="flex-1">
                                                                <h5 className="text-white font-medium">{servicio.nombre}</h5>
                                                                <div className="flex items-center gap-4 mt-1 text-sm text-zinc-400">
                                                                    <span>{formatCurrency(servicio.precioUnitario)} c/u</span>
                                                                    {verUtilidades && (
                                                                        <>
                                                                            <span className="text-orange-400">
                                                                                Costo: {formatCurrency(servicio.costo)}
                                                                            </span>
                                                                            <span className="text-green-400">
                                                                                Utilidad: {formatCurrency(servicio.precioUnitario - servicio.costo)}
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Controles de cantidad */}
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => handleCantidadChange(servicio, servicio.cantidad - 1)}
                                                                        disabled={servicio.cantidad <= 1}
                                                                        className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-50"
                                                                    >
                                                                        <Minus size={14} />
                                                                    </button>

                                                                    <input
                                                                        type="number"
                                                                        value={servicio.cantidad}
                                                                        onChange={(e) => {
                                                                            const valor = parseInt(e.target.value) || 1
                                                                            handleCantidadChange(servicio, valor)
                                                                        }}
                                                                        className="w-16 px-2 py-1 text-center bg-zinc-600 border border-zinc-500 rounded text-white focus:outline-none focus:border-blue-500"
                                                                        min="1"
                                                                    />

                                                                    <button
                                                                        onClick={() => handleCantidadChange(servicio, servicio.cantidad + 1)}
                                                                        className="p-1 rounded text-zinc-400 hover:text-white"
                                                                    >
                                                                        <Plus size={14} />
                                                                    </button>
                                                                </div>

                                                                {/* Subtotal */}
                                                                <div className="text-right min-w-[80px]">
                                                                    <span className="text-white font-medium">
                                                                        {formatCurrency(servicio.subtotal)}
                                                                    </span>
                                                                </div>

                                                                {/* Eliminar */}
                                                                <button
                                                                    onClick={() => onEliminarServicio(servicio.servicioId)}
                                                                    className="p-1 text-red-400 hover:text-red-300 rounded"
                                                                    title="Eliminar servicio"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Resumen final */}
            <div className="bg-zinc-900 rounded-lg border border-zinc-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Resumen Total</h3>

                <div className="space-y-3">
                    <div className="flex justify-between text-zinc-300">
                        <span>Total de servicios:</span>
                        <span>{servicios.reduce((sum, s) => sum + s.cantidad, 0)} unidades</span>
                    </div>

                    <div className="flex justify-between text-zinc-300">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(metricas.subtotal)}</span>
                    </div>

                    {verUtilidades && (
                        <>
                            <div className="flex justify-between text-orange-400">
                                <span>Costo total:</span>
                                <span>{formatCurrency(metricas.costoTotal)}</span>
                            </div>
                            <div className="flex justify-between text-green-400">
                                <span>Utilidad bruta:</span>
                                <span>{formatCurrency(metricas.utilidadTotal)}</span>
                            </div>
                            <div className="flex justify-between text-green-400">
                                <span>Margen:</span>
                                <span>{metricas.margenPorcentaje.toFixed(1)}%</span>
                            </div>
                        </>
                    )}

                    <div className="border-t border-zinc-700 pt-3">
                        <div className="flex justify-between text-white font-semibold text-lg">
                            <span>Total:</span>
                            <span>{formatCurrency(metricas.subtotal)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Nota sobre precios congelados */}
            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3">
                <p className="text-blue-300 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    Los precios están congelados al momento de crear la cotización y no cambiarán aunque se actualice el catálogo.
                </p>
            </div>
        </div>
    )
}
