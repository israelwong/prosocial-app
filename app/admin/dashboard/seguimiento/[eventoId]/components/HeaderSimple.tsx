'use client'

import { Card, CardContent } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Calendar, User, FileText, Edit, MapPin, Copy, Check, Phone } from "lucide-react"
import { WhatsAppIcon } from "@/app/components/ui/WhatsAppIcon"
import Link from "next/link"
import { formatearFecha, formatearFechaCorta, esFechaValida } from "@/app/admin/_lib/utils/fechas"
import { useState } from "react"

interface HeaderSimpleProps {
    eventoNombre: string
    eventoId: string
    clienteNombre?: string
    clienteTelefono?: string
    tipoEvento?: string
    etapa?: string
    fechaEvento?: Date | string
}

export function HeaderSimple({
    eventoNombre,
    eventoId,
    clienteNombre,
    clienteTelefono,
    tipoEvento,
    etapa,
    fechaEvento
}: HeaderSimpleProps) {

    const [copiado, setCopiado] = useState(false)

    const formatearFechaEvento = (fecha?: Date | string) => {
        if (!fecha) return 'Fecha no definida'
        if (!esFechaValida(fecha)) return 'Fecha no válida'
        return formatearFecha(fecha)
    }

    const formatearFechaEventoCorta = (fecha?: Date | string) => {
        if (!fecha) return 'Sin fecha'
        if (!esFechaValida(fecha)) return 'Fecha no válida'
        return formatearFechaCorta(fecha)
    }

    const abrirWhatsApp = () => {
        const mensaje = encodeURIComponent(`Hola ${clienteNombre || 'estimado cliente'}`)
        const url = `https://wa.me/?text=${mensaje}`
        window.open(url, '_blank')
    }

    const copiarTelefono = async () => {
        if (!clienteTelefono) return

        // Remover espacios, guiones y paréntesis del teléfono
        const telefonoLimpio = clienteTelefono.replace(/[\s\-\(\)]/g, '')

        try {
            await navigator.clipboard.writeText(telefonoLimpio)
            setCopiado(true)
            setTimeout(() => setCopiado(false), 2000) // Resetear después de 2 segundos
        } catch (err) {
            console.error('Error al copiar el teléfono:', err)
        }
    }

    return (
        <Card className="bg-zinc-900 border-zinc-800 mb-6">
            <CardContent className="p-6">
                {/* Header Principal */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-zinc-100 mb-2">
                            {eventoNombre || 'Evento sin nombre'}
                        </h1>
                        <p className="text-sm text-zinc-400">
                            ID: {eventoId}
                        </p>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex items-center gap-3">
                        <Link href={`/admin/dashboard/eventos/${eventoId}`}>
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Información Principal - Diseño más visual */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Cliente con botón WhatsApp */}
                    <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-blue-400" />
                                <span className="text-sm font-medium text-zinc-300">Cliente</span>
                            </div>
                            {clienteNombre && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={abrirWhatsApp}
                                    className="h-10 w-10 p-0 text-green-500 hover:text-green-400 hover:bg-green-500/10 rounded-full"
                                    title="Contactar por WhatsApp"
                                >
                                    <WhatsAppIcon size={20} />
                                </Button>
                            )}
                        </div>
                        <p className="text-lg font-semibold text-zinc-100">
                            {clienteNombre || 'No asignado'}
                        </p>

                        {/* Teléfono del cliente dentro de la misma ficha */}
                        {clienteTelefono && (
                            <div
                                className="flex items-center gap-2 cursor-pointer hover:bg-zinc-700/30 p-1 rounded transition-colors"
                                onClick={copiarTelefono}
                                title="Hacer clic para copiar teléfono"
                            >
                                <Phone className="h-3 w-3 text-green-400" />
                                <span className="text-xs text-zinc-400">
                                    {clienteTelefono}
                                </span>
                                {copiado && (
                                    <span className="text-xs text-green-400 font-medium ml-2">¡Copiado!</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Fecha del evento */}
                    <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-5 w-5 text-yellow-400" />
                            <span className="text-sm font-medium text-zinc-300">Fecha</span>
                        </div>
                        <p className="text-lg font-semibold text-zinc-100">
                            {formatearFechaEventoCorta(fechaEvento)}
                        </p>
                        <p className="text-xs text-zinc-400 mt-1">
                            {formatearFechaEvento(fechaEvento)}
                        </p>
                    </div>

                    {/* Tipo de evento */}
                    <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                        <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-5 w-5 text-purple-400" />
                            <span className="text-sm font-medium text-zinc-300">Tipo</span>
                        </div>
                        <p className="text-lg font-semibold text-zinc-100">
                            {tipoEvento || 'No definido'}
                        </p>
                    </div>

                    {/* Etapa del evento - Solo si existe */}
                    {etapa && (
                        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                            <div className="flex items-center gap-2 mb-2">
                                <MapPin className="h-5 w-5 text-orange-400" />
                                <span className="text-sm font-medium text-zinc-300">Etapa</span>
                            </div>
                            <p className="text-lg font-semibold text-orange-400">
                                {etapa}
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
