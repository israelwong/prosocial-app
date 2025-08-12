'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { EventoConDetalles } from '@/app/admin/_lib/schemas/evento.schemas'
import { Eye } from 'lucide-react'

interface EventosTableProps {
    eventos: EventoConDetalles[]
}

export default function EventosTable({ eventos }: EventosTableProps) {
    const router = useRouter()

    const handleRowClick = (eventoId: string) => {
        router.push(`/admin/dashboard/eventos/${eventoId}`)
    }

    if (eventos.length === 0) {
        return (
            <div className="text-center py-8 bg-zinc-900/50 rounded-lg">
                <p className="text-zinc-400">No hay eventos en esta etapa.</p>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto bg-zinc-900 rounded-lg border border-zinc-800">
            <table className="min-w-full text-sm text-left text-zinc-300">
                <thead className="bg-zinc-800 text-xs text-zinc-400 uppercase tracking-wider">
                    <tr>
                        <th scope="col" className="px-6 py-3">
                            Evento
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Cliente
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Fecha del Evento
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Tipo
                        </th>
                        <th scope="col" className="px-6 py-3 text-center">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                    {eventos.map((evento) => (
                        <tr
                            key={evento.id}
                            className="hover:bg-zinc-800/50 cursor-pointer transition-colors duration-150"
                            onClick={() => handleRowClick(evento.id)}
                        >
                            <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                                {evento.nombre}
                            </td>
                            <td className="px-6 py-4">
                                {evento.Cliente.nombre}
                            </td>
                            <td className="px-6 py-4">
                                {new Date(evento.fecha_evento).toLocaleDateString('es-MX', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </td>
                            <td className="px-6 py-4">
                                {evento.EventoTipo.nombre}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <button
                                    className="text-blue-400 hover:text-blue-300"
                                    title="Ver detalles"
                                >
                                    <Eye size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
