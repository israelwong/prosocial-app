'use client'
import React from 'react'
import { Button } from '@/app/components/ui/button'
import { formatearFecha } from '@/app/admin/_lib/utils/fechas'
import { WhatsAppIcon } from '@/app/components/ui/WhatsAppIcon'
import {
    Calendar,
    User,
    Settings,
    X,
    Clock,
    MapPin
} from 'lucide-react'

interface EventoData {
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

    const getStatusColor = (etapa: string) => {
        switch (etapa.toLowerCase()) {
            case 'nuevo':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            case 'seguimiento':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
            case 'cotizacion':
                return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
            case 'aprobado':
                return 'bg-green-500/20 text-green-400 border-green-500/30'
            case 'completado':
                return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            case 'cancelado':
                return 'bg-red-500/20 text-red-400 border-red-500/30'
            default:
                return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
        }
    }

    const puedeGestionarEvento = eventoData.nombreEtapa !== 'Nuevo' && eventoData.nombreEtapa !== 'Seguimiento'

    return (
        <div className="bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3">
                {/* Header minimalista */}
                <div className="flex items-center justify-between">
                    {/* Información básica */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-zinc-400" />
                            <h1 className="text-lg font-semibold text-zinc-100 truncate">
                                {eventoData.nombreCliente}
                            </h1>
                        </div>

                        <span className={`px-2 py-1 rounded-md text-xs border ${getStatusColor(eventoData.nombreEtapa)}`}>
                            {eventoData.nombreEtapa}
                        </span>

                        {eventoData.fechaEvento && (
                            <div className="flex items-center gap-1 text-sm font-medium text-zinc-200">
                                <Clock className="h-4 w-4" />
                                <span>
                                    {formatearFecha(eventoData.fechaEvento, {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Acciones minimalistas */}
                    <div className="flex items-center gap-2 flex-shrink-0">
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
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
