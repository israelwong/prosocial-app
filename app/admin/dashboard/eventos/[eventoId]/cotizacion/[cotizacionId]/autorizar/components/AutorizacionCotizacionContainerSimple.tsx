'use client'
import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
    cotizacion: any
    cuentasBancarias: any[]
    eventoId: string
}

export default function AutorizacionCotizacionContainer({
    cotizacion,
    cuentasBancarias,
    eventoId
}: Props) {
    const router = useRouter()

    const volverALista = () => {
        router.push(`/admin/dashboard/eventos/${eventoId}/cotizacion`)
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100">
            {/* Header */}
            <div className="border-b border-zinc-800 bg-zinc-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={volverALista}
                                className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors"
                            >
                                <ArrowLeft size={20} />
                                <span>Volver a cotizaciones</span>
                            </button>
                            <div className="h-6 w-px bg-zinc-700" />
                            <div>
                                <h1 className="text-xl font-semibold text-zinc-100">
                                    Autorizar Cotización
                                </h1>
                                <p className="text-sm text-zinc-400">
                                    {cotizacion.Evento?.nombre || 'Sin nombre'} • {cotizacion.Evento?.Cliente?.nombre || 'Sin cliente'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido temporal */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-zinc-100 mb-4">
                        Página de Autorización de Cotización
                    </h2>
                    <p className="text-zinc-400 mb-4">
                        Esta página reemplaza el modal simple con un flujo completo de autorización.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-zinc-100">Cotización #{cotizacion.id}</h3>
                            <p className="text-zinc-400">Total: ${cotizacion.total?.toLocaleString('es-MX') || '0'}</p>
                            <p className="text-zinc-400">Anticipo: ${cotizacion.anticipo?.toLocaleString('es-MX') || '0'}</p>
                        </div>

                        <div>
                            <h4 className="font-medium text-zinc-200">Cuentas Bancarias Disponibles:</h4>
                            <p className="text-zinc-400">{cuentasBancarias.length} cuenta(s) configurada(s)</p>
                        </div>

                        <div className="mt-6">
                            <p className="text-zinc-500 text-sm">
                                Los componentes completos del flujo de autorización se implementarán aquí:
                            </p>
                            <ul className="list-disc list-inside text-zinc-500 text-sm mt-2 space-y-1">
                                <li>Revisión de cotización</li>
                                <li>Configuración de condiciones comerciales</li>
                                <li>Selección de métodos de pago</li>
                                <li>Configuración de calendario de pagos</li>
                                <li>Vista previa y autorización final</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
