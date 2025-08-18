'use client'
import React from 'react'

interface Props {
    puedeRealizarPago: boolean
    fechaDisponible: boolean
    condicionSeleccionada: string
    metodoPagoSeleccionado?: string
    precioFinal?: number
    infoMetodoPago?: {
        esMSI: boolean
        numMSI: number
        esAnticipo: boolean
        montoPorPago: number
    } | null
    onIniciarPago: () => void
    loading?: boolean
}

export default function BotonPago({
    puedeRealizarPago,
    fechaDisponible,
    condicionSeleccionada,
    metodoPagoSeleccionado,
    precioFinal,
    infoMetodoPago,
    onIniciarPago,
    loading = false
}: Props) {

    const getEstadoBoton = () => {
        if (!fechaDisponible) {
            return {
                texto: 'Fecha no disponible',
                className: 'bg-red-600/20 text-red-400 border-red-500/30 cursor-not-allowed',
                disabled: true
            }
        }

        if (!condicionSeleccionada) {
            return {
                texto: 'Selecciona condición de pago',
                className: 'bg-zinc-600/20 text-zinc-400 border-zinc-500/30 cursor-not-allowed',
                disabled: true
            }
        }

        if (!metodoPagoSeleccionado) {
            return {
                texto: 'Selecciona método de pago',
                className: 'bg-zinc-600/20 text-zinc-400 border-zinc-500/30 cursor-not-allowed',
                disabled: true
            }
        }

        if (loading) {
            return {
                texto: 'Procesando...',
                className: 'bg-purple-600/20 text-purple-400 border-purple-500/30 cursor-wait',
                disabled: true
            }
        }

        // Generar texto dinámico según el tipo de pago
        let textoBoton = 'Pagar ahora'

        if (infoMetodoPago && precioFinal) {
            if (infoMetodoPago.esMSI) {
                // MSI: "Pagar 3 MSI de $1,500.00"
                textoBoton = `Pagar ${infoMetodoPago.numMSI} MSI de ${infoMetodoPago.montoPorPago.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`
            } else if (infoMetodoPago.esAnticipo) {
                // Anticipo: "Pagar anticipo $5,000.00"
                textoBoton = `Pagar anticipo ${precioFinal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`
            } else {
                // Pago completo: "Pagar $15,000.00"
                textoBoton = `Pagar ${precioFinal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`
            }
        }

        return {
            texto: textoBoton,
            className: 'bg-purple-600 hover:bg-purple-700 text-white border-purple-500 hover:border-purple-400 cursor-pointer',
            disabled: false
        }
    }

    const estadoBoton = getEstadoBoton()

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-700 p-4 z-50">
            <div className="max-w-md mx-auto">
                <button
                    onClick={onIniciarPago}
                    disabled={estadoBoton.disabled}
                    className={`
                        w-full py-3 px-6 rounded-lg border font-medium text-sm transition-all duration-200
                        ${estadoBoton.className}
                    `}
                >
                    {estadoBoton.texto}
                </button>
            </div>
        </div>
    )
}
