import React, { useMemo } from 'react'
import { Servicio, ServicioCategoria } from '@/app/admin/_lib/types'
// import { obtenerCategories } from '@/app/admin/_lib/categorias.actions'
import { ChevronRight, Camera, BookImage, Settings, Video, Box, Smartphone } from 'lucide-react'

interface Props {
    servicios: Servicio[]
    categorias: ServicioCategoria[]
}

const getServiceHours = (name: string, cantidad: number | undefined) => {
    const lowerCaseName = name.toLowerCase();
    if (['operador', 'fotógrafo', 'asistente', 'camarógrafo'].some(word => lowerCaseName.includes(word))) {
        return `${cantidad ?? 1} hrs`;
    }
    if (lowerCaseName.includes('revelado digital') || lowerCaseName.includes('diseño') || lowerCaseName.includes('edición') || lowerCaseName.includes('grabación') || lowerCaseName.includes('revelado ligero') || lowerCaseName.includes('grúa') || lowerCaseName.includes('sesión') || lowerCaseName.includes('shooting')) {
        return '';
    }
    return cantidad ?? 1;
};


const Wishlist: React.FC<Props> = ({ servicios, categorias }) => {

    const categoriasRenderizadas = useMemo(() => {
        return categorias.map(categoria => {
            const serviciosFiltrados = servicios
                .filter(servicio => servicio.servicioCategoriaId === categoria.id)
                .sort((a, b) => (a.posicion ?? 0) - (b.posicion ?? 0))
            if (serviciosFiltrados.length === 0) return null

            return (
                <div key={categoria.id} className="mb-5 ">
                    <p className='text-sm text-zinc-200 mb-1 items-center uppercase font-semibold'>
                        {categoria.nombre.toLowerCase().includes('orgánica') && <Smartphone size={18} className='inline-block mr-1' />}
                        {categoria.nombre.toLowerCase().includes('fotografía') && <Camera size={18} className='inline-block mr-1' />}
                        {categoria.nombre.toLowerCase().includes('cuadro') && <BookImage size={18} className='inline-block mr-1' />}
                        {categoria.nombre.toLowerCase().includes('otros servicios') && <Settings size={18} className='inline-block mr-1' />}
                        {categoria.nombre.toLowerCase().includes('cine') && <Video size={18} className='inline-block mr-1' />}
                        {categoria.nombre.toLowerCase().includes('entregables') && <Box size={18} className='inline-block mr-1' />}
                        {categoria.nombre}
                    </p>
                    <ul>
                        {serviciosFiltrados.map(servicio => (
                            <li key={servicio.id} className="flex items-start leading-5 space-y-1">
                                <p><ChevronRight size={16} className='mt-1 text-zinc-500' /></p>
                                <p className='text-zinc-400'>

                                    {servicio.nombre} <span className='text-zinc-600'>

                                        {servicio.cantidad && servicio.cantidad > 1 ? getServiceHours(servicio.nombre, servicio.cantidad) : ''}
                                    </span>
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            )
        })
    }, [categorias, servicios])

    return (
        <div>
            <div className="sticky top-5">
                {servicios.length === 0 ? (
                    <p className='py-16 px-5 border border-dashed border-zinc-800 rounded-md text-center text-zinc-800 text-xl font-light'>
                        No hay servicios en esta lista
                    </p>
                ) : (
                    categoriasRenderizadas
                )}
            </div>
        </div>
    )
}

export default React.memo(Wishlist)