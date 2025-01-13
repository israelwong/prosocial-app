'use client'
import React, { useState, useCallback } from 'react'
import { crearAgendaEvento } from '@/app/admin/_lib/agenda.actions'
import { AgendaTipo } from '@/app/admin/_lib/types'

interface Props {
    eventoId: string
    agendaTipos: AgendaTipo[]
    userId: string
    onClose: () => void,
    onSubmit: () => void
}

export default function ModalFormAgendaNuevo({ eventoId, userId, agendaTipos, onClose, onSubmit }: Props) {
    const [concepto, setConcepto] = useState<string | null>(null);
    const [descripcion, setDescripcion] = useState<string | null>(null);
    const [googleMapsUrl, setGoogleMapsUrl] = useState<string | null>(null);
    const [direccion, setDireccion] = useState<string | null>(null);
    const [fecha, setFecha] = useState<Date | null>(null);
    const [hora, setHora] = useState<string | null>(null);
    const [error, setError] = useState<{ concepto: string, fecha: string, agendaTipo: string }>({
        concepto: '',
        fecha: '',
        agendaTipo: ''
    });
    const [guardando, setGuardando] = useState(false);
    const [agendaTipo, setAgendaTipo] = useState<string | null>(null);


    //! VALIDAR FORMULARIO
    const validarFormulario = useCallback(() => {
        const newError = { ...error };

        if (!concepto) {
            newError.concepto = 'El concepto es requerido';
        } else {
            newError.concepto = '';
        }

        if (!fecha) {
            newError.fecha = 'La fecha es requerida';
        } else {
            newError.fecha = '';
        }
        setError(newError);

        if (!agendaTipo) {
            newError.agendaTipo = 'El tipo de agenda es requerido';
        } else {
            newError.agendaTipo = '';
        }

        return !newError.concepto && !newError.fecha;

    }, [concepto, descripcion, googleMapsUrl, direccion, fecha, hora, error])


    //! GUARDAR
    const handleGuardar = useCallback(() => {

        if (!validarFormulario()) {
            return
        }

        const agenda = {
            concepto,
            descripcion,
            googleMapsUrl,
            direccion,
            fecha,
            hora,
            eventoId,
            userId,
            agendaTipo: agendaTipo || '',
        }

        setGuardando(true);
        crearAgendaEvento(agenda).then((response) => {
            if (response.success) {
                onSubmit();
            }
        }).catch((error) => {
            console.error('Error al crear la agenda:', error);
            setGuardando(false);
        });

    }, [concepto, descripcion, googleMapsUrl, direccion, fecha, hora, eventoId,])


    return (
        <div className='max-w-md mx-auto p-4'>
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                <div className="bg-zinc-800 rounded-lg shadow-lg p-6 w-full max-w-md">
                    {/* header */}
                    <div className='flex justify-between items-center mb-5'>
                        <h1 className='text-2xl font-bold'>
                            Agendar servicio
                        </h1>
                    </div>

                    {/* FORMULARIO */}
                    <div>

                        <div className='mb-5'>
                            <label className='block text-zinc-400 text-sm font-bold mb-2' htmlFor='tipo'>
                                Tipo de agenda
                            </label>
                            <select
                                id='tipo'
                                value={agendaTipo || ''}
                                onChange={(e) => setAgendaTipo(e.target.value)}
                                className='shadow appearance-none border border-zinc-800 rounded w-full py-2 px-3 text-zinc-200 bg-zinc-900 leading-tight focus:outline-none focus:shadow-outline'
                            >
                                <option value=''>Selecciona una opción</option>
                                {agendaTipos.map((tipo, index) => (
                                    <option key={index} value={tipo.nombre}>
                                        {tipo.nombre}
                                    </option>
                                ))}
                            </select>
                            {error.agendaTipo && <p className='text-red-500 pt-1'>{error.agendaTipo}</p>}
                        </div>

                        <div className='mb-5'>
                            <label className='block text-zinc-400 text-sm font-bold mb-2' htmlFor='concepto'>
                                Concepto
                            </label>
                            <input
                                id='concepto'
                                type='text'
                                value={concepto || ''}
                                onChange={(e) => setConcepto(e.target.value)}
                                className='shadow appearance-none border border-zinc-800 rounded w-full py-2 px-3 text-zinc-200 bg-zinc-900 leading-tight focus:outline-none focus:shadow-outline'
                            />
                            {error.concepto && <p className='text-red-500 pt-1'>{error.concepto}</p>}
                        </div>

                        <div className='mb-5'>
                            <label className='block text-zinc-400 text-sm font-bold mb-2' htmlFor='descripcion'>
                                Descripción
                            </label>
                            <textarea
                                id='descripcion'
                                value={descripcion || ''}
                                rows={4}
                                onChange={(e) => setDescripcion(e.target.value)}
                                className='shadow appearance-none border border-zinc-800 rounded w-full py-2 px-3 text-zinc-200 bg-zinc-900 leading-tight focus:outline-none focus:shadow-outline'
                            />
                        </div>

                        <div className='mb-5'>
                            <label className='block text-zinc-400 text-sm font-bold mb-2' htmlFor='direccion'>
                                Dirección de prestación del servicio <span className='text-zinc-600'>(opcional)</span>
                            </label>
                            <textarea
                                id='direccion'
                                rows={4}
                                value={direccion || ''}
                                onChange={(e) => setDireccion(e.target.value)}
                                className='shadow appearance-none border border-zinc-800 rounded w-full py-2 px-3 text-zinc-200 bg-zinc-900 leading-tight focus:outline-none focus:shadow-outline'
                            />
                        </div>

                        <div className='mb-5'>
                            <label className='block text-zinc-400 text-sm font-bold mb-2' htmlFor='googleMapsUrl'>
                                URL de Google Maps <span className='text-zinc-600'>(opcional)</span>
                            </label>
                            <input
                                id='googleMapsUrl'
                                type='text'
                                value={googleMapsUrl || ''}
                                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                                className='shadow appearance-none border border-zinc-800 rounded w-full py-2 px-3 text-zinc-200 bg-zinc-900 leading-tight focus:outline-none focus:shadow-outline'
                            />
                        </div>

                        <div className='grid grid-cols-2 gap-5'>

                            <div className='mb-5'>
                                <label className='block text-zinc-400 text-sm font-bold mb-2' htmlFor='fecha'>
                                    Fecha
                                </label>
                                <input
                                    id='fecha'
                                    type='date'
                                    value={fecha ? fecha.toISOString().split('T')[0] : ''}
                                    onChange={(e) => setFecha(new Date(e.target.value))}
                                    className='shadow appearance-none border border-zinc-800 rounded w-full py-2 px-3 text-zinc-200 bg-zinc-900 leading-tight focus:outline-none focus:shadow-outline'
                                />
                                {error.fecha && <p className='text-red-500 pt-1'>{error.fecha}</p>}
                            </div>
                            <div className='mb-5'>
                                <label className='block text-zinc-400 text-sm font-bold mb-2' htmlFor='hora'>
                                    Hora <span className='text-zinc-600'>(opcional)</span>
                                </label>
                                <input
                                    id='hora'
                                    type='time'
                                    value={hora || ''}
                                    onChange={(e) => setHora(e.target.value)}
                                    className='shadow appearance-none border border-zinc-800 rounded w-full py-2 px-3 text-zinc-200 bg-zinc-900 leading-tight focus:outline-none focus:shadow-outline'
                                />
                            </div>
                        </div>

                        {/* ACCIONES */}
                        <div className='space-y-2'>
                            <button
                                onClick={() => handleGuardar()}
                                className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full ${guardando ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={guardando}
                            >
                                {guardando ? 'Guardando...' : 'Agendar'}
                            </button>
                            <button className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full'
                                onClick={onClose}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    )
}
