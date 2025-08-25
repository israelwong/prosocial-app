'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
    motivo: string
    redirigirA?: string // Nueva prop opcional
}

export default function RedirectCliente({ motivo, redirigirA = "/cliente" }: Props) {
    const router = useRouter()

    useEffect(() => {
        console.log(`🔄 ${motivo}, redirigiendo al cliente a: ${redirigirA}`)
        router.replace(redirigirA)
    }, [router, motivo, redirigirA])

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-white mb-2">Redirigiendo...</h2>
                <p className="text-zinc-400">{motivo}</p>
            </div>
        </div>
    )
}
