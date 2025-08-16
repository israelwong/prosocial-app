'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Package, List, Settings } from "lucide-react"

interface ServiciosAsociadosPlaceholderProps {
    servicios?: Array<{
        id?: string
        nombre?: string
        precio?: number
        status?: string
        categoria?: string
    }> | null
}

const STATUS_COLORS = {
    'pendiente': 'bg-yellow-100 text-yellow-800',
    'confirmado': 'bg-green-100 text-green-800',
    'cancelado': 'bg-red-100 text-red-800',
    'completado': 'bg-blue-100 text-blue-800',
    'default': 'bg-gray-100 text-gray-600'
} as const

export function ServiciosAsociadosPlaceholder({ servicios }: ServiciosAsociadosPlaceholderProps) {

    // Función de formateo consistente
    const formatearMoneda = (cantidad: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(cantidad).replace('MX$', '$')
    }

    const getStatusColor = (status?: string) => {
        if (!status) return STATUS_COLORS.default
        return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.default
    }

    const totalServicios = servicios?.length || 0
    const totalPrecio = servicios?.reduce((sum, servicio) => sum + (servicio.precio || 0), 0) || 0

    // Agrupar por status para estadísticas rápidas
    const estatusResumen = servicios?.reduce((acc, servicio) => {
        const status = servicio.status || 'sin_status'
        acc[status] = (acc[status] || 0) + 1
        return acc
    }, {} as Record<string, number>) || {}

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Servicios Asociados
                    <Badge variant="outline" className="ml-2">
                        {totalServicios}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Resumen rápido */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-blue-800">Total servicios</p>
                            <p className="text-lg font-bold text-blue-900">
                                {totalServicios}
                            </p>
                        </div>

                        <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-sm font-medium text-green-800">Valor total</p>
                            <p className="text-lg font-bold text-green-900">
                                {formatearMoneda(totalPrecio)}
                            </p>
                        </div>

                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <p className="text-sm font-medium text-purple-800">Estados</p>
                            <p className="text-lg font-bold text-purple-900">
                                {Object.keys(estatusResumen).length}
                            </p>
                        </div>
                    </div>

                    {/* Lista simple de servicios */}
                    {servicios && servicios.length > 0 ? (
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm text-gray-700">
                                Servicios ({servicios.length})
                            </h4>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {servicios.slice(0, 5).map((servicio, index) => (
                                    <div
                                        key={servicio.id || index}
                                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <p className="text-sm font-medium truncate">
                                                {servicio.nombre || 'Servicio sin nombre'}
                                            </p>
                                            {servicio.categoria && (
                                                <p className="text-xs text-gray-500">
                                                    {servicio.categoria}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right ml-2">
                                            <p className="text-sm font-semibold">
                                                {formatearMoneda(servicio.precio || 0)}
                                            </p>
                                            {servicio.status && (
                                                <Badge className={`text-xs ${getStatusColor(servicio.status)}`}>
                                                    {servicio.status}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {servicios.length > 5 && (
                                    <p className="text-xs text-gray-500 text-center py-2">
                                        ... y {servicios.length - 5} servicios más
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500">No hay servicios asociados</p>
                        </div>
                    )}

                    {/* Placeholder para componente complejo */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <List className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 font-medium">
                            Componente de Servicios Completo
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                            Aquí se integrará la gestión completa de servicios:
                            edición, reordenamiento, categorías y responsables
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
