import { CitaProxima } from '@/types/dashboard'
import { Calendar, Video, Phone, MapPin, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface CitasProgramadasWidgetProps {
    citas: CitaProxima[]
}

export function CitasProgramadasWidget({ citas }: CitasProgramadasWidgetProps) {
    const formatFecha = (fecha: Date) => {
        const today = new Date()
        const citaDate = new Date(fecha)

        // Si es hoy
        if (citaDate.toDateString() === today.toDateString()) {
            return 'Hoy'
        }

        // Si es mañana
        const tomorrow = new Date(today)
        tomorrow.setDate(today.getDate() + 1)
        if (citaDate.toDateString() === tomorrow.toDateString()) {
            return 'Mañana'
        }

        // Otro día
        return new Intl.DateTimeFormat('es-MX', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        }).format(citaDate)
    }

    const getModalidadIcon = (modalidad: string) => {
        switch (modalidad.toUpperCase()) {
            case 'VIRTUAL':
                return <Video className="h-3 w-3" />
            case 'TELEFONICA':
                return <Phone className="h-3 w-3" />
            case 'PRESENCIAL':
                return <MapPin className="h-3 w-3" />
            default:
                return <Calendar className="h-3 w-3" />
        }
    }

    const getStatusColor = (status: string, requiereConfirmacion: boolean) => {
        if (requiereConfirmacion) {
            return 'text-yellow-600 bg-yellow-100'
        }
        switch (status.toUpperCase()) {
            case 'CONFIRMADA':
                return 'text-green-600 bg-green-100'
            case 'PROGRAMADA':
                return 'text-blue-600 bg-blue-100'
            default:
                return 'text-zinc-400 bg-zinc-800'
        }
    }

    const citasRequierenConfirmacion = citas.filter(cita => cita.requiere_confirmacion).length

    return (
        <div className="bg-zinc-900 rounded-lg shadow-sm border border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                    Citas Programadas
                </h3>
                <div className="flex items-center gap-2">
                    {citasRequierenConfirmacion > 0 && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {citasRequierenConfirmacion} sin confirmar
                        </span>
                    )}
                    <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-2.5 py-0.5 rounded">
                        {citas.length} esta semana
                    </span>
                </div>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
                {citas.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500">
                        <Calendar className="h-8 w-8 mx-auto mb-2 text-zinc-600" />
                        <p>No hay citas programadas esta semana</p>
                    </div>
                ) : (
                    citas.map((cita) => (
                        <Link
                            key={cita.id}
                            href={`/admin/dashboard/eventos/${cita.eventoId}#citas`}
                            className="block p-3 rounded-lg border border-zinc-800 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm font-medium text-indigo-600">
                                            {formatFecha(cita.fecha)} {cita.hora}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            {getModalidadIcon(cita.modalidad)}
                                            <span className="text-xs text-zinc-500 capitalize">
                                                {cita.modalidad.toLowerCase()}
                                            </span>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(cita.status, cita.requiere_confirmacion)}`}>
                                            {cita.requiere_confirmacion ? 'Sin confirmar' : cita.status}
                                        </span>
                                    </div>

                                    <p className="text-sm font-medium text-zinc-100 mb-1">
                                        {cita.asunto}
                                    </p>

                                    <div className="space-y-1">
                                        <div className="text-xs text-zinc-400">
                                            <span className="font-medium">{cita.cliente_nombre}</span>
                                            <span className="text-gray-400"> • </span>
                                            <span>{cita.evento_nombre}</span>
                                        </div>

                                        {cita.ubicacion && cita.modalidad.toUpperCase() === 'PRESENCIAL' && (
                                            <div className="flex items-center gap-1 text-xs text-zinc-500">
                                                <MapPin className="h-3 w-3" />
                                                <span className="truncate">{cita.ubicacion}</span>
                                            </div>
                                        )}

                                        {cita.urlVirtual && cita.modalidad.toUpperCase() === 'VIRTUAL' && (
                                            <div className="flex items-center gap-1 text-xs text-blue-600">
                                                <Video className="h-3 w-3" />
                                                <span className="truncate">Enlace disponible</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {cita.requiere_confirmacion && (
                                    <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-1" />
                                )}
                            </div>
                        </Link>
                    ))
                )}
            </div>

            {/* Resumen de tipos de cita */}
            {citas.length > 0 && (
                <div className="mt-4 pt-4 border-t border-zinc-800">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div>
                            <div className="font-medium text-zinc-100">
                                {citas.filter(c => c.modalidad.toUpperCase() === 'VIRTUAL').length}
                            </div>
                            <div className="text-zinc-500">Virtual</div>
                        </div>
                        <div>
                            <div className="font-medium text-zinc-100">
                                {citas.filter(c => c.modalidad.toUpperCase() === 'PRESENCIAL').length}
                            </div>
                            <div className="text-zinc-500">Presencial</div>
                        </div>
                        <div>
                            <div className="font-medium text-zinc-100">
                                {citas.filter(c => c.modalidad.toUpperCase() === 'TELEFONICA').length}
                            </div>
                            <div className="text-zinc-500">Telefónica</div>
                        </div>
                    </div>
                </div>
            )}

            {citas.length > 0 && (
                <div className="mt-4 pt-4 border-t border-zinc-800">
                    <Link
                        href="/admin/dashboard/citas"
                        className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium block py-2 hover:bg-indigo-50 rounded transition-colors"
                    >
                        Ver todas las citas →
                    </Link>
                </div>
            )}
        </div>
    )
}
