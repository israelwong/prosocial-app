'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import ServiciosPortalCliente from '../../components/ServiciosPortalCliente'
import {
    CalendarDays,
    MapPin,
    Users,
    Clock,
    CreditCard,
    ArrowLeft,
    Package,
    FileText,
    Phone,
    Mail
} from 'lucide-react'

interface EventoDetalle {
    id: string
    nombre: string
    fecha_evento: string
    hora_evento: string
    numero_invitados: number
    lugar: string
    cotizacion: {
        id: string
        status: string
        total: number
        pagado: number
        descripcion?: string
        servicios: Array<{
            id: string
            nombre: string
            cantidad: number
            precio_unitario?: number
            subtotal?: number
            seccion?: string
            categoria?: string
            seccionPosicion?: number
            categoriaPosicion?: number
            posicion?: number
        }>
    }
}

export default function EventoDetalle() {
    const [evento, setEvento] = useState<EventoDetalle | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const params = useParams()
    const eventoId = params?.eventoId as string

    useEffect(() => {
        const fetchEvento = async () => {
            try {
                const clienteData = sessionStorage.getItem('cliente-data')
                if (!clienteData) {
                    router.push('/cliente-portal/auth/login')
                    return
                }

                const response = await fetch(`/api/cliente-portal/evento/${eventoId}`)
                if (response.ok) {
                    const data = await response.json()
                    setEvento(data.evento)
                } else {
                    console.error('Error al cargar evento')
                }
            } catch (error) {
                console.error('Error al cargar evento:', error)
            } finally {
                setLoading(false)
            }
        }

        if (eventoId) {
            fetchEvento()
        }
    }, [eventoId, router])

    const formatFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        })
    }

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'aprobada':
                return 'bg-green-900/20 text-green-300 border-green-800'
            case 'enviada':
                return 'bg-amber-900/20 text-amber-300 border-amber-800'
            case 'cancelada':
                return 'bg-red-900/20 text-red-300 border-red-800'
            default:
                return 'bg-zinc-800 text-zinc-400 border-zinc-700'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'aprobada':
                return 'Cotización Aprobada'
            case 'enviada':
                return 'Cotización Pendiente'
            case 'cancelada':
                return 'Cotización Cancelada'
            default:
                return status
        }
    }

    const getSaldoPendiente = (total: number, pagado: number) => {
        return total - pagado
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
                    <p className="mt-4 text-zinc-400">Cargando detalles del evento...</p>
                </div>
            </div>
        )
    }

    if (!evento) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <Card className="max-w-md mx-auto bg-zinc-900 border-zinc-800">
                    <CardContent className="text-center py-12">
                        <FileText className="mx-auto h-12 w-12 text-zinc-500 mb-4" />
                        <h3 className="text-lg font-medium text-zinc-100 mb-2">
                            Evento no encontrado
                        </h3>
                        <p className="text-zinc-400 mb-4">
                            No se pudo cargar la información del evento.
                        </p>
                        <Button
                            onClick={() => router.push('/cliente-portal/dashboard')}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Volver al Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-950">
            <div className="bg-zinc-900 shadow-sm border-b border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center py-6">
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/cliente-portal/dashboard')}
                            className="mr-4 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Button>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-zinc-100">{evento.nombre}</h1>
                            <p className="text-zinc-400">Detalles del evento</p>
                        </div>
                        <Badge className={`${getStatusColor(evento.cotizacion.status)} text-sm`}>
                            {getStatusText(evento.cotizacion.status)}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Información del Evento */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="flex items-center text-zinc-100">
                                    <CalendarDays className="h-5 w-5 mr-2" />
                                    Información del Evento
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="flex items-center text-sm">
                                        <CalendarDays className="h-4 w-4 mr-3 text-zinc-500" />
                                        <div>
                                            <p className="font-medium text-zinc-300">Fecha</p>
                                            <p className="text-zinc-400">{formatFecha(evento.fecha_evento)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center text-sm">
                                        <Clock className="h-4 w-4 mr-3 text-zinc-500" />
                                        <div>
                                            <p className="font-medium text-zinc-300">Hora</p>
                                            <p className="text-zinc-400">{evento.hora_evento}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center text-sm">
                                        <Users className="h-4 w-4 mr-3 text-zinc-500" />
                                        <div>
                                            <p className="font-medium text-zinc-300">Invitados</p>
                                            <p className="text-zinc-400">{evento.numero_invitados} personas</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center text-sm">
                                        <MapPin className="h-4 w-4 mr-3 text-zinc-500" />
                                        <div>
                                            <p className="font-medium text-zinc-300">Lugar</p>
                                            <p className="text-zinc-400">{evento.lugar}</p>
                                        </div>
                                    </div>
                                </div>

                                {evento.cotizacion.descripcion && (
                                    <div className="mt-6 pt-6 border-t border-zinc-800">
                                        <h4 className="font-medium mb-2 text-zinc-300">Descripción</h4>
                                        <p className="text-zinc-400 text-sm leading-relaxed">
                                            {evento.cotizacion.descripcion}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Servicios Incluidos */}
                        <ServiciosPortalCliente
                            servicios={evento.cotizacion.servicios}
                            loading={loading}
                        />
                    </div>

                    {/* Resumen de Pago */}
                    <div className="space-y-6">
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="flex items-center text-zinc-100">
                                    <CreditCard className="h-5 w-5 mr-2" />
                                    Resumen de Pago
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Total:</span>
                                        <span className="font-semibold text-zinc-100">{formatMoney(evento.cotizacion.total)}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Pagado:</span>
                                        <span className="font-semibold text-green-400">
                                            {formatMoney(evento.cotizacion.pagado)}
                                        </span>
                                    </div>

                                    <div className="border-t border-zinc-800 pt-3">
                                        <div className="flex justify-between">
                                            <span className="text-zinc-400">Saldo pendiente:</span>
                                            <span className={`font-semibold ${getSaldoPendiente(evento.cotizacion.total, evento.cotizacion.pagado) > 0
                                                ? 'text-yellow-400'
                                                : 'text-green-400'
                                                }`}>
                                                {formatMoney(getSaldoPendiente(evento.cotizacion.total, evento.cotizacion.pagado))}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {evento.cotizacion.status === 'aprobada' &&
                                    getSaldoPendiente(evento.cotizacion.total, evento.cotizacion.pagado) > 0 && (
                                        <Button
                                            className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
                                            onClick={() => router.push(`/cliente-portal/pago/${evento.cotizacion.id}`)}
                                        >
                                            <CreditCard className="h-4 w-4 mr-2" />
                                            Realizar Pago
                                        </Button>
                                    )}
                            </CardContent>
                        </Card>

                        {/* Contacto */}
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-zinc-100">¿Necesitas ayuda?</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center text-sm">
                                    <Phone className="h-4 w-4 mr-3 text-zinc-500" />
                                    <div>
                                        <p className="font-medium text-zinc-300">Teléfono</p>
                                        <p className="text-zinc-400">+52 55 1234 5678</p>
                                    </div>
                                </div>

                                <div className="flex items-center text-sm">
                                    <Mail className="h-4 w-4 mr-3 text-zinc-500" />
                                    <div>
                                        <p className="font-medium text-zinc-300">Email</p>
                                        <p className="text-zinc-400">contacto@prosocial.mx</p>
                                    </div>
                                </div>

                                <Button variant="outline" className="w-full mt-4 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
                                    Contactar Equipo
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
