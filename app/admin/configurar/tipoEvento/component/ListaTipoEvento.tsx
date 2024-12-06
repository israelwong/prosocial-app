'use client'
import React, { useEffect, useState } from 'react'
import { obtenerTiposEvento, actualizarTipoEvento, eliminarTipoEvento, actualizarPosicionTipoEvento } from '@/app/admin/_lib/eventoTipo.actions'
import { EventoTipo } from '@/app/admin/_lib/types'
import FormCrearTipoEvento from './FormCrearTipoEvento'
import { useDragAndDrop } from '@/app/admin/_lib/dragAndDrop'
import { GripHorizontal } from 'lucide-react'

function ListaTipoEvento() {

    const [tiposEvento, setTiposEvento] = useState([] as EventoTipo[]);
    const [loading, setLoading] = useState(true)
    const [formTipoEventoVisible, setFormTipoEventoVisible] = useState(false)

    async function fetchTiposEvento() {
        const results = await obtenerTiposEvento()
        if (results) {
            setTiposEvento(results)
        }
        setLoading(false)
    }

    async function handleSubmitCrearEvento() {
        await fetchTiposEvento()
        setFormTipoEventoVisible(false)
    }

    function hanleCancelCrearEvento() {
        setFormTipoEventoVisible(false)
    }

    async function handleUpdateTipoEvento(id: string, nombreNuevo: string) {
        try {
            await actualizarTipoEvento(id, nombreNuevo)
            fetchTiposEvento()
        } catch (error) {
            console.error('Error actualizando tipo de evento:', error)
        }
    }

    async function handleDeleteTipoEvento(id: string) {
        if (confirm('¿Estás seguro de eliminar este tipo de evento?')) {
            try {
                await eliminarTipoEvento(id)
                fetchTiposEvento()
            } catch (error) {
                console.error('Error eliminando tipo de evento:', error)
            }
        }
    }

    useEffect(() => {
        fetchTiposEvento()
    }, [])

    //! Drag and drop begin
    const { items, handleDragStart, handleDrop, handleDragOver } = useDragAndDrop(tiposEvento);
    useEffect(() => {
        setTiposEvento(items);
    }, [items]);

    useEffect(() => {
        const newOrder = tiposEvento.map((item, index) => ({
            ...item,
            posicion: index + 1
        }));
        // console.log('nuevo irden', newOrder);
        actualizarPosicionTipoEvento(newOrder);
    }, [tiposEvento]);
    //! Drag and drop end

    return (
        <div className='max-w-lg'>

            <div className='flex justify-between items-center mb-5'>
                <h1 className='text-2xl'>Tipos de evento</h1>
                <button
                    className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm'
                    onClick={() => setFormTipoEventoVisible(true)} >
                    Agregar tipo de evento
                </button>
            </div>

            {formTipoEventoVisible && (
                <div className='pb-5'>
                    <FormCrearTipoEvento onSubmit={handleSubmitCrearEvento} onCancel={hanleCancelCrearEvento} />
                </div>
            )}

            <div>
                {loading && <p>Cargando...</p>}
                {tiposEvento.length > 0 ? (
                    <ul className='space-y-4'>
                        {tiposEvento.map((tipoEvento, index) => (
                            <li key={tipoEvento.id} className='flex  cursor-move items-center'
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDrop(index)}
                            >
                                <span className='text-white cursor-move pr-4'>
                                    <GripHorizontal />
                                </span>
                                <div className='flex flex-auto justify-between items-center gap-2'>
                                    <input
                                        type="text"
                                        value={tipoEvento.nombre}
                                        onChange={(e) => {
                                            const newNombre = e.target.value;
                                            setTiposEvento(prevTipoEventos =>
                                                prevTipoEventos.map(tipo =>
                                                    tipo.id === tipoEvento.id ? { ...tipo, nombre: newNombre } : tipo
                                                )
                                            );
                                        }}

                                        onBlur={(e) => {
                                            const newNombre = e.currentTarget.value;
                                            if (tipoEvento.id) {
                                                handleUpdateTipoEvento(tipoEvento.id, newNombre);
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                const newNombre = e.currentTarget.value;
                                                if (tipoEvento.id) {
                                                    handleUpdateTipoEvento(tipoEvento.id, newNombre);
                                                }
                                            }
                                        }
                                        }

                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    />
                                    <div>
                                        <button className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm'
                                            onClick={() => tipoEvento.id && handleDeleteTipoEvento(tipoEvento.id)}
                                        >Eliminar</button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className='text-zinc-500'>No hay tipos de evento disponibles.</p>
                )}
            </div>
        </div>
    )
}

export default ListaTipoEvento