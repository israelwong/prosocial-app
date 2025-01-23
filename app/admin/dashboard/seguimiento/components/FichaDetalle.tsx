'use client'
import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { Cliente, Evento, Cotizacion, ServicioCategoria, User, CotizacionServicio, EventoEtapa } from '@/app/admin/_lib/types'
import { obtenerEventoSeguimiento, actualizarEtapa } from '@/app/admin/_lib/evento.actions'
import { obtenerCondicionComercial } from '@/app/admin/_lib/condicionesComerciales.actions';
import { useRouter } from 'next/navigation'
import { obtenerEventoEtapas } from '@/app/admin/_lib/EventoEtapa.actions';

import Wishlist from './Wishlist'
import FichaPresupuesto from './FichaPresupuesto'
import FichaBalanceFinanciero from './FichaBalanceFinanciero'
import FichaBitacora from '../../eventos/components/FichaBitacora'
import FichaAgenda from './FichaAgenda'



export interface Props {
    eventoId: string
}

export default function FichaDetalle({ eventoId }: Props) {

    const router = useRouter()
    const [evento, setEvento] = useState<Evento | null>(null)
    const [cliente, setCliente] = useState<Cliente | null>(null)
    const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null)
    const [tipoEvento, setTipoEvento] = useState<string | null>(null)
    const [condicionComercial, setCondicionComercial] = useState<string | null>(null)
    const [showDetailsCliente, setShowDetailsCliente] = useState(false)
    const [showDetailsEvento, setShowDetailsEvento] = useState(false)

    const [servicioCategoria, setServicioCategoria] = useState<ServicioCategoria[] | null>(null)
    const [users, setUsers] = useState<User[] | null>(null)
    const [cotizacionServicio, setCotizacionServicio] = useState<CotizacionServicio[] | null>(null)
    const [etapas, setEtapas] = useState<EventoEtapa[]>([])
    const [etapaActual, setEtapaActual] = useState<string | null>(null)
    const [actualizandoEtapa, setActualizandoEtapa] = useState<boolean>(false)
    const [etapaActualizada, setEtapaActualizada] = useState<boolean>(false)


    useEffect(() => {
        const fetchData = async () => {
            try {

                obtenerEventoEtapas().then((etapas) => {
                    setEtapas(etapas);
                });

                const data = await obtenerEventoSeguimiento(eventoId)

                setEvento(data.evento ?? null)
                setEtapaActual(data.evento?.eventoEtapaId ?? null)

                setCliente(data.cliente ?? null)
                setCotizacion(data.cotizacion ?? null)
                setTipoEvento(data.tipoEvento ?? null)

                setServicioCategoria(data.categorias ?? null)
                setUsers(data.usuarios ?? null)
                setCotizacionServicio(data.cotizacionServicio ?? null)

                if (data.cotizacion?.condicionesComercialesId) {
                    const condicionComercial = await obtenerCondicionComercial(data.cotizacion?.condicionesComercialesId)
                    const condicion = `${condicionComercial?.nombre} - ${condicionComercial?.descripcion}`
                    setCondicionComercial(condicion)
                }


            } catch (error) {
                console.error('Error fetching data:', error)
            }
        }
        fetchData()

    }, [eventoId])

    const fechaCelebracion = useMemo(() => {
        return evento?.fecha_evento ? new Date(new Date(evento.fecha_evento).getTime() + new Date().getTimezoneOffset() * 60000).toLocaleString('es-ES', { dateStyle: 'full' }) : ''
    }, [evento?.fecha_evento])

    const handleActualizarEtapa = useCallback(async (etapaId: string) => {
        try {
            setActualizandoEtapa(true);
            await actualizarEtapa(eventoId, etapaId);
            setEtapaActual(etapaId);

            setTimeout(() => {
                setActualizandoEtapa(false);
                setEtapaActualizada(true);
            }, 3000);

        } catch (error) {
            console.error('Error updating stage:', error);
        }


    }, [eventoId]);

    return (
        <div>
            <div>
                {/* header */}
                <div className='flex justify-between items-center mb-5'>
                    <h1 className='text-xl space-x-1 flex items-center'>
                        <span className='font-semibold mr-1'>
                            Seguimiento de evento
                        </span>

                    </h1>
                    <div className='flex items-center space-x-2'>
                        <button className='bg-red-700 text-white px-3 py-2 rounded-md' onClick={() => router.back()}>
                            <span className='hidden sm:inline'>Cerrar ventana</span>
                            <span className='sm:hidden'>Cerrar</span>
                        </button>
                    </div>
                </div>
                <div className='md:grid md:grid-cols-4 gap-5'>

                    {/* COLUMNA 1 */}
                    <div>
                        {/* //! EVENTO */}

                        <div className='mb-5'>
                            <label className='block text-zinc-500 mb-2'>Etapa actual:</label>
                            <select
                                className='bg-zinc-900 text-white p-2 rounded-md w-full'
                                value={etapaActual ?? ''}
                                onChange={(e) => {
                                    const selectedEtapa = etapas.find(etapa => etapa.id === e.target.value);
                                    if (selectedEtapa) {
                                        if (selectedEtapa.id) {
                                            handleActualizarEtapa(selectedEtapa.id);
                                        }
                                        setEvento(prev => prev ? { ...prev, eventoEtapaId: selectedEtapa.id } : null);
                                    }
                                }}
                                disabled={etapas.length === 0}
                            >
                                <option value="" disabled className='text-zinc-500'>
                                    {etapas.length === 0 ? 'Cargando etapas...' : 'Seleccione una etapa'}
                                </option>
                                {etapas.length === 0 ? (
                                    <option value="" disabled>
                                        ...
                                    </option>
                                ) : (
                                    etapas.map(etapa => (
                                        <option key={etapa.id} value={etapa.id}>
                                            {etapa.nombre}
                                        </option>
                                    ))
                                )}
                            </select>
                            {actualizandoEtapa && (
                                <p className='text-yellow-500 text-sm mt-2'>
                                    Actualizando etapa...
                                </p>
                            )}
                            {etapaActualizada && (
                                <p className='text-green-500 text-sm mt-2'>
                                    Etapa actualizada
                                </p>
                            )}
                        </div>



                        <div className='bg-yellow-800/80 px-3 py-3 rounded-md shadow-md text-yellow-300 border border-yellow-700 inline-block w-full mb-5'>
                            Celebración: <span className='font-semibold'>{fechaCelebracion}</span>
                        </div>


                        <div className='bg-zinc-900 p-4 rounded-lg shadow-md mb-5 border border-zinc-800 w-full'>
                            <div>
                                <button className='text-lg text-zinc-200 font-semibold flex justify-between items-center w-full'
                                    onClick={() => setShowDetailsEvento(prev => !prev)}>
                                    <p>
                                        Evento: <span>{evento?.nombre}</span>
                                    </p>
                                    <span className='mr-2'>
                                        {showDetailsEvento ? '▲' : '▼'}
                                    </span>
                                </button>
                            </div>
                            {showDetailsEvento && (
                                <>
                                    <ul className='mt-2 list-inside list-disc mb-3'>
                                        <li><span className='text-zinc-500'>Tipo de evento:</span> {tipoEvento}</li>
                                        <li><span className='text-zinc-500'>Sede:</span> Sede</li>
                                        <li><span className='text-zinc-500'>Dirección:</span> Dirección</li>
                                    </ul>

                                    {/* //! ACCIONES  */}

                                    <button
                                        className='bg-red-900 text-white py-2 px-3 rounded-md text-sm'
                                        onClick={() => router.push(`/admin/dashboard/eventos/${evento?.id}`)}
                                    >Editar</button>
                                </>
                            )}
                        </div>


                        {/* //! CLIENTE */}
                        <div className='bg-zinc-900 p-4 rounded-lg shadow-md mb-5 border border-zinc-800 w-full'>
                            <div>
                                <button className='text-lg text-zinc-200 font-semibold flex justify-between items-center w-full'
                                    onClick={() => setShowDetailsCliente(prev => !prev)}>
                                    <p>
                                        Cliente: <span>{cliente?.nombre}</span>
                                    </p>
                                    <span className='mr-2'>
                                        {showDetailsCliente ? '▲' : '▼'}
                                    </span>
                                </button>
                            </div>
                            {showDetailsCliente && (
                                <>
                                    <ul className='mt-2 list-inside list-disc mb-3'>
                                        <li><span className='text-zinc-500'>Teléfono:</span> {cliente?.telefono}</li>
                                        <li><span className='text-zinc-500'>Correo:</span> {cliente?.email}</li>
                                        <li><span className='text-zinc-500'>Domicilio:</span> {cliente?.direccion || <span className='text-yellow-500'>Pendiente</span>}</li>
                                    </ul>

                                    {cliente?.id ? (
                                        <button
                                            className='bg-red-900 text-white px-3 py-1 rounded-md border border-red-800'
                                            onClick={() => router.push(`/admin/dashboard/contactos/${cliente?.id}`)}
                                        >Editar</button>
                                    ) : (
                                        <span className='text-yellow-500'>Cargando...</span>
                                    )}
                                </>
                            )}
                        </div>

                        <button
                            className='bg-blue-900 text-white rounded-md w-full md:mb-2 mb-5 py-3 md:py-2'
                            onClick={() => window.open(`/admin/dashboard/contrato/${evento?.id}`, '_blank')}>
                            Contrato digital
                        </button>

                        <button className='bg-red-700 text-white p-2 rounded-md mb-5 w-full md:block hidden' onClick={() => router.back()}>Cerrar ventana</button>
                    </div>

                    {/* COLUMNA 2 */}
                    <div>
                        {/* //! PRESUPUESTO */}
                        <FichaPresupuesto precio={cotizacion?.precio ?? 0} condicionComercial={condicionComercial} />
                        <div className='p-5 border border-zinc-800 rounded-md md:mb-0 mb-5'>
                            <FichaBalanceFinanciero cotizacionId={cotizacion?.id ?? ''} />
                        </div>
                    </div>

                    {/* COLUMNA 3 */}
                    {/* //! SERVICIOS */}
                    <div className='mb-6 border border-zinc-800 p-5 rounded-md'>
                        <div className='flex justify-between items-center mb-4'>
                            <h3 className='text-xl font-semibold text-zinc-500'>Servicios asociados</h3>
                            <button
                                className={`border border-zinc-800 bg-zinc-900 text-white px-4 py-2 rounded-md md:block hidden ${!cotizacion?.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => cotizacion?.id && router.push(`/admin/dashboard/cotizaciones/${cotizacion.id}`)}
                                disabled={!cotizacion?.id}
                            >
                                {cotizacion?.id ? 'Editar' : '...'}
                            </button>
                        </div>
                        <Wishlist
                            categorias={servicioCategoria ?? []}
                            usuarios={users ?? []}
                            servicios2={cotizacionServicio ?? []}
                        />
                    </div>
                    {/* //!COLUMNA 4 */}
                    <div className='mb-6 '>
                        <FichaAgenda eventoId={eventoId} />
                        <FichaBitacora eventoId={eventoId} />
                    </div>
                </div>
            </div>
        </div>
    )
}