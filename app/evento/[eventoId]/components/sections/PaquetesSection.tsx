'use client'
import React, { useState } from 'react'
import PaqueteCard from '../cards/PaqueteCard'
import { Package, Scale, MessageSquare } from 'lucide-react'

interface Paquete {
    id: string
    nombre: string
    precio: number | null
}

interface Props {
    paquetes: Paquete[]
    eventoId: string
    showAsAlternative?: boolean
}

export default function PaquetesSection({ paquetes, eventoId, showAsAlternative = false }: Props) {
    const [enviandoSolicitud, setEnviandoSolicitud] = useState(false)
    const [solicitudEnviada, setSolicitudEnviada] = useState(false)

    if (!paquetes.length) return null

    // Función para abrir comparador de paquetes (sin cotización)
    const handleCompararpaquetes = () => {
        // Abrir en nueva pestaña el comparador de paquetes público
        const url = `/comparador-paquetes?eventoId=${eventoId}`
        window.location.href = url
    }

    // Función para solicitar paquete personalizado
    const handleSolicitarPersonalizado = async () => {
        setEnviandoSolicitud(true)

        try {
            const response = await fetch('/api/cliente-portal/solicitud-personalizada', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    eventoId: eventoId,
                    tipo: 'paquete_personalizado',
                    mensaje: 'Cliente solicita cotización personalizada desde vista pública de paquetes',
                    // Metadata adicional para el sistema de notificaciones
                    metadata: {
                        rutaDestino: `/admin/dashboard/eventos/${eventoId}`,
                        accionBitacora: {
                            habilitada: true,
                            mensaje: '📝 Cliente solicitó cotización personalizada desde vista pública de paquetes'
                        },
                        origen: 'vista_publica_paquetes',
                        tipoSolicitud: 'paquete_personalizado'
                    }
                })
            })

            if (response.ok) {
                setSolicitudEnviada(true)
                // Mostrar mensaje de éxito por 3 segundos
                setTimeout(() => {
                    setSolicitudEnviada(false)
                }, 3000)
            } else {
                throw new Error('Error al enviar solicitud')
            }
        } catch (error) {
            console.error('Error al solicitar paquete personalizado:', error)
            alert('Error al enviar la solicitud. Por favor intenta de nuevo.')
        } finally {
            setEnviandoSolicitud(false)
        }
    }

    // Determinar cuál es el más popular (el del medio o el segundo más caro)
    const paquetesOrdenados = [...paquetes].sort((a, b) => {
        if (!a.precio) return 1
        if (!b.precio) return -1
        return a.precio - b.precio
    })

    const indexPopular = paquetesOrdenados.length === 3 ? 1 :
        paquetesOrdenados.length === 2 ? 1 : 0

    return (
        <section className={`py-8 px-4 ${showAsAlternative ? 'border-t border-zinc-800' : ''}`}>
            <div className="max-w-6xl mx-auto">
                {/* Header de sección */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                        {showAsAlternative ? 'Paquetes alternativos' : 'Paquetes disponibles'}
                    </h2>
                    <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto">
                        {showAsAlternative
                            ? 'También puedes considerar estos paquetes pre-diseñados'
                            : 'Selecciona el paquete que mejor se adapte a tu evento'
                        }
                    </p>
                </div>

                {/* Grid de paquetes responsive */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paquetes.map((paquete, index) => (
                        <PaqueteCard
                            key={paquete.id}
                            paquete={paquete}
                            eventoId={eventoId}
                            index={index}
                            isPopular={index === indexPopular && paquetes.length > 1}
                        />
                    ))}
                </div>

                {/* Botones de acción - Solo cuando NO es alternativa (sin cotizaciones) */}
                {!showAsAlternative && (
                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
                        {/* Botón Comparar Paquetes */}
                        <button
                            onClick={handleCompararpaquetes}
                            className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl group"
                        >
                            <Scale className="w-5 h-5 group-hover:rotate-6 transition-transform" />
                            Comparar Paquetes
                        </button>

                        {/* Botón Solicitar Paquete Personalizado */}
                        <button
                            onClick={handleSolicitarPersonalizado}
                            disabled={enviandoSolicitud || solicitudEnviada}
                            className={`inline-flex items-center gap-3 font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl group ${solicitudEnviada
                                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white'
                                : enviandoSolicitud
                                    ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-not-allowed'
                                    : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white'
                                }`}
                        >
                            {solicitudEnviada ? (
                                <>
                                    <svg className="w-5 h-5 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    ¡Solicitud Enviada!
                                </>
                            ) : enviandoSolicitud ? (
                                <>
                                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <MessageSquare className="w-5 h-5 group-hover:rotate-6 transition-transform" />
                                    Solicitar Paquete Personalizado
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Información adicional para paquetes */}
                <div className="mt-8 text-center">
                    <div className="bg-gradient-to-r from-zinc-800/50 to-zinc-700/50 border border-zinc-600 rounded-xl p-6 max-w-3xl mx-auto">
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-center md:text-left">
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    ¿Necesitas algo personalizado?
                                </h3>
                                <p className="text-zinc-400 text-sm">
                                    Podemos crear una cotización especial adaptada exactamente a tus necesidades
                                </p>
                            </div>
                            <div className="flex-shrink-0">
                                <a
                                    href="https://wa.me/5544546582?text=Hola, me gustaría una cotización personalizada para mi evento"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2.5 px-5 rounded-lg transition-all duration-200 text-sm whitespace-nowrap"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z" />
                                    </svg>
                                    Cotización personalizada
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
