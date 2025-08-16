'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { suscribirCotizacion, desuscribirCotizacion, ESTADOS_COTIZACION } from '@/lib/supabase-realtime'

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
    const [servicios, setServicios] = useState([])
    const [costos, setCostos] = useState([])
    const [loading, setLoading] = useState(false)
    const [conectado, setConectado] = useState(false)

    useEffect(() => {
        if (esRealtime) {
            console.log('Iniciando sesión de tiempo real...')
            setConectado(true)

            const channel = suscribirCotizacion(cotizacion.id, (payload) => {
                console.log('Actualización recibida:', payload)

                if (payload.table === 'Cotizacion') {
                    setCotizacion(payload.new)
                }

                if (payload.table === 'CotizacionServicio') {
                    cargarServicios()
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

    const cargarServicios = async () => {
        console.log('Cargando servicios...')
        // Aquí iría la llamada real para obtener servicios
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

                    {servicios.length === 0 ? (
                        <div className="text-center py-6">
                            <div className="text-zinc-400 mb-2 text-sm">
                                {esRealtime ? 'Esperando servicios...' : 'Cargando servicios...'}
                            </div>
                            {esRealtime && (
                                <div className="text-xs text-zinc-500">
                                    Los servicios aparecerán conforme se agreguen
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {servicios.map((servicio: any) => (
                                <div key={servicio.id} className="flex justify-between items-center p-3 bg-zinc-700 rounded-lg">
                                    <span className="text-white text-sm">{servicio.nombre}</span>
                                    <span className="text-green-400 font-medium text-sm">
                                        ${servicio.precio?.toLocaleString('es-MX')}
                                    </span>
                                </div>
                            ))}
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
