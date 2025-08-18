'use client'

import { useEffect } from 'react'

interface EventoMetadata {
    eventoId: string;
    eventoTipoId: string;
    eventoTipoNombre: string;
    cotizacionId?: string;
}

interface Props {
    metadata: EventoMetadata;
}

export default function EventoMetadataProvider({ metadata }: Props) {
    useEffect(() => {
        // Guardar metadata del evento en sessionStorage para uso en paquetes
        sessionStorage.setItem('eventoMetadata', JSON.stringify(metadata))

        // Limpiar después de 1 hora (en caso de que el usuario no navegue)
        const timer = setTimeout(() => {
            sessionStorage.removeItem('eventoMetadata')
        }, 60 * 60 * 1000) // 1 hora

        return () => clearTimeout(timer)
    }, [metadata])

    return null // Este componente no renderiza nada
}
