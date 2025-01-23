'use client'
import React, { useEffect, useState } from "react"
import { actualizarEvento, obtenerEventoPorId, eliminarEvento, actualizarEtapa } from '@/app/admin/_lib/evento.actions'
import { useRouter } from "next/navigation"
import { Trash2 } from 'lucide-react'

import { asignarEventoUser, liberarEventoUser } from '@/app/admin/_lib/evento.actions'
import { EventoEtapa } from '@/app/admin/_lib/types'
import Cookies from 'js-cookie'

import { obtenerEventoEtapas } from "@/app/admin/_lib/EventoEtapa.actions"

interface Props {
    eventoId: string
    onAsignacionEvento?: (status: boolean) => void
}

export default function FichaEventoV2({ eventoId, onAsignacionEvento }: Props) {

    // const [error, setError] = useState('')
    // const [eventoTipoId, setEventoTipoId] = useState<string | null>(null)

    //! variables del evento
    const [nombre, setNombre] = useState<string>('')
    const [fechaEvento, setFechaEvento] = useState<Date | null>(null)
    const [fechaCreacion, setFechaCreacion] = useState<Date | null>(null)
    const [fechaActualizacion, setFechaActualizacion] = useState<Date | null>(null)
    const [actualizandoEvento, setActualizandoEvento] = useState(false)
    const [respuestaServidor, setRespuestaServidor] = useState('')
    const [errorEliminar, setErrorEliminar] = useState('')
    const [eventoTipo, setEventoTipo] = useState<string | null>(null)
    const [userId, setUserId] = useState<string | null>(null)
    const router = useRouter()

    //! etapas
    const [etapas, setEtapas] = useState<EventoEtapa[]>([])
    const [etapaActualId, setEtapaActualId] = useState<string>()

    //! mensajes
    const [asignandoEvento, setAsignadoEvento] = useState(false)
    const [eventoAsignado, setEventoAsignado] = useState(false)

    useEffect(() => {

        obtenerEventoPorId(eventoId).then((data) => {
            if (data) {
                setNombre(data.nombre ?? '')
                setFechaEvento(data.fecha_evento ? new Date(data.fecha_evento) : null)
                setFechaCreacion(data.createdAt ? new Date(data.createdAt) : null)
                setFechaActualizacion(data.updatedAt ? new Date(data.updatedAt) : null)
                setEtapaActualId(data.eventoEtapaId ?? undefined)
                setUserId(data.userId ?? null)
                setEventoTipo(data.EventoTipo?.nombre ?? '')
            }
        });

        obtenerEventoEtapas().then((data) => {
            setEtapas(data)
        })

    }, [eventoId])

    const handleSubmit = async () => {
        // setError('')
        setActualizandoEvento(true)
        const response = await actualizarEvento(
            {
                id: eventoId,
                nombre,
                fecha_evento: fechaEvento ?? new Date()
            }
        )
        if (response) {
            setRespuestaServidor('Información actualizada correctamente')
            setTimeout(() => {
                setRespuestaServidor('')
            }, 2000);
        }
        setActualizandoEvento(false)
    }

    const handleEliminarEvento = async () => {
        if (confirm('¿Estás seguro de eliminar este evento?')) {
            const response = await eliminarEvento(eventoId)
            if (response.success) {
                router.push('/admin/dashboard/eventos')
            } else {
                setErrorEliminar('No se puede eliminar este evento, primero debes eliminar las cotizaciones y los comentarios asociados.')
            }
        }
    }

    const handleActualizarEtapa = async (etapaActualId: string) => {
        if (confirm('¿Estás seguro de actualizar la etapa para este evento?')) {
            if (etapaActualId) {
                await actualizarEtapa(eventoId, etapaActualId)
                setEtapaActualId(etapaActualId)
                // console.log(response)
            } else {
                console.error('etapaActualId is undefined');
            }
        }
    }

    const handleAsignarmeEvento = async () => {

        const currenteUserId = JSON.parse(Cookies.get('user') || '{}').id || ''
        const segundaEtapaId = etapas[1]?.id;

        if (segundaEtapaId) {
            setAsignadoEvento(true)
            await asignarEventoUser(eventoId, currenteUserId, segundaEtapaId)
            setUserId(currenteUserId)
            if (onAsignacionEvento) {
                onAsignacionEvento(true);
            }

            await actualizarEtapa(eventoId, segundaEtapaId)
            setEtapaActualId(segundaEtapaId)

            setEventoAsignado(true)
            setTimeout(() => {
                setEventoAsignado(false)
            }, 2000)
            setAsignadoEvento(false)
        }

    }

    const handleLiberarEvento = async () => {
        if (confirm('¿Estás seguro de liberar este evento?')) {
            await liberarEventoUser(eventoId)
            if (onAsignacionEvento) {
                onAsignacionEvento(false)
            }
            const primeraEtapaId = etapas[0]?.id;
            setEtapaActualId(primeraEtapaId)
            setUserId(null)
        }
    }

    return (
        <div className=''>

            <div className='space-y-5'>

                <div className='mb-5 flex items-center justify-between'>

                    <div className='text-zinc-500 text-xl font-bold'>
                        Detalles de evento
                    </div>
                    <div>
                        <select
                            value={etapaActualId}
                            onChange={(e) => handleActualizarEtapa(e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 rounded w-full py-2 px-3 text-zinc-500"
                        >
                            {etapas.length > 0 ? (
                                etapas.map((etapa) => (
                                    <option key={etapa.id} value={etapa.id}>
                                        {etapa.nombre}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>
                                    Cargando etapas...
                                </option>
                            )}
                        </select>
                    </div>

                </div>

                <div className='border border-zinc-800 rounded-md p-5 '>

                    <div className="mb-4">
                        <label className="block text-zinc-600 text-sm mb-2" htmlFor="nombre">
                            Nombre del evento
                        </label>
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder={nombre ? 'Nombre del evento' : 'Aún no definido'}
                            className={`bg-zinc-900 rounded w-full py-2 px-3 text-white placeholder-zinc-700 placeholder-italic ${!nombre ? 'border border-red-500' : 'border border-zinc-800'}`}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-zinc-600 text-sm mb-2" htmlFor="eventoTipoId">
                            Tipo de Evento
                        </label>

                        <div
                            className="bg-zinc-900 border border-zinc-800 rounded w-full py-2 px-3 text-zinc-500"
                        >
                            {eventoTipo}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-zinc-600 text-sm mb-2" htmlFor="fechaevento">
                            Fecha de evento
                        </label>
                        <input
                            type="date"
                            id="fechaevento"
                            name="fechaevento"
                            value={fechaEvento ? fechaEvento.toISOString().split("T")[0] : ''} // Convierte al formato requerido
                            onChange={e => setFechaEvento(new Date(e.target.value))}
                            className="bg-zinc-900 border border-yellow-600 rounded w-full py-2 px-3 text-zinc-300"
                        />
                    </div>

                    <div className='grid grid-cols-2'>

                        <p className='text-sm text-zinc-500 italic mb-0'>
                            Creación  {fechaCreacion ? new Date(fechaCreacion).toLocaleString('es-ES', {
                                year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'
                            }) : ''}
                        </p>

                        <p className='text-sm text-zinc-500 italic mb-5'>
                            Actualización {fechaActualizacion ? new Date(fechaActualizacion).toLocaleString('es-ES', {
                                year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'
                            }) : ''}
                        </p>
                    </div>
                    {eventoId ? (
                        <div className="space-y-3">
                            {respuestaServidor &&
                                <p className="p-3 bg-green-600 text-green-200 text-center rounded-md">{respuestaServidor}</p>
                            }

                            <button
                                onClick={handleSubmit}
                                className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full ${actualizandoEvento ? 'bg-zinc-500 cursor-not-allowed' : ''}`}
                                disabled={actualizandoEvento}
                            >
                                {actualizandoEvento ? 'Actualizando información...' : 'Actualizar información'}
                            </button>

                            {eventoAsignado && (
                                <p className="p-3 bg-green-600 text-green-200 text-center rounded-md">
                                    Evento asignado correctamente
                                </p>
                            )}

                            {userId ? (
                                <button
                                    className="text-yellow-500 py-2 flex items-center justify-center w-full text-sm border border-yellow-500 rounded-md"
                                    onClick={() => handleLiberarEvento()}
                                >
                                    Liberar evento para otro usuario
                                </button>
                            ) : (
                                <button
                                    className={`border border-yellow-500 font-bold py-2 px-4 rounded w-full ${asignandoEvento ? 'bg-zinc-500 cursor-not-allowed text-zinc-400' : 'bg-yellow-600 text-yellow-100'}`}
                                    onClick={() => handleAsignarmeEvento()}
                                    disabled={asignandoEvento}
                                >
                                    {asignandoEvento ? 'Asignando evento...' : 'Asignarme evento'}
                                </button>
                            )}

                            <button
                                onClick={() => handleEliminarEvento()}
                                className="text-red-500 py-2 flex items-center justify-center w-full text-sm"
                            >
                                <Trash2 size={15} className='mr-2' />
                                Eliminar evento
                            </button>

                            {errorEliminar && <p className="text-red-500 text-sm">{errorEliminar}</p>}
                        </div>
                    ) : (
                        <p className="text-zinc-500 text-center">Cargando información del evento...</p>
                    )}

                </div>
            </div>
        </div>
    )
}
