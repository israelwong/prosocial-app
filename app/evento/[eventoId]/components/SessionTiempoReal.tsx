'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { suscribirCotizacion, desuscribirCotizacion } from '@/lib/supabase-realtime'

interface Evento {
    id: string
    nombre: string
    fecha_evento: Date
    status: string
    sede?: string
}

interface Cotizacion {
    id: string
    nombre: string
    precio: number
    status: string
}

interface Props {
    evento: Evento
    esAdmin?: boolean
    esProspecto?: boolean
    cotizacionIdInicial?: string
}

export default function SessionTiempoReal({
    evento,
    esAdmin = false,
    esProspecto = false,
    cotizacionIdInicial
}: Props) {
    const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null)
    const [servicios, setServicios] = useState([])
    const [costos, setCostos] = useState([])
    const [conectado, setConectado] = useState(false)
    const [sesionActiva, setSesionActiva] = useState(false)
    const [tiempoSesion, setTiempoSesion] = useState(0)

    // Timer para sesión de 40 minutos
    useEffect(() => {
        let interval: NodeJS.Timeout

        if (sesionActiva) {
            interval = setInterval(() => {
                setTiempoSesion(prev => {
                    if (prev >= 2400) { // 40 minutos en segundos
                        setSesionActiva(false)
                        return 2400
                    }
                    return prev + 1
                })
            }, 1000)
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [sesionActiva])

    // Suscripción a tiempo real
    useEffect(() => {
        if (cotizacionIdInicial && cotizacion?.id) {
            console.log('Iniciando sesión de tiempo real...')
            setConectado(true)

            const channel = suscribirCotizacion(cotizacion.id, (payload) => {
                console.log('Actualización recibida:', payload)

                if (payload.table === 'Cotizacion') {
                    setCotizacion(payload.new)
                }

                if (payload.table === 'CotizacionServicio') {
                    // Recargar servicios
                    cargarServicios()
                }

                if (payload.table === 'CotizacionCosto') {
                    // Recargar costos
                    cargarCostos()
                }
            })

            return () => {
                console.log('Cerrando sesión de tiempo real...')
                desuscribirCotizacion(channel)
                setConectado(false)
            }
        }
    }, [cotizacion?.id, cotizacionIdInicial])

    const cargarServicios = async () => {
        console.log('Cargando servicios...')
        // Aquí iría la llamada real para obtener servicios
    }

    const cargarCostos = async () => {
        console.log('Cargando costos...')
        // Aquí iría la llamada real para obtener costos
    }

    const iniciarSesion = () => {
        setSesionActiva(true)
        setTiempoSesion(0)
        setConectado(true)
    }

    const formatearTiempo = (segundos: number) => {
        const minutos = Math.floor(segundos / 60)
        const segs = segundos % 60
        return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`
    }

    const tiempoRestante = 2400 - tiempoSesion // 40 minutos - tiempo transcurrido

    return (
        <div className="min-h-screen bg-zinc-900">
            {/* Header fijo */}
            <div className="bg-zinc-800 p-4 border-b border-zinc-700 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Link
                            href={`/evento/${evento.id}`}
                            className="text-blue-400 hover:text-blue-300"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-lg font-bold text-white">
                                {esAdmin ? 'Panel Administrativo' : 'Presentación Ejecutiva'}
                            </h1>
                            <p className="text-zinc-400 text-sm">
                                {evento.nombre}
                            </p>
                        </div>
                    </div>

                    {/* Indicadores de estado */}
                    <div className="flex items-center space-x-2">
                        {sesionActiva && (
                            <div className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm">
                                {formatearTiempo(tiempoRestante)}
                            </div>
                        )}

                        <div className={`px-3 py-1 rounded-lg text-sm ${conectado
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-600 text-gray-200'
                            }`}>
                            <div className="flex items-center space-x-1">
                                <div className={`w-2 h-2 rounded-full ${conectado ? 'bg-green-300 animate-pulse' : 'bg-gray-400'
                                    }`}></div>
                                <span>{conectado ? 'En vivo' : 'Desconectado'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vista de Administrador */}
            {esAdmin && (
                <div className="p-4">
                    <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700 mb-6">
                        <h2 className="text-xl font-bold text-white mb-4">
                            Panel de Control - Sesión Ejecutiva
                        </h2>

                        {!sesionActiva ? (
                            <div className="text-center">
                                <p className="text-zinc-400 mb-6">
                                    Inicia la sesión de presentación ejecutiva de 40 minutos
                                </p>
                                <button
                                    onClick={iniciarSesion}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                                >
                                    Iniciar Sesión de Presentación
                                </button>
                            </div>
                        ) : (
                            <div>
                                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-green-400 font-medium">
                                            Sesión activa - {formatearTiempo(tiempoSesion)} transcurridos
                                        </span>
                                        <span className="text-green-300">
                                            Quedan: {formatearTiempo(tiempoRestante)}
                                        </span>
                                    </div>
                                </div>

                                {/* Aquí iría el panel de administración para crear/editar cotización */}
                                <div className="bg-zinc-700 rounded-lg p-4">
                                    <h3 className="text-white font-bold mb-3">
                                        Crear/Editar Cotización
                                    </h3>
                                    <p className="text-zinc-400 text-sm">
                                        Panel de administración para gestionar la cotización en tiempo real.
                                        (Por implementar)
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Vista de Prospecto */}
            {esProspecto && (
                <div className="p-4">
                    {!sesionActiva ? (
                        <div className="text-center py-12">
                            <div className="bg-zinc-800 rounded-lg p-8 border border-zinc-700">
                                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">
                                    Presentación Ejecutiva
                                </h2>
                                <p className="text-zinc-400 mb-6">
                                    Tu cotización personalizada se creará durante la sesión de presentación
                                </p>
                                <div className="text-zinc-500 text-sm">
                                    Esperando que inicie la sesión...
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {/* Header de cotización */}
                            <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 mb-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-lg font-bold text-white">
                                        {cotizacion?.nombre || 'Preparando cotización...'}
                                    </h2>
                                    <div className="text-green-400 text-sm">
                                        ● En vivo
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-white">
                                    ${cotizacion?.precio?.toLocaleString('es-MX') || '---'}
                                </div>
                            </div>

                            {/* Lista de servicios en tiempo real */}
                            <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 mb-4">
                                <h3 className="font-bold text-white mb-3">
                                    Servicios Incluidos
                                </h3>

                                {servicios.length === 0 ? (
                                    <div className="text-center py-6">
                                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                        <p className="text-zinc-400 text-sm">
                                            Los servicios aparecerán aquí conforme se vayan agregando...
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {servicios.map((servicio: any, index) => (
                                            <div
                                                key={servicio.id || index}
                                                className="flex justify-between items-center p-3 bg-zinc-700 rounded-lg animate-slide-in"
                                            >
                                                <span className="text-white text-sm">{servicio.nombre}</span>
                                                <span className="text-green-400 font-medium text-sm">
                                                    ${servicio.precio?.toLocaleString('es-MX')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Información adicional */}
                            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                    <span className="text-blue-400 font-medium text-sm">
                                        Sesión de presentación en curso
                                    </span>
                                </div>
                                <p className="text-blue-300 text-sm">
                                    Esta cotización se está creando en tiempo real durante nuestra sesión de presentación.
                                    Al finalizar podrás revisarla y proceder con el pago si te interesa.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Footer fijo con información de contacto */}
            <div className="fixed bottom-0 left-0 right-0 bg-zinc-800 border-t border-zinc-700 p-4">
                <div className="text-center">
                    <a
                        href="https://wa.me/5544546582?text=Hola, estoy en la sesión de presentación ejecutiva"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 text-green-400 hover:text-green-300 text-sm"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z" />
                        </svg>
                        <span>Soporte durante la sesión</span>
                    </a>
                </div>
            </div>

            {/* Estilos para animaciones */}
            <style jsx>{`
                @keyframes slide-in {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }
            `}</style>
        </div>
    )
}
