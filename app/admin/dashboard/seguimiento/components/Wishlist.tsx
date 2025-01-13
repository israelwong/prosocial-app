import React from 'react'
import { CotizacionServicio, ServicioCategoria, User } from '@/app/admin/_lib/types'
// import { obtenerCotizacionServicios } from '@/app/admin/_lib/cotizacion.actions';
import FichaServicio from './FichaServicio';

interface Props {
    categorias: ServicioCategoria[]
    usuarios: User[]
    servicios2: CotizacionServicio[]
}

const Wishlist: React.FC<Props> = ({ categorias, usuarios, servicios2 }) => {
    // console.log(servicios2)
    return (
        <div className="sticky top-5">
            {
                categorias
                    .sort((a, b) => a.posicion - b.posicion)
                    .map(categoria => {
                        const serviciosFiltrados = servicios2.filter(servicio => servicio.servicioCategoriaId === categoria.id)
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
            }
        </div>
    )
}

export default React.memo(Wishlist)