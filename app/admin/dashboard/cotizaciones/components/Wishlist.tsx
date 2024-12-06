import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Servicio, ServicioCategoria } from '@/app/admin/_lib/types'
import { obtenerCategories } from '@/app/admin/_lib/categorias.actions'
import { Trash } from 'lucide-react'

interface Props {
    servicios: Servicio[]
    onActualizarServicio: (servicio: Servicio) => void
}

const Wishlist: React.FC<Props> = ({ servicios, onActualizarServicio }) => {

    const [categorias, setCategorias] = useState<ServicioCategoria[]>([])

    useEffect(() => {
        const fetchData = async () => {
            const categoriasData = await obtenerCategories()
            setCategorias(categoriasData)
        }
        fetchData()
    }, [])

    const handleUpdateWhishlist = useCallback((servicio: Servicio) => {
        const index = servicios.findIndex(s => s.id === servicio.id)
        if (index === -1) return
        servicios[index] = servicio
        servicios.sort((a, b) => (a.posicion ?? 0) - (b.posicion ?? 0)) // Ordenar por posición ascendente
        onActualizarServicio(servicio)
    }, [servicios, onActualizarServicio])

    const handleDeleteServicio = useCallback((servicio: Servicio) => {
        const index = servicios.findIndex(s => s.id === servicio.id)
        if (index === -1) return
        servicios.splice(index, 1)
        onActualizarServicio(servicio)
    }, [servicios, onActualizarServicio])

    const categoriasRenderizadas = useMemo(() => {
        return categorias.map(categoria => {
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
                                            value={servicio.cantidad ?? 1}
                                            onFocus={(e) => e.target.select()}
                                            onChange={(e) => {
                                                let newCantidad = parseInt(e.target.value, 10) || 1;
                                                if (newCantidad < 1) newCantidad = 1;
                                                servicio.cantidad = newCantidad;
                                                handleUpdateWhishlist(servicio);
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
                                            onClick={() => handleDeleteServicio(servicio)}
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
    }, [categorias, servicios, handleUpdateWhishlist, handleDeleteServicio])

    return (
        <div className="sticky top-5">
            {servicios.length === 0 ? (
                <p className='py-16 px-5 border border-dashed border-zinc-800 rounded-md text-center text-zinc-800 text-xl font-light'>
                    No hay servicios en esta lista
                </p>
            ) : (
                categoriasRenderizadas
            )}
        </div>
    )
}

export default React.memo(Wishlist)