import React from 'react'
import { Metadata } from 'next'
import SetupForm from '../../components/SetupForm'

export const metadata: Metadata = {
    title: 'Configuración inicial - ProSocial'
}

export default function ClienteSetupPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo y título */}
                <div className="text-center mb-8">
                    <div className="text-4xl font-bold text-white mb-2">
                        ProSocial
                    </div>
                    <div className="text-zinc-400">
                        Configuración inicial
                    </div>
                </div>

                {/* Formulario de setup */}
                <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-2xl p-8">
                    <h1 className="text-2xl font-bold text-white mb-4 text-center">
                        ¡Bienvenido!
                    </h1>

                    <div className="text-zinc-400 text-sm mb-6 text-center">
                        Para completar el acceso a tu portal, por favor crea una contraseña segura
                    </div>

                    <SetupForm />
                </div>

                {/* Información de seguridad */}
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-start gap-3">
                        <div className="text-blue-400 mt-0.5">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-blue-400 text-sm font-medium">Seguridad</p>
                            <p className="text-blue-300/80 text-xs mt-1">
                                Tu contraseña se almacena de forma segura y encriptada. 
                                Solo tú podrás acceder a la información de tu evento.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
