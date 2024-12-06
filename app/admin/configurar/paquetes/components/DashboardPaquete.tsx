'use client'
import React, { useEffect, useState } from 'react'
import { EventoTipo } from '@/app/admin/_lib/types'
import { obtenerTiposEvento } from '@/app/admin/_lib/eventoTipo.actions'
import { obtenerPaquetesPorTipoEvento, clonarPaquete, actualizarOrdenPaquetes } from '@/app/admin/_lib/paquete.actions'
import { Paquete } from '@/app/admin/_lib/types'
import { Pencil, Copy } from 'lucide-react'
import FormCrearTipoEvento from './FormCrearTipoEvento'
import FormPaqueteNuevo from './FormPaqueteNuevo'
import { useRouter } from 'next/navigation'
import { useDragAndDrop } from '@/app/admin/_lib/dragAndDrop'

function DashboardPaquete() {

    const [tiposEvento, setTiposEvento] = useState<EventoTipo[]>([]);
    const [paquetes, setPaquetes] = useState<Paquete[]>([]);
    const [mostrarModalTipoEvento, setMostrarModalTipoEvento] = useState(false);
    const [tipoEventoSeleccionado, setTipoEventoSeleccionado] = useState<EventoTipo | null>(null);
    const [mostrarModalPaqueteNuevo, setMostrarModalPaqueteNuevo] = useState(false);
    const router = useRouter();

    async function fetchData() {
        const tiposEvento = await obtenerTiposEvento();
        setTiposEvento(tiposEvento);

        if (tiposEvento.length > 0) {
            const paquetesPorTipo = await Promise.all(tiposEvento.map(tipo => obtenerPaquetesPorTipoEvento(tipo.id)));
            setPaquetes(paquetesPorTipo.flat());
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModalCrearTipoEvento = () => {
        setMostrarModalTipoEvento(true);
    };

    const handleSubmitNuevoTipoEvento = async () => {
        await fetchData();
        setMostrarModalTipoEvento(false);
    }

    const handleCloseModalNuevoTipoEvento = () => {
        setMostrarModalTipoEvento(false);
    };

    const handleCloseModalNuevoPaquete = () => {
        setMostrarModalPaqueteNuevo(false);
    }

    const handleModalPaqueteNuevo = async (tipoEvento: EventoTipo) => {
        setTipoEventoSeleccionado(tipoEvento);
        setMostrarModalPaqueteNuevo(true);
    }

    const handleClonarPaquete = async (paqueteId: string) => {
        if (!confirm('¿Estás seguro de clonar este paquete?')) return;
        await clonarPaquete(paqueteId);
        await fetchData();
    }

    const { items, handleDragStart, handleDrop, handleDragOver } = useDragAndDrop(paquetes);

    useEffect(() => {
        setPaquetes(items);
    }, [items]);

    useEffect(() => {
        const nuevoOrden = paquetes.map((category, index) => ({
            ...category,
            posicion: index + 1
        }));
        actualizarOrdenPaquetes(nuevoOrden);
    }, [paquetes]);

    return (
        <div>
            <div className='flex justify-between mb-5 items-center'>
                <h3 className='text-2xl text-zinc-600'>Paquetes</h3>
                <button
                    className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
                    onClick={handleOpenModalCrearTipoEvento}
                >
                    Crear tipo de evento
                </button>
            </div>
            {tiposEvento.map((tipoEvento) => (
                <div key={tipoEvento.id} className='bg-zinc-900 mb-5 rounded-md'>
                    <ul>
                        <table className='min-w-full divide-y divide-zinc-600'>
                            <thead className='bg-zinc-800'>
                                <tr>
                                    <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6'>
                                        {tipoEvento.nombre}
                                    </th>
                                    <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6'>
                                        Precio
                                    </th>
                                    <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6'>
                                        Costo
                                    </th>
                                    <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6'>
                                        Gasto
                                    </th>
                                    <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6'>
                                        Utilidad
                                    </th>
                                    <th scope='col' className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6'>
                                        <button className='px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-md text-sm text-zinc-500'
                                            onClick={() => handleModalPaqueteNuevo(tipoEvento)}>
                                            Crear paquete
                                        </button>
                                    </th>
                                </tr>

                            </thead>
                            <tbody className='text-zinc-200'>
                                {paquetes
                                    .filter((paquete) => paquete.eventoTipoId === tipoEvento.id)
                                    .map((paquete, index) => (
                                        <tr key={paquete.id}
                                            draggable
                                            onDragStart={() => handleDragStart(index)}
                                            onDragOver={handleDragOver}
                                            onDrop={() => handleDrop(index)}
                                        >
                                            <td className='px-6 py-4 whitespace-nowrap text-sm font-medium '>
                                                {paquete.nombre}
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                                {paquete.precio && paquete.precio.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                                {paquete.costo && paquete.costo.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                                {paquete.gasto && paquete.gasto.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                                {paquete.utilidad && paquete.utilidad.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap font-medium gap-4 space-x-4 text-center'>
                                                <button
                                                    className=''
                                                    onClick={() => router.push(`/admin/configurar/paquetes/${paquete.id}`)}
                                                >
                                                    <Pencil size={20} />
                                                </button>
                                                <button className=''
                                                    onClick={() => handleClonarPaquete(paquete.id || '')}>
                                                    <Copy size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                {paquetes.filter((paquete) => paquete.eventoTipoId === tipoEvento.id).length === 0 && (
                                    <tr>
                                        <td colSpan={5} className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                            No hay paquetes disponibles para este tipo de evento.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </ul>
                </div>
            ))
            }
            {
                mostrarModalTipoEvento && (
                    <div className='fixed inset-0 flex items-center justify-center z-50 bg-zinc-800/50'>
                        <div className='bg-zinc-950 p-6 rounded shadow-lg w-1/5'>
                            <FormCrearTipoEvento
                                onCancel={handleCloseModalNuevoTipoEvento}
                                onSubmit={handleSubmitNuevoTipoEvento}
                            />
                        </div>
                    </div>
                )
            }
            {
                mostrarModalPaqueteNuevo && (
                    <div className='fixed inset-0 flex items-center justify-center z-50 bg-zinc-800/50'>
                        <div className='bg-zinc-950 p-6 rounded shadow-lg w-1/5'>
                            <FormPaqueteNuevo
                                tipoEvento={tipoEventoSeleccionado!}
                                onCancel={handleCloseModalNuevoPaquete}
                            />
                        </div>
                    </div>
                )
            }
        </div >
    )
}

export default DashboardPaquete