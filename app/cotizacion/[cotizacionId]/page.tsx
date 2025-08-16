import React from 'react'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { obtenerCotizacion } from '@/app/admin/_lib/cotizacion.actions'
import Cotizacion from '../components/Cotizacion'

export const metadata: Metadata = {
    title: 'Cotización personalizada'
}

interface PageProps { params: Promise<{ cotizacionId: string }> }

export default async function LegacyCotizacionPage({ params }: PageProps) {
    const { cotizacionId } = await params
    
    try {
        // Obtener información de la cotización para redirigir a nueva estructura
        const cotizacion = await obtenerCotizacion(cotizacionId)
        
        if (cotizacion && cotizacion.eventoId) {
            // Redirigir a la nueva estructura con parámetro legacy para identificar
            redirect(`/evento/cotizacion/${cotizacion.eventoId}/cotizacion/${cotizacionId}?legacy=true`)
        }
        
        // Si no se puede obtener la cotización, continuar con el componente legacy
        return <Cotizacion cotizacionId={cotizacionId} />
        
    } catch (error) {
        console.error('Error al procesar cotización legacy:', error)
        
        // En caso de error, mostrar la página legacy como fallback
        return <Cotizacion cotizacionId={cotizacionId} />
    }
}
