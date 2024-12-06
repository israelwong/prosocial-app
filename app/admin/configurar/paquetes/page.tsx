import React from 'react'
import { Metadata } from 'next'
import DashboardPaquete from './components/DashboardPaquete'

export const metadata: Metadata = {
    title: 'Paquetes',
    description: 'Configuración de paquetes',
}

function Paquetes() {
    return (
        <div>
            <DashboardPaquete />
        </div>
    )
}

export default Paquetes
