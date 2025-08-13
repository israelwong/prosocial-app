'use client'
import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { obtenerCategories } from '@/app/admin/_lib/categorias.actions'
import { obtenerServicioPorCategoria } from '@/app/admin/_lib/servicio.actions'
import { ServicioCategoria } from '@/app/admin/_lib/types'
import { Servicio } from '@/app/admin/_lib/types'

interface Props {
    eventoTipoId?: string
    serviciosExcluidos?: string[]
    onAgregarServicio: (servicio: Servicio) => void
}

const ListaServicios: React.FC<Props> = ({ eventoTipoId, serviciosExcluidos = [], onAgregarServicio }) => {

    const [categorias, setCategorias] = useState<ServicioCategoria[]>([])
    const [servicios, setServicios] = useState<{ [key: string]: Servicio[] }>({})
    const [notificacion, setNotificacion] = useState<string | null>(null)
    const [categoriaAbierta, setCategoriaAbierta] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            const categoriasData = await obtenerCategories()
            setCategorias(categoriasData)

            const serviciosData: { [key: string]: Servicio[] } = {}
            await Promise.all(categoriasData.map(async (categoria) => {
                serviciosData[categoria.id] = await obtenerServicioPorCategoria(categoria.id) || []
            }))
            setServicios(serviciosData)
        }
        fetchData()
    }, [])

    const handleAgregarServicio = useCallback((servicio: Servicio) => {
        onAgregarServicio(servicio)
        setNotificacion(`Servicio ${servicio.nombre} agregado`)
        setTimeout(() => {
            setNotificacion(null)
        }, 2000)
    }, [onAgregarServicio])

    const toggleCategoria = (categoriaId: string) => {
        setCategoriaAbierta(prev => prev === categoriaId ? null : categoriaId)
    }

    const categoriasRenderizadas = useMemo(() => {
        return categorias.map(categoria => (
            <div key={categoria.id} className={`border ${categoriaAbierta === categoria.id ? 'border-yellow-700' : 'border-zinc-700'} rounded-md mb-3 p-3`}>
                <h2
                    className="text-md text-zinc-300 font-bold mb-0 cursor-pointer flex items-center"
                    onClick={() => toggleCategoria(categoria.id)}
                >
                    <span className="mr-2">
                        {categoriaAbierta === categoria.id ? '▲' : '▼'}
                    </span>
                    {categoria.nombre}
                </h2>
                {categoriaAbierta === categoria.id && (
                    <ul className='space-y-2 pt-3'>
                        {servicios[categoria.id] ? (
                            servicios[categoria.id]
                                .filter(servicio => servicio.id && !serviciosExcluidos.includes(servicio.id))
                                .map(servicio => (
                                    <li key={servicio.id}
                                        className="p-3 rounded-md border-dashed border border-zinc-800 bg-zinc-900 cursor-pointer hover:bg-zinc-800/80"
                                        onClick={() => handleAgregarServicio(servicio)}
                                    >
                                        <div className='flex justify-between'>
                                            <p className='pr-5'>
                                                {servicio.nombre}
                                            </p>
                                            <label>
                                                {servicio.precio_publico?.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                            </label>
                                        </div>
                                    </li>
                                ))
                        ) : (
                            <li className="p-3 rounded-md border-dashed border border-zinc-800 bg-zinc-900 text-zinc-500 italic">
                                Cargando servicios...
                            </li>
                        )}
                    </ul>
                )}
            </div>
        ))
    }, [categorias, servicios, handleAgregarServicio, categoriaAbierta])

    return (
        <div className="max-h-screen">
            {notificacion && (
                <div className="fixed bottom-10 right-5 bg-green-800/90 text-white rounded-md shadow-lg w-1/4 text-right py-3 px-5 italic justify-end border border-zinc-200">
                    {notificacion}
                </div>
            )}
            {categoriasRenderizadas}
        </div>
    )
}

export default React.memo(ListaServicios)