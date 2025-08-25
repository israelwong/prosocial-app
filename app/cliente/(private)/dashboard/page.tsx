'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/app/components/ui/card'
import { CalendarDays } from 'lucide-react'
import { useClienteAuth } from '../../hooks'
import { obtenerEventosCliente } from '../../_lib/actions/evento.actions'
import { Evento } from '../../_lib/types'
import EventoCard from './components/EventoCard'
import { DashboardContentSkeleton } from '@/app/cliente/components/ui/skeleton'

export default function ClienteDashboard() {
    const [eventos, setEventos] = useState<Evento[]>([])
    const [loading, setLoading] = useState(true)
    const { cliente, isAuthenticated, logout } = useClienteAuth()

    useEffect(() => {
        if (!isAuthenticated || !cliente) {
            return // El useClienteAuth ya maneja la redirección
        }

        const fetchEventos = async () => {
            try {
                setLoading(true)
                console.log('🔄 Cargando eventos para cliente:', cliente.id) // Debug log

                // 🆕 Obtener eventos contratados: cotizaciones aprobadas + pagos SPEI pendientes
                const response = await obtenerEventosCliente(cliente.id)

                if (response.success && response.data) {
                    setEventos(response.data.eventos)
                } else {
                    console.error('❌ Error al cargar eventos:', response.message)
                }
            } catch (error) {
                console.error('❌ Error al cargar eventos:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchEventos()
    }, [isAuthenticated, cliente])

    if (!isAuthenticated || loading) {
        return <DashboardContentSkeleton />
    }

    return (
        <div className="min-h-screen bg-zinc-950">
            <div className="bg-zinc-900 shadow-sm border-b border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-100">Mis Eventos</h1>
                            <p className="text-zinc-400">Bienvenido, {cliente?.nombre}</p>
                        </div>
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
                            <EventoCard key={evento.id} evento={evento} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}