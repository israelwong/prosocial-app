'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { suscribirCotizacion, desuscribirCotizacion, ESTADOS_COTIZACION } from '@/lib/supabase-realtime'
import { obtenerCotizacionCompleta } from '@/app/admin/_lib/actions/cotizacion/cotizacion.actions'

interface Cotizacion {
    id: string
    nombre: string
    precio: number
    status: string
    createdAt: Date
    expiresAt?: Date
    eventoId: string
}

interface Evento {
    id: string
    nombre: string
    fecha_evento: Date
    status: string
    sede?: string
    direccion?: string
}

interface CotizacionServicio {
    id: string
    cantidad: number
    precioUnitario: number
    subtotal: number
    servicio: {
        id: string
        nombre: string
        ServicioCategoria: {
            id: string
            nombre: string
            Seccion: {
                id: string
                nombre: string
                posicion: number
            }
        }
    }
}

interface ServiciosAgrupados {
    [seccion: string]: {
        posicion: number
        categorias: {
            [categoria: string]: {
                posicion: number
                servicios: CotizacionServicio[]
            }
        }
    }
}

interface Props {
    cotizacion: Cotizacion
    evento: Evento
    esRealtime?: boolean
    esAdmin?: boolean
    esLegacy?: boolean
    estaExpirada?: boolean
    fechaOcupada?: boolean
}

export default function CotizacionDetalle({
    cotizacion: cotizacionInicial,
    evento,
    esRealtime = false,
    esAdmin = false,
    esLegacy = false,
    estaExpirada = false,
    fechaOcupada = false
}: Props) {
    const [cotizacion, setCotizacion] = useState(cotizacionInicial)
    const [serviciosAgrupados, setServiciosAgrupados] = useState<ServiciosAgrupados>({})
    const [costos, setCostos] = useState([])
    const [loading, setLoading] = useState(false)
    const [conectado, setConectado] = useState(false)

    useEffect(() => {
        // Cargar servicios al montar el componente
        cargarServiciosAgrupados()

        if (esRealtime) {
            console.log('Iniciando sesión de tiempo real...')
            setConectado(true)

            const channel = suscribirCotizacion(cotizacion.id, (payload) => {
                console.log('Actualización recibida:', payload)

                if (payload.table === 'Cotizacion') {
                    setCotizacion(payload.new)
                }

                if (payload.table === 'CotizacionServicio') {
                    cargarServiciosAgrupados()
                }

                if (payload.table === 'CotizacionCosto') {
                    cargarCostos()
                }
            })

            return () => {
                console.log('Cerrando sesión de tiempo real...')
                desuscribirCotizacion(channel)
                setConectado(false)
            }
        }
    }, [cotizacion.id, esRealtime])

    const cargarServiciosAgrupados = async () => {
        try {
            setLoading(true)
            console.log('Cargando servicios agrupados para cotización:', cotizacion.id)

            // Obtener la cotización completa con servicios
            const resultado = await obtenerCotizacionCompleta(cotizacion.id)
            const cotizacionCompleta = resultado.cotizacion

            console.log('Cotización completa obtenida:', cotizacionCompleta)
            console.log('Servicios en cotización:', cotizacionCompleta?.Servicio)

            if (!cotizacionCompleta?.Servicio || cotizacionCompleta.Servicio.length === 0) {
                console.log('No hay servicios en la cotización')
                setServiciosAgrupados({})
                return
            }

            // Agrupar servicios por sección y categoría
            const agrupados: ServiciosAgrupados = {}

            cotizacionCompleta.Servicio.forEach((cotizacionServicio: any) => {
                console.log('Procesando cotización servicio:', cotizacionServicio)

                const servicio = cotizacionServicio.Servicio
                const servicioCategoria = cotizacionServicio.ServicioCategoria || servicio?.ServicioCategoria

                console.log('Servicio:', servicio)
                console.log('ServicioCategoria:', servicioCategoria)

                if (!servicio && !servicioCategoria) {
                    console.log('No se encontró servicio ni categoría, saltando...')
                    return
                }

                // Obtener datos de sección y categoría
                const seccionNombre = servicioCategoria?.Seccion?.nombre || 'Sin sección'
                const categoriaNombre = servicioCategoria?.nombre || 'Sin categoría'
                const posicionSeccion = servicioCategoria?.Seccion?.posicion || 999
                const posicionCategoria = 999 // Las categorías no tienen posición en el schema

                console.log(`Sección: ${seccionNombre}, Categoría: ${categoriaNombre}`)

                // Inicializar sección si no existe
                if (!agrupados[seccionNombre]) {
                    agrupados[seccionNombre] = {
                        posicion: posicionSeccion,
                        categorias: {}
                    }
                }

                // Inicializar categoría si no existe
                if (!agrupados[seccionNombre].categorias[categoriaNombre]) {
                    agrupados[seccionNombre].categorias[categoriaNombre] = {
                        posicion: posicionCategoria,
                        servicios: []
                    }
                }

                // Agregar el servicio con la información necesaria
                agrupados[seccionNombre].categorias[categoriaNombre].servicios.push({
                    id: cotizacionServicio.id,
                    cantidad: cotizacionServicio.cantidad,
                    precioUnitario: cotizacionServicio.precioUnitario,
                    subtotal: cotizacionServicio.subtotal,
                    servicio: {
                        id: servicio?.id || cotizacionServicio.servicioId,
                        nombre: servicio?.nombre || cotizacionServicio.nombre_snapshot || 'Servicio sin nombre',
                        ServicioCategoria: servicioCategoria
                    }
                })
            })

            console.log('Servicios agrupados resultado:', agrupados)

            // Ordenar servicios dentro de cada categoría por nombre
            Object.keys(agrupados).forEach(seccionNombre => {
                Object.keys(agrupados[seccionNombre].categorias).forEach(categoriaNombre => {
                    agrupados[seccionNombre].categorias[categoriaNombre].servicios.sort((a, b) =>
                        a.servicio.nombre.localeCompare(b.servicio.nombre)
                    )
                })
            })

            setServiciosAgrupados(agrupados)
        } catch (error) {
            console.error('Error al cargar servicios:', error)
            setServiciosAgrupados({})
        } finally {
            setLoading(false)
        }
    }

    const cargarCostos = async () => {
        console.log('Cargando costos...')
        // Aquí iría la llamada real para obtener costos
    }

    const iniciarPago = () => {
        if (fechaOcupada) {
            alert('Lo sentimos, la fecha ya ha sido ocupada por otro cliente.')
            return
        }

        if (estaExpirada) {
            alert('Esta cotización ha expirado. Por favor contacta al equipo de ventas.')
            return
        }

        // Redirigir a Stripe Checkout
        window.location.href = `/api/checkout/create-session?cotizacionId=${cotizacion.id}`
    }

    // Determinar el estado visual
    const getEstadoVisual = () => {
        if (fechaOcupada) {
            return {
                titulo: 'Fecha no disponible',
                mensaje: 'Esta fecha ya ha sido reservada.',
                color: 'red',
                icon: '🚫'
            }
        }

        if (estaExpirada) {
            return {
                titulo: 'Cotización expirada',
                mensaje: 'Esta cotización ha expirado.',
                color: 'orange',
                icon: '⏰'
            }
        }

        if (cotizacion.status === ESTADOS_COTIZACION.APROBADA) {
            return {
                titulo: 'Cotización aprobada',
                mensaje: 'Puedes proceder con el pago.',
                color: 'green',
                icon: '✅'
            }
        }

        return {
            titulo: 'Cotización pendiente',
            mensaje: 'Esta cotización está siendo revisada.',
            color: 'blue',
            icon: '⏳'
        }
    }

    const estadoVisual = getEstadoVisual()
    const puedeRealizarPago = !fechaOcupada && !estaExpirada && cotizacion.status === ESTADOS_COTIZACION.APROBADA

    const urlRegreso = esLegacy ? `/cotizacion/${cotizacion.id}` : `/evento/${evento.id}`

    return (
        <div className="min-h-screen bg-zinc-900">
            {/* Indicador de tiempo real */}
            {esRealtime && (
                <div className="fixed top-4 right-4 z-50">
                    <div className={`px-3 py-2 rounded-lg text-xs font-medium ${conectado
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-600 text-gray-200'
                        }`}>
                        <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${conectado ? 'bg-green-300 animate-pulse' : 'bg-gray-400'
                                }`}></div>
                            <span>{conectado ? 'En vivo' : 'Desconectado'}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Header móvil */}
            <div className="bg-zinc-800 p-4 border-b border-zinc-700 sticky top-0 z-10">
                <div className="flex items-center space-x-3 mb-2">
                    <Link
                        href={urlRegreso}
                        className="text-blue-400 hover:text-blue-300"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg font-bold text-white truncate">
                            {cotizacion.nombre}
                        </h1>
                        <div className="text-zinc-400 text-sm">
                            {evento.nombre} - {new Date(evento.fecha_evento).toLocaleDateString('es-MX', {
                                month: 'short',
                                day: 'numeric'
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Estado de la cotización */}
            <div className="p-4">
                <div className={`p-4 rounded-lg border ${estadoVisual.color === 'red' ? 'bg-red-500/20 border-red-500/30' :
                    estadoVisual.color === 'orange' ? 'bg-orange-500/20 border-orange-500/30' :
                        estadoVisual.color === 'green' ? 'bg-green-500/20 border-green-500/30' :
                            'bg-blue-500/20 border-blue-500/30'
                    }`}>
                    <div className="flex items-start space-x-3">
                        <div className="text-2xl">{estadoVisual.icon}</div>
                        <div className="flex-1">
                            <h2 className="font-bold text-white mb-1">
                                {estadoVisual.titulo}
                            </h2>
                            <p className="text-zinc-300 text-sm">
                                {estadoVisual.mensaje}
                            </p>

                            {esRealtime && !esAdmin && (
                                <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-3 mt-3">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                        <span className="text-blue-400 font-medium text-sm">Sesión en tiempo real</span>
                                    </div>
                                    <p className="text-blue-300 text-xs">
                                        Estás viendo esta cotización en tiempo real.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="p-4 pb-24 space-y-4">
                {/* Servicios incluidos */}
                <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                    <h3 className="font-bold text-white mb-3">
                        Servicios incluidos
                    </h3>

                    {loading ? (
                        <div className="text-center py-6">
                            <div className="text-zinc-400 mb-2 text-sm">
                                Cargando servicios...
                            </div>
                        </div>
                    ) : Object.keys(serviciosAgrupados).length === 0 ? (
                        <div className="text-center py-6">
                            <div className="text-zinc-400 mb-2 text-sm">
                                No hay servicios incluidos
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
                                        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-3">
                                            <h4 className="text-lg font-bold text-white uppercase tracking-wide">
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
                                                            <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded">
                                                                {categoriaData.servicios.length} servicio{categoriaData.servicios.length !== 1 ? 's' : ''}
                                                            </span>
                                                        </div>

                                                        {/* Lista de servicios */}
                                                        <div className="space-y-2">
                                                            {categoriaData.servicios.map((cotizacionServicio) => (
                                                                <div key={cotizacionServicio.id} className="bg-zinc-800/50 rounded-md p-4 border border-zinc-600/30 hover:border-zinc-500/50 transition-colors">
                                                                    {/* Diseño responsivo: stack en móvil, grid en desktop */}
                                                                    <div className="flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:gap-4 sm:items-center">
                                                                        {/* Nombre del servicio */}
                                                                        <div className="sm:col-span-6">
                                                                            <h6 className="text-white font-medium text-sm sm:text-base leading-tight">
                                                                                {cotizacionServicio.servicio.nombre}
                                                                            </h6>
                                                                        </div>

                                                                        {/* Cantidad */}
                                                                        <div className="sm:col-span-2">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-xs text-zinc-400 sm:hidden">Cantidad:</span>
                                                                                <span className="text-zinc-300 font-medium text-sm sm:text-center">
                                                                                    x{cotizacionServicio.cantidad}
                                                                                </span>
                                                                            </div>
                                                                        </div>

                                                                        {/* Precio unitario (solo en desktop) */}
                                                                        <div className="hidden sm:block sm:col-span-2 text-center">
                                                                            <span className="text-zinc-400 text-sm">
                                                                                {cotizacionServicio.precioUnitario.toLocaleString('es-MX', {
                                                                                    style: 'currency',
                                                                                    currency: 'MXN'
                                                                                })}
                                                                            </span>
                                                                        </div>

                                                                        {/* Subtotal */}
                                                                        <div className="sm:col-span-2">
                                                                            <div className="flex items-center justify-between sm:justify-end gap-2">
                                                                                <span className="text-xs text-zinc-400 sm:hidden">Subtotal:</span>
                                                                                <span className="text-green-400 font-bold text-base sm:text-lg">
                                                                                    {cotizacionServicio.subtotal.toLocaleString('es-MX', {
                                                                                        style: 'currency',
                                                                                        currency: 'MXN'
                                                                                    })}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Subtotal de la categoría */}
                                                        <div className="flex justify-end pt-2 border-t border-zinc-600/50">
                                                            <div className="bg-blue-900/30 px-4 py-2 rounded-lg border border-blue-500/30">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-blue-300 font-medium text-sm">
                                                                        Subtotal {categoriaNombre}:
                                                                    </span>
                                                                    <span className="text-blue-200 font-bold text-lg">
                                                                        {categoriaData.servicios.reduce((total, servicio) => total + servicio.subtotal, 0)
                                                                            .toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>

                                        {/* Subtotal de la sección */}
                                        <div className="bg-purple-900/30 px-4 py-3 border-t border-purple-500/30">
                                            <div className="flex justify-between items-center">
                                                <span className="text-purple-300 font-semibold">
                                                    Total {seccionNombre}:
                                                </span>
                                                <span className="text-purple-200 font-bold text-xl">
                                                    {Object.values(seccionData.categorias)
                                                        .reduce((total, categoria) =>
                                                            total + categoria.servicios.reduce((catTotal, servicio) => catTotal + servicio.subtotal, 0), 0)
                                                        .toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                            {/* Total general de todos los servicios */}
                            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-4 border border-green-500/50">
                                <div className="flex justify-between items-center">
                                    <span className="text-green-100 font-bold text-lg">
                                        TOTAL SERVICIOS:
                                    </span>
                                    <span className="text-white font-bold text-2xl">
                                        {Object.values(serviciosAgrupados)
                                            .reduce((total, seccion) =>
                                                total + Object.values(seccion.categorias)
                                                    .reduce((secTotal, categoria) =>
                                                        secTotal + categoria.servicios.reduce((catTotal, servicio) => catTotal + servicio.subtotal, 0), 0), 0)
                                            .toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Costos adicionales */}
                {costos.length > 0 && (
                    <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                        <h3 className="font-bold text-white mb-3">
                            Costos adicionales
                        </h3>
                        <div className="space-y-2">
                            {costos.map((costo: any) => (
                                <div key={costo.id} className="flex justify-between items-center p-3 bg-zinc-700 rounded-lg">
                                    <span className="text-white text-sm">{costo.concepto}</span>
                                    <span className="text-orange-400 font-medium text-sm">
                                        ${costo.monto?.toLocaleString('es-MX')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Información adicional */}
                <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                    <div className="text-zinc-400 space-y-2 text-sm">
                        <div>Creada: {new Date(cotizacion.createdAt).toLocaleDateString('es-MX')}</div>
                        {cotizacion.expiresAt && (
                            <div>Expira: {new Date(cotizacion.expiresAt).toLocaleDateString('es-MX')}</div>
                        )}
                        {evento.sede && (
                            <div className="flex items-center">
                                <span className="mr-2">📍</span>
                                <span className="truncate">{evento.sede}</span>
                            </div>
                        )}
                        <div className="text-xs text-zinc-500">ID: {cotizacion.id}</div>
                    </div>
                </div>
            </div>

            {/* Footer fijo con resumen y acciones */}
            <div className="fixed bottom-0 left-0 right-0 bg-zinc-800 border-t border-zinc-700 p-4">
                {/* Resumen de precio */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-zinc-400 text-sm">Total:</span>
                        <span className="text-white text-xl font-bold">
                            ${(cotizacion.precio + costos.reduce((sum: number, c: any) => sum + (c.monto || 0), 0)).toLocaleString('es-MX')}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-zinc-400 text-xs">Anticipo requerido (50%):</span>
                        <span className="text-green-400 font-bold">
                            ${((cotizacion.precio + costos.reduce((sum: number, c: any) => sum + (c.monto || 0), 0)) * 0.5).toLocaleString('es-MX')}
                        </span>
                    </div>
                </div>

                {/* Acciones */}
                <div className="space-y-2">
                    {puedeRealizarPago ? (
                        <button
                            onClick={iniciarPago}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                        >
                            Proceder al pago
                        </button>
                    ) : (
                        <button
                            disabled
                            className="w-full bg-zinc-700 text-zinc-400 font-bold py-3 px-4 rounded-lg cursor-not-allowed"
                        >
                            {fechaOcupada ? 'Fecha ocupada' :
                                estaExpirada ? 'Cotización expirada' :
                                    'Pago no disponible'}
                        </button>
                    )}

                    <a
                        href="https://wa.me/5544546582?text=Hola, tengo preguntas sobre mi cotización"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z" />
                        </svg>
                        <span>Contactar por WhatsApp</span>
                    </a>
                </div>
            </div>
        </div>
    )
}
