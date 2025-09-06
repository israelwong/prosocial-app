import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Evento no encontrado - ProSocial Admin',
}

export default function EventoNotFound() {
    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-zinc-900 rounded-lg border border-zinc-800 p-8 text-center">
                {/* Icono de error */}
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                        className="w-8 h-8 text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                    </svg>
                </div>

                {/* Título y mensaje */}
                <h1 className="text-2xl font-bold text-white mb-4">
                    Evento no encontrado
                </h1>

                <p className="text-zinc-400 mb-6 text-sm leading-relaxed">
                    El evento que estás buscando no existe o ha sido eliminado del sistema.
                    Esto puede suceder si el evento fue eliminado recientemente.
                </p>

                {/* Botones de acción */}
                <div className="space-y-3">
                    <Link
                        href="/admin/dashboard/seguimiento"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                        </svg>
                        Ir a Dashboard de Seguimiento
                    </Link>

                    <Link
                        href="/admin/dashboard"
                        className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 15l4-4 4 4" />
                        </svg>
                        Dashboard Principal
                    </Link>
                </div>

                {/* Información adicional */}
                <div className="mt-6 pt-6 border-t border-zinc-800">
                    <p className="text-xs text-zinc-500">
                        Si necesitas ayuda, contacta al administrador del sistema
                    </p>
                </div>
            </div>
        </div>
    )
}
