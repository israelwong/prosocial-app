'use client'
import React from 'react'
import { Button } from '@/app/components/ui/button'
import { formatearFecha } from '@/app/admin/_lib/utils/fechas'
import {
    Calendar,
    User,
    MessageCircle,
    Settings,
    X,
    Phone,
    MapPin,
    Clock
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
            <div className="container mx-auto px-4 py-4">
                {/* Información Principal */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                        {/* Cliente y Evento */}
                        <div className="flex items-center gap-3 mb-2">
                            <User className="h-5 w-5 text-zinc-400 flex-shrink-0" />
                            <h1 className="text-xl font-bold text-zinc-100 truncate">
                                {eventoData.nombreCliente}
                            </h1>
                            <span className={`px-2 py-1 rounded-md text-xs border ${getStatusColor(eventoData.nombreEtapa)}`}>
                                {eventoData.nombreEtapa}
                            </span>
                        </div>

                        <div className="flex items-center gap-3 text-zinc-300">
                            <Calendar className="h-4 w-4 text-zinc-500" />
                            <span className="text-lg font-medium truncate">
                                {eventoData.nombreEvento}
                            </span>
                        </div>
                    </div>

                    {/* Acciones Rápidas */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {puedeGestionarEvento && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onGestionarEvento}
                                className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                            >
                                <Settings className="h-4 w-4 mr-2" />
                                Gestionar {eventoData.nombreEtapa}
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onAbrirConversacion}
                            className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                        >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            WhatsApp
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onCerrar}
                            className="bg-zinc-700 hover:bg-zinc-600 text-zinc-200 border-zinc-600"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cerrar
                        </Button>
                    </div>
                </div>

                {/* Información Secundaria */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                    {eventoData.fechaEvento && (
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>
                                {eventoData.fechaEvento ?
                                    formatearFecha(eventoData.fechaEvento, {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }) :
                                    'Fecha por definir'
                                }
                            </span>
                        </div>
                    )}

                    {eventoData.telefono && (
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{eventoData.telefono}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className={eventoData.eventoAsignado ? 'text-green-400' : 'text-yellow-400'}>
                            {eventoData.eventoAsignado ? 'Evento asignado' : 'Sin asignar'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
