'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Calendar, User, FileText } from "lucide-react"

interface HeaderSimpleProps {
    eventoNombre: string
    eventoId: string
    clienteNombre?: string
    tipoEvento?: string
    status?: string
    fechaEvento?: Date | string
}

const STATUS_COLORS = {
    'programado': 'bg-blue-100 text-blue-800',
    'confirmado': 'bg-green-100 text-green-800',
    'cancelado': 'bg-red-100 text-red-800',
    'completado': 'bg-gray-100 text-gray-800',
    'default': 'bg-gray-100 text-gray-600'
} as const

export function HeaderSimple({
    eventoNombre,
    eventoId,
    clienteNombre,
    tipoEvento,
    status,
    fechaEvento
}: HeaderSimpleProps) {

    const formatearFecha = (fecha?: Date | string) => {
        if (!fecha) return 'Fecha no definida'

        try {
            const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha
            return fechaObj.toLocaleDateString('es-MX', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        } catch {
            return 'Fecha no válida'
        }
    }

    const getStatusColor = (status?: string) => {
        if (!status) return STATUS_COLORS.default
        return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.default
    }

    return (
        <Card className="mb-6">
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl font-bold">
                            {eventoNombre || 'Evento sin nombre'}
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                            ID: {eventoId}
                        </p>
                    </div>

                    {status && (
                        <Badge className={getStatusColor(status)}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Cliente */}
                    <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <div>
                            <p className="text-sm font-medium">Cliente</p>
                            <p className="text-sm text-gray-600">
                                {clienteNombre || 'No asignado'}
                            </p>
                        </div>
                    </div>

                    {/* Fecha */}
                    <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                            <p className="text-sm font-medium">Fecha del evento</p>
                            <p className="text-sm text-gray-600">
                                {formatearFecha(fechaEvento)}
                            </p>
                        </div>
                    </div>

                    {/* Tipo de evento */}
                    <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <div>
                            <p className="text-sm font-medium">Tipo de evento</p>
                            <p className="text-sm text-gray-600">
                                {tipoEvento || 'No definido'}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
