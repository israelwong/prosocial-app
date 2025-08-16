'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Button } from "@/app/components/ui/button"
import {
    ClipboardList,
    CheckCircle,
    Clock,
    AlertTriangle,
    FileText,
    Calendar,
    User,
    Plus,
    Eye
} from "lucide-react"

interface BitacoraEventosV3Props {
    eventoId: string
    bitacora?: Array<{
        id: string
        fecha: string
        tipo: string
        titulo: string
        descripcion: string
        usuario?: string
        status?: string
    }>
    onAgregarEntrada?: () => void
    onVerDetalle?: (entradaId: string) => void
    isLoading?: boolean
}

const ENTRADA_TIPOS_STYLES = {
    'nota': { bg: 'bg-blue-100', text: 'text-blue-800', icon: FileText },
    'llamada': { bg: 'bg-green-100', text: 'text-green-800', icon: Clock },
    'reunion': { bg: 'bg-purple-100', text: 'text-purple-800', icon: Calendar },
    'tarea': { bg: 'bg-orange-100', text: 'text-orange-800', icon: ClipboardList },
    'problema': { bg: 'bg-red-100', text: 'text-red-800', icon: AlertTriangle },
    'completado': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle }
} as const

export function BitacoraEventosV3({
    eventoId,
    bitacora = [],
    onAgregarEntrada,
    onVerDetalle,
    isLoading = false
}: BitacoraEventosV3Props) {
    const obtenerTipoConfig = (tipo: string) => {
        return ENTRADA_TIPOS_STYLES[tipo as keyof typeof ENTRADA_TIPOS_STYLES]
            || ENTRADA_TIPOS_STYLES.nota
    }

    const formatearFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const calcularResumen = () => {
        const total = bitacora.length
        const completadas = bitacora.filter(b => b.tipo === 'completado').length
        const pendientes = bitacora.filter(b => b.tipo === 'tarea').length
        const problemas = bitacora.filter(b => b.tipo === 'problema').length

        return { total, completadas, pendientes, problemas }
    }

    const resumen = calcularResumen()

    if (isLoading) {
        return (
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5" />
                        Bitácora del Evento
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">
                        Cargando bitácora...
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
                        <ClipboardList className="h-5 w-5" />
                        Bitácora del Evento
                    </CardTitle>
                    {onAgregarEntrada && (
                        <Button onClick={onAgregarEntrada} size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Nueva Entrada
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Resumen de Actividades */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-700">
                            {resumen.total}
                        </div>
                        <div className="text-sm text-blue-600">Total Entradas</div>
                    </div>

                    <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-700">
                            {resumen.completadas}
                        </div>
                        <div className="text-sm text-green-600">Completadas</div>
                    </div>

                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-700">
                            {resumen.pendientes}
                        </div>
                        <div className="text-sm text-orange-600">Tareas Pendientes</div>
                    </div>

                    <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-700">
                            {resumen.problemas}
                        </div>
                        <div className="text-sm text-red-600">Problemas</div>
                    </div>
                </div>

                {/* Lista de Entradas */}
                {bitacora.length > 0 ? (
                    <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Actividades Recientes</h4>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {bitacora.slice().reverse().map((entrada) => {
                                const tipoConfig = obtenerTipoConfig(entrada.tipo)
                                const TipoIcon = tipoConfig.icon

                                return (
                                    <div
                                        key={entrada.id}
                                        className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                                    >
                                        <div className="flex-shrink-0">
                                            <div className={`p-2 rounded-full ${tipoConfig.bg}`}>
                                                <TipoIcon className={`h-4 w-4 ${tipoConfig.text}`} />
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h5 className="font-medium text-gray-900 mb-1">
                                                        {entrada.titulo}
                                                    </h5>
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        {entrada.descripcion}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>{formatearFecha(entrada.fecha)}</span>
                                                        </div>
                                                        {entrada.usuario && (
                                                            <div className="flex items-center gap-1">
                                                                <User className="h-3 w-3" />
                                                                <span>{entrada.usuario}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 ml-4">
                                                    <Badge className={`${tipoConfig.bg} ${tipoConfig.text} text-xs`}>
                                                        {entrada.tipo.charAt(0).toUpperCase() + entrada.tipo.slice(1)}
                                                    </Badge>

                                                    {onVerDetalle && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => onVerDetalle(entrada.id)}
                                                            className="h-8 w-8 p-0"
                                                            title="Ver detalles"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No hay entradas en la bitácora</p>
                        <p className="text-sm mt-1">
                            {onAgregarEntrada ?
                                'Haz clic en "Nueva Entrada" para agregar la primera actividad' :
                                'Este evento aún no tiene actividades registradas'
                            }
                        </p>
                    </div>
                )}

                {/* Notificaciones de Tareas Pendientes */}
                {resumen.pendientes > 0 && (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                            <div>
                                <p className="font-medium text-orange-800">
                                    Tienes {resumen.pendientes} tarea(s) pendiente(s)
                                </p>
                                <p className="text-sm text-orange-600">
                                    Revisa las actividades marcadas como "tarea" que requieren atención
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notificaciones de Problemas */}
                {resumen.problemas > 0 && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            <div>
                                <p className="font-medium text-red-800">
                                    {resumen.problemas} problema(s) reportado(s)
                                </p>
                                <p className="text-sm text-red-600">
                                    Hay problemas que requieren resolución inmediata
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
