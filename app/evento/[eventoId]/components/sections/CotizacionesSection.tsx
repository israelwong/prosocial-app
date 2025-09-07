'use client'
import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '@/app/admin/_lib/supabase'
import { REALTIME_CONFIG } from '../../../config/realtime.config'
import CotizacionCard from '../cards/CotizacionCard'
import NotificacionRealtime from '../ui/NotificacionRealtime'
import AyudaEleccionCotizaciones from '@/app/components/shared/AyudaEleccionCotizaciones'

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
    telefonoNegocio?: string // Teléfono del negocio desde la BD
}

export default function CotizacionesSection({
    cotizaciones: cotizacionesIniciales,
    eventoId,
    enableRealtime = REALTIME_CONFIG.cotizacionesRealtime, // Usar configuración global por defecto
    telefonoNegocio = "5544546582" // Teléfono por defecto si no se proporciona desde la BD
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

                    {/* Botón Comparar Paquetes - Visible cuando hay múltiples cotizaciones */}
                    {cotizaciones.length > 1 && (
                        <div className="mt-8 lg:mt-10 text-center">
                            <a
                                href={`/evento/${eventoId}/comparador`}
                                className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-base lg:text-lg"
                            >
                                <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Comparar Paquetes
                                <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                                    Nuevo
                                </span>
                            </a>
                            <p className="text-zinc-400 text-sm mt-2 max-w-md mx-auto">
                                Compara características, precios y servicios lado a lado para encontrar la opción perfecta
                            </p>
                        </div>
                    )}

                    {/* Información adicional - Usando componente reutilizable */}
                    <AyudaEleccionCotizaciones
                        mostrar={cotizaciones.length > 1}
                        telefonoWhatsApp={telefonoNegocio}
                        telefonoLlamada={telefonoNegocio}
                        mensajeWhatsApp="Hola, necesito ayuda para elegir entre mis cotizaciones"
                    />
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
