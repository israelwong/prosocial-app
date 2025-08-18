'use client'
import React from 'react'

interface Props {
    fechaDisponible: boolean
}

export default function BadgeDisponibilidad({ fechaDisponible }: Props) {
    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${fechaDisponible
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
            <span className="text-xs">{fechaDisponible ? '✅' : '🚫'}</span>
            {fechaDisponible ? 'Fecha disponible' : 'Fecha no disponible'}
        </span>
    )
}
