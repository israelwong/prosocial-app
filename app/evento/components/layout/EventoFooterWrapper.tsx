import React from 'react'
import { obtenerConfiguracionNegocio } from '../../lib/negocio-config'
import EventoFooterDynamic from './EventoFooterDynamic'

export default async function EventoFooterWrapper() {
    const config = await obtenerConfiguracionNegocio()

    return (
        <EventoFooterDynamic
            nombre={config.nombre}
            isotipo={config.isotipo}
            slogan={config.slogan}
            telefono={config.telefono}
            whatsapp={config.whatsapp}
            email={config.email}
            horarios={config.horarios}
            redesSociales={config.redesSociales}
        />
    )
}
