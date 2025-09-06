'use client'
import React from 'react'
import { HeroMarketing } from '@/app/components/shared'

interface Evento {
    id: string
    nombre: string | null
    fecha_evento: Date
    sede?: string | null
    direccion?: string | null
    EventoTipo?: {
        nombre: string
        id?: string
    } | null
    Cliente?: {
        nombre: string
        id?: string
        telefono?: string | null
        email?: string | null
    } | null
}

interface Props {
    evento: Evento
    diasRestantes: number
    tipoContenido: 'cotizaciones' | 'paquetes' | 'preparando'
    cantidadOpciones?: number
}

export default function HeroSection({
    evento,
    diasRestantes,
    tipoContenido,
    cantidadOpciones = 0
}: Props) {
    return (
        <HeroMarketing
            variant="evento"
            titulo={evento.Cliente?.nombre || 'Tu evento especial'}
            evento={evento}
            diasRestantes={diasRestantes}
            tipoContenido={tipoContenido}
            cantidadOpciones={cantidadOpciones}
            showScrollIndicator={true}
        />
    )
}
