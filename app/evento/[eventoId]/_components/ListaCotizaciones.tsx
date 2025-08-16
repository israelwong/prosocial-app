'use client'
import React from 'react'
import Link from 'next/link'

interface Cotizacion {
    id: string
    nombre: string
    precio: number
    status: string
    createdAt: Date
    expiresAt?: Date
    visitas?: number
}

interface Evento {
    id: string
    nombre: string
    fecha_evento: Date
    status: string
}

interface Props {
    cotizaciones: Cotizacion[]
    eventoId: string
    evento: Evento
}

export default function ListaCotizaciones({ cotizaciones, eventoId, evento }: Props) {

    const getEstadoCotizacion = (cotizacion: Cotizacion) => {
        const hoy = new Date()
        const expira = cotizacion.expiresAt ? new Date(cotizacion.expiresAt) : null

        if (evento.status === 'contratado') {
            return { texto: 'Evento contratado', color: 'blue', disponible: false, icon: '🔒' }
        }

        if (expira && expira < hoy) {
            return { texto: 'Expirada', color: 'red', disponible: false, icon: '⏰' }
        }

        if (cotizacion.status === 'aprobada') {
            return { texto: 'Aprobada', color: 'green', disponible: true, icon: '✅' }
        }

        if (cotizacion.status === 'pendiente') {
            return { texto: 'Pendiente', color: 'orange', disponible: true, icon: '⏳' }
        }

        return { texto: 'Rechazada', color: 'red', disponible: false, icon: '❌' }
    }

    const formatearFecha = (fecha: Date) => {
        return new Date(fecha).toLocaleDateString('es-MX', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const colorClasses = {
        green: 'bg-green-500/20 text-green-400 border-green-500/30',
        orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        red: 'bg-red-500/20 text-red-400 border-red-500/30',
        blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    }

    return (
        <div className="space-y-3">
            {cotizaciones.map((cotizacion) => {
                const estado = getEstadoCotizacion(cotizacion)

                return (
                    <div key={cotizacion.id} className="bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden">
                        {/* Header de la cotización */}
                        <div className="p-4 pb-3">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-white text-lg leading-tight">
                                        {cotizacion.nombre}
                                    </h3>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <span className="text-xs text-zinc-400">
                                            {formatearFecha(cotizacion.createdAt)}
                                        </span>
                                        {cotizacion.visitas !== undefined && (
                                            <>
                                                <span className="text-zinc-500">•</span>
                                                <span className="text-xs text-zinc-400">
                                                    {cotizacion.visitas} visitas
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${colorClasses[estado.color as keyof typeof colorClasses]} whitespace-nowrap ml-2`}>
                                    <span className="mr-1">{estado.icon}</span>
                                    {estado.texto}
                                </div>
                            </div>

                            {/* Precio */}
                            <div className="text-2xl font-bold text-white mb-3">
                                ${cotizacion.precio.toLocaleString('es-MX')}
                            </div>

                            {/* Información de expiración */}
                            {cotizacion.expiresAt && (
                                <div className="text-xs text-zinc-500 mb-3">
                                    Expira: {formatearFecha(cotizacion.expiresAt)}
                                </div>
                            )}
                        </div>

                        {/* Indicador de tiempo real si está en sesión */}
                        {cotizacion.status === 'en_sesion' && (
                            <div className="px-4 pb-3">
                                <div className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                        <span className="text-blue-400 text-xs font-medium">
                                            Sesión en vivo activa
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Acciones */}
                        <div className="px-4 pb-4">
                            {estado.disponible ? (
                                <Link
                                    href={`/evento/${eventoId}/cotizacion/${cotizacion.id}`}
                                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center"
                                >
                                    Ver detalles
                                </Link>
                            ) : (
                                <button
                                    disabled
                                    className="w-full bg-zinc-700 text-zinc-400 font-medium py-3 px-4 rounded-lg cursor-not-allowed"
                                >
                                    No disponible
                                </button>
                            )}
                        </div>
                    </div>
                )
            })}

            {/* Mensaje de contacto */}
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 text-center mt-6">
                <div className="text-zinc-400 mb-3 text-sm">
                    ¿Necesitas una cotización personalizada?
                </div>
                <a
                    href="https://wa.me/5544546582?text=Hola, me interesa solicitar una cotización personalizada"
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
    )
}
