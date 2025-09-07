'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/app/components/ui/button'
import { ArrowLeft, Check, X, Package, CreditCard, MessageCircle, Filter, Eye, EyeOff, Info, HelpCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import SolicitudPaqueteModal from '@/app/components/modals/SolicitudPaqueteModal'
import ModalAyudaComparador from '@/app/components/modals/ModalAyudaComparador'
import AyudaEleccionCotizaciones from '@/app/components/shared/AyudaEleccionCotizaciones'

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

interface ComparadorPaquetesProps {
    eventoId: string
}

export default function ComparadorPaquetes({ eventoId }: ComparadorPaquetesProps) {
    const router = useRouter()

    const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]) // Cambio: array en lugar de una sola
    const [eventoData, setEventoData] = useState<any>(null) // Datos del evento
    const [paquetes, setPaquetes] = useState<Paquete[]>([])
    const [serviciosCotizaciones, setServiciosCotizaciones] = useState<{ [key: string]: ServiciosAgrupados }>({}) // Cambio: objeto con servicios de todas las cotizaciones
    const [serviciosPaquetes, setServiciosPaquetes] = useState<{ [key: string]: ServiciosAgrupados }>({})
    const [loading, setLoading] = useState(true)
    const [eventoTipoId, setEventoTipoId] = useState<string | null>(null)

    // Estados para el filtro de columnas
    const [columnasVisibles, setColumnasVisibles] = useState<{ [key: string]: boolean }>({})
    const [mostrarFiltros, setMostrarFiltros] = useState(false)

    // Estados para el modal de confirmación
    const [mostrarModal, setMostrarModal] = useState(false)
    const [paqueteSeleccionado, setPaqueteSeleccionado] = useState<Paquete | null>(null)

    // Estado para el modal de ayuda
    const [mostrarAyuda, setMostrarAyuda] = useState(false)

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

    // Obtener todas las secciones únicas para la comparación (VERSIÓN ACTUALIZADA)
    const obtenerTodasSecciones = () => {
        const todasSecciones = new Map<string, { posicion: number, categorias: Map<string, { posicion: number, servicios: Set<string> }> }>()

        // Agregar secciones de las cotizaciones
        Object.values(serviciosCotizaciones).forEach(cotizacionServicios => {
            Object.entries(cotizacionServicios).forEach(([seccionNombre, seccionData]) => {
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

                    categoriaData.servicios.forEach((servicio: any) => {
                        categoria.servicios.add(`${servicio.id}|${servicio.nombre}`)
                    })
                })
            })
        })

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

                    categoriaData.servicios.forEach((servicio: any) => {
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

    const handleSolicitarPaquete = (paqueteId: string) => {
        const paquete = paquetes.find(p => p.id === paqueteId)
        if (paquete) {
            setPaqueteSeleccionado(paquete)
            setMostrarModal(true)
        }
    }

    // Funciones para manejo de filtros de columnas
    const toggleColumnaVisible = (columnaId: string) => {
        setColumnasVisibles(prev => ({
            ...prev,
            [columnaId]: !prev[columnaId]
        }))
    }

    const formatearPrecio = (precio: number): string => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(precio)
    }

    useEffect(() => {
        if (!eventoId) return

        const cargarDatos = async () => {
            try {
                // Cargar datos del evento con todas sus cotizaciones
                const eventoResponse = await fetch(`/api/comparador/evento/${eventoId}`)
                if (!eventoResponse.ok) throw new Error('Error al cargar datos del evento')

                const eventoDataResponse = await eventoResponse.json()
                setEventoData(eventoDataResponse)

                // Establecer todas las cotizaciones
                const todasLasCotizaciones = eventoDataResponse.cotizaciones || []
                setCotizaciones(todasLasCotizaciones)

                // Agrupar servicios de todas las cotizaciones
                const serviciosCotizacionesMap: { [key: string]: ServiciosAgrupados } = {}
                todasLasCotizaciones.forEach((cotizacion: Cotizacion) => {
                    serviciosCotizacionesMap[cotizacion.id] = agruparServicios(cotizacion.servicios)
                })
                setServiciosCotizaciones(serviciosCotizacionesMap)

                const eventoTipo = eventoDataResponse.eventoTipoId
                setEventoTipoId(eventoTipo)

                if (eventoTipo) {
                    // Cargar paquetes para el tipo de evento
                    const paquetesResponse = await fetch(`/api/paquetes/para-cliente?eventoTipoId=${eventoTipo}`)
                    if (!paquetesResponse.ok) throw new Error('Error al cargar paquetes')

                    const paquetesData = await paquetesResponse.json()
                    setPaquetes(paquetesData)

                    // Inicializar columnas visibles DESPUÉS de establecer las cotizaciones
                    const columnasIniciales: { [key: string]: boolean } = {}

                    // Mostrar todas las cotizaciones
                    todasLasCotizaciones.forEach((cotizacion: Cotizacion) => {
                        columnasIniciales[`cotizacion-${cotizacion.id}`] = true
                    })

                    paquetesData.forEach((paquete: any) => {
                        columnasIniciales[paquete.id] = true // Todas visibles por defecto
                    })

                    setColumnasVisibles(columnasIniciales)

                    // Agrupar servicios de cada paquete
                    const serviciosPaquetesMap: { [key: string]: ServiciosAgrupados } = {}
                    paquetesData.forEach((paquete: any) => {
                        serviciosPaquetesMap[paquete.id] = agruparServicios(paquete.PaqueteServicio || [])
                    })
                    setServiciosPaquetes(serviciosPaquetesMap)
                }
            } catch (error) {
                console.error('Error al cargar datos:', error)
                toast.error('Error al cargar los datos del evento')
            } finally {
                setLoading(false)
            }
        }

        cargarDatos()
    }, [eventoId])

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

    if (!cotizaciones.length && (!eventoData || !paquetes || paquetes.length === 0)) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-white text-xl">Error al cargar los datos del evento</p>
                    <p className="text-gray-400 mt-2">No se encontraron datos para mostrar</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    {cotizaciones.length > 0 ? (
                        <Link
                            href={`/evento/${cotizaciones[0].evento.id}`}
                            className="text-zinc-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                    ) : (
                        <Link
                            href={`/evento/${eventoData?.id || eventoId}`}
                            className="text-zinc-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            {cotizaciones.length > 0 ? 'Comparar Paquetes y Cotizaciones' : 'Paquetes Disponibles'}
                        </h1>
                        <p className="text-zinc-400">
                            {cotizaciones.length > 0
                                ? `${cotizaciones.length} cotizaciones • ${cotizaciones[0].evento.nombre}`
                                : `${eventoData?.nombre || 'Evento'} • ${eventoData?.eventoTipo?.nombre || 'Sin tipo'}`
                            }
                        </p>
                    </div>
                </div>

                {/* Header con precios */}
                {/* <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 mb-6">
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
                </div> */}

                {/* Instrucciones de uso */}
                <div className="bg-blue-900/30 border border-blue-600/50 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-blue-100 text-sm">
                                <span className="font-medium">💡 Consejo:</span> Usa los filtros de abajo para ocultar/mostrar cotizaciones y paquetes que desees comparar.{' '}
                                <span className="hidden sm:inline">En dispositivos móviles, desliza horizontalmente para ver todas las columnas.</span>
                            </p>
                        </div>
                        <button
                            onClick={() => setMostrarAyuda(true)}
                            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs font-medium px-2 py-1 rounded border border-blue-500/30 hover:border-blue-400/50 transition-colors"
                        >
                            <HelpCircle className="w-3 h-3" />
                            Guía completa
                        </button>
                    </div>
                </div>

                {/* Filtros de columnas */}
                <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-zinc-400" />
                            <h3 className="text-lg font-semibold text-white">Filtrar</h3>
                        </div>
                        <button
                            onClick={() => setMostrarFiltros(!mostrarFiltros)}
                            className="flex items-center gap-2 px-3 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors text-white text-sm"
                        >
                            {mostrarFiltros ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            {mostrarFiltros ? 'Ocultar' : 'Mostrar'}
                        </button>
                    </div>

                    {mostrarFiltros && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {/* Toggles para cotizaciones - Solo si existen */}
                            {cotizaciones.map(cotizacion => (
                                <div key={cotizacion.id} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id={`cotizacion-${cotizacion.id}`}
                                        checked={columnasVisibles[`cotizacion-${cotizacion.id}`] || false}
                                        onChange={() => toggleColumnaVisible(`cotizacion-${cotizacion.id}`)}
                                        className="w-4 h-4 text-green-600 bg-zinc-700 border-zinc-600 rounded focus:ring-green-500"
                                    />
                                    <label htmlFor={`cotizacion-${cotizacion.id}`} className="text-sm text-green-400 font-medium truncate">
                                        {cotizacion.nombre}
                                    </label>
                                </div>
                            ))}

                            {/* Toggles para paquetes */}
                            {paquetes.map(paquete => (
                                <div key={paquete.id} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id={`paquete-${paquete.id}`}
                                        checked={columnasVisibles[paquete.id] || false}
                                        onChange={() => toggleColumnaVisible(paquete.id)}
                                        className="w-4 h-4 text-blue-600 bg-zinc-700 border-zinc-600 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor={`paquete-${paquete.id}`} className="text-sm text-blue-400 font-medium truncate">
                                        {paquete.nombre}
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Tabla de comparación anidada */}
                <div className="bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700">
                    {/* Indicador de scroll horizontal - solo en móvil */}
                    <div className="block sm:hidden bg-gradient-to-r from-purple-600/80 to-pink-600/80 text-white text-xs text-center py-2 px-4">
                        ← Desliza para ver más columnas →
                    </div>
                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-zinc-800">
                        <table className="w-full">
                            {/* Header de la tabla */}
                            <thead className="bg-zinc-700">
                                <tr>
                                    <th className="text-left p-4 text-white font-semibold min-w-[300px]">
                                        Servicios
                                    </th>
                                    {cotizaciones.map(cotizacion =>
                                        columnasVisibles[`cotizacion-${cotizacion.id}`] && (
                                            <th key={cotizacion.id} className="text-center p-3 text-white font-semibold min-w-[140px]">
                                                <div className="text-green-400 font-bold">{cotizacion.nombre}</div>
                                                <div className="text-green-300 text-sm font-normal">
                                                    {formatearPrecio(cotizacion.precio || 0)}
                                                </div>
                                            </th>
                                        )
                                    )}
                                    {paquetes.filter(paquete => columnasVisibles[paquete.id]).map(paquete => (
                                        <th key={paquete.id} className="text-center p-3 text-white font-semibold min-w-[140px]">
                                            <div className="text-blue-400 font-bold">{paquete.nombre}</div>
                                            <div className="text-blue-300 text-sm font-normal">
                                                {formatearPrecio(paquete.precio || 0)}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from(todasSecciones.entries())
                                    .map(([seccionNombre, seccionData]) => (
                                        <React.Fragment key={seccionNombre}>
                                            {/* Header de Sección */}
                                            <tr className="bg-gradient-to-r from-purple-600 to-purple-700">
                                                <td colSpan={1 + cotizaciones.filter(c => columnasVisibles[`cotizacion-${c.id}`]).length + paquetes.filter(p => columnasVisibles[p.id]).length} className="p-3">
                                                    <h3 className="text-white font-bold text-base">
                                                        📋 {seccionNombre}
                                                    </h3>
                                                </td>
                                            </tr>

                                            {Array.from(seccionData.categorias.entries())
                                                .map(([categoriaNombre, categoriaData]) => (
                                                    <React.Fragment key={categoriaNombre}>
                                                        {/* Header de Categoría */}
                                                        <tr className="bg-zinc-700/70">
                                                            <td colSpan={1 + cotizaciones.filter(c => columnasVisibles[`cotizacion-${c.id}`]).length + paquetes.filter(p => columnasVisibles[p.id]).length} className="p-3">
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

                                                                        {/* Comparación - Todas las Cotizaciones */}
                                                                        {cotizaciones.map(cotizacion =>
                                                                            columnasVisibles[`cotizacion-${cotizacion.id}`] && (
                                                                                <td key={cotizacion.id} className="p-3 text-center">
                                                                                    {servicioEstaIncluido(servicioId, serviciosCotizaciones[cotizacion.id] || {}) ? (
                                                                                        <Check className="w-5 h-5 text-green-400 mx-auto" />
                                                                                    ) : (
                                                                                        <X className="w-5 h-5 text-red-400 mx-auto" />
                                                                                    )}
                                                                                </td>
                                                                            )
                                                                        )}

                                                                        {/* Comparación - Paquetes */}
                                                                        {paquetes.filter(paquete => columnasVisibles[paquete.id]).map(paquete => (
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
                                        <div className="text-white font-medium">
                                            Acciones
                                        </div>
                                    </td>
                                    {cotizaciones.map(cotizacion =>
                                        columnasVisibles[`cotizacion-${cotizacion.id}`] && (
                                            <td key={cotizacion.id} className="p-3 text-center">
                                                <Link
                                                    href={`/evento/${cotizacion.evento.id}/cotizacion/${cotizacion.id}`}
                                                    className="inline-flex items-center gap-1 bg-green-600/80 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                                                >
                                                    <CreditCard className="w-3.5 h-3.5" />
                                                    Reservar
                                                </Link>
                                            </td>
                                        )
                                    )}
                                    {paquetes.filter(paquete => columnasVisibles[paquete.id]).map(paquete => (
                                        <td key={paquete.id} className="p-3 text-center">
                                            <button
                                                onClick={() => handleSolicitarPaquete(paquete.id)}
                                                className="inline-flex items-center gap-1 bg-purple-600/80 hover:bg-purple-600 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                                            >
                                                <MessageCircle className="w-3.5 h-3.5" />
                                                Solicitar
                                            </button>
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sección de ayuda para elegir */}
                <AyudaEleccionCotizaciones
                    mostrar={true}
                    titulo="¿Necesitas ayuda para elegir?"
                    descripcion="Contáctanos para que te ayudemos a generar una cotización personalizada"
                    telefonoWhatsApp={eventoData?.negocio?.telefono || "5544546582"}
                    telefonoLlamada={eventoData?.negocio?.telefono || "5544546582"}
                    mensajeWhatsApp="Hola, necesito ayuda para generar una cotización personalizada"
                />

                {/* Botón de regresar en footer */}
                <div className="mt-8 lg:mt-10 text-center">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center justify-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white font-medium py-3 px-6 rounded-lg transition-colors text-sm lg:text-base"
                    >
                        <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
                        Regresar
                    </button>
                </div>

                {/* Modal de solicitud de paquete */}
                {mostrarModal && paqueteSeleccionado && (
                    <SolicitudPaqueteModal
                        paquete={{
                            id: paqueteSeleccionado.id,
                            nombre: paqueteSeleccionado.nombre,
                            precio: paqueteSeleccionado.precio || 0,
                            eventoTipo: paqueteSeleccionado.eventoTipo
                        }}
                        eventoId={eventoId || ''}
                        cliente={{
                            nombre: cotizaciones[0]?.cliente?.nombre || eventoData?.cliente?.nombre,
                            email: cotizaciones[0]?.cliente?.email || eventoData?.cliente?.email,
                            telefono: cotizaciones[0]?.cliente?.telefono || eventoData?.cliente?.telefono
                        }}
                        onClose={() => {
                            setMostrarModal(false)
                            setPaqueteSeleccionado(null)
                        }}
                        onSuccess={() => {
                            setMostrarModal(false)
                            setPaqueteSeleccionado(null)
                        }}
                    />
                )}

                {/* Modal de ayuda del comparador */}
                <ModalAyudaComparador
                    isOpen={mostrarAyuda}
                    onClose={() => setMostrarAyuda(false)}
                />
            </div>
        </div>
    )
}