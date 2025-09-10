import React from 'react'
import { Metadata } from 'next'
import { obtenerCuentasBancarias } from '@/app/admin/_lib/actions/negocio/negocioBanco.actions'
import CuentaBancariaView from './components/CuentaBancariaView'

export const metadata: Metadata = {
    title: 'Configurar Cuenta Bancaria',
    description: 'Configuración de cuentas bancarias del negocio'
}

export default async function CuentaBancariaPage() {
    const cuentasBancarias = await obtenerCuentasBancarias()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-zinc-100 mb-2">
                    Cuenta Bancaria
                </h1>
                <p className="text-zinc-400">
                    Configura las cuentas bancarias del negocio para recibir pagos por transferencia
                </p>
            </div>

            <CuentaBancariaView cuentasBancarias={cuentasBancarias} />
        </div>
    )
}
