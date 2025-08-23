'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import ServiciosPortalCliente from '../../../components/ServiciosPortalCliente'
import ModalEditarEvento, { EventoEditData } from '../../../components/ModalEditarEvento'
import { useClienteAuth } from '../../../hooks'
import { obtenerEventoDetalle, editarEvento } from '../../../_lib/actions'
import type { EventoDetalle } from '../../../_lib/types'
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
    const [modalEditOpen, setModalEditOpen] = useState(false)
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

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount)
    }

    const handleEditEvento = async (datos: EventoEditData) => {
        try {
            const result = await editarEvento(eventoId, datos)
            if (result.success) {
                // Actualizar el evento local
                setEvento(prev => prev ? {
                    ...prev,
                    nombre: datos.nombre,
                    direccion: datos.direccion,
                    sede: datos.sede
                } : null)

                setModalEditOpen(false)
            } else {
                throw new Error(result.message || 'Error al editar evento')
            }
        } catch (error) {
            console.error('Error al editar evento:', error)
            throw error
        }
    }

    const getSaldoPendiente = (total: number, pagado: number) => {
        return total - pagado
    }

    if (!isAuthenticated || loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
                    <p className="mt-4 text-zinc-400">
                        {!isAuthenticated ? 'Verificando autenticación...' : 'Cargando detalles del evento...'}
                    </p>
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
                    <div className="flex items-center py-6">
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/cliente/dashboard')}
                            className="mr-4 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Button>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-zinc-100">{evento.nombre}</h1>
                            <p className="text-zinc-400">Detalles del evento</p>
                        </div>
                        {/* Botones de acción */}
                        <div className="flex gap-3">
                            <Button
                                onClick={() => router.push(`/cliente/evento/${evento.id}/pagos`)}
                                variant="outline"
                                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                            >
                                <Receipt className="h-4 w-4 mr-2" />
                                Ver Historial de Pagos
                            </Button>
                            <Button
                                onClick={() => setModalEditOpen(true)}
                                variant="outline"
                                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar evento
                            </Button>
                        </div>
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
                                        <MapPin className="h-4 w-4 mr-3 text-zinc-500" />
                                        <div>
                                            <p className="font-medium text-zinc-300">Ubicación</p>
                                            <p className="text-zinc-400">{evento.lugar || 'No especificado'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center text-sm">
                                        <Users className="h-4 w-4 mr-3 text-zinc-500" />
                                        <div>
                                            <p className="font-medium text-zinc-300">Invitados</p>
                                            <p className="text-zinc-400">{evento.numero_invitados} personas</p>
                                        </div>
                                    </div>

                                    {/* Nuevos campos: Tipo y Etapa del evento */}
                                    {evento.eventoTipo && (
                                        <div className="flex items-center text-sm">
                                            <Tag className="h-4 w-4 mr-3 text-zinc-500" />
                                            <div>
                                                <p className="font-medium text-zinc-300">Tipo de evento</p>
                                                <p className="text-zinc-400">{evento.eventoTipo.nombre}</p>
                                            </div>
                                        </div>
                                    )}

                                    {evento.eventoEtapa && (
                                        <div className="flex items-center text-sm">
                                            <Layers className="h-4 w-4 mr-3 text-zinc-500" />
                                            <div>
                                                <p className="font-medium text-zinc-300">Etapa del evento</p>
                                                <p className="text-zinc-400">{evento.eventoEtapa.nombre}</p>
                                            </div>
                                        </div>
                                    )}

                                    {evento.direccion && (
                                        <div className="flex items-start text-sm md:col-span-2">
                                            <MapPin className="h-4 w-4 mr-3 text-zinc-500 mt-0.5" />
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-zinc-300">Dirección</p>
                                                <p className="text-zinc-400 break-words">{evento.direccion}</p>
                                            </div>
                                        </div>
                                    )}

                                    {evento.sede && (
                                        <div className="flex items-start text-sm md:col-span-2">
                                            <Package className="h-4 w-4 mr-3 text-zinc-500 mt-0.5" />
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-zinc-300">Sede</p>
                                                <p className="text-zinc-400 break-words">{evento.sede}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Servicios */}
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="flex items-center text-zinc-100">
                                    <Package className="h-5 w-5 mr-2" />
                                    Servicios Contratados
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ServiciosPortalCliente servicios={evento.cotizacion.servicios} />
                            </CardContent>
                        </Card>
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
                                    <div className="flex justify-between py-2">
                                        <span className="text-zinc-400">Total del evento:</span>
                                        <span className="font-semibold text-zinc-100">
                                            {formatMoney(evento.cotizacion.total)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="text-zinc-400">Pagado:</span>
                                        <span className="font-semibold text-green-400">
                                            {formatMoney(evento.cotizacion.pagado)}
                                        </span>
                                    </div>
                                    <div className="border-t border-zinc-700 pt-3">
                                        <div className="flex justify-between py-2">
                                            <span className="text-zinc-300 font-medium">Saldo pendiente:</span>
                                            <span className="font-bold text-amber-400">
                                                {formatMoney(getSaldoPendiente(evento.cotizacion.total, evento.cotizacion.pagado))}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {getSaldoPendiente(evento.cotizacion.total, evento.cotizacion.pagado) > 0 && (
                                    <Button
                                        onClick={() => router.push(`/cliente/evento/${evento.id}/pago/${evento.cotizacion.id}`)}
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                    >
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Realizar Pago
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

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

            {/* Modal para editar evento */}
            <ModalEditarEvento
                evento={evento}
                isOpen={modalEditOpen}
                onClose={() => setModalEditOpen(false)}
                onSave={handleEditEvento}
            />
        </div>
    )
}
