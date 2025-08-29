'use client'
import React, { useState, useEffect } from 'react'
import { CheckCircle, X } from 'lucide-react'

interface Props {
    show: boolean
    mensaje: string
    onClose: () => void
    duracion?: number
}

export default function NotificacionRealtime({ show, mensaje, onClose, duracion = 5000 }: Props) {
    useEffect(() => {
        if (show && duracion > 0) {
            const timer = setTimeout(() => {
                onClose()
            }, duracion)

            return () => clearTimeout(timer)
        }
    }, [show, duracion, onClose])

    if (!show) return null

    return (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-5">
            <div className="bg-green-900/90 backdrop-blur-sm border border-green-700 rounded-lg p-4 shadow-2xl max-w-sm">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-green-400 mb-1">
                            ¡Nueva cotización disponible!
                        </p>
                        <p className="text-sm text-green-100">
                            {mensaje}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex-shrink-0 text-green-300 hover:text-green-100 transition-colors p-0.5"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
