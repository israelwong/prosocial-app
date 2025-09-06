'use client'
import React from 'react'
import { PortfolioGallery } from '@/app/components/shared/marketing'
import type { EventType } from '@/app/components/shared/marketing'

interface PortfolioSectionProps {
    tipoEvento: 'boda' | 'xv' | 'xv años' | '15 años'
    titulo?: string
    descripcion?: string
    className?: string
}

export default function PortfolioSection({
    tipoEvento,
    titulo,
    descripcion,
    className = ""
}: PortfolioSectionProps) {
    return (
        <PortfolioGallery
            tipoEvento={tipoEvento as EventType}
            variant="default"
            titulo={titulo}
            descripcion={descripcion}
            className={className}
        />
    )
}
