'use client'
import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/app/components/ui/button'
import { ArrowLeft, Check, X, Package, CreditCard, MessageCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

// Tipos
interface ServicioDetalle {
    id: string
    nombre: string
    cantidad: number
}

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

interface Cotizacion {
    id: string
    nombre: string
    precio: number
    servicios: any[]
    cliente: {
        nombre: string
        email: string
        telefono?: string
    }
    evento: {
        id: string
        nombre: string
        eventoTipo: {
            id: string
            nombre: string
        }
    }
}

interface Paquete {
    id: string
    nombre: string
    precio: number
    eventoTipoId: string
    eventoTipo: string
    PaqueteServicio: any[]
}

type TodasSecciones = Map<string, { posicion: number, categorias: Map<string, { posicion: number, servicios: Set<string> }> }>

export default function ComparadorPaquetes() {
    const searchParams = useSearchParams()
    const cotizacionId = searchParams?.get('cotizacionId')

    const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null)
    const [paquetes, setPaquetes] = useState<Paquete[]>([])
    const [serviciosCotizacion, setServiciosCotizacion] = useState<ServiciosAgrupados>({})
    const [serviciosPaquetes, setServiciosPaquetes] = useState<{ [key: string]: ServiciosAgrupados }>({})
    const [loading, setLoading] = useState(true)
    const [eventoTipoId, setEventoTipoId] = useState<string | null>(null)

    // Función para agrupar servicios (VERSIÓN ORIGINAL)
    const agruparServicios = (servicios: any[]): ServiciosAgrupados => {
        const agrupados: ServiciosAgrupados = {}

        if (!servicios || !Array.isArray(servicios)) return agrupados

        servicios.forEach((servicio) => {
            const seccionNombre = servicio.Servicio?.ServicioCategoria?.seccionCategoria?.Seccion?.nombre || 'Sin sección'
            const categoriaNombre = servicio.Servicio?.ServicioCategoria?.nombre || 'Sin categoría'

            if (!agrupados[seccionNombre]) {
                agrupados[seccionNombre] = {
                    posicion: servicio.Servicio?.ServicioCategoria?.seccionCategoria?.Seccion?.posicion || 0,
                    categorias: {}
                }
            }

            if (!agrupados[seccionNombre].categorias[categoriaNombre]) {
                agrupados[seccionNombre].categorias[categoriaNombre] = {
                    posicion: servicio.Servicio?.ServicioCategoria?.posicion || 0,
                    servicios: []
                }
            }

            agrupados[seccionNombre].categorias[categoriaNombre].servicios.push({
                id: servicio.Servicio?.id || servicio.id,
                nombre: servicio.Servicio?.nombre || servicio.nombre,
                cantidad: servicio.cantidad || 1
            })
        })

        return agrupados
    }

    // Obtener todas las secciones únicas para la comparación (VERSIÓN ORIGINAL)
    const obtenerTodasSecciones = () => {
        const todasSecciones = new Map<string, { posicion: number, categorias: Map<string, { posicion: number, servicios: Set<string> }> }>()

        // Agregar secciones de la cotización
        if (serviciosCotizacion) {
            Object.entries(serviciosCotizacion).forEach(([seccionNombre, seccionData]) => {
                if (!todasSecciones.has(seccionNombre)) {
                    todasSecciones.set(seccionNombre, {
                        posicion: seccionData.posicion,
                        categorias: new Map()
                    })
                }
                const seccion = todasSecciones.get(seccionNombre)!

                Object.entries(seccionData.categorias).forEach(([categoriaNombre, categoriaData]) => {
                    if (!seccion.categorias.has(categoriaNombre)) {
                        seccion.categorias.set(categoriaNombre, {
                            posicion: categoriaData.posicion,
                            servicios: new Set()
                        })
                    }
                    const categoria = seccion.categorias.get(categoriaNombre)!

                    categoriaData.servicios.forEach(servicio => {
                        categoria.servicios.add(`${servicio.id}|${servicio.nombre}`)
                    })
                })
            })
        }

        // Agregar secciones de los paquetes
        Object.values(serviciosPaquetes).forEach(paqueteServicios => {
            Object.entries(paqueteServicios).forEach(([seccionNombre, seccionData]) => {
                if (!todasSecciones.has(seccionNombre)) {
                    todasSecciones.set(seccionNombre, {
                        posicion: seccionData.posicion,
                        categorias: new Map()
                    })
                }
                const seccion = todasSecciones.get(seccionNombre)!

                Object.entries(seccionData.categorias).forEach(([categoriaNombre, categoriaData]) => {
                    if (!seccion.categorias.has(categoriaNombre)) {
                        seccion.categorias.set(categoriaNombre, {
                            posicion: categoriaData.posicion,
                            servicios: new Set()
                        })
                    }
                    const categoria = seccion.categorias.get(categoriaNombre)!

                    categoriaData.servicios.forEach(servicio => {
                        categoria.servicios.add(`${servicio.id}|${servicio.nombre}`)
                    })
                })
            })
        })



        return todasSecciones
    }

    const servicioEstaIncluido = (servicioId: string, serviciosAgrupados: ServiciosAgrupados): boolean => {
        for (const seccion of Object.values(serviciosAgrupados)) {
            for (const categoria of Object.values(seccion.categorias)) {
                if (categoria.servicios.some(s => s.id === servicioId)) {
                    return true
                }
            }
        }
        return false
    }

    const handleSolicitarPaquete = async (paqueteId: string) => {
        try {
            const response = await fetch('/api/cliente-portal/solicitudes-paquete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paqueteId,
                    cotizacionId,
                    clienteId: cotizacion?.cliente?.email
                })
            })
            console.log({ response })

            if (response.ok) {
                toast.success('Solicitud de paquete enviada correctamente')
            } else {
                toast.error('Error al enviar la solicitud')
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Error al enviar la solicitud')
        }
    }

    useEffect(() => {
        if (!cotizacionId) return

        const cargarDatos = async () => {
            try {
                // Cargar cotización
                const cotizacionResponse = await fetch(`/api/cotizaciones/${cotizacionId}`)
                if (!cotizacionResponse.ok) throw new Error('Error al cargar cotización')

                const cotizacionData = await cotizacionResponse.json()
                setCotizacion(cotizacionData)

                const serviciosAgrupadosCotizacion = agruparServicios(cotizacionData.servicios)
                setServiciosCotizacion(serviciosAgrupadosCotizacion)

                const eventoTipo = cotizacionData.evento?.eventoTipoId
                setEventoTipoId(eventoTipo)

                if (eventoTipo) {
                    // Cargar paquetes para el tipo de evento
                    const paquetesResponse = await fetch(`/api/paquetes/para-cliente?eventoTipoId=${eventoTipo}`)
                    if (!paquetesResponse.ok) throw new Error('Error al cargar paquetes')

                    const paquetesData = await paquetesResponse.json()
                    setPaquetes(paquetesData)

                    // Agrupar servicios de cada paquete
                    const serviciosPaquetesMap: { [key: string]: ServiciosAgrupados } = {}
                    paquetesData.forEach((paquete: any) => {
                        serviciosPaquetesMap[paquete.id] = agruparServicios(paquete.PaqueteServicio || [])
                    })
                    setServiciosPaquetes(serviciosPaquetesMap)
                } else {
                    console.warn('⚠️ No se encontró eventoTipoId en la cotización')
                    toast.error('No se pudo determinar el tipo de evento para cargar paquetes')
                }

            } catch (error) {
                console.error('Error al cargar datos:', error)
                toast.error('Error al cargar los datos de comparación')
            } finally {
                setLoading(false)
            }
        }

        cargarDatos()
    }, [cotizacionId])

    const todasSecciones = obtenerTodasSecciones()

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <Package className="w-16 h-16 text-purple-500 animate-pulse mx-auto mb-4" />
                    <p className="text-white text-xl">Cargando comparación...</p>
                </div>
            </div>
        )
    }

    if (!cotizacion) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-white text-xl">Error al cargar la cotización</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link
                        href={`/evento/${cotizacion.evento.id}/cotizacion/${cotizacionId}`}
                        className="text-zinc-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            Comparar Paquetes
                        </h1>
                        <p className="text-zinc-400">
                            {cotizacion.nombre} • {cotizacion.evento.nombre}
                        </p>
                    </div>
                </div>

                {/* Header con precios */}
                <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {cotizacion && (
                            <div className="text-center p-4 bg-zinc-700 rounded-lg">
                                <h3 className="font-semibold text-green-400">Tu Cotización</h3>
                                <p className="text-2xl font-bold text-white">
                                    ${(cotizacion.precio || 0).toLocaleString('es-MX')}
                                </p>
                            </div>
                        )}
                        {paquetes.map(paquete => (
                            <div key={paquete.id} className="text-center p-4 bg-zinc-700 rounded-lg">
                                <h3 className="font-semibold text-blue-400">{paquete.nombre}</h3>
                                <p className="text-2xl font-bold text-white">
                                    ${(paquete.precio || 0).toLocaleString('es-MX')}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabla de comparación anidada */}
                <div className="bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            {/* Header de la tabla */}
                            <thead className="bg-zinc-700">
                                <tr>
                                    <th className="text-left p-4 text-white font-semibold min-w-[300px]">
                                        Servicios
                                    </th>
                                    {cotizacion && (
                                        <th className="text-center p-3 text-white font-semibold min-w-[120px]">
                                            <div className="text-green-400">Tu Cotización</div>
                                        </th>
                                    )}
                                    {paquetes.map(paquete => (
                                        <th key={paquete.id} className="text-center p-3 text-white font-semibold min-w-[120px]">
                                            <div className="text-blue-400">{paquete.nombre}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from(todasSecciones.entries())
                                    .sort(([, a], [, b]) => (a.posicion || 0) - (b.posicion || 0))
                                    .map(([seccionNombre, seccionData]) => (
                                        <React.Fragment key={seccionNombre}>
                                            {/* Header de Sección */}
                                            <tr className="bg-gradient-to-r from-purple-600 to-purple-700">
                                                <td colSpan={1 + (cotizacion ? 1 : 0) + paquetes.length} className="p-3">
                                                    <h3 className="text-white font-bold text-base">
                                                        📋 {seccionNombre}
                                                    </h3>
                                                </td>
                                            </tr>

                                            {Array.from(seccionData.categorias.entries())
                                                .sort(([, a], [, b]) => (a.posicion || 0) - (b.posicion || 0))
                                                .map(([categoriaNombre, categoriaData]) => (
                                                    <React.Fragment key={categoriaNombre}>
                                                        {/* Header de Categoría */}
                                                        <tr className="bg-zinc-700/70">
                                                            <td colSpan={1 + (cotizacion ? 1 : 0) + paquetes.length} className="p-3">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-1 h-4 bg-blue-500 rounded"></div>
                                                                    <h4 className="text-blue-300 font-semibold text-sm">
                                                                        {categoriaNombre}
                                                                    </h4>
                                                                </div>
                                                            </td>
                                                        </tr>

                                                        {/* Servicios de la categoría - SIN ORDENAMIENTO (como ServiciosAgrupados.tsx) */}
                                                        {Array.from(categoriaData.servicios)
                                                            .map((servicioInfo, index) => {
                                                                const [servicioId, servicioNombre] = servicioInfo.split('|')
                                                                return (
                                                                    <tr key={servicioInfo} className={`${index % 2 === 0 ? 'bg-zinc-800' : 'bg-zinc-850'} hover:bg-zinc-700/30 transition-colors`}>
                                                                        {/* Nombre del servicio */}
                                                                        <td className="p-3 pl-8">
                                                                            <div className="text-zinc-200 font-medium text-sm">
                                                                                {servicioNombre}
                                                                            </div>
                                                                        </td>

                                                                        {/* Comparación - Tu Cotización */}
                                                                        {cotizacion && (
                                                                            <td className="p-3 text-center">
                                                                                {servicioEstaIncluido(servicioId, serviciosCotizacion) ? (
                                                                                    <Check className="w-5 h-5 text-green-400 mx-auto" />
                                                                                ) : (
                                                                                    <X className="w-5 h-5 text-red-400 mx-auto" />
                                                                                )}
                                                                            </td>
                                                                        )}

                                                                        {/* Comparación - Paquetes */}
                                                                        {paquetes.map(paquete => (
                                                                            <td key={paquete.id} className="p-3 text-center">
                                                                                {servicioEstaIncluido(servicioId, serviciosPaquetes[paquete.id] || {}) ? (
                                                                                    <Check className="w-5 h-5 text-green-400 mx-auto" />
                                                                                ) : (
                                                                                    <X className="w-5 h-5 text-red-400 mx-auto" />
                                                                                )}
                                                                            </td>
                                                                        ))}
                                                                    </tr>
                                                                )
                                                            })}
                                                    </React.Fragment>
                                                ))}
                                        </React.Fragment>
                                    ))}

                                {/* Fila de botones de acción */}
                                <tr className="bg-zinc-700 border-t-2 border-zinc-600">
                                    <td className="p-4">
                                        <div className="text-white font-semibold text-lg">
                                            🎯 Acciones
                                        </div>
                                    </td>
                                    {cotizacion && (
                                        <td className="p-3 text-center">
                                            <Link
                                                href={`/evento/${cotizacion.evento.id}/cotizacion/${cotizacionId}`}
                                                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                            >
                                                <CreditCard className="w-4 h-4" />
                                                Continuar Reservación
                                            </Link>
                                        </td>
                                    )}
                                    {paquetes.map(paquete => (
                                        <td key={paquete.id} className="p-3 text-center">
                                            <Button
                                                onClick={() => handleSolicitarPaquete(paquete.id)}
                                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                                Solicitar Paquete
                                            </Button>
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}