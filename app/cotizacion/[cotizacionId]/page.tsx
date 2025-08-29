'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface Props {
    params: {
        cotizacionId: string
    }
}

export default function CotizacionRedirectPage({ params }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const procesarRedireccion = async () => {
            try {
                console.log('🔄 Procesando redirección para cotización:', params.cotizacionId)

                // Llamar al API para obtener datos de redirección
                const response = await fetch(`/api/cotizacion-publica/${params.cotizacionId}`)

                if (!response.ok) {
                    if (response.status === 404) {
                        setError('Cotización no encontrada')
                        return
                    }
                    throw new Error(`Error ${response.status}`)
                }

                const data = await response.json()

                console.log('📊 Datos de redirección:', data)

                if (data.tieneAprobada) {
                    // Tiene cotización aprobada → Login de cliente
                    console.log('✅ Redirigiendo a login de cliente (tiene cotización aprobada)')
                    router.push('/cliente/auth/login')
                } else {
                    // No tiene cotización aprobada → Página pública del evento
                    console.log('🎯 Redirigiendo a evento público:', data.eventoId)
                    router.push(`/evento/${data.eventoId}`)
                }

            } catch (error) {
                console.error('❌ Error al procesar redirección:', error)
                setError('Error al procesar la solicitud')
            } finally {
                setLoading(false)
            }
        }

        if (params.cotizacionId) {
            procesarRedireccion()
        }
    }, [params.cotizacionId, router])

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">
                        Redirigiendo...
                    </h2>
                    <p className="text-zinc-400">
                        Verificando tu cotización
                    </p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="text-red-400 text-5xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-white mb-2">
                        {error}
                    </h2>
                    <p className="text-zinc-400 mb-6">
                        La cotización que buscas no existe o no está disponible.
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Ir al inicio
                    </button>
                </div>
            </div>
        )
    }

    return null
}
