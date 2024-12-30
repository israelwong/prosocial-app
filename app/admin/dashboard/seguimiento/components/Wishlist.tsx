import React, { useState, useEffect, useMemo } from 'react'
import { Servicio, ServicioCategoria, User } from '@/app/admin/_lib/types'
import { obtenerCategories } from '@/app/admin/_lib/categorias.actions'
import { obtenerUsuarios } from '@/app/admin/_lib/User.actions'
import { useRouter } from 'next/navigation'

interface Props {
    servicios: Servicio[]
    cotizacionId: string
}

const Wishlist: React.FC<Props> = ({ servicios, cotizacionId }) => {

    const [loading, setLoading] = useState(true)
    const [categorias, setCategorias] = useState<ServicioCategoria[]>([])
    const [usuarios, setUsuarios] = useState<User[]>([])
    const router = useRouter()

    useEffect(() => {
        const fetchData = async () => {
            const categoriasData = await obtenerCategories()
            setCategorias(categoriasData)

            const usuariosData = await obtenerUsuarios()
            setUsuarios(usuariosData)

            setLoading(false)
        }
        fetchData()
    }, [])

    const categoriasRenderizadas = useMemo(() => {
        return categorias.map(categoria => {

            const serviciosFiltrados = servicios
                .filter(servicio => servicio.servicioCategoriaId === categoria.id)
                .sort((a, b) => (a.posicion ?? 0) - (b.posicion ?? 0))
            if (serviciosFiltrados.length === 0) return null

            return (
                <div key={categoria.id} className='mb-5'>
                    <div className="px-3 pb-0 text-zinc-600 bg-zinc-900 font-semibold uppercase">
                        {categoria.nombre}
                    </div>

                    <div>
                        {serviciosFiltrados.map(servicio => (
                            <div key={servicio.id} className="p-3 border-b border-zinc-800">
                                <div>
                                    {servicio.nombre}
                                </div>
                                <div className='flex justify-between text-sm text-zinc-400'>
                                    {/* <p>
                                        Honorarios
                                    </p> */}
                                    <p>
                                        P.U {(servicio.costo ?? 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                    </p>
                                    <p>
                                        Cant. {servicio.cantidad}
                                    </p>
                                    <p>
                                        Monto {((servicio.costo ?? 0) * (servicio.cantidad ?? 0)).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                    </p>
                                    <button
                                        className='px-2 py-1 bg-zinc-800 text-zinc-200 rounded-md'
                                    // onClick={() => router.push(`/admin/cotizaciones/${cotizacionId}/servicios/${servicio.id}`)}
                                    >
                                        Pagar
                                    </button>
                                </div>
                                <p>
                                    Responsable:
                                    {/* {servicio.userId ? usuarios.find(u => u.id === servicio.userId)?.username : 'Pendiente'} */}
                                </p>
                            </div>
                        ))}
                    </div>
                </div >
            )
        })
    }, [categorias, servicios, usuarios])

    return (
        <div className="sticky top-5">
            {loading ? (
                <p className='py-16 px-5 border border-dashed border-zinc-800 rounded-md text-center text-zinc-800 text-xl font-light'>
                    Cargando datos...
                </p>
            ) : (
                servicios.length === 0 ? (
                    <p className='py-16 px-5 border border-dashed border-zinc-800 rounded-md text-center text-zinc-800 text-xl font-light'>
                        No hay servicios en esta lista
                    </p>
                ) : (
                    categoriasRenderizadas.length === 0 ? (
                        <p className='py-16 px-5 border border-dashed border-zinc-800 rounded-md text-center text-zinc-800 text-xl font-light'>
                            Cargando servicios...
                        </p>
                    ) : (
                        categoriasRenderizadas
                    )
                )
            )}
        </div>
    )
}

export default React.memo(Wishlist)
