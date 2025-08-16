'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Clock, User, FileText, AlertCircle } from "lucide-react"

interface BitacoraSimpleProps {
    bitacora?: Array<{
        id?: string
        fecha?: Date | string
        usuario?: string
        accion?: string
        descripcion?: string
        tipo?: string
        observaciones?: string
    }> | null
}

const TIPO_COLORS = {
    'creacion': 'bg-green-100 text-green-800',
    'actualizacion': 'bg-blue-100 text-blue-800',
    'eliminacion': 'bg-red-100 text-red-800',
    'comentario': 'bg-yellow-100 text-yellow-800',
    'sistema': 'bg-gray-100 text-gray-800',
    'default': 'bg-gray-100 text-gray-600'
} as const

export function BitacoraSimple({ bitacora }: BitacoraSimpleProps) {

    const formatearFecha = (fecha?: Date | string) => {
        if (!fecha) return 'Fecha no definida'

        try {
            const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha
            return fechaObj.toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch {
            return 'Fecha no válida'
        }
    }

    const getTipoColor = (tipo?: string) => {
        if (!tipo) return TIPO_COLORS.default
        return TIPO_COLORS[tipo as keyof typeof TIPO_COLORS] || TIPO_COLORS.default
    }

    if (!bitacora || bitacora.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Bitácora del Evento
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No hay registros en la bitácora</p>
                        <p className="text-sm text-gray-400 mt-1">
                            Los eventos y cambios aparecerán aquí
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Bitácora del Evento
                    <Badge variant="outline" className="ml-2">
                        {bitacora.length}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {bitacora.slice(0, 10).map((registro, index) => (
                        <div
                            key={registro.id || index}
                            className="border-l-2 border-gray-200 pl-4 pb-4 last:pb-0"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    {registro.tipo && (
                                        <Badge className={getTipoColor(registro.tipo)}>
                                            {registro.tipo}
                                        </Badge>
                                    )}
                                    <span className="text-sm font-medium">
                                        {registro.accion || 'Acción no especificada'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Clock className="h-3 w-3" />
                                    {formatearFecha(registro.fecha)}
                                </div>
                            </div>

                            {registro.descripcion && (
                                <p className="text-sm text-gray-600 mb-2">
                                    {registro.descripcion}
                                </p>
                            )}

                            {registro.observaciones && (
                                <p className="text-xs text-gray-500 mb-2 italic">
                                    {registro.observaciones}
                                </p>
                            )}

                            {registro.usuario && (
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                    <User className="h-3 w-3" />
                                    {registro.usuario}
                                </div>
                            )}
                        </div>
                    ))}

                    {bitacora.length > 10 && (
                        <div className="text-center pt-4 border-t">
                            <p className="text-sm text-gray-500">
                                Se muestran los últimos 10 registros de {bitacora.length} total
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
