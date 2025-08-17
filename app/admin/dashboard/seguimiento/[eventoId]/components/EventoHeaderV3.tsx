'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Calendar, MapPin, User, Phone, Mail } from "lucide-react"

interface EventoHeaderV3Props {
    evento: {
        id: string
        nombre: string
        fecha: string
        fecha_evento: string
        hora?: string
        locacion?: string
        cliente: {
            nombre: string
            telefono?: string
            email?: string
        }
        status: string
        eventoTipo: {
            nombre: string
        }
    }
}

const EVENTO_STATUS_STYLES = {
    'programado': 'bg-blue-100 text-blue-800',
    'confirmado': 'bg-green-100 text-green-800',
    'cancelado': 'bg-red-100 text-red-800',
    'realizado': 'bg-purple-100 text-purple-800',
    'pendiente': 'bg-yellow-100 text-yellow-800'
} as const

export function EventoHeaderV3({ evento }: EventoHeaderV3Props) {
    const statusStyle = EVENTO_STATUS_STYLES[evento.status as keyof typeof EVENTO_STATUS_STYLES]
        || 'bg-gray-100 text-gray-800'

    const formatFecha = (fecha: string) => {
        if (!fecha) return 'Sin fecha'
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    }

    return (
        <Card className="mb-6">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <CardTitle className="text-2xl font-bold text-gray-900">
                            {evento.nombre}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-sm">
                                {evento.eventoTipo.nombre}
                            </Badge>
                            <Badge className={`text-sm ${statusStyle}`}>
                                {evento.status.charAt(0).toUpperCase() + evento.status.slice(1)}
                            </Badge>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Información del Evento */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900 mb-3">Detalles del Evento</h3>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>
                                {formatFecha(evento.fecha_evento || evento.fecha)}
                                {evento.hora && (
                                    <span className="ml-2 text-gray-500">
                                        a las {evento.hora}
                                    </span>
                                )}
                            </span>
                        </div>

                        {evento.locacion && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span>{evento.locacion}</span>
                            </div>
                        )}
                    </div>

                    {/* Información del Cliente */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900 mb-3">Información del Cliente</h3>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="h-4 w-4" />
                            <span>{evento.cliente.nombre}</span>
                        </div>

                        {evento.cliente.telefono && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="h-4 w-4" />
                                <span>{evento.cliente.telefono}</span>
                            </div>
                        )}

                        {evento.cliente.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="h-4 w-4" />
                                <span className="break-all">{evento.cliente.email}</span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
