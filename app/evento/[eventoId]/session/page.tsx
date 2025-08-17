import React from 'react'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { obtenerEventoPorId } from '@/app/admin/_lib/evento.actions'
import SessionTiempoReal from '../components/SessionTiempoReal'

export const metadata: Metadata = {
    title: 'Sesión de Presentación Ejecutiva'
}

interface PageProps {
    params: Promise<{ eventoId: string }>
    searchParams: Promise<{ admin?: string, cotizacionId?: string, prospecto?: string }>
}

export default async function SessionPage({ params, searchParams }: PageProps) {
    const { eventoId } = await params
    const { admin, cotizacionId, prospecto } = await searchParams

    try {
        // Obtener información del evento
        const evento = await obtenerEventoPorId(eventoId)

        if (!evento) {
            redirect('/404')
        }

        // Verificar si el evento ya está contratado
        if (evento.status === 'contratado') {
            redirect('/cliente/login')
        }

        return (
            <SessionTiempoReal
                evento={evento}
                esAdmin={admin === 'true'}
                esProspecto={prospecto === 'true'}
                cotizacionIdInicial={cotizacionId || undefined}
            />
        )

    } catch (error) {
        console.error('Error al cargar sesión:', error)
        redirect('/404')
    }
}
