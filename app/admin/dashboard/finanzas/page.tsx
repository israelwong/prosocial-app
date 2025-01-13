import React from 'react'
import DashboardFinanzas from './components/DashboardFinanzas'
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Finanzas',
}


function Finanzas() {
    return <DashboardFinanzas />
}

export default Finanzas
