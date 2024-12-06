import React, { useState, useEffect } from 'react'
import { Servicio, ServicioCategoria } from '@/app/admin/_lib/types'
import { obtenerCategories } from '@/app/admin/_lib/categorias.actions'
import { Trash } from 'lucide-react'

interface Props {
    servicios: Servicio[]
    onActualizarServicio: (servicio: Servicio) => void
}

export default function Whishlist({ servicios, onActualizarServicio }: Props) {

    const [categorias, setCategorias] = useState([] as ServicioCategoria[])

    useEffect(() => {
        const fetchData = async () => {
            const categoriasData = await obtenerCategories()
            setCategorias(categoriasData)
        }
        fetchData()
    }, [])

    const handleUpdateWhishlist = (servicio: Servicio) => {
        const index = servicios.findIndex(s => s.id === servicio.id)
        if (index === -1) return
        servicios[index] = servicio
        servicios.sort((a, b) => (a.posicion ?? 0) - (b.posicion ?? 0)) // Ordenar por posición ascendente
        onActualizarServicio(servicio)
        setCategorias([...categorias])
    }

    const handleDeleteServicio = (servicio: Servicio) => {
        const index = servicios.findIndex(s => s.id === servicio.id)
        if (index === -1) return
        servicios.splice(index, 1)
        onActualizarServicio(servicio)
        setCategorias([...categorias])
    }

    return (
        <div className="sticky top-5">

            <div className='flex justify-between items-center mb-5'>
                <p className='text-xl text-zinc-500'>
                    Wishlist
                </p>

                <button
                    onClick={() => {
                        servicios.length = 0;
                        onActualizarServicio({} as Servicio); // Trigger an update with an empty object
                        setCategorias([...categorias]);
                    }}
                    className='text-zinc-600 rounded-md border border-zinc-600 px-3 py-1 text-sm'
                >
                    Vaciar lista
                </button>
            </div>

            {servicios.length === 0 ? (
                <p className='py-16 px-5 border border-dashed border-zinc-800 rounded-md text-center text-zinc-800 text-xl font-light'>
                    No hay servicios en esta lista
                </p>
            ) : (
                categorias.map(categoria => {
                    const serviciosFiltrados = servicios
                        .filter(servicio => servicio.servicioCategoriaId === categoria.id)
                        .sort((a, b) => (a.posicion ?? 0) - (b.posicion ?? 0))
                    if (serviciosFiltrados.length === 0) return null
                    return (

                        <div key={categoria.id} className="mb-6 bg-zinc-900 border border-zinc-800 p-5 rounded-md">
                            <table className="min-w-full table-fixed border-collapse border border-white rounded-md overflow-hidden">
                                <thead>
                                    <tr>
                                        <th className="p-3 text-start text-zinc-600 w-1/2">{categoria.nombre}</th>
                                        <th className="p-3 text-center text-zinc-600">Precio</th>
                                        <th className="p-3 text-center text-zinc-600">Cantidad</th>
                                        <th className="p-3 text-center text-zinc-600">Total</th>
                                        <th className="p-3 text-center text-zinc-600"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-700">
                                    {serviciosFiltrados.map(servicio => (
                                        <tr key={servicio.id} className="hover:bg-zinc-800">
                                            <td className="p-3 text-wrap pr-4 text-start">
                                                {servicio.nombre}
                                            </td>
                                            <td className="p-3 text-center">
                                                {(servicio.precio_publico ?? 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                            </td>
                                            <td className="text-center px-3">
                                                <input
                                                    type="number"
                                                    value={servicio.cantidad ?? 0}
                                                    onFocus={(e) => e.target.select()}
                                                    onChange={(e) => {
                                                        const newCantidad = parseInt(e.target.value, 10) || 0;
                                                        servicio.cantidad = newCantidad;
                                                        handleUpdateWhishlist(servicio);
                                                        setCategorias([...categorias]);
                                                    }}
                                                    className='text-center bg-transparent border-none outline-none w-1/2'
                                                    step="any"
                                                />
                                            </td>
                                            <td className="text-center">
                                                {((servicio.precio_publico ?? 0) * (servicio.cantidad ?? 0)).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                            </td>
                                            <td className="text-center pt-2">
                                                <button
                                                    onClick={() => {
                                                        handleDeleteServicio(servicio);
                                                        setCategorias([...categorias]);
                                                    }}
                                                    className="text-red-600 mx-4"
                                                >
                                                    <Trash size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                })
            )}

        </div>
    )
}