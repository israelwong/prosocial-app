'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import {
    Settings,
    Edit3,
    FileText,
    Download,
    Share,
    Printer,
    MoreVertical
} from "lucide-react"

interface AccionesRapidasV3Props {
    eventoId: string
    cotizacionId?: string
    onEditarEvento?: () => void
    onGenerarContrato?: () => void
    onDescargarReporte?: () => void
    onCompartirEvento?: () => void
    onImprimirResumen?: () => void
    onConfiguracionAvanzada?: () => void
    isLoading?: boolean
}

export function AccionesRapidasV3({
    eventoId,
    cotizacionId,
    onEditarEvento,
    onGenerarContrato,
    onDescargarReporte,
    onCompartirEvento,
    onImprimirResumen,
    onConfiguracionAvanzada,
    isLoading = false
}: AccionesRapidasV3Props) {

    if (isLoading) {
        return (
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Acciones Rápidas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">
                        Cargando acciones...
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Acciones Rápidas
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Acciones Principales */}
                <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 text-sm">Acciones Principales</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {onEditarEvento && (
                            <Button
                                onClick={onEditarEvento}
                                variant="outline"
                                className="justify-start gap-2 h-auto p-3"
                            >
                                <Edit3 className="h-4 w-4" />
                                <div className="text-left">
                                    <div className="font-medium">Editar Evento</div>
                                    <div className="text-xs text-gray-500">Modificar información básica</div>
                                </div>
                            </Button>
                        )}

                        {onGenerarContrato && cotizacionId && (
                            <Button
                                onClick={onGenerarContrato}
                                variant="outline"
                                className="justify-start gap-2 h-auto p-3"
                            >
                                <FileText className="h-4 w-4" />
                                <div className="text-left">
                                    <div className="font-medium">Generar Contrato</div>
                                    <div className="text-xs text-gray-500">Crear documento oficial</div>
                                </div>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Acciones de Documentos */}
                <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 text-sm">Documentos y Reportes</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {onDescargarReporte && (
                            <Button
                                onClick={onDescargarReporte}
                                variant="outline"
                                className="justify-start gap-2 h-auto p-3"
                            >
                                <Download className="h-4 w-4" />
                                <div className="text-left">
                                    <div className="font-medium">Descargar Reporte</div>
                                    <div className="text-xs text-gray-500">Reporte completo del evento</div>
                                </div>
                            </Button>
                        )}

                        {onImprimirResumen && (
                            <Button
                                onClick={onImprimirResumen}
                                variant="outline"
                                className="justify-start gap-2 h-auto p-3"
                            >
                                <Printer className="h-4 w-4" />
                                <div className="text-left">
                                    <div className="font-medium">Imprimir Resumen</div>
                                    <div className="text-xs text-gray-500">Resumen para archivo físico</div>
                                </div>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Acciones de Colaboración */}
                <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 text-sm">Colaboración</h4>
                    <div className="grid grid-cols-1 gap-3">
                        {onCompartirEvento && (
                            <Button
                                onClick={onCompartirEvento}
                                variant="outline"
                                className="justify-start gap-2 h-auto p-3"
                            >
                                <Share className="h-4 w-4" />
                                <div className="text-left">
                                    <div className="font-medium">Compartir Evento</div>
                                    <div className="text-xs text-gray-500">Enviar información a colaboradores</div>
                                </div>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Configuración Avanzada */}
                {onConfiguracionAvanzada && (
                    <div className="pt-4 border-t border-gray-200">
                        <Button
                            onClick={onConfiguracionAvanzada}
                            variant="ghost"
                            className="w-full justify-start gap-2 h-auto p-3 text-gray-600 hover:text-gray-900"
                        >
                            <MoreVertical className="h-4 w-4" />
                            <div className="text-left">
                                <div className="font-medium">Configuración Avanzada</div>
                                <div className="text-xs text-gray-500">Opciones adicionales del evento</div>
                            </div>
                        </Button>
                    </div>
                )}

                {/* Información de Estado */}
                <div className="pt-4 border-t border-gray-200 space-y-2">
                    <h4 className="font-medium text-gray-900 text-sm">Información del Sistema</h4>
                    <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
                        <div className="flex justify-between">
                            <span>ID del Evento:</span>
                            <span className="font-mono">{eventoId.slice(-8)}</span>
                        </div>
                        {cotizacionId && (
                            <div className="flex justify-between">
                                <span>ID de Cotización:</span>
                                <span className="font-mono">{cotizacionId.slice(-8)}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span>Última Actualización:</span>
                            <span>{new Date().toLocaleDateString('es-ES')}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
