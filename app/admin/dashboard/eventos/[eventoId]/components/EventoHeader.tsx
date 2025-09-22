'use client'
import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/app/components/ui/button'
import { formatearFecha } from '@/app/admin/_lib/utils/fechas'
import { WhatsAppIcon } from '@/app/components/ui/WhatsAppIcon'
import { validarDisponibilidadFecha } from '@/app/admin/_lib/actions/evento/crearEventoCompleto/crearEventoCompleto.actions'
import type { DisponibilidadFecha } from '@/app/admin/_lib/actions/evento/crearEventoCompleto/crearEventoCompleto.schemas'
import { EVENTO_STATUS } from '@/app/admin/_lib/constants/status'
import ModalCuentasBancarias from './ModalCuentasBancarias'
import {
    Calendar,
    User,
    Settings,
    X,
    Clock,
    MapPin,
    CheckCircle,
    AlertCircle,
    Building2
} from 'lucide-react'

interface EventoData {
    id: string
    clienteId: string
    eventoTipoId: string
    nombreCliente: string
    telefono: string
    nombreEtapa: string
    eventoAsignado: boolean
    nombreEvento: string
    fechaEvento: Date | null
    status: string
}

interface Props {
    eventoData: EventoData
    onAbrirConversacion: () => void
    onCerrar: () => void
    onGestionarEvento: () => void
}

export default function EventoHeader({
    eventoData,
    onAbrirConversacion,
    onCerrar,
    onGestionarEvento
}: Props) {

    const [disponibilidadFecha, setDisponibilidadFecha] = useState<DisponibilidadFecha | null>(null)
    const [cargandoDisponibilidad, setCargandoDisponibilidad] = useState(false)
    const [modalCuentasOpen, setModalCuentasOpen] = useState(false)

    // Verificar disponibilidad de fecha cuando cambie fechaEvento
    useEffect(() => {
        if (eventoData.fechaEvento) {
            setCargandoDisponibilidad(true)
            validarDisponibilidadFecha({
                fecha_evento: eventoData.fechaEvento,
                permitirDuplicada: false
            }).then((resultado) => {
                setDisponibilidadFecha(resultado)
                setCargandoDisponibilidad(false)
            }).catch(() => {
                setCargandoDisponibilidad(false)
            })
        }
    }, [eventoData.fechaEvento])

    const getStatusColor = (etapa: string) => {
        switch (etapa.toLowerCase()) {
            case 'nuevo':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            case 'seguimiento':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
            case 'cotizacion':
                return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
            case EVENTO_STATUS.APROBADO:
                return 'bg-green-500/20 text-green-400 border-green-500/30'
            case EVENTO_STATUS.COMPLETADO:
                return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            case EVENTO_STATUS.CANCELADO:
                return 'bg-red-500/20 text-red-400 border-red-500/30'
            default:
                return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
        }
    }

    const puedeGestionarEvento = eventoData.nombreEtapa !== 'Nuevo' && eventoData.nombreEtapa !== 'Seguimiento'

    const renderEtiquetaDisponibilidad = () => {
        if (cargandoDisponibilidad) {
            return (
                <span className="text-xs text-zinc-400 flex items-center gap-1">
                    <Clock className="h-3 w-3 animate-spin" />
                    Verificando...
                </span>
            )
        }

        if (!disponibilidadFecha || !eventoData.fechaEvento) {
            return null
        }

        // Verificar si hay conflictos con otros eventos
        const hayConflictos = disponibilidadFecha.conflictos && disponibilidadFecha.conflictos.length > 0
        const eventoActualEnConflictos = hayConflictos &&
            disponibilidadFecha.conflictos?.some(conflicto => conflicto.id === eventoData.id)

        if (hayConflictos && !eventoActualEnConflictos) {
            // Fecha ocupada por otro evento
            const conflicto = disponibilidadFecha.conflictos?.[0]
            return (
                <span className="px-2 py-1 rounded-md text-xs border bg-red-500/20 text-red-400 border-red-500/30 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Fecha no disponible ({conflicto?.cliente})
                </span>
            )
        } else if (hayConflictos && eventoActualEnConflictos) {
            // Fecha asignada a este evento
            return (
                <span className="px-2 py-1 rounded-md text-xs border bg-green-500/20 text-green-400 border-green-500/30 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Fecha asignada
                </span>
            )
        } else {
            // Fecha disponible
            return (
                <span className="px-2 py-1 rounded-md text-xs border bg-green-500/20 text-green-400 border-green-500/30 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Fecha aún disponible para agendar
                </span>
            )
        }
    }

    return (
        <div className="bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3 max-w-full">
                {/* Mobile Layout */}
                <div className="flex flex-col gap-3 md:hidden">
                    {/* Row 1: Nombre del cliente y cerrar */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <User className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                            <h1 className="text-lg font-semibold text-zinc-100 truncate">
                                {eventoData.nombreCliente}
                            </h1>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onCerrar}
                            className="bg-zinc-700 hover:bg-zinc-600 text-zinc-200 border-zinc-600 h-8 px-2 flex-shrink-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Row 2: Estado y disponibilidad */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-1 rounded-md text-xs border ${getStatusColor(eventoData.nombreEtapa)}`}>
                            {eventoData.nombreEtapa}
                        </span>
                        {renderEtiquetaDisponibilidad()}
                    </div>

                    {/* Row 3: Botones de acción */}
                    <div className="flex items-center gap-2">
                        {eventoData.telefono && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onAbrirConversacion}
                                className="bg-green-600 hover:bg-green-700 text-white border-green-600 h-8 px-3 flex-1"
                            >
                                <WhatsAppIcon className="h-4 w-4 mr-2" size={16} />
                                <span className="truncate">Hola {eventoData.nombreCliente}</span>
                            </Button>
                        )}

                        {puedeGestionarEvento && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onGestionarEvento}
                                className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 h-8 px-3 flex-shrink-0"
                            >
                                <Settings className="h-4 w-4" />
                                <span className="hidden sm:inline ml-1">Gestionar</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Tablet Layout */}
                <div className="hidden md:flex lg:hidden items-center justify-between gap-4">
                    {/* Información principal */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                            <User className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                            <h1 className="text-lg font-semibold text-zinc-100 truncate">
                                {eventoData.nombreCliente}
                            </h1>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-1 rounded-md text-xs border ${getStatusColor(eventoData.nombreEtapa)}`}>
                                {eventoData.nombreEtapa}
                            </span>
                            {renderEtiquetaDisponibilidad()}
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {eventoData.telefono && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onAbrirConversacion}
                                className="bg-green-600 hover:bg-green-700 text-white border-green-600 h-8 px-3"
                            >
                                <WhatsAppIcon className="h-4 w-4 mr-2" size={16} />
                                WhatsApp
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setModalCuentasOpen(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white border-purple-600 h-8 px-3"
                        >
                            <Building2 className="h-4 w-4 mr-1" />
                            CLABE
                        </Button>

                        {puedeGestionarEvento && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onGestionarEvento}
                                className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 h-8 px-3"
                            >
                                <Settings className="h-4 w-4 mr-1" />
                                Gestionar
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onCerrar}
                            className="bg-zinc-700 hover:bg-zinc-600 text-zinc-200 border-zinc-600 h-8 px-2"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Cerrar
                        </Button>
                    </div>
                </div>

                {/* Desktop Layout (original mejorado) */}
                <div className="hidden lg:flex items-center justify-between gap-6">
                    {/* Información básica */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                            <User className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                            <h1 className="text-lg font-semibold text-zinc-100 truncate">
                                {eventoData.nombreCliente}
                            </h1>
                        </div>

                        <span className={`px-2 py-1 rounded-md text-xs border ${getStatusColor(eventoData.nombreEtapa)} flex-shrink-0`}>
                            {eventoData.nombreEtapa}
                        </span>

                        {/* Etiqueta de disponibilidad */}
                        <div className="flex-shrink-0">
                            {renderEtiquetaDisponibilidad()}
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        {eventoData.telefono && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onAbrirConversacion}
                                className="bg-green-600 hover:bg-green-700 text-white border-green-600 h-8 px-3"
                            >
                                <WhatsAppIcon className="h-4 w-4 mr-2" size={16} />
                                Hola {eventoData.nombreCliente}
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setModalCuentasOpen(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white border-purple-600 h-8 px-3"
                        >
                            <Building2 className="h-4 w-4 mr-1" />
                            Cuenta CLABE
                        </Button>

                        {puedeGestionarEvento && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onGestionarEvento}
                                className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 h-8 px-3"
                            >
                                <Settings className="h-4 w-4 mr-1" />
                                Gestionar
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onCerrar}
                            className="bg-zinc-700 hover:bg-zinc-600 text-zinc-200 border-zinc-600 h-8 px-2"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Cerrar
                        </Button>
                    </div>
                </div>
            </div>

            {/* Modal de Cuentas Bancarias - Renderizado en portal para evitar problemas de posicionamiento */}
            {typeof window !== 'undefined' && createPortal(
                <ModalCuentasBancarias
                    isOpen={modalCuentasOpen}
                    onClose={() => setModalCuentasOpen(false)}
                />,
                document.body
            )}
        </div>
    )
}
