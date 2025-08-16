import React from 'react'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { obtenerCotizacion } from '@/app/admin/_lib/cotizacion.actions'

export const metadata: Metadata = {
    title: 'Cotización personalizada'
}

interface PageProps { params: Promise<{ cotizacionId: string }> }

export default async function LegacyCotizacionPage({ params }: PageProps) {
    const { cotizacionId } = await params
    
    try {
        // Obtener información de la cotización
        const cotizacion = await obtenerCotizacion(cotizacionId)
        
        if (!cotizacion) {
            redirect('/404')
        }

        // Redirigir a la nueva estructura
        redirect(`/evento/cotizacion/${cotizacion.eventoId}/cotizacion/${cotizacionId}`)
        
    } catch (error) {
        console.error('Error al redirigir cotización legacy:', error)
        
        // Si hay error, mostrar la página legacy como fallback
        const Cotizacion = (await import('../components/Cotizacion')).default
        return <Cotizacion cotizacionId={cotizacionId} />
    }
}
