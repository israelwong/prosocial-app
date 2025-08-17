'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Calendar, Clock, MapPin, Users, FileText, Tag } from "lucide-react"

interface DetallesEventoProps {
    evento?: {
        id?: string
        nombre?: string
        fecha_evento?: Date | string
        numero_invitados?: number
        locacion?: string
        status?: string
        observaciones?: string
        createdAt?: Date | string
        updatedAt?: Date | string
    } | null
    tipoEvento?: {
        nombre?: string
        descripcion?: string
    } | null
    etapa?: {
        nombre?: string
        descripcion?: string
    } | null
}

const STATUS_COLORS = {
    'programado': 'bg-blue-100 text-blue-800',
    'confirmado': 'bg-green-100 text-green-800',
    'cancelado': 'bg-red-100 text-red-800',
    'completado': 'bg-gray-100 text-gray-800',
    'default': 'bg-gray-100 text-gray-600'
} as const

export function DetallesEvento({ evento, tipoEvento, etapa }: DetallesEventoProps) {

    const formatearFecha = (fecha?: Date | string) => {
        if (!fecha) return 'No definida'

        try {
            const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha
            return fechaObj.toLocaleDateString('es-MX', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch {
            return 'Fecha no válida'
        }
    }

    const getStatusColor = (status?: string) => {
        if (!status) return STATUS_COLORS.default
        return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.default
    }

    if (!evento) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Detalles del Evento
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-500">No hay información del evento disponible</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Detalles del Evento
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Status y Etapa */}
                    <div className="flex flex-wrap gap-2">
                        {evento.status && (
                            <Badge className={getStatusColor(evento.status)}>
                                {evento.status.charAt(0).toUpperCase() + evento.status.slice(1)}
                            </Badge>
                        )}
                        {etapa?.nombre && (
                            <Badge variant="outline">
                                {etapa.nombre}
                            </Badge>
                        )}
                    </div>

                    {/* Información básica */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Fecha del evento */}
                        <div className="flex items-start space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium">Fecha del evento</p>
                                <p className="text-sm text-gray-600">
                                    {formatearFecha(evento.fecha_evento)}
                                </p>
                            </div>
                        </div>

                        {/* Número de invitados */}
                        {evento.numero_invitados && (
                            <div className="flex items-start space-x-2">
                                <Users className="h-4 w-4 text-gray-500 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Número de invitados</p>
                                    <p className="text-sm text-gray-600">
                                        {evento.numero_invitados} personas
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Locación */}
                        {evento.locacion && (
                            <div className="flex items-start space-x-2">
                                <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Locación</p>
                                    <p className="text-sm text-gray-600">
                                        {evento.locacion}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Tipo de evento */}
                        {tipoEvento?.nombre && (
                            <div className="flex items-start space-x-2">
                                <Tag className="h-4 w-4 text-gray-500 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Tipo de evento</p>
                                    <p className="text-sm text-gray-600">
                                        {tipoEvento.nombre}
                                    </p>
                                    {tipoEvento.descripcion && (
                                        <p className="text-xs text-gray-500">
                                            {tipoEvento.descripcion}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Observaciones */}
                    {evento.observaciones && (
                        <div className="pt-3 border-t">
                            <div className="flex items-start space-x-2">
                                <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Observaciones</p>
                                    <p className="text-sm text-gray-600">
                                        {evento.observaciones}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Metadatos */}
                    <div className="pt-3 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-400">
                            {evento.createdAt && (
                                <div>
                                    <span className="font-medium">Creado:</span>{' '}
                                    {formatearFecha(evento.createdAt)}
                                </div>
                            )}
                            {evento.updatedAt && (
                                <div>
                                    <span className="font-medium">Actualizado:</span>{' '}
                                    {formatearFecha(evento.updatedAt)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
