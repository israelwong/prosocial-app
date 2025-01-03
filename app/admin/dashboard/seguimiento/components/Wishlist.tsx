import React, { useState, useEffect, useMemo } from 'react'
import { CotizacionServicio, ServicioCategoria, User } from '@/app/admin/_lib/types'
import { obtenerCotizacionServicios } from '@/app/admin/_lib/cotizacion.actions';
import { obtenerCategories } from '@/app/admin/_lib/categorias.actions'

import FichaServicio from './FichaServicio';
import { obtenerUsuarios } from '@/app/admin/_lib/User.actions'

interface Props {
    cotizacionId: string
}

const Wishlist: React.FC<Props> = ({ cotizacionId }) => {

    const [loading, setLoading] = useState(true)
    const [usuarios, setUsuarios] = useState<User[]>([])
    const [categorias, setCategorias] = useState<ServicioCategoria[]>([])
    const [servicios, setServicios] = useState<CotizacionServicio[]>([])

    useEffect(() => {
        const fetchData = () => {

            obtenerCotizacionServicios(cotizacionId).then(cotizacionServiciosData => {
                setServicios(cotizacionServiciosData)
            })

            obtenerCategories().then(data => {
                setCategorias(data)
            })

            obtenerUsuarios().then(data => {
                setUsuarios(data)
            })

            setLoading(false)
        }
        fetchData()
    }, [cotizacionId])

    const categoriasRenderizadas = useMemo(() => {
        return categorias
            .map(categoria => {
                const serviciosFiltrados = servicios.filter(servicio => servicio.servicioCategoriaId === categoria.id)
                if (serviciosFiltrados.length === 0) {
                    return null
                }
                return (
                    <div key={categoria.id} className='mb-5 border border-dashed border-zinc-800 p-3 rounded-md bg-zinc-900'>
                        <div className="px-0 pb-0 text-zinc-600 font-semibold uppercase">
                            {categoria.nombre}
                        </div>

                        <div>
                            {serviciosFiltrados.map(servicio => {
                                return (
                                    <div key={servicio.id} className='px-0 py-2 '>
                                        <FichaServicio
                                            usuarios={usuarios}
                                            cotizacionServicioId={servicio.id}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )
            })
            .filter(categoria => categoria !== null)
    }, [categorias, servicios, usuarios])


    return (
        <div className="sticky top-5">
            {loading ? (
                <p className='text-zinc-600 italic'>
                    Cargando datos...
                </p>
            ) : (
                categoriasRenderizadas
            )}
        </div>
    )
}

export default React.memo(Wishlist)