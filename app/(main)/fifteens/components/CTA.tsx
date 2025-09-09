'use client'
import React from 'react'
import { CTAPaquetes } from '@/app/components/cta'

/**
 * Componente CTA optimizado para XV Años
 * Usa el nuevo CTAPaquetes con separación visual y diseño mejorado
 */

function CTA() {
    return (
        <CTAPaquetes
            title="¡Contacta hoy mismo!"
            subtitle="tenemos fechas limitadas."
            buttonText="Ver Paquetes XV Años"
            buttonHref="/contacto?ref=fifteen"
            buttonId="btn-contacto-desde-hero-fifteens"
            showTopSeparator={true}
            showBottomSeparator={false}
        />
    )
}

export default CTA
