'use client'
import React from 'react'
import Header from './Header'

interface Evento {
    id: string
    nombre: string | null
    fecha_evento: Date
    EventoTipo?: {
        nombre: string
    } | null
    Cliente?: {
        nombre: string
        id?: string
        telefono?: string | null
        email?: string | null
    } | null
}

interface ConflictoInfo {
    mensaje: string
    eventosEnConflicto: Array<{
        eventoId?: string
        evento: string | null
        tipo: string | null
    }>
}

interface Props {
    evento: Evento
    diasRestantes: number
    conflicto?: ConflictoInfo
}

export default function FechaNoDisponible({ evento, diasRestantes, conflicto }: Props) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-950/50 to-purple-950/70 flex flex-col">
            <Header evento={evento} disponible={false} diasRestantes={diasRestantes} />

            <main className="flex-grow flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-zinc-900/80 backdrop-blur-sm p-8 rounded-xl shadow-xl text-center border border-red-500/30">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-4">
                        Fecha no disponible
                    </h2>

                    <p className="text-zinc-300 mb-6">
                        Lo sentimos, esta fecha ya fue asignada a otro evento.
                    </p>

                    {/* Información del conflicto */}
                    {conflicto && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-sm">
                            <strong className="text-red-300">Evento en conflicto:</strong>
                            <div className="mt-2 text-red-200">
                                {conflicto.eventosEnConflicto.map((item, index) => (
                                    <div key={`evento-conflicto-${item.eventoId || `idx-${index}`}`} className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                                        {item.evento} {item.tipo && `(${item.tipo})`}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Botón de contacto */}
                    <a
                        href="https://wa.me/5544546582?text=Hola, necesito reprogramar mi evento porque la fecha ya no está disponible"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z" />
                        </svg>
                        Contactar para reprogramar
                    </a>
                </div>
            </main>
        </div>
    )
}
