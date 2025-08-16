'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Button } from "@/app/components/ui/button"
import {
    Settings,
    CheckCircle,
    Clock,
    AlertCircle,
    XCircle,
    Plus,
    Edit3
} from "lucide-react"

interface ServiciosListaV3Props {
    servicios: {
        cantidad: number
        lista: Array<{
            id: string
            nombre: string
            precio: number
            status: string
        }>
    }
    onAgregarServicio?: () => void
    onEditarServicio?: (servicioId: string) => void
    isLoading?: boolean
}

const SERVICIO_STATUS_STYLES = {
    'completado': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
    'en_progreso': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Settings },
    'pendiente': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
    'pausado': { bg: 'bg-orange-100', text: 'text-orange-800', icon: AlertCircle },
    'cancelado': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
} as const

export function ServiciosListaV3({
    servicios,
    onAgregarServicio,
    onEditarServicio,
    isLoading = false
}: ServiciosListaV3Props) {
    const formatearMoneda = (cantidad: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(cantidad)
    }

    const obtenerStatusConfig = (status: string) => {
        return SERVICIO_STATUS_STYLES[status as keyof typeof SERVICIO_STATUS_STYLES]
            || SERVICIO_STATUS_STYLES.pendiente
    }

    const calcularResumen = () => {
        const total = servicios.lista.reduce((sum, servicio) => sum + servicio.precio, 0)
        const completados = servicios.lista.filter(s => s.status === 'completado').length
        const enProgreso = servicios.lista.filter(s => s.status === 'en_progreso').length
        const pendientes = servicios.lista.filter(s => s.status === 'pendiente').length

        return { total, completados, enProgreso, pendientes }
    }

    const resumen = calcularResumen()

    if (isLoading) {
        return (
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Servicios del Evento
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">
                        Cargando servicios...
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="mb-6">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Servicios del Evento
                    </CardTitle>
                    {onAgregarServicio && (
                        <Button onClick={onAgregarServicio} size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Agregar Servicio
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Resumen de Servicios */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-700">
                            {servicios.cantidad}
                        </div>
                        <div className="text-sm text-blue-600">Total</div>
                    </div>

                    <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-700">
                            {resumen.completados}
                        </div>
                        <div className="text-sm text-green-600">Completados</div>
                    </div>

                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-700">
                            {resumen.enProgreso}
                        </div>
                        <div className="text-sm text-blue-600">En Progreso</div>
                    </div>

                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-700">
                            {resumen.pendientes}
                        </div>
                        <div className="text-sm text-yellow-600">Pendientes</div>
                    </div>
                </div>

                {/* Valor Total */}
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Valor Total de Servicios</p>
                    <p className="text-3xl font-bold text-gray-900">
                        {formatearMoneda(resumen.total)}
                    </p>
                </div>

                {/* Lista de Servicios */}
                {servicios.lista.length > 0 ? (
                    <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Lista de Servicios</h4>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {servicios.lista.map((servicio) => {
                                const statusConfig = obtenerStatusConfig(servicio.status)
                                const StatusIcon = statusConfig.icon

                                return (
                                    <div
                                        key={servicio.id}
                                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <StatusIcon className={`h-5 w-5 ${statusConfig.text}`} />
                                            <div className="flex-1">
                                                <h5 className="font-medium text-gray-900">
                                                    {servicio.nombre}
                                                </h5>
                                                <p className="text-sm text-gray-600">
                                                    {formatearMoneda(servicio.precio)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Badge className={`${statusConfig.bg} ${statusConfig.text} text-xs`}>
                                                {servicio.status.charAt(0).toUpperCase() + servicio.status.slice(1).replace('_', ' ')}
                                            </Badge>

                                            {onEditarServicio && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onEditarServicio(servicio.id)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No hay servicios asociados</p>
                        <p className="text-sm mt-1">
                            {onAgregarServicio ?
                                'Haz clic en "Agregar Servicio" para comenzar' :
                                'Este evento aún no tiene servicios configurados'
                            }
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
