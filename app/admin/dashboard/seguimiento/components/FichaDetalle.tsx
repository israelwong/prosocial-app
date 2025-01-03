'use client'
import React, { useEffect, useState } from 'react'
import { Cliente, Evento, Cotizacion } from '@/app/admin/_lib/types'
import { obtenerEventoSeguimiento, actualizarEventoStatus } from '@/app/admin/_lib/evento.actions'
import { useRouter } from 'next/navigation'
import { obtenerCondicionComercial } from '@/app/admin/_lib/condicionesComerciales.actions';


import Wishlist from './Wishlist'
import FichaPresupuesto from './FichaPresupuesto'
import FichaBalanceFinanciero from './FichaBalanceFinanciero'

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
    const [status, setStatus] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            const data = await obtenerEventoSeguimiento(eventoId)
            setEvento(data.evento ?? null)
            setStatus(data.evento?.status ?? null)
            setCliente(data.cliente ?? null)
            setCotizacion(data.cotizacion ?? null)
            setTipoEvento(data.tipoEvento ?? null)

            if (data.cotizacion?.condicionesComercialesId) {
                const condicionComercial = await obtenerCondicionComercial(data.cotizacion?.condicionesComercialesId)
                const condicion = `${condicionComercial?.nombre} - ${condicionComercial?.descripcion}`
                setCondicionComercial(condicion)
            }
        }
        fetchData()
    }, [eventoId])

    const handleActualizarEventoStatus = async (status: string) => {

        if (!confirm('¿Estás seguro de cambiar el status del evento?'))
            return

        const eventoId = evento?.id
        await actualizarEventoStatus(
            eventoId ?? '',
            status
        )
    }

    return (
        <div>

            <div>
                {/* header */}
                <div className='flex justify-between items-center mb-5'>

                    <h1 className='text-xl font-semibold'>
                        Seguimiento de evento
                    </h1>

                    <div className='flex items-center space-x-2'>

                        <button className='bg-red-700 text-white px-3 py-2 rounded-md' onClick={() => {
                            router.back()
                        }
                        }>
                            Cerrar ventana
                        </button>
                    </div>
                </div>

                <div className='grid grid-cols-4 gap-5'>

                    {/* COLUMNA 1 */}
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

                        <button
                            className='bg-blue-900 text-white p-2 rounded-md w-full mb-2'
                            onClick={() => {
                                window.open(`/admin/dashboard/contrato/${evento?.id}`, '_blank')
                            }}
                        >
                            Contrato digital
                        </button>

                        {status === 'aprobado' && (
                            <button
                                className='bg-zinc-700 px-3 py-2 text-white rounded-md w-full mb-2'
                                onClick={async () => {
                                    await handleActualizarEventoStatus('archivado')
                                    setStatus('archivado')
                                }}
                            >
                                Archivar evento
                            </button>
                        )}
                        {status === 'archivado' && (
                            <button
                                className='border border-yellow-700 px-3 py-2 text-yellow-600 rounded-md w-full mb-2'
                                onClick={async () => {
                                    await handleActualizarEventoStatus('aprobado')
                                    setStatus('aprobado')
                                }}
                            >
                                Desarchivar
                            </button>
                        )}

                        <button className='bg-red-700 text-white p-2 rounded-md mb-5 w-full'
                            onClick={() => { router.back() }}
                        >
                            Cerrar ventana
                        </button>
                    </div>

                    {/* COLUMNA 2 */}
                    <div>

                        {/* //! PRESUPUESTO */}
                        <FichaPresupuesto
                            precio={cotizacion?.precio ?? 0}
                            condicionComercial={condicionComercial}
                        />

                        <div className='p-5 border border-zinc-800 rounded-md'>
                            <FichaBalanceFinanciero
                                cotizacionId={cotizacion?.id ?? ''}
                            />
                        </div>

                    </div>

                    {/* //! SERVICIOS */}
                    <div className='mb-6 border border-zinc-800 p-5 rounded-md'>
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
                        <Wishlist cotizacionId={cotizacion?.id ?? ''} />
                    </div>

                </div>
            </div>

        </div >
    )
}
