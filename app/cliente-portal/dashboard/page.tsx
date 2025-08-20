'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { CalendarDays, MapPin, Users, Clock, CreditCard, Eye } from 'lucide-react'

interface Evento {
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
    }
}

export default function ClienteDashboard() {
    const [eventos, setEventos] = useState<Evento[]>([])
    const [loading, setLoading] = useState(true)
    const [clienteNombre, setClienteNombre] = useState('')
    const router = useRouter()

    useEffect(() => {
        const fetchEventos = async () => {
            try {
                console.log('📊 Dashboard: Iniciando carga de eventos...') // Debug log
                const clienteData = sessionStorage.getItem('cliente-data')
                console.log('📦 Cliente data from sessionStorage:', clienteData) // Debug log

                if (!clienteData) {
                    console.log('❌ No hay datos de cliente, redirigiendo a login') // Debug log
                    router.push('/cliente-portal/auth/login')
                    return
                }

                const cliente = JSON.parse(clienteData)
                console.log('👤 Cliente parseado:', cliente) // Debug log
                setClienteNombre(cliente.nombre)

                console.log('🔄 Cargando eventos para cliente:', cliente.id) // Debug log
                const response = await fetch(`/api/cliente-portal/eventos/${cliente.id}`)
                console.log('📡 Response status:', response.status) // Debug log

                if (response.ok) {
                    const data = await response.json()
                    console.log('📅 Eventos recibidos:', data) // Debug log
                    setEventos(data.eventos)
                } else {
                    console.error('❌ Error al cargar eventos:', response.status)
                }
            } catch (error) {
                console.error('❌ Error al cargar eventos:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchEventos()
    }, [router])

    const formatFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
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
                return 'bg-blue-900/20 text-blue-300 border-blue-800'
            case 'enviada':
                return 'bg-yellow-900/20 text-yellow-300 border-yellow-800'
            case 'cancelada':
                return 'bg-red-900/20 text-red-300 border-red-800'
            default:
                return 'bg-zinc-800 text-zinc-400 border-zinc-700'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'aprobada':
                return 'Aprobada'
            case 'enviada':
                return 'Pendiente'
            case 'cancelada':
                return 'Cancelada'
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
                    <p className="mt-4 text-zinc-400">Cargando tus eventos...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-950">
            <div className="bg-zinc-900 shadow-sm border-b border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-100">Mis Eventos</h1>
                            <p className="text-zinc-400">Bienvenido, {clienteNombre}</p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => {
                                sessionStorage.removeItem('cliente-data')
                                router.push('/cliente-portal/auth/login')
                            }}
                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                        >
                            Cerrar Sesión
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {eventos.length === 0 ? (
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardContent className="text-center py-12">
                            <CalendarDays className="mx-auto h-12 w-12 text-zinc-500 mb-4" />
                            <h3 className="text-lg font-medium text-zinc-100 mb-2">
                                No tienes eventos registrados
                            </h3>
                            <p className="text-zinc-400">
                                Contacta a nuestro equipo para crear tu primer evento.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {eventos.map((evento) => (
                            <Card key={evento.id} className="hover:shadow-lg transition-shadow border-zinc-800 bg-zinc-900">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg font-semibold line-clamp-2 text-zinc-100">
                                            {evento.nombre}
                                        </CardTitle>
                                        <Badge
                                            className={`${getStatusColor(evento.cotizacion.status)} text-xs`}
                                        >
                                            {getStatusText(evento.cotizacion.status)}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center text-sm text-zinc-400">
                                            <CalendarDays className="h-4 w-4 mr-2" />
                                            {formatFecha(evento.fecha_evento)}
                                        </div>

                                        <div className="flex items-center text-sm text-zinc-400">
                                            <Clock className="h-4 w-4 mr-2" />
                                            {evento.hora_evento}
                                        </div>

                                        <div className="flex items-center text-sm text-zinc-400">
                                            <Users className="h-4 w-4 mr-2" />
                                            {evento.numero_invitados} invitados
                                        </div>

                                        <div className="flex items-center text-sm text-zinc-400">
                                            <MapPin className="h-4 w-4 mr-2" />
                                            <span className="line-clamp-1">{evento.lugar}</span>
                                        </div>
                                    </div>

                                    {evento.cotizacion.status === 'aprobada' && (
                                        <div className="border-t border-zinc-800 pt-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-zinc-400">Total:</span>
                                                    <span className="font-medium text-zinc-100">
                                                        {formatMoney(evento.cotizacion.total)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-zinc-400">Pagado:</span>
                                                    <span className="font-medium text-green-400">
                                                        {formatMoney(evento.cotizacion.pagado)}
                                                    </span>
                                                </div>
                                                {getSaldoPendiente(evento.cotizacion.total, evento.cotizacion.pagado) > 0 && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-zinc-400">Saldo pendiente:</span>
                                                        <span className="font-medium text-yellow-400">
                                                            {formatMoney(getSaldoPendiente(evento.cotizacion.total, evento.cotizacion.pagado))}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-2 pt-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                                            onClick={() => router.push(`/cliente-portal/evento/${evento.id}`)}
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            Ver Detalles
                                        </Button>

                                        {evento.cotizacion.status === 'aprobada' &&
                                            getSaldoPendiente(evento.cotizacion.total, evento.cotizacion.pagado) > 0 && (
                                                <Button
                                                    size="sm"
                                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                                    onClick={() => router.push(`/cliente-portal/pago/${evento.cotizacion.id}`)}
                                                >
                                                    <CreditCard className="h-4 w-4 mr-1" />
                                                    Pagar
                                                </Button>
                                            )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}