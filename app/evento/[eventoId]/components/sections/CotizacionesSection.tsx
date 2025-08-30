'use client'
import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '@/app/admin/_lib/supabase'
import { REALTIME_CONFIG } from '../../../config/realtime.config'
import CotizacionCard from '../cards/CotizacionCard'
import NotificacionRealtime from '../ui/NotificacionRealtime'

interface Cotizacion {
    id: string
    nombre: string
    precio: number
    status?: string
}

interface Props {
    cotizaciones: Cotizacion[]
    eventoId: string
    enableRealtime?: boolean // Nueva prop para controlar el realtime
}

export default function CotizacionesSection({
    cotizaciones: cotizacionesIniciales,
    eventoId,
    enableRealtime = REALTIME_CONFIG.cotizacionesRealtime // Usar configuración global por defecto
}: Props) {
    const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>(cotizacionesIniciales)
    const [mostrarNotificacion, setMostrarNotificacion] = useState(false)
    const [mensajeNotificacion, setMensajeNotificacion] = useState('')

    // Usar ref para evitar re-creaciones de funciones
    const cotizacionesRef = useRef(cotizacionesIniciales)
    const isLoadingRef = useRef(false)

    // Actualizar ref cuando cambian las cotizaciones
    useEffect(() => {
        cotizacionesRef.current = cotizaciones
    }, [cotizaciones])

    // Función optimizada para recargar cotizaciones
    const cargarCotizaciones = async (mostrarAlerta = false) => {
        // Prevenir múltiples requests simultáneos
        if (isLoadingRef.current) return
        isLoadingRef.current = true

        try {
            const response = await fetch(`/api/evento/${eventoId}/cotizaciones-publicas`)
            if (response.ok) {
                const data = await response.json()
                if (data.success && data.cotizaciones) {
                    const cotizacionesAnterior = cotizacionesRef.current.length
                    const cotizacionesNuevas = data.cotizaciones.length

                    setCotizaciones(data.cotizaciones)

                    // Mostrar notificación solo si hay nuevas cotizaciones y se solicita
                    if (mostrarAlerta && cotizacionesNuevas > cotizacionesAnterior && REALTIME_CONFIG.notificacionesVisuales) {
                        const cotizacionesAgregadas = cotizacionesNuevas - cotizacionesAnterior
                        setMensajeNotificacion(
                            cotizacionesAgregadas === 1
                                ? 'Se ha agregado una nueva cotización para tu evento'
                                : `Se han agregado ${cotizacionesAgregadas} nuevas cotizaciones`
                        )
                        setMostrarNotificacion(true)

                        // Scroll suave con timeout configurado
                        setTimeout(() => {
                            const element = document.querySelector('#cotizaciones-section')
                            if (element) {
                                element.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'start'
                                })
                            }
                        }, REALTIME_CONFIG.timeoutScroll)
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error al recargar cotizaciones:', error)
        } finally {
            isLoadingRef.current = false
        }
    }

    // Suscripción optimizada en tiempo real (solo si está habilitada)
    useEffect(() => {
        if (!enableRealtime) return // Salir si el realtime está deshabilitado

        let subscription: any = null

        const connectRealtime = () => {
            subscription = supabase
                .channel(`cotizaciones-evento-${eventoId}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'Cotizacion',
                        filter: `eventoId=eq.${eventoId}`
                    },
                    (payload) => {
                        // Solo procesar cambios relevantes para el cliente
                        if (payload.eventType === 'INSERT') {
                            const newCotizacion = payload.new
                            if (newCotizacion.visible_cliente && newCotizacion.status !== 'archivada') {
                                cargarCotizaciones(true)
                            }
                        } else if (payload.eventType === 'UPDATE') {
                            const updatedCotizacion = payload.new
                            const oldCotizacion = payload.old

                            // Solo actualizar si hay cambios significativos
                            const hasSignificantChanges = (
                                updatedCotizacion.visible_cliente !== oldCotizacion.visible_cliente ||
                                updatedCotizacion.status !== oldCotizacion.status ||
                                (updatedCotizacion.visible_cliente &&
                                    (updatedCotizacion.nombre !== oldCotizacion.nombre ||
                                        updatedCotizacion.precio !== oldCotizacion.precio))
                            )

                            if (hasSignificantChanges) {
                                cargarCotizaciones(false)
                            }
                        } else if (payload.eventType === 'DELETE') {
                            cargarCotizaciones(false)
                        }
                    }
                )
                .subscribe()
        }

        // Conectar con delay configurado para evitar race conditions
        const timeoutId = setTimeout(connectRealtime, REALTIME_CONFIG.delayConexion)

        return () => {
            clearTimeout(timeoutId)
            if (subscription) {
                subscription.unsubscribe()
            }
        }
    }, [eventoId, enableRealtime]) // Solo depende de eventoId y enableRealtime
    if (!cotizaciones.length) return null

    return (
        <>
            <section id="cotizaciones-section" className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header de sección */}
                    <div className="text-center mb-8 lg:mb-10">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                            {cotizaciones.length === 1 ? 'Tu cotización' : 'Tus cotizaciones'}
                        </h2>
                        <p className="text-zinc-400 text-base sm:text-lg max-w-3xl mx-auto">
                            {cotizaciones.length === 1
                                ? 'Revisa los detalles de tu cotización personalizada'
                                : `Hemos preparado ${cotizaciones.length} opciones especiales para tu evento`
                            }
                        </p>
                    </div>

                    {/* Grid de cotizaciones responsive - mejorada distribución */}
                    <div className="flex justify-center w-full">
                        <div className={`
                        grid w-full
                        ${cotizaciones.length === 1
                                ? 'grid-cols-1 justify-items-center max-w-lg'
                                : ''
                            }
                        ${cotizaciones.length === 2
                                ? 'grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-4xl'
                                : ''
                            }
                        ${cotizaciones.length >= 3
                                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 max-w-6xl'
                                : ''
                            }
                    `}>
                            {cotizaciones.map((cotizacion, index) => (
                                <div key={cotizacion.id} className={`
                                w-full mx-auto
                                ${cotizaciones.length === 1 ? 'max-w-lg' : ''}
                                ${cotizaciones.length === 2 ? 'max-w-lg sm:max-w-none' : ''}
                                ${cotizaciones.length >= 3 ? 'max-w-sm sm:max-w-none' : ''}
                            `}>
                                    <CotizacionCard
                                        cotizacion={cotizacion}
                                        eventoId={eventoId}
                                        index={index}
                                        isRecommended={index === 1 && cotizaciones.length > 2} // Marcar la segunda como recomendada si hay más de 2
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Información adicional */}
                    {cotizaciones.length > 1 && (
                        <div className="mt-10 lg:mt-12 text-center">
                            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 lg:p-8 max-w-2xl mx-auto">
                                <h3 className="text-lg lg:text-xl font-semibold text-white mb-2">
                                    ¿No estás seguro cuál elegir?
                                </h3>
                                <p className="text-zinc-400 text-sm lg:text-base mb-6">
                                    Nuestro equipo puede ayudarte a tomar la mejor decisión para tu evento
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <a
                                        href="https://wa.me/5544546582?text=Hola, necesito ayuda para elegir entre mis cotizaciones"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors text-sm lg:text-base"
                                    >
                                        <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z" />
                                        </svg>
                                        Consultar por WhatsApp
                                    </a>
                                    <a
                                        href="tel:5544546582"
                                        className="inline-flex items-center justify-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white font-medium py-3 px-6 rounded-lg transition-colors text-sm lg:text-base"
                                    >
                                        <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        Llamar
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Notificación realtime - solo si está habilitada */}
            {REALTIME_CONFIG.notificacionesVisuales && (
                <NotificacionRealtime
                    show={mostrarNotificacion}
                    mensaje={mensajeNotificacion}
                    onClose={() => setMostrarNotificacion(false)}
                    duracion={REALTIME_CONFIG.duracionNotificaciones}
                />
            )}
        </>
    )
}
