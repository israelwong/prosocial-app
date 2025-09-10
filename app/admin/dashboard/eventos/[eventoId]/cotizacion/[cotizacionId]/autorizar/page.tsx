import React from 'react'
import { redirect } from 'next/navigation'
import { obtenerCotizacionCompleta } from '@/app/admin/_lib/actions/cotizacion/cotizacion.actions'
import { obtenerCuentasBancarias } from '@/app/admin/_lib/actions/negocio/negocioBanco.actions'
import { COTIZACION_STATUS } from '@/app/admin/_lib/constants/status'
import AutorizacionCotizacionContainer from './components/AutorizacionCotizacionContainer'
import type { AutorizacionCotizacionData, AutorizacionCuentaBancaria } from './types'

interface PageProps {
    params: Promise<{
        eventoId: string
        cotizacionId: string
    }>
}

// Función para adaptar datos de cotización
function adaptarCotizacion(cotizacion: any): AutorizacionCotizacionData {
    return {
        id: cotizacion.id,
        total: cotizacion.total || 0,
        anticipo: cotizacion.anticipo || 0,
        status: cotizacion.status,
        Evento: {
            nombre: cotizacion.Evento?.nombre || '',
            fecha_evento: cotizacion.Evento?.fecha_evento || '',
            Cliente: {
                nombre: cotizacion.Evento?.Cliente?.nombre || '',
                email: cotizacion.Evento?.Cliente?.email || null,
                telefono: cotizacion.Evento?.Cliente?.telefono || null
            },
            EventoTipo: cotizacion.Evento?.EventoTipo || null
        },
        Servicio: cotizacion.Servicio || []
    }
}

// Función para adaptar cuentas bancarias
function adaptarCuentasBancarias(cuentas: any[]): AutorizacionCuentaBancaria[] {
    return cuentas.map(cuenta => ({
        id: cuenta.id,
        banco: cuenta.banco,
        beneficiario: cuenta.beneficiario,
        clabe: cuenta.clabe,
        cuenta: cuenta.cuenta || null,
        sucursal: cuenta.sucursal || null,
        principal: cuenta.principal
    }))
}

export default async function AutorizarCotizacionPage({ params }: PageProps) {
    const { eventoId, cotizacionId } = await params

    try {
        // Cargar datos necesarios
        const [cotizacionData, cuentasBancarias] = await Promise.all([
            obtenerCotizacionCompleta(cotizacionId),
            obtenerCuentasBancarias()
        ])

        // Verificar si la cotización existe
        if (!cotizacionData?.cotizacion) {
            redirect(`/admin/dashboard/eventos/${eventoId}/cotizacion`)
        }

        const cotizacion = cotizacionData.cotizacion

        // Verificar si ya está autorizada/aprobada
        if (cotizacion.status === COTIZACION_STATUS.AUTORIZADO ||
            cotizacion.status === COTIZACION_STATUS.APROBADA) {
            redirect(`/admin/dashboard/eventos/${eventoId}/cotizacion`)
        }

        // Adaptar datos a los tipos requeridos
        const cotizacionAdaptada = adaptarCotizacion(cotizacion)
        const cuentasAdaptadas = adaptarCuentasBancarias(cuentasBancarias || [])

        return (
            <div className="min-h-screen bg-zinc-950">
                <AutorizacionCotizacionContainer
                    cotizacion={cotizacionAdaptada}
                    cuentasBancarias={cuentasAdaptadas}
                    eventoId={eventoId}
                />
            </div>
        )

    } catch (error) {
        console.error('Error cargando datos para autorización:', error)
        redirect(`/admin/dashboard/eventos/${eventoId}/cotizacion`)
    }
}
