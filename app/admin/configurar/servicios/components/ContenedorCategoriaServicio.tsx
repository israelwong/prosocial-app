'use client'
import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { obtenerServicioPorCategoria, actualizarPosicionServicio, duplicarServicio, actualizarVisibilidadCliente } from '@/app/admin/_lib/servicio.actions'
import { useDragAndDrop } from '@/app/admin/_lib/dragAndDrop'
import { ServicioCategoria, Servicio } from '@/app/admin/_lib/types'
import { useRouter } from 'next/navigation'
import { Copy, Pencil } from 'lucide-react'
import { Eye, EyeOff } from 'lucide-react'


interface Props {
    categoria: ServicioCategoria,
    searchTerm: string
}

function ContenedorCategoriaTarea({ categoria, searchTerm }: Props) {

    const router = useRouter();
    const [servicios, setServicios] = useState<Servicio[]>([]);

    const fetchServicios = useCallback(async () => {
        const servicios = await obtenerServicioPorCategoria(categoria.id);
        setServicios(servicios || []);
    }, [categoria.id]);

    useEffect(() => {
        fetchServicios();
    }, [fetchServicios]);

    const { items, handleDragStart, handleDrop, handleDragOver } = useDragAndDrop(servicios);
    useEffect(() => {
        setServicios(items);
    }, [items]);

    const reordenamiento = useMemo(() => servicios.map((item, index) => ({
        ...item,
        posicion: index + 1
    })), [servicios]);

    const hasReordered = useMemo(() => servicios.some((item, index) => item.posicion !== reordenamiento[index].posicion), [servicios, reordenamiento]);

    useEffect(() => {
        if (hasReordered) {
            actualizarPosicionServicio(reordenamiento);
        }
    }, [hasReordered, reordenamiento]);

    const handleDuplicarServicio = async (id: string) => {
        const response = confirm('¿Estás seguro de duplicar este servicio?')
        if (response) {
            await duplicarServicio(id);
            fetchServicios();
        }
    }

    const filteredServicio = useMemo(() => {
        return servicios.filter(servicio => servicio.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [servicios, searchTerm]);

    const handleVIsibilidadCliente = async (servicioId: string, visible: boolean) => {
        actualizarVisibilidadCliente(servicioId, visible);
        fetchServicios();
    }

    return (
        <div className='w-full'>

            <div className="mb-5">

                {servicios.length > 0 ? (
                    <div className="overflow-x-auto border border-zinc-600 rounded-md text-sm">
                        <table className="min-w-full table-fixed border-collapse border border-white rounded-md overflow-hidden">
                            <colgroup>
                                <col className="w-1/2" />
                                <col className="w-1/10" />
                                <col className="w-1/10" />
                                <col className="w-1/10" />
                                <col className="w-1/10" />
                                <col className="w-1/10" />
                                <col className="w-1/10" />
                            </colgroup>
                            <thead className="bg-zinc-900/50 text-zinc-200 font-semibold  text-balance">
                                <tr>
                                    <th className="p-3 text-left leading-3">
                                        {categoria.nombre.toUpperCase()}
                                    </th>
                                    <th className="p-3 text-left">Precio</th>
                                    <th className="p-3 text-left">Costo</th>
                                    <th className="p-3 text-left">Gasto</th>
                                    <th className="p-3 text-left">Utilidad</th>
                                    <th className="p-3 text-center">
                                        <button
                                            className="px-4 py-2 text-white rounded hover:bg-blue-600 text-sm bg-blue-800"
                                            onClick={() => router.push(`servicios/nuevo/${categoria.id}`)}>
                                            Agregar
                                        </button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredServicio.map((servicio, index) => (
                                    <tr key={servicio.id} className="odd:bg-zinc-800 even:bg-zinc-900 hover:bg-zinc-700 text-zinc-200"
                                        draggable
                                        onDragStart={() => handleDragStart(index)}
                                        onDragOver={handleDragOver}
                                        onDrop={() => handleDrop(index)}
                                    >
                                        <td className="p-3 text-wrap max-w-xs pr-5">{servicio.nombre}</td>
                                        <td className="p-3 truncate">
                                            {servicio.precio_publico ? servicio.precio_publico.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) : '--'}
                                        </td>
                                        <td className="p-3 truncate">
                                            {servicio.costo ? servicio.costo.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) : '--'}
                                        </td>
                                        <td className="p-3 truncate">
                                            {servicio.gasto ? servicio.gasto.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) : '--'}
                                        </td>
                                        <td className="p-3 truncate">
                                            {servicio.utilidad ? servicio.utilidad.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) : '--'}
                                        </td>

                                        <td className="p-3 flex gap-5 justify-center">

                                            <button onClick={() => servicio.id && handleVIsibilidadCliente(servicio.id, !servicio.visible_cliente)}>
                                                {servicio.visible_cliente ? <Eye size={16} /> : <EyeOff size={16} />}
                                            </button>

                                            <button
                                                onClick={() => router.push(`/admin/configurar/servicios/${servicio.id}`)}
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button onClick={() => servicio.id && handleDuplicarServicio(servicio.id)}>
                                                <Copy size={16} />
                                            </button>

                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="no-tareas px-5 py-10 text-zinc-700 bg-zinc-800 rounded-md">
                        <div className='flex justify-between items-center'>
                            <p className='text-xl'>
                                No hay servicios asociados a <span className='text-zinc-500'>{categoria.nombre}</span>
                            </p>
                            <button
                                onClick={() => router.push(`servicios/nuevo/${categoria.id}`)}
                                className="px-4 py-2  bg-blue-800 text-white rounded hover:bg-blue-600 text-sm"
                            >
                                Agregar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ContenedorCategoriaTarea