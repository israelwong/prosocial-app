import { EventoResumen } from '@/types/dashboard'
import { Calendar, MapPin, Users } from 'lucide-react'
import Link from 'next/link'

interface EventosDelMesWidgetProps {
    eventos: EventoResumen[]
}

export function EventosDelMesWidget({ eventos }: EventosDelMesWidgetProps) {
    const formatFecha = (fecha: Date) => {
        return new Intl.DateTimeFormat('es-MX', {
            day: 'numeric',
            month: 'short'
        }).format(new Date(fecha))
    }

    return (
        <div className="bg-zinc-900 rounded-lg shadow-sm border border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-400" />
                    Agenda del Mes
                </h3>
                <span className="bg-blue-950/50 text-blue-300 text-sm font-medium px-2.5 py-0.5 rounded border border-blue-800">
                    {eventos.length} eventos
                </span>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
                {eventos.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500">
                        <Calendar className="h-8 w-8 mx-auto mb-2 text-zinc-600" />
                        <p>No hay eventos en agenda este mes</p>
                    </div>
                ) : (
                    eventos.map((evento) => (
                        <Link
                            key={evento.id}
                            href={`/admin/dashboard/eventos/seguimiento/${evento.id}`}
                            className="block p-3 rounded-lg border border-zinc-800 hover:border-blue-700 hover:bg-blue-950/30 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-medium text-blue-400">
                                            {formatFecha(evento.fecha_evento)}
                                        </span>
                                        <span
                                            className="inline-block w-2 h-2 rounded-full bg-zinc-600"
                                        />
                                        <span className="text-xs text-zinc-500">
                                            {evento.etapa_nombre}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-zinc-100 truncate">
                                        {evento.nombre || 'Evento sin nombre'}
                                    </p>
                                    <div className="flex items-center gap-4 mt-1">
                                        <div className="flex items-center gap-1 text-xs text-zinc-400">
                                            <Users className="h-3 w-3" />
                                            {evento.cliente_nombre}
                                        </div>
                                        {(evento.sede || evento.direccion) && (
                                            <div className="flex items-center gap-1 text-xs text-zinc-400">
                                                <MapPin className="h-3 w-3" />
                                                <span className="truncate max-w-24">
                                                    {evento.sede || evento.direccion}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            {eventos.length > 0 && (
                <div className="mt-4 pt-4 border-t border-zinc-800">
                    <Link
                        href="/admin/dashboard/eventos"
                        className="w-full text-center text-sm text-blue-400 hover:text-blue-300 font-medium block py-2 hover:bg-zinc-800 rounded transition-colors"
                    >
                        Ver toda la agenda →
                    </Link>
                </div>
            )}
        </div>
    )
}
