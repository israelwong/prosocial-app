'use client'
import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/app/components/ui/button'
import { ArrowLeft, Check, X, Package, CreditCard, MessageCircle, Filter, Eye, EyeOff } from 'lucide-react'
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
    const eventoId = searchParams?.get('eventoId')

    const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null)
    const [eventoData, setEventoData] = useState<any>(null) // Datos del evento
    const [paquetes, setPaquetes] = useState<Paquete[]>([])
    const [serviciosCotizacion, setServiciosCotizacion] = useState<ServiciosAgrupados>({})
    const [serviciosPaquetes, setServiciosPaquetes] = useState<{ [key: string]: ServiciosAgrupados }>({})
    const [loading, setLoading] = useState(true)
    const [eventoTipoId, setEventoTipoId] = useState<string | null>(null)

    // Estados para el filtro de columnas
    const [columnasVisibles, setColumnasVisibles] = useState<{ [key: string]: boolean }>({})
    const [mostrarFiltros, setMostrarFiltros] = useState(false)

    // Estados para el modal de confirmación
    const [mostrarModal, setMostrarModal] = useState(false)
    const [paqueteSeleccionado, setPaqueteSeleccionado] = useState<Paquete | null>(null)
    const [enviandoSolicitud, setEnviandoSolicitud] = useState(false)
    const [mostrarExito, setMostrarExito] = useState(false)

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

    const handleSolicitarPaquete = (paqueteId: string) => {
        const paquete = paquetes.find(p => p.id === paqueteId)
        if (paquete) {
            setPaqueteSeleccionado(paquete)
            setMostrarModal(true)
        }
    }

    const confirmarSolicitudPaquete = async () => {
        if (!paqueteSeleccionado) return

        setEnviandoSolicitud(true)
        try {
            const response = await fetch('/api/cliente-portal/solicitudes-paquete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paqueteId: paqueteSeleccionado.id,
                    eventoId,
                    clienteId: cotizacion?.cliente?.email || eventoData?.cliente?.email
                })
            })
            // console.log({ response })

            if (response.ok) {
                setMostrarModal(false)
                setMostrarExito(true)
                // No limpiar paqueteSeleccionado aún, lo necesitamos para el modal de éxito
            } else {
                toast.error('Error al enviar la solicitud')
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Error al enviar la solicitud')
        } finally {
            setEnviandoSolicitud(false)
        }
    }

    const cancelarSolicitud = () => {
        setMostrarModal(false)
        setPaqueteSeleccionado(null)
    }

    const cerrarModalExito = () => {
        setMostrarExito(false)
        setPaqueteSeleccionado(null)
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

                // Si hay cotizaciones, usar la primera como principal
                const cotizacionPrincipal = eventoDataResponse.cotizaciones?.[0]
                if (cotizacionPrincipal) {
                    setCotizacion(cotizacionPrincipal)
                    const serviciosAgrupadosCotizacion = agruparServicios(cotizacionPrincipal.servicios)
                    setServiciosCotizacion(serviciosAgrupadosCotizacion)
                }

                const eventoTipo = eventoDataResponse.eventoTipoId
                setEventoTipoId(eventoTipo)

                if (eventoTipo) {
                    // Cargar paquetes para el tipo de evento
                    const paquetesResponse = await fetch(`/api/paquetes/para-cliente?eventoTipoId=${eventoTipo}`)
                    if (!paquetesResponse.ok) throw new Error('Error al cargar paquetes')

                    const paquetesData = await paquetesResponse.json()
                    setPaquetes(paquetesData)

                    // Inicializar columnas visibles DESPUÉS de establecer la cotización
                    const columnasIniciales: { [key: string]: boolean } = {}
                    
                    // Solo mostrar cotización si existe
                    if (cotizacionPrincipal) {
                        columnasIniciales.cotizacion = true
                    }

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

    if (!cotizacion && (!eventoData || !paquetes || paquetes.length === 0)) {
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
                    {cotizacion ? (
                        <Link
                            href={`/evento/${cotizacion.evento.id}/cotizacion/${cotizacion.id}`}
                            className="text-zinc-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                    ) : (
                        <Link
                            href={`/evento/${eventoData?.id || '#'}`}
                            className="text-zinc-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            {cotizacion ? 'Comparar Paquetes' : 'Paquetes Disponibles'}
                        </h1>
                        <p className="text-zinc-400">
                            {cotizacion
                                ? `${cotizacion.nombre} • ${cotizacion.evento.nombre}`
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
                            {/* Toggle para cotización - Solo si existe */}
                            {cotizacion && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="cotizacion-toggle"
                                        checked={columnasVisibles.cotizacion || false}
                                        onChange={() => toggleColumnaVisible('cotizacion')}
                                        className="w-4 h-4 text-green-600 bg-zinc-700 border-zinc-600 rounded focus:ring-green-500"
                                    />
                                    <label htmlFor="cotizacion-toggle" className="text-sm text-green-400 font-medium">
                                        Tu Cotización
                                    </label>
                                </div>
                            )}

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
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            {/* Header de la tabla */}
                            <thead className="bg-zinc-700">
                                <tr>
                                    <th className="text-left p-4 text-white font-semibold min-w-[300px]">
                                        Servicios
                                    </th>
                                    {cotizacion && columnasVisibles.cotizacion && (
                                        <th className="text-center p-3 text-white font-semibold min-w-[140px]">
                                            <div className="text-green-400 font-bold">Tu Cotización</div>
                                            <div className="text-green-300 text-sm font-normal">
                                                {formatearPrecio(cotizacion.precio || 0)}
                                            </div>
                                        </th>
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
                                                <td colSpan={1 + (cotizacion ? 1 : 0) + paquetes.length} className="p-3">
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
                                                            <td colSpan={1 + (cotizacion && columnasVisibles.cotizacion ? 1 : 0) + paquetes.filter(p => columnasVisibles[p.id]).length} className="p-3">
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
                                                                        {cotizacion && columnasVisibles.cotizacion && (
                                                                            <td className="p-3 text-center">
                                                                                {servicioEstaIncluido(servicioId, serviciosCotizacion) ? (
                                                                                    <Check className="w-5 h-5 text-green-400 mx-auto" />
                                                                                ) : (
                                                                                    <X className="w-5 h-5 text-red-400 mx-auto" />
                                                                                )}
                                                                            </td>
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
                                    {cotizacion && columnasVisibles.cotizacion && (
                                        <td className="p-3 text-center">
                                            <Link
                                                href={`/evento/${cotizacion.evento.id}/cotizacion/${cotizacion.id}`}
                                                className="inline-flex items-center gap-1 bg-green-600/80 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                                            >
                                                <CreditCard className="w-3.5 h-3.5" />
                                                Pagar
                                            </Link>
                                        </td>
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

                {/* Modal de confirmación */}
                {mostrarModal && paqueteSeleccionado && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-zinc-900 rounded-xl border border-zinc-700 shadow-2xl max-w-md w-full mx-4">
                            {/* Header del modal */}
                            <div className="p-6 border-b border-zinc-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center">
                                        <MessageCircle className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">
                                            Solicitar Paquete
                                        </h3>
                                        <p className="text-sm text-zinc-400">
                                            Confirma tu solicitud al asesor
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Contenido del modal */}
                            <div className="p-6">
                                <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 mb-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold text-blue-400">
                                            {paqueteSeleccionado.nombre}
                                        </h4>
                                        <span className="text-xl font-bold text-white">
                                            {formatearPrecio(paqueteSeleccionado.precio || 0)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-zinc-400">
                                        Tipo de evento: {paqueteSeleccionado.eventoTipo}
                                    </p>
                                </div>

                                <div className="bg-zinc-800/50 rounded-lg p-4 mb-6">
                                    <p className="text-sm text-zinc-300 leading-relaxed">
                                        ¿Deseas solicitar información adicional sobre este paquete?
                                        Un asesor se pondrá en contacto contigo para brindarte más detalles
                                        y resolver cualquier duda que puedas tener.
                                    </p>
                                </div>

                                {/* Información del cliente */}
                                <div className="bg-green-900/20 rounded-lg p-4 mb-6 border border-green-700/30">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Check className="w-4 h-4 text-green-400" />
                                        <span className="text-sm font-medium text-green-400">
                                            Tu información de contacto
                                        </span>
                                    </div>
                                    <div className="text-sm text-zinc-300 space-y-1">
                                        <p>{cotizacion?.cliente?.nombre}</p>
                                        <p>{cotizacion?.cliente?.email}</p>
                                        {cotizacion?.cliente?.telefono && (
                                            <p>{cotizacion.cliente.telefono}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer del modal */}
                            <div className="p-6 border-t border-zinc-700 flex gap-3">
                                <button
                                    onClick={cancelarSolicitud}
                                    disabled={enviandoSolicitud}
                                    className="flex-1 px-4 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmarSolicitudPaquete}
                                    disabled={enviandoSolicitud}
                                    className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {enviandoSolicitud ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <MessageCircle className="w-4 h-4" />
                                            Enviar Solicitud
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de éxito */}
                {mostrarExito && paqueteSeleccionado && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-zinc-900 rounded-xl border border-zinc-700 shadow-2xl max-w-md w-full mx-4">
                            {/* Header del modal */}
                            <div className="p-6 border-b border-zinc-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-600/20 rounded-full flex items-center justify-center">
                                        <Check className="w-5 h-5 text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">
                                            ¡Solicitud Enviada!
                                        </h3>
                                        <p className="text-sm text-zinc-400">
                                            Tu solicitud ha sido procesada exitosamente
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Contenido del modal */}
                            <div className="p-6">
                                <div className="bg-green-900/20 rounded-lg p-4 border border-green-700/30 mb-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Check className="w-5 h-5 text-green-400" />
                                        <span className="font-medium text-green-400">
                                            Solicitud enviada exitosamente
                                        </span>
                                    </div>
                                    <p className="text-sm text-zinc-300 leading-relaxed">
                                        Tu solicitud para el paquete <strong className="text-blue-400">{paqueteSeleccionado.nombre}</strong> ha
                                        sido enviada correctamente. Pronto deberías verla en tus opciones de paquetes
                                        para poder reservarla.
                                    </p>
                                </div>

                                <div className="bg-zinc-800/50 rounded-lg p-4 mb-6">
                                    <h4 className="font-medium text-white mb-3">¿Qué sigue?</h4>
                                    <div className="space-y-2 text-sm text-zinc-300">
                                        <div className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                                            <p>Un asesor revisará tu solicitud</p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                                            <p>El paquete aparecerá en tus opciones disponibles</p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                                            <p>Podrás proceder con la reservación cuando esté listo</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/30">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Package className="w-4 h-4 text-blue-400" />
                                        <span className="text-sm font-medium text-blue-400">
                                            Paquete solicitado
                                        </span>
                                    </div>
                                    <div className="text-sm text-zinc-300">
                                        <p className="font-medium">{paqueteSeleccionado.nombre}</p>
                                        <p className="text-zinc-400">{formatearPrecio(paqueteSeleccionado.precio || 0)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer del modal */}
                            <div className="p-6 border-t border-zinc-700">
                                <button
                                    onClick={cerrarModalExito}
                                    className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <Check className="w-4 h-4" />
                                    Entendido
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}