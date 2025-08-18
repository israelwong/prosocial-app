'use client'
import React from 'react'

interface Props {
    puedeRealizarPago: boolean
    fechaDisponible: boolean
    condicionSeleccionada: string
    onIniciarPago: () => void
    loading?: boolean
}

export default function BotonPago({
    puedeRealizarPago,
    fechaDisponible,
    condicionSeleccionada,
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

        if (loading) {
            return {
                texto: 'Procesando...',
                className: 'bg-purple-600/20 text-purple-400 border-purple-500/30 cursor-wait',
                disabled: true
            }
        }

        return {
            texto: 'Continuar al pago',
            className: 'bg-purple-600 hover:bg-purple-700 text-white border-purple-500 hover:border-purple-400 cursor-pointer',
            disabled: false
        }
    }

    const estadoBoton = getEstadoBoton()

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-sm border-t border-zinc-700 p-4 z-50">
            <div className="max-w-md mx-auto">
                <button
                    onClick={onIniciarPago}
                    disabled={estadoBoton.disabled}
                    className={`w-full py-4 px-6 rounded-lg border font-semibold text-center transition-all duration-200 ${estadoBoton.className}`}
                >
                    {loading && (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}
                    {estadoBoton.texto}
                </button>

                {!fechaDisponible && (
                    <p className="text-center text-red-400 text-sm mt-2">
                        Esta fecha no está disponible para reservar
                    </p>
                )}

                {fechaDisponible && !condicionSeleccionada && (
                    <p className="text-center text-zinc-400 text-sm mt-2">
                        Selecciona una condición de pago para continuar
                    </p>
                )}
            </div>
        </div>
    )
}
