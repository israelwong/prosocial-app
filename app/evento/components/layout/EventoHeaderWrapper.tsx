import React from 'react'
import { obtenerConfiguracionNegocio } from '../../lib/negocio-config'
import EventoHeaderDynamic from './EventoHeaderDynamic'

interface Props {
    showBackButton?: boolean
    onBack?: () => void
    showShareButton?: boolean
    shareTitle?: string
    shareDescription?: string
}

export default async function EventoHeaderWrapper(props: Props) {
    const config = await obtenerConfiguracionNegocio()

    return (
        <EventoHeaderDynamic
            {...props}
            logotipo={config.logotipo}
            nombre={config.nombre}
        />
    )
}
