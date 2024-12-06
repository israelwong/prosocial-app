import React, { useState, useEffect, useMemo } from 'react'
import { Servicio, ServicioCategoria } from '@/app/admin/_lib/types'
import { obtenerCategories } from '@/app/admin/_lib/categorias.actions'
import { ChevronRight } from 'lucide-react'

// import Galeria from './Galeria'

interface Props {
    servicios: Servicio[]
}

const formatServiceName = (name: string) => {
    let formattedName = name;
    if (formattedName.toLowerCase().includes('por hora') || formattedName.toLowerCase().includes('fotografo b por hora')) {
        formattedName = formattedName.replace(/por hora/i, '').trim();
    }
    return formattedName.split(' ').map((word, index) =>
        index === 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase()
    ).join(' ');
};

const getServiceHours = (name: string, cantidad: number | undefined) => {
    const lowerCaseName = name.toLowerCase();
    if (['fotógrafo', 'asistente', 'camarógrafo'].some(word => lowerCaseName.includes(word))) {
        return `${cantidad ?? 1} hrs`;
    }
    if (lowerCaseName.includes('revelado digital') || lowerCaseName.includes('diseño') || lowerCaseName.includes('edición') || lowerCaseName.includes('grabación') || lowerCaseName.includes('revelado ligero') || lowerCaseName.includes('grúa') || lowerCaseName.includes('sesión') || lowerCaseName.includes('shooting')) {
        return '';
    }
    return cantidad ?? 1;
};

const uniqueServices = (name: string) => {
    const lowerCaseName = name.toLowerCase();
    if (lowerCaseName.includes('retoque avanzado')) {
        return ' Fotos en';
    }
    return '';
};

const Wishlist: React.FC<Props> = ({ servicios }) => {

    const [categorias, setCategorias] = useState<ServicioCategoria[]>([])
    const [modalSesionVestido, setModalSesionVestido] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            const categoriasData = await obtenerCategories()
            setCategorias(categoriasData)
        }
        fetchData()
    }, [])

    const handleOpenModalSesionVestido = () => {
        console.log('handleOpenModalSesionVestido')
        setModalSesionVestido(true)
    }

    const categoriasRenderizadas = useMemo(() => {
        return categorias.map(categoria => {

            const serviciosFiltrados = servicios
                .filter(servicio => servicio.servicioCategoriaId === categoria.id)
                .sort((a, b) => (a.posicion ?? 0) - (b.posicion ?? 0))
            if (serviciosFiltrados.length === 0) return null

            return (
                <div key={categoria.id} className="mb-3 bg-zinc-900 border border-zinc-600 p-3 rounded-md">

                    <p className='text-lg text-zinc-400 mb-2'>{categoria.nombre}</p>
                    <ul>
                        {serviciosFiltrados.map(servicio => (
                            <li key={servicio.id} className="flex items-start leading-6">
                                <p><ChevronRight size={16} className='mt-1 text-zinc-500' /></p>
                                <p className='text-zinc-300'>
                                    {getServiceHours(servicio.nombre, servicio.cantidad)}
                                    {uniqueServices(servicio.nombre)} {formatServiceName(servicio.nombre)}

                                    {servicio.nombre.toLocaleLowerCase().includes('sesión de vestido') && (
                                        <button
                                            onClick={handleOpenModalSesionVestido}
                                            className='bg-blue-400 px-3 py-1 rounded-md leading-3 text-sm'>ver ejemplo</button>
                                    )}

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

            {/* <Galeria bucked={'vestido'} /> */}

            <div className="sticky top-5">
                {servicios.length === 0 ? (
                    <p className='py-16 px-5 border border-dashed border-zinc-800 rounded-md text-center text-zinc-800 text-xl font-light'>
                        No hay servicios en esta lista
                    </p>
                ) : (
                    categoriasRenderizadas
                )}

            </div>

            {modalSesionVestido && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 w-full h-full">
                    <div className="bg-white p-5 rounded-lg shadow-lg max-w-3xl w-full">
                        <button
                            onClick={() => setModalSesionVestido(false)}
                            className="absolute top-3 right-3 text-black"
                        >
                            Close
                        </button>

                    </div>
                </div>
            )}

        </div>
    )
}

export default React.memo(Wishlist)