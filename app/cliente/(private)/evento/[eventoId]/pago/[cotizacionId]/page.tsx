'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { useClienteAuth } from '../../../../../hooks'
import { obtenerCotizacionPago, obtenerPagosCotizacion } from '../../../../../_lib/actions/pago.actions'
import CompletarPago from './components/CompletarPago'
import ResumenCotizacion from './components/ResumenCotizacion'
import HistorialPagos from './components/HistorialPagos'
import { PagoLoadingSkeleton } from '../../../../../components/ui/skeleton'

interface CotizacionPago {
    id: string
    total: number
    pagado: number
    evento: {
        id: string
        nombre: string
        fecha_evento: Date
        lugar: string
        numero_invitados: number
    }
    cliente: {
        id: string
        nombre: string
        email: string
        telefono: string
    }
}

interface Pago {
    id: string
    monto: number
    metodo_pago: string
    status: string
    createdAt: Date
}

export default function PagoCotizacionPage() {
    const [cotizacion, setCotizacion] = useState<CotizacionPago | null>(null)
    const [pagos, setPagos] = useState<Pago[]>([])
    const [loading, setLoading] = useState(true)
    const { cliente, isAuthenticated } = useClienteAuth()
    const router = useRouter()
    const params = useParams()
    const eventoId = params?.eventoId as string
    const cotizacionId = params?.cotizacionId as string

    useEffect(() => {
        if (!isAuthenticated || !cliente) {
            return
        }

        const fetchCotizacion = async () => {
            try {
                setLoading(true)
                const response = await obtenerCotizacionPago(cotizacionId, cliente.id)

                if (response.success && response.cotizacion) {
                    setCotizacion(response.cotizacion)

                    // Obtener pagos de la cotización
                    const pagosResponse = await obtenerPagosCotizacion(cotizacionId, cliente.id)
                    if (pagosResponse.success && pagosResponse.pagos) {
                        setPagos(pagosResponse.pagos)
                    } else {
                        setPagos([])
                    }
                } else {
                    console.error('❌ Error al cargar cotización:', response.message)
                    router.push('/cliente/dashboard')
                }
            } catch (error) {
                console.error('❌ Error al cargar cotización:', error)
                router.push('/cliente/dashboard')
            } finally {
                setLoading(false)
            }
        }

        fetchCotizacion()
    }, [isAuthenticated, cliente, cotizacionId, router])

    // Función para refrescar datos después de un pago
    const refrescarDatos = async () => {
        if (!cliente) return

        try {
            const response = await obtenerCotizacionPago(cotizacionId, cliente.id)
            if (response.success && response.cotizacion) {
                setCotizacion(response.cotizacion)

                const pagosResponse = await obtenerPagosCotizacion(cotizacionId, cliente.id)
                if (pagosResponse.success && pagosResponse.pagos) {
                    setPagos(pagosResponse.pagos)
                }
            }
        } catch (error) {
            console.error('❌ Error al refrescar datos:', error)
        }
    }

    // Escuchar cuando la página se enfoca (cuando regresas del checkout)
    useEffect(() => {
        const handleFocus = () => {
            refrescarDatos()
        }

        window.addEventListener('focus', handleFocus)
        return () => window.removeEventListener('focus', handleFocus)
    }, [cliente, cotizacionId])

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount)
    }

    const getSaldoPendiente = () => {
        if (!cotizacion) return 0
        return cotizacion.total - cotizacion.pagado
    }

    if (!isAuthenticated || loading) {
        return <PagoLoadingSkeleton />
    }

    if (!cotizacion) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
                    <h3 className="text-lg font-medium text-zinc-100 mb-2">
                        Cotización no encontrada
                    </h3>
                    <p className="text-zinc-400 mb-4">
                        No se pudo cargar la información de la cotización.
                    </p>
                    <Button onClick={() => router.push('/cliente/dashboard')}>
                        Volver al Dashboard
                    </Button>
                </div>
            </div>
        )
    }

    const saldoPendiente = getSaldoPendiente()

    return (
        <div className="min-h-screen bg-zinc-950">
            {/* Header */}
            <div className="bg-zinc-900 shadow-sm border-b border-zinc-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-6">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push('/cliente/dashboard')}
                                className="text-zinc-400 hover:text-zinc-100"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-zinc-100">Pasarela de Pago</h1>
                                <p className="text-zinc-400">{cotizacion.evento.nombre}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Información del Evento y Cotización */}
                    <div className="space-y-6">
                        {/* Resumen de Cotización */}
                        <ResumenCotizacion
                            total={cotizacion.total}
                            pagado={cotizacion.pagado}
                            saldoPendiente={saldoPendiente}
                        />

                        {/* Historial de Pagos */}
                        <HistorialPagos pagos={pagos} />
                    </div>

                    {/* Formulario de Pago Simplificado */}
                    <div className="space-y-6">
                        <CompletarPago
                            cotizacionId={cotizacionId}
                            eventoId={eventoId}
                            saldoPendiente={saldoPendiente}
                            cliente={cliente}
                            onPaymentSuccess={refrescarDatos}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
