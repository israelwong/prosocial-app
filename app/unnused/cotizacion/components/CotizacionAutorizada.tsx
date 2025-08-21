'use client';
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';

import { Servicio, ServicioCategoria } from '@/app/admin/_lib/types'
import { cotizacionDetalle } from '@/app/admin/_lib/cotizacion.actions';
import { registrarVisita } from '@/app/admin/_lib/cotizacionVisita.actions';

import SkeletonPendiente from './skeletonPendiente';
import Wishlist from './Wishlist';

interface Props {
    cotizacionId: string
}

export default function CotizacionPendiente({ cotizacionId }: Props) {

    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [nombreCotizacion, setNombreCotizacion] = useState('');
    const [servicios, setServicios] = useState<Servicio[]>([]);

    const [nombreCliente, setNombreCliente] = useState('');
    const [tipoEvento, setTipoEvento] = useState('');
    const [fechaEvento, setFechaEvento] = useState<Date | null>(null);
    const [nombreEvento, setNombreEvento] = useState('');
    const [precio, setPrecio] = useState(0);

    const [categorias, setCategorias] = useState<ServicioCategoria[]>([])

    const [fromLista, setFromLista] = useState(false);

    useEffect(() => {
        async function fetchData() {

            setLoading(true);
            const {
                cotizacion,
                evento,
                eventoTipo,
                cliente,
                servicios,
                ServicioCategoria,
                cotizacionServicio,
            } = await cotizacionDetalle(cotizacionId);


            if (cotizacion) {

                setPrecio(cotizacion.precio || 0);
                setNombreCotizacion(cotizacion.nombre || '');

                const serviciosData = await Promise.all(cotizacionServicio.map(async (servicio: { servicioId: string; cantidad: number; posicion: number; servicioCategoriaId: string; }) => {
                    const servicioData = servicios.find(servicioData => servicioData.id === servicio.servicioId);
                    return {
                        ...servicioData,
                        cantidad: servicio.cantidad,
                        nombre: servicioData?.nombre || '',
                        posicion: servicio.posicion,
                        servicioCategoriaId: servicio.servicioCategoriaId,
                    };
                }));
                setServicios(serviciosData);
                setCategorias(ServicioCategoria);
            }



            if (cliente) {
                setNombreCliente(cliente?.nombre || '');
                setNombreCotizacion(cotizacion?.nombre || '');
                setTipoEvento(eventoTipo?.nombre || '');
                setNombreEvento(evento?.nombre || '');
                setFechaEvento(evento?.fecha_evento || null);
            }
            setLoading(false);
        }
        fetchData();
    }, [cotizacionId]);

    //! Calcular totales


    //! Obtener condición comercial y método de pago para llamar handleSeleccionCondicionMetodoPago y mostrar los datos
    useEffect(() => {

        const urlParams = new URLSearchParams(window.location.search);
        const fromListaParam = urlParams.get('param');
        const isPrev = urlParams.get('preview');

        if (!isPrev) {
            if (!sessionStorage.getItem('visitaRegistrada')) {
                registrarVisita(cotizacionId);
                sessionStorage.setItem('visitaRegistrada', 'true');
            }
        }

        // REVISAR SI VIENE DE LISTA
        if (fromListaParam) {
            setFromLista(fromListaParam === 'lista');
        }

    }, [cotizacionId]);




    //! Regresar a la lista y limpiar sessionStorage
    const handleRegresar = () => {
        sessionStorage.removeItem('visitaRegistrada');
        router.back()
    }

    return (
        <div >
            {loading ? (
                <SkeletonPendiente />
            ) : (
                <div className=''>
                    <div className={`max-w-screen-sm mx-auto`}>

                        <div>
                            {fromLista &&
                                <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 mt-4 z-20">
                                    <div className="relative">
                                        <button onClick={handleRegresar} className="relative z-10 px-4 py-3 text-white bg-red-700 rounded-full hover:bg-red-600 text-sm">
                                            Cerrar ventana
                                        </button>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-full h-full bg-red-500 rounded-full animate-ping opacity-50"></div>
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>

                        {/* MENSAJE INICIAL */}
                        {!fromLista ? (
                            <div className='mt-8 p-5'>
                                <p className='text-left text-4xl font-Bebas-Neue mb-2 text-zinc-200'>
                                    Hola {nombreCliente},
                                </p>
                                <p className='text-left  mx-auto text-zinc-500'>
                                    Te compartimos los detalles del servicio para la cobertura de tu evento de {tipoEvento} de <span className='underline uppercase text-zinc-200'>{nombreEvento}</span> que celebrarás el {fechaEvento ? new Date(fechaEvento.getTime() + 86400000).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}.
                                </p>
                            </div>
                        ) : (
                            <div className='mt-8 p-5'>
                                <p className='uppercase text-left text-2xl font-Bebas-Neue text-zinc-200'>
                                    <span className='uppercase font-semibold text-zinc-200'>{nombreCotizacion}</span>
                                </p>
                                <p className='text-left  mx-auto text-zinc-500'>
                                    para el evento de {tipoEvento} de <span className='underline uppercase text-zinc-200'>{nombreEvento}</span> que celebrarás el {fechaEvento ? new Date(fechaEvento.getTime() + 86400000).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}.
                                </p>
                            </div>
                        )}

                        <div className='mx-auto p-5'>

                            {/* //! WISHLIST */}
                            <div className='mb-10'>
                                <p className='text-xl text-zinc-500 mb-2'>
                                    ¿Qué servicios se incluyen?
                                </p>
                                <div className='bg-zinc-900 border border-zinc-600 p-3 rounded-md mb-5'>

                                    <Wishlist
                                        servicios={servicios}
                                        categorias={categorias}
                                    />
                                </div>
                            </div>

                            {/* //! PRECIO TOTAL */}
                            <div className='mb-5'>
                                <p className='text-xl text-zinc-500 mb-2'>Presupuesto final</p>
                                <div className='border border-zinc-800 p-5 rounded-md'>
                                    <p className='text-xl'>
                                        {precio.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                    </p>
                                </div>
                            </div>


                        </div>


                    </div>
                </div>

            )}
        </div>
    )
}