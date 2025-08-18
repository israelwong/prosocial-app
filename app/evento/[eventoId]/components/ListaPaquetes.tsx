'use client'
import React from 'react'
import Link from 'next/link'

interface Paquete {
    id: string
    nombre: string
    precio: number | null
}

interface Props {
    paquetes: Paquete[]
    eventoId: string
}

export default function ListaPaquetes({ paquetes, eventoId }: Props) {
    if (!paquetes.length) return null

    const formatearPrecio = (precio: number | null) => {
        if (!precio) return 'Consulta precio'
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0
        }).format(precio)
    }

    return (
        <div className="space-y-8 mt-16">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold text-white mb-2">
                    Paquetes pre-diseñados
                </h3>
                <p className="text-zinc-400 text-base">
                    Opciones listas para ti
                </p>
            </div>
            <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {paquetes.map((paquete) => (
                        <Link
                            key={paquete.id}
                            href={`/evento/paquetes/${paquete.id}`}
                            className="block w-full max-w-sm mx-auto"
                        >
                            <div className="p-5 rounded-xl border border-zinc-700 bg-zinc-900 hover:border-white/20 transition">
                                <h4 className="text-lg font-medium text-white mb-2 truncate">
                                    {paquete.nombre}
                                </h4>
                                <div className="flex items-baseline gap-2 mb-4">
                                    <span className="text-2xl font-bold text-white">
                                        {formatearPrecio(paquete.precio)}
                                    </span>
                                    {paquete.precio && (
                                        <span className="text-xs text-zinc-400 font-medium">
                                            MXN
                                        </span>
                                    )}
                                </div>
                                <span className="inline-block text-sm text-zinc-300 font-semibold hover:underline">
                                    Ver paquete &rarr;
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
