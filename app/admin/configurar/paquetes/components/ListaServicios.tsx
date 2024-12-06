'use client'
import React, { useEffect, useState } from 'react'
import { obtenerCategories } from '@/app/admin/_lib/categorias.actions'
import { obtenerServicioPorCategoria } from '@/app/admin/_lib/servicio.actions'
import { ServicioCategoria } from '@/app/admin/_lib/types'
import { Servicio } from '@/app/admin/_lib/types'

interface Props {
    onAgregarServicio: (servicio: Servicio) => void
}

export default function ListaServicios({ onAgregarServicio }: Props) {

    const [categorias, setCategorias] = useState([] as ServicioCategoria[])
    const [servicios, setServicios] = useState({} as { [key: string]: Servicio[] })
    const [notificacion, setNotificacion] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            const categoriasData = await obtenerCategories()
            setCategorias(categoriasData)

            const serviciosData: { [key: string]: Servicio[] } = {}
            for (const categoria of categoriasData) {
                serviciosData[categoria.id] = (await obtenerServicioPorCategoria(categoria.id)) || []
            }
            setServicios(serviciosData)
        }

        fetchData()
    }, [])

    const handleAgregarServicio = (servicio: Servicio) => {
        onAgregarServicio(servicio)
        setNotificacion(`Servicio ${servicio.nombre} agregado`)
        setTimeout(() => {
            setNotificacion(null)
        }, 2000)
    }

    return (
        <div className="max-h-screen overflow-y-auto">

            {notificacion && (
                <div className="fixed top-4 right-4 bg-green-500/80 text-white p-3 rounded-md shadow-lg w-1/5">
                    {notificacion}
                </div>
            )}

            {categorias
                .map(categoria => (
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
                                    <div className='flex justify-between mb-2'>
                                        <p className='pr-5'>
                                            {servicio.nombre}
                                        </p>
                                        <label>
                                            {servicio.precio_publico?.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                        </label>
                                    </div>
                                    <div className='grid grid-cols-3 text-[12px] text-zinc-500 rounded-lg leading-3 italic'>
                                        <span>
                                            Costo {(servicio.costo ?? 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                        </span>
                                        <span>
                                            Gasto {(servicio.gasto ?? 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                        </span>
                                        <span>
                                            Utilidad {(servicio.utilidad ?? 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
        </div>
    )
}