'use client'
import React, { useEffect, useState } from 'react'
import { Evento } from '@/app/admin/_lib/types'
import { actualizarEvento } from '@/app/admin/_lib/evento.actions'
import { obtenerTiposEvento } from '@/app/admin/_lib/eventoTipo.actions'

interface Props {
    evento: Evento
    onSuccess: () => void
    onClose: () => void
}

export default function FormEventoEditar({ evento, onSuccess, onClose }: Props) {
    const [nombre, setNombre] = useState(evento.nombre)
    const [eventoTipoId, setEventoTipoId] = useState(evento.eventoTipoId)
    const [tipoEvento, setTipoEvento] = useState(evento.tipoEvento)
    const [status, setStatus] = useState(evento.status)
    const [fechaEvento, setFechaEvento] = useState(new Date(evento.fecha_evento))
    const [tiposEvento, setTiposEvento] = useState<{ id: string, nombre: string }[]>([])
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchTipoEventos = async () => {
            const tiposEventos = await obtenerTiposEvento()
            setTiposEvento(tiposEventos)
            const tipoEvento = tiposEventos.find(tipo => tipo.id === evento.eventoTipoId)
            setTipoEvento(tipoEvento?.nombre ?? '')
        }
        fetchTipoEventos()
    }, [evento.eventoTipoId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!nombre || !eventoTipoId || !tipoEvento || !fechaEvento) {
            setError('Todos los campos son obligatorios')
            return
        }
        setError('')

        const response = await actualizarEvento(
            {
                id: evento.id,
                clienteId: evento.clienteId,
                eventoTipoId,
                nombre,
                status: status,
                fecha_evento: fechaEvento
            }
        )

        if (response.success) {
            onSuccess()
            return
        }
    }

    return (
        <div className="max-w-md mx-auto shadow-md rounded-lg p-6 bg-zinc-900">
            <h2 className="text-2xl font-bold mb-4">Editar evento</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className='space-y-5'>
                <div className="mb-4">
                    <label className="block text-zinc-600 text-sm mb-2" htmlFor="nombre">
                        Nombre
                    </label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded w-full py-2 px-3 text-zinc-300"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-zinc-600 text-sm mb-2" htmlFor="eventoTipoId">
                        Tipo de Evento
                    </label>
                    <select
                        id="eventoTipoId"
                        name="eventoTipoId"
                        value={eventoTipoId ?? ''}
                        onChange={(e) => setEventoTipoId(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded w-full py-2 px-3 text-zinc-300"
                    >
                        {tiposEvento.map(tipo => (
                            <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-zinc-600 text-sm mb-2" htmlFor="estatus">
                        Estatus
                    </label>
                    <select
                        id="status"
                        name="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded w-full py-2 px-3 text-zinc-300"
                    >
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-zinc-600 text-sm mb-2" htmlFor="fechaevento">
                        Fecha de Evento
                    </label>
                    <input
                        type="date"
                        id="fechaevento"
                        name="fechaevento"
                        value={fechaEvento.toISOString().split("T")[0]} // Convierte al formato requerido
                        onChange={e => setFechaEvento(new Date(e.target.value))}
                        className="bg-zinc-900 border border-zinc-800 rounded w-full py-2 px-3 text-zinc-300"
                    />
                </div>
                <div className="space-y-3">
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                    >
                        Guardar Cambios
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    )
}