'use client'
import React, { useEffect, useState } from 'react'
import { Cliente, Evento, Cotizacion, Pago, Servicio } from '@/app/admin/_lib/types'
import { obtenerEventoSeguimiento } from '@/app/admin/_lib/evento.actions'
import { obtenerCotizacionServicios, } from '@/app/admin/_lib/cotizacion.actions';
import { obtenerServicio } from '@/app/admin/_lib/servicio.actions'
import { useRouter } from 'next/navigation'
import { obtenerCondicionComercial } from '@/app/admin/_lib/condicionesComerciales.actions';
import Wishlist from './Wishlist'
import { Tickets, Pencil, Trash, Clock9, CircleCheck } from 'lucide-react';



export interface Props {
    eventoId: string
}

export default function FichaDetalle({ eventoId }: Props) {

    const router = useRouter()
    const [evento, setEvento] = useState<Evento | null>(null)
    const [cliente, setCliente] = useState<Cliente | null>(null)
    const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null)
    const [pagos, setPagos] = useState<Pago[] | null>(null)
    const [tipoEvento, setTipoEvento] = useState<string | null>(null)
    const [condicionComercial, setCondicionComercial] = useState<string | null>(null)
    const [servicios, setServicios] = useState<Servicio[]>([]);

    useEffect(() => {
        const fetchData = async () => {

            const data = await obtenerEventoSeguimiento(eventoId)

            console.log(data)
            setEvento(data.evento ?? null)
            setCliente(data.cliente ?? null)
            setCotizacion(data.cotizacion ?? null)
            setPagos(data.pago ?? null)
            setTipoEvento(data.tipoEvento ?? null)

            if (data.cotizacion?.condicionesComercialesId) {
                const condicionComercial = await obtenerCondicionComercial(data.cotizacion?.condicionesComercialesId)
                const condicion = `${condicionComercial?.nombre} - ${condicionComercial?.descripcion}`
                setCondicionComercial(condicion)
            }

            // Obtener los servicios de la cotización
            const serviciosCotizacion = await obtenerCotizacionServicios(data.cotizacion?.id || '');

            // Obtener los servicios
            const serviciosData = await Promise.all(serviciosCotizacion.map(async (servicio) => {
                const servicioData = await obtenerServicio(servicio.servicioId);
                return {
                    ...servicioData,
                    cantidad: servicio.cantidad,
                    nombre: servicioData?.nombre || '',
                    posicion: servicio.posicion,
                    servicioCategoriaId: servicio.servicioCategoriaId,
                };
            }));
            setServicios(serviciosData);


        }
        fetchData()


    }, [eventoId])



    return (
        <div>

            <div>
                {/* header */}
                <div className='flex justify-between items-center mb-5'>

                    <h1 className='text-xl font-semibold'>
                        Seguimiento de evento
                    </h1>

                    <div className='flex items-center space-x-2'>

                        <div>

                            Progreso
                        </div>


                        <button className='bg-red-700 text-white p-2 rounded-md' onClick={() => {
                            router.back()
                        }
                        }>
                            Cerrar ventana
                        </button>
                    </div>
                </div>

                <div className='grid grid-cols-4 gap-5'>
                    <div>

                        {/* //! EVENTO */}
                        <div className='bg-zinc-900 p-4 rounded-lg shadow-md mb-5 border border-zinc-800'>

                            <div className='flex justify-between items-center mb-3'>
                                <h3 className='text-xl text-zinc-200 font-semibold'>
                                    Evento
                                </h3>
                                <button
                                    className='bg-zinc-900 text-white px-2 py-1 rounded-md border border-zinc-800'
                                    onClick={() => {
                                        router.push(`/admin/dashboard/eventos/${evento?.id}`)
                                    }}
                                >
                                    Editar
                                </button>
                            </div>

                            <ul className='mt-2 list-inside list-disc mb-3'>
                                <li>
                                    <span className='text-zinc-500'>Nombre del evento:</span> {evento?.nombre}</li>
                                <li>
                                    <span className='text-zinc-500'>Tipo de evento:</span> {tipoEvento}
                                </li>
                                <li>
                                    <span className='text-zinc-500'>Sede:</span> Sede
                                </li>
                                <li>
                                    <span className='text-zinc-500'>Dirección:</span> Dirección
                                </li>
                            </ul>

                            <div className='bg-yellow-800/80 px-2 py-1 rounded-full shadow-md text-yellow-300 border border-yellow-700 inline-block text-sm'>
                                Fecha de celebración:<span className='font-semibold'> {evento?.fecha_evento?.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>

                        </div>

                        {/* //! CLIENTE */}
                        <div className='bg-zinc-900 p-4 rounded-lg shadow-md mb-5 border border-zinc-800'>
                            <div className='flex justify-between items-center mb-3'>
                                <h3 className='text-xl text-zinc-200 font-semibold'>
                                    Cliente
                                </h3>
                                <button
                                    className='bg-zinc-900 text-white px-2 py-1 rounded-md border border-zinc-800'
                                    onClick={() => {
                                        router.push(`/admin/dashboard/contactos/${cliente?.id}`)
                                    }}
                                >
                                    Editar
                                </button>
                            </div>
                            <ul className='mt-2 list-inside list-disc'>
                                <li>
                                    <span className='text-zinc-500'>Nombre:</span> {cliente?.nombre}
                                </li>
                                <li>
                                    <span className='text-zinc-500'>Teléfono:</span> {cliente?.telefono}
                                </li>
                                <li>
                                    <span className='text-zinc-500'>Correo:</span> {cliente?.email}
                                </li>
                                <li>
                                    <span className='text-zinc-500'>Domicilio:</span> {cliente?.direccion || <span className='text-yellow-500'>Pendiente</span>}
                                </li>
                            </ul>
                        </div>

                        <button className='bg-blue-900 text-white p-2 rounded-md mb-3 w-full'>
                            Contrato digital
                        </button>

                        <button className='bg-red-700 text-white p-2 rounded-md mb-5 w-full'
                            onClick={() => { router.back() }}
                        >
                            Cerrar ventana
                        </button>
                    </div>

                    <div >

                        {/* //! PRESUPUESTO */}
                        <div className='bg-zinc-900 p-4 rounded-lg shadow-md mb-5 border border-zinc-800'>
                            <h3 className='text-xl font-semibold text-zinc-500 mb-1'>
                                Presupuesto
                            </h3>
                            <p className='text-4xl font-semibold mb-3'>
                                {cotizacion?.precio?.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                            </p>
                            <p className='text-sm text-zinc-500 italic'>
                                Condición comercial: {condicionComercial}
                            </p>
                        </div>


                        {/*    //! HISTORIAL */}
                        <div className='flex justify-between items-center mb-5'>
                            <h4 className='text-lg font-semibold text-zinc-500'>
                                Historial de pagos
                            </h4>
                            <button
                                className=' text-white p-2 rounded-md bg-blue-900 border border-blue-700 text-sm'
                                onClick={() => {
                                    router.push(`/admin/dashboard/pagos/nuevo`)
                                }
                                }>
                                Registrar pago
                            </button>
                        </div>

                        <div className='grid grid-cols-2 gap-5 mb-5'>
                            <div className='bg-green-800/20 border border-green-700 p-4 rounded-lg shadow-md'>
                                <p>Pagado</p>
                                <p className='text-2xl'>
                                    {pagos?.reduce((acc, pago) => acc + (pago.monto ?? 0), 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                </p>
                            </div>
                            <div className='bg-red-800/20 border border-red-700 p-4 rounded-lg shadow-md'>
                                <p>Pendiente:</p>
                                <p className='text-2xl'>
                                    {((cotizacion?.precio ?? 0) - (pagos?.reduce((acc, pago) => acc + (pago.monto ?? 0), 0) || 0)).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                </p>
                            </div>
                        </div>

                        {pagos?.map(pago => (
                            <div key={pago.id} className='bg-zinc-900 p-4 rounded-lg shadow-md mb-5 border border-zinc-800'>

                                <div className=''>
                                    <div className='grid grid-cols-3 gap-5'>

                                        <div className='col-span-2'>
                                            <h3 className='text-zinc-200'>
                                                {pago.concepto}
                                                {pago.status === 'paid' ? (
                                                    <span className='text-green-500 flex items-center'><CircleCheck size={14} className='mr-1' /> {pago.metodo_pago === 'card' ? 'TCTD' : pago.metodo_pago} </span>
                                                ) : (
                                                    <span className='text-yellow-500 flex items-center'><Clock9 size={14} className='mr-1' /> {pago.metodo_pago === 'card' ? 'TCTD' : pago.metodo_pago}</span>
                                                )}

                                            </h3>
                                            <p className='text-zinc-500 text-sm'>
                                                {pago.updatedAt?.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                        </div>

                                        <p className='text-lg text-white text-end'>
                                            {pago.monto?.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                        </p>
                                    </div>
                                    <div className='flex space-x-2 mt-3'>
                                        <button className='text-red-700 px-2 py-1 rounded-md border border-red-700 flex items-center space-x-1 text-sm justify-center'>
                                            <Trash size={14} />
                                        </button>
                                        <button
                                            className='bg-zinc-900 text-white px-2 py-1 rounded-md border border-zinc-800 text-sm w-full flex items-center space-x-1 justify-center'
                                            onClick={() => {
                                                router.push(`/admin/dashboard/pagos/${pago.id}`)
                                            }}
                                        >
                                            <Tickets size={14} className='mr-1' /> Comprobante
                                        </button>
                                        <button
                                            className='bg-zinc-900 text-white px-2 py-1 rounded-md border border-zinc-800 text-sm w-full flex items-center justify-center space-x-1'
                                            onClick={() => {
                                                router.push(`/admin/dashboard/pagos/${pago.id}/editar`)
                                            }}
                                        >
                                            <Pencil size={14} className='mr-1' /> Editar
                                        </button>

                                        {pago.status === 'pending' && (
                                            <button className='bg-green-700 text-white px-2 py-1 rounded-md border border-green-600 text-sm w-full flex items-center justify-center space-x-1'>
                                                Confirmar
                                            </button>
                                        )}
                                    </div>

                                </div>

                            </div>
                        ))}

                    </div>

                    {/* //! SERVICIOS */}
                    <div className='mb-6 bg-zinc-900 border border-zinc-800 p-5 rounded-md'>
                        <div className='flex justify-between items-center mb-4'>
                            <h3 className='text-xl font-semibold text-zinc-500'>
                                Servicios asociados
                            </h3>
                            <button
                                className='bg-zinc-900 text-white p-2 rounded-md' onClick={() => {
                                    router.push(`/admin/dashboard/cotizaciones/${cotizacion?.id}`)
                                }
                                }>
                                Editar
                            </button>

                        </div>
                        <Wishlist servicios={servicios} cotizacionId={cotizacion?.id ?? ''} />
                    </div>

                </div>
            </div>

        </div >
    )
}
