import React from 'react'
import { Metadata } from 'next'
import LoginForm from '../../components/LoginForm'

export const metadata: Metadata = {
    title: 'Acceso Clientes - ProSocial'
}

export default function ClientePortalLoginPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo y título */}
                <div className="text-center mb-8">
                    <div className="text-4xl font-bold text-white mb-2">
                        ProSocial
                    </div>
                    <div className="text-zinc-400">
                        Portal de clientes
                    </div>
                </div>

                {/* Formulario de login */}
                <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-2xl p-8">
                    <h1 className="text-2xl font-bold text-white mb-6 text-center">
                        Bienvenido
                    </h1>

                    <div className="text-zinc-400 text-sm mb-6 text-center">
                        Accede para ver el estado de tu evento y realizar pagos
                    </div>

                    <LoginForm />
                </div>

                {/* Información adicional */}
                <div className="mt-6 text-center">
                    <p className="text-zinc-500 text-sm">
                        ¿Problemas para acceder?{' '}
                        <a
                            href="https://wa.me/5544546582?text=Hola, necesito ayuda para acceder a mi portal de cliente"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-400 hover:text-green-300 transition-colors"
                        >
                            Contáctanos
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}
