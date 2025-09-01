'use client'
import React from 'react'
import { X, Check, Filter, Eye, Smartphone, Monitor, CreditCard, MessageCircle } from 'lucide-react'

interface Props {
    isOpen: boolean
    onClose: () => void
}

export default function ModalAyudaComparador({ isOpen, onClose }: Props) {
    if (!isOpen) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 z-40"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-zinc-700">
                        <h2 className="text-xl font-bold text-white">
                            📖 Guía del Comparador
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-zinc-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Sección 1: Filtros */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Filter className="w-5 h-5 text-purple-400" />
                                <h3 className="text-lg font-semibold text-white">1. Usando los Filtros</h3>
                            </div>
                            <div className="bg-zinc-800 rounded-lg p-4 space-y-2">
                                <p className="text-zinc-300 text-sm">
                                    • Haz clic en <Eye className="w-4 h-4 inline mx-1" /> para mostrar u ocultar columnas
                                </p>
                                <p className="text-zinc-300 text-sm">
                                    • Las cotizaciones aparecen en <span className="text-green-400 font-medium">verde</span>
                                </p>
                                <p className="text-zinc-300 text-sm">
                                    • Los paquetes prediseñados aparecen en <span className="text-blue-400 font-medium">azul</span>
                                </p>
                            </div>
                        </div>

                        {/* Sección 2: Navegación */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                    <Smartphone className="w-4 h-4 text-green-400" />
                                    <Monitor className="w-4 h-4 text-blue-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-white">2. Navegación</h3>
                            </div>
                            <div className="bg-zinc-800 rounded-lg p-4 space-y-2">
                                <p className="text-zinc-300 text-sm">
                                    • <span className="font-medium">En móvil:</span> Desliza horizontalmente para ver más columnas
                                </p>
                                <p className="text-zinc-300 text-sm">
                                    • <span className="font-medium">En desktop:</span> Usa la rueda del mouse o scroll lateral
                                </p>
                            </div>
                        </div>

                        {/* Sección 3: Interpretación */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                    <Check className="w-4 h-4 text-green-400" />
                                    <X className="w-4 h-4 text-red-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-white">3. Leyendo la Comparación</h3>
                            </div>
                            <div className="bg-zinc-800 rounded-lg p-4 space-y-2">
                                <p className="text-zinc-300 text-sm flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-400" />
                                    <span><span className="font-medium">Verde:</span> El servicio está incluido</span>
                                </p>
                                <p className="text-zinc-300 text-sm flex items-center gap-2">
                                    <X className="w-4 h-4 text-red-400" />
                                    <span><span className="font-medium">Rojo:</span> El servicio NO está incluido</span>
                                </p>
                            </div>
                        </div>

                        {/* Sección 4: Acciones */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                    <CreditCard className="w-4 h-4 text-green-400" />
                                    <MessageCircle className="w-4 h-4 text-purple-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-white">4. Reservar o Solicitar</h3>
                            </div>
                            <div className="bg-zinc-800 rounded-lg p-4 space-y-2">
                                <p className="text-zinc-300 text-sm flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-green-400" />
                                    <span><span className="font-medium text-green-400">Reservar:</span> Para cotizaciones personalizadas</span>
                                </p>
                                <p className="text-zinc-300 text-sm flex items-center gap-2">
                                    <MessageCircle className="w-4 h-4 text-purple-400" />
                                    <span><span className="font-medium text-purple-400">Solicitar:</span> Para paquetes prediseñados</span>
                                </p>
                            </div>
                        </div>

                        {/* Consejo final */}
                        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-600/30 rounded-lg p-4">
                            <p className="text-purple-200 text-sm">
                                <span className="font-medium">💡 Consejo Pro:</span> Compara máximo 3-4 opciones a la vez para una mejor visualización.
                                Usa los filtros para focalizarte en las opciones que más te interesan.
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-zinc-700 p-6">
                        <button
                            onClick={onClose}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                        >
                            ¡Entendido!
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
