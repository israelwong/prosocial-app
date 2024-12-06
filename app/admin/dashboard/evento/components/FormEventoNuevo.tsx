'use client'
import React, { useEffect, useState } from 'react'
import { crearEvento } from '@/app/admin/_lib/evento.actions'
import { obtenerTiposEvento } from '@/app/admin/_lib/eventoTipo.actions'

interface Props {
    clienteId: string
    onSuccess: () => void
    onClose: () => void
}

export default function FormEventoNuevo({ clienteId, onSuccess, onClose }: Props) {

    const [nombre, setNombre] = useState('')
    const [eventoTipoId, setEventoTipoId] = useState('')
    const [fechaEvento, setFechaEvento] = useState(new Date())
    const [tiposEvento, setTiposEvento] = useState<{ id: string, nombre: string }[]>([])
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchTipoEventos = async () => {
            const tiposEventos = await obtenerTiposEvento()
            setTiposEvento(tiposEventos)
        }
        fetchTipoEventos()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!nombre || !eventoTipoId || !fechaEvento) {
            setError('Todos los campos son obligatorios')
            return
        }
        setError('')

        const response = await crearEvento(
            {
                clienteId,
                eventoTipoId,
                nombre: nombre.charAt(0).toUpperCase() + nombre.slice(1),
                fecha_evento: fechaEvento
            }
        )

        if (response.success) {
            onSuccess()
            return
        } else {
            setError('Error al crear el evento')
        }
    }

    return (
        <div className="max-w-md mx-auto shadow-md rounded-lg p-6 bg-zinc-900">
            <h2 className="text-2xl font-bold mb-4">Crear nuevo evento</h2>
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
                        value={eventoTipoId}
                        onChange={(e) => setEventoTipoId(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded w-full py-2 px-3 text-zinc-300"
                    >
                        <option value="">Seleccione un tipo de evento</option>
                        {tiposEvento.map(tipo => (
                            <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                        ))}
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
                        Crear Evento
                    </button>
                    <button
                        type="button"
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