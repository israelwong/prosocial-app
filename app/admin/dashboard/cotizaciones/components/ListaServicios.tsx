'use client'
import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { obtenerCategories } from '@/app/admin/_lib/categorias.actions'
import { obtenerServicioPorCategoria } from '@/app/admin/_lib/servicio.actions'
import { ServicioCategoria } from '@/app/admin/_lib/types'
import { Servicio } from '@/app/admin/_lib/types'

interface Props {
    onAgregarServicio: (servicio: Servicio) => void
}

const ListaServicios: React.FC<Props> = ({ onAgregarServicio }) => {

    const [categorias, setCategorias] = useState<ServicioCategoria[]>([])
    const [servicios, setServicios] = useState<{ [key: string]: Servicio[] }>({})
    const [notificacion, setNotificacion] = useState<string | null>(null)

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

    const categoriasRenderizadas = useMemo(() => {
        return categorias.map(categoria => (
            <div key={categoria.id} className="mb-6 bg-zinc-900 border border-zinc-800 p-5 rounded-md">
                <h2 className="text-lg text-zinc-500 font-bold mb-3">
                    {categoria.nombre}
                </h2>
                <ul className='space-y-2'>
                    {servicios[categoria.id]?.map(servicio => (
                        <li key={servicio.id}
                            className="p-3 rounded-md border border-zinc-700 cursor-pointer"
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
                    ))}
                </ul>
            </div>
        ))
    }, [categorias, servicios, handleAgregarServicio])

    return (
        <div className="max-h-screen overflow-y-auto">
            {notificacion && (
                <div className="fixed top-4 right-4 bg-green-500/80 text-white p-3 rounded-md shadow-lg w-1/5">
                    {notificacion}
                </div>
            )}
            {categoriasRenderizadas}
        </div>
    )
}

export default React.memo(ListaServicios)