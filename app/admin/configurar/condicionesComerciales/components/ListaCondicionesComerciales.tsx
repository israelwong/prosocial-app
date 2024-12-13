'use client'
import React, { useState, useEffect } from 'react'
import { obtenerCondicionesComerciales, ordenar } from '@/app/admin/_lib/condicionesComerciales.actions'
import { CondicionesComerciales } from '@/app/admin/_lib/types'
import { useRouter } from 'next/navigation'
import { useDragAndDrop } from '@/app/admin/_lib/dragAndDrop'

export default function ListaCondicionesComerciales() {

    const router = useRouter()
    const [condicionesComerciales, setCondicionesComerciales] = useState([] as CondicionesComerciales[])

    useEffect(() => {
        const fetchData = async () => {
            const condicionesComercialesData = await obtenerCondicionesComerciales()
            setCondicionesComerciales(condicionesComercialesData)
        }
        fetchData()
    }, [])


    //! Drag and drop begin
    const { items, handleDragStart, handleDrop, handleDragOver } = useDragAndDrop(condicionesComerciales);
    useEffect(() => {
        setCondicionesComerciales(items);
    }, [items]);

    useEffect(() => {
        const newOrder = condicionesComerciales.map((condicion, index) => ({
            ...condicion,
            orden: index + 1
        }));
        ordenar(newOrder);
    }, [condicionesComerciales]);
    //! Drag and drop end

    return (
        <div>
            <div className='mb-5 flex justify-between'>
                <h1 className='text-2xl'>Condiciones Comerciales</h1>
                <button
                    className='bg-blue-600 text-white px-4 py-2 rounded-md'
                    onClick={() => router.push('/admin/configurar/condicionesComerciales/nueva')}>
                    Crear nueva condición comercial
                </button>
            </div>

            {condicionesComerciales.length === 0 ? (
                <p className='py-10 text-center text-zinc-500'>No hay condiciones comerciales disponibles.</p>
            ) : (

                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-zinc-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descuento</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Anticipo</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Estátus</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-zinc-800 divide-y divide-gray-200 text-white">
                        {condicionesComerciales.map((condicion, index) => (
                            <tr key={condicion.id}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDrop(index)}

                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{condicion.nombre}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {condicion.descripcion ? condicion.descripcion : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                    {condicion.descuento ? `${condicion.descuento}%` : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                    {condicion.porcentaje_anticipo ? `${condicion.porcentaje_anticipo}%` : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                    <span className={`inline-block w-3 h-3 rounded-full ${condicion.status === 'active' ? 'bg-green-500' : 'bg-zinc-400'}`}></span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                    <button
                                        className='bg-blue-600 text-white px-4 py-2 rounded-md'
                                        onClick={() => router.push(`/admin/configurar/condicionesComerciales/${condicion.id}`)}>
                                        Editar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

        </div>
    )
}
