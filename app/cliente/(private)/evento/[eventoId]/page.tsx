'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import ServiciosContratados from './components/ServiciosContratados'
import ResumenPago from './components/ResumenPago'
import { useClienteAuth } from '../../../hooks'
import { obtenerEventoDetalle } from '../../../_lib/actions'
import type { EventoDetalle } from '../../../_lib/types'
import { EventoContentSkeleton } from '@/app/cliente/components/ui/skeleton'
import {
    CalendarDays,
    MapPin,
    Users,
    Clock,
    ArrowLeft,
    Package,
    FileText,
    Phone,
    Mail,
    Edit,
    Tag,
    Layers,
    Receipt,
    CheckCircle,
    XCircle
} from 'lucide-react'

export default function EventoDetalle() {
    const [evento, setEvento] = useState<EventoDetalle | null>(null)
    const [loading, setLoading] = useState(true)
    const [showNotification, setShowNotification] = useState(false)
    const [notificationMessage, setNotificationMessage] = useState('')
    const [notificationType, setNotificationType] = useState<'success' | 'error' | 'warning'>('success')

    const { cliente, isAuthenticated } = useClienteAuth()
    const router = useRouter()
    const params = useParams()
    const searchParams = useSearchParams()
    const eventoId = params?.eventoId as string

    useEffect(() => {
        if (!isAuthenticated || !cliente) {
            return // El useClienteAuth ya maneja la redirección
        }

        const fetchEvento = async () => {
            try {
                const result = await obtenerEventoDetalle(eventoId)
                if (result.success && result.data) {
                    setEvento(result.data)
                } else {
                    console.error('Error al cargar evento:', result.message)
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
    }, [eventoId, isAuthenticated, cliente])

    // Manejar notificaciones de pago
    useEffect(() => {
        if (!searchParams) return

        const pagoExitoso = searchParams.get('pagoExitoso')
        const pagoPendiente = searchParams.get('pagoPendiente')
        const pagoError = searchParams.get('pagoError')
        const message = searchParams.get('message')
        const pagoId = searchParams.get('pagoId')

        if (pagoExitoso === 'true') {
            setNotificationType('success')
            setNotificationMessage(`¡Pago procesado exitosamente! ID: ${pagoId || 'N/A'}`)
            setShowNotification(true)
            // Limpiar URL
            const url = new URL(window.location.href)
            url.searchParams.delete('pagoExitoso')
            url.searchParams.delete('pagoId')
            window.history.replaceState({}, '', url.toString())
        } else if (pagoPendiente === 'true') {
            setNotificationType('warning')
            setNotificationMessage(`Pago registrado como pendiente. ID: ${pagoId || 'N/A'}`)
            setShowNotification(true)
            // Limpiar URL
            const url = new URL(window.location.href)
            url.searchParams.delete('pagoPendiente')
            url.searchParams.delete('pagoId')
            window.history.replaceState({}, '', url.toString())
        } else if (pagoError === 'true') {
            setNotificationType('error')
            setNotificationMessage(message ? decodeURIComponent(message) : 'Error al procesar el pago')
            setShowNotification(true)
            // Limpiar URL
            const url = new URL(window.location.href)
            url.searchParams.delete('pagoError')
            url.searchParams.delete('message')
            window.history.replaceState({}, '', url.toString())
        }

        // Auto-ocultar notificación después de 5 segundos
        if (pagoExitoso || pagoPendiente || pagoError) {
            setTimeout(() => {
                setShowNotification(false)
            }, 5000)
        }
    }, [searchParams])

    const formatFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        })
    }

    if (!isAuthenticated || loading) {
        return <EventoContentSkeleton />
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
                            onClick={() => router.push('/cliente/dashboard')}
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
            {/* Notificación de pago */}
            {showNotification && (
                <div className={`fixed top-4 right-4 z-50 max-w-sm w-full ${notificationType === 'success' ? 'bg-green-600' :
                    notificationType === 'warning' ? 'bg-yellow-600' : 'bg-red-600'
                    } text-white p-4 rounded-lg shadow-lg`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            {notificationType === 'success' && <CheckCircle className="h-5 w-5 mr-2" />}
                            {notificationType === 'warning' && <Clock className="h-5 w-5 mr-2" />}
                            {notificationType === 'error' && <XCircle className="h-5 w-5 mr-2" />}
                            <span className="font-medium">{notificationMessage}</span>
                        </div>
                        <button
                            onClick={() => setShowNotification(false)}
                            className="ml-2 text-white hover:text-gray-200"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-zinc-900 shadow-sm border-b border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6 space-y-4">
                        {/* Línea 1: botón regresar | editar (evento) */}
                        <div className="flex items-center justify-between">
                            <Button
                                variant="ghost"
                                onClick={() => router.push('/cliente/dashboard')}
                                className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver
                            </Button>
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => router.push(`/cliente/evento/${evento.id}/pagos`)}
                                    variant="outline"
                                    size="sm"
                                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                >
                                    <Receipt className="h-4 w-4 mr-2" />
                                    Historial de Pagos
                                </Button>
                                <Button
                                    onClick={() => router.push(`/cliente/evento/${eventoId}/editar`)}
                                    variant="outline"
                                    size="sm"
                                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                </Button>
                            </div>
                        </div>

                        {/* Línea 2: Nombre evento, fecha evento, tipo de evento, etapa del evento */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-zinc-500 mb-1">Nombre del evento</p>
                                <h1 className="text-xl font-bold text-zinc-100">{evento.nombre}</h1>
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500 mb-1">Fecha del evento</p>
                                <p className="text-zinc-300">{formatFecha(evento.fecha_evento)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500 mb-1">Tipo de evento</p>
                                <p className="text-zinc-300">{evento.eventoTipo?.nombre || 'No especificado'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500 mb-1">Etapa del evento</p>
                                <Badge variant="secondary" className="bg-zinc-800 text-zinc-200">
                                    {evento.eventoEtapa?.nombre || 'No especificado'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Información del Evento */}
                    {/* Servicios */}
                    <ServiciosContratados servicios={evento.cotizacion.servicios} />


                    {/* Resumen de Pago */}
                    <div className="space-y-6">
                        <ResumenPago evento={evento} />

                        {/* Información de Contacto */}
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="flex items-center text-zinc-100">
                                    <Phone className="h-5 w-5 mr-2" />
                                    Información de Contacto
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-sm">
                                    <p className="text-zinc-400 mb-2">
                                        ¿Tienes dudas sobre tu evento? Contáctanos:
                                    </p>
                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <Phone className="h-4 w-4 mr-2 text-zinc-500" />
                                            <span className="text-zinc-300">+52 55 1234 5678</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Mail className="h-4 w-4 mr-2 text-zinc-500" />
                                            <span className="text-zinc-300">hola@prosocial.com.mx</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
