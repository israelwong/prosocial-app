'use client'
import React from 'react'

interface Props {
    fechaDisponible: boolean
}

export default function BadgeDisponibilidad({ fechaDisponible }: Props) {
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${fechaDisponible
            ? 'bg-green-500/10 text-green-400'
            : 'bg-red-500/10 text-red-400'
            }`}>
            <span className="text-[10px]">{fechaDisponible ? '●' : '●'}</span>
            {fechaDisponible ? 'Disponible' : 'No disponible'}
        </span>
    )
}
