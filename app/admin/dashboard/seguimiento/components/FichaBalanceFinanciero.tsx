import React, { useEffect, useState } from 'react'
import { Pago, Cotizacion } from '@/app/admin/_lib/types'
import { Tickets, Pencil, Trash, Clock9, CircleCheck } from 'lucide-react';
import { obtenerCotizacion } from '@/app/admin/_lib/cotizacion.actions';
import { obtenerPagosCotizacion, eliminarPago } from '@/app/admin/_lib/pago.actions';
import { obtenerEventoPorId } from '@/app/admin/_lib/evento.actions';

import ModalFormPagoNuevo from './ModalFormPagoNuevo';
import ModalFormPagoEditar from './ModalFormPagoEditar';

interface Props {
    cotizacionId: string
}

export default function FichaBalanceFinanciero({ cotizacionId }: Props) {

    const [cotizacion, setCotizacion] = React.useState<Cotizacion>()
    const [pagos, setPagos] = React.useState<Pago[]>()
    const [pagoId, setPagoId] = useState<string>()
    const [isModalPagoNuevoOpen, setIsModalPagoNuevoOpen] = useState(false)
    const [clienteId, setClienteId] = useState<string>()
    const [pagoRegistrado, setPagoRegistrado] = useState<boolean>(false)
    const [pagoEliminado, setPagoEliminado] = useState<boolean>(false)
    const [isModalPagoEditarOpen, setIsModalPagoEditarOpen] = useState(false)
    const [pagoActualizado, setPagoActualizado] = useState<boolean>(false)

    useEffect(() => {

        const fetchData = () => {
            obtenerCotizacion(cotizacionId).then(cotizacion => {
                if (cotizacion) {

                    setCotizacion(cotizacion)
                    obtenerEventoPorId(cotizacion.eventoId).then(evento => {
                        if (evento?.clienteId) {
                            setClienteId(evento.clienteId)
                        }
                    })
                    setPagoRegistrado(false)
                    setPagoEliminado(false)
                    setPagoActualizado(false)
                }
            })

            obtenerPagosCotizacion(cotizacionId).then(pagos => {
                setPagos(pagos)
            })
        }

        fetchData()
    }, [cotizacionId, pagoRegistrado, pagoEliminado, pagoActualizado])

    const handlePagoRegistrado = (success: boolean) => {
        console.log('Pago registrado', success)
        if (success) {
            setPagoRegistrado(true)
            setIsModalPagoNuevoOpen(false)
        }
    }

    const handleDeletePago = (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este pago?')) return
        eliminarPago(id).then(response => {
            if (response.success) {
                setPagoEliminado(true)
            }
        })
    }

    const handlePagoActualizado = (success: boolean) => {
        if (success) {
            setIsModalPagoEditarOpen(false)
            setPagoActualizado(true)
        }
    }


    return (
        <div>
            {/* HEADER */}
            <div className='flex justify-between items-center mb-5'>
                <h4 className='text-lg font-semibold text-zinc-500'>
                    Historial de pagos
                </h4>
                <button
                    className=' text-white p-2 rounded-md bg-blue-900 border border-blue-700 text-sm'
                    onClick={() => {
                        setIsModalPagoNuevoOpen(true)
                    }}>
                    Registrar pago
                </button>
            </div>

            {/* SALDO */}
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

            {/* HISTORIAL DE PAGOS */}
            {pagos?.map(pago => (
                <div key={pago.id} className='bg-zinc-900 p-4 rounded-lg shadow-md mb-5 border border-zinc-800'>

                    <div className=''>
                        <div className='grid grid-cols-3 gap-5'>

                            <div className='col-span-2'>
                                <h3 className='text-zinc-200'>
                                    {pago.concepto}
                                </h3>

                                <div className='text-sm'>
                                    {pago.status === 'paid' ? (
                                        <span className='text-green-500 flex items-center'><CircleCheck size={14} className='mr-1' /> {pago.metodo_pago === 'card' ? 'TCTD' : pago.metodo_pago} </span>
                                    ) : (
                                        <span className='text-yellow-500 flex items-center'><Clock9 size={14} className='mr-1' /> {pago.metodo_pago === 'card' ? 'TCTD' : pago.metodo_pago}</span>
                                    )}
                                </div>


                                <p className='text-zinc-500 text-sm'>
                                    {pago.updatedAt?.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>

                            <p className='text-lg text-white text-end'>
                                {pago.monto?.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                            </p>
                        </div>
                        <div className='flex space-x-2 mt-3'>

                            <button
                                className='text-red-700 px-2 py-1 rounded-md border border-red-700 flex items-center space-x-1 text-sm justify-center'
                                onClick={() => pago.id && handleDeletePago(pago.id)}
                            >
                                <Trash size={14} />
                            </button>

                            <button
                                className='bg-zinc-900 text-white px-2 py-1 rounded-md border border-zinc-800 text-sm w-full flex items-center space-x-1 justify-center'
                                onClick={() => {
                                    window.open(`/admin/dashboard/pagos/${pago.id}`, '_blank')
                                }}
                            >
                                <Tickets size={14} className='mr-1' /> Comprobante
                            </button>
                            <button
                                className='bg-zinc-900 text-white px-2 py-1 rounded-md border border-zinc-800 text-sm w-full flex items-center justify-center space-x-1'
                                onClick={() => {
                                    setIsModalPagoEditarOpen(true)
                                    setPagoId(pago.id)
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

            {/* MODAL NUEVO PAGO */}
            {isModalPagoNuevoOpen && (
                <ModalFormPagoNuevo
                    cotizacionId={cotizacionId}
                    clienteId={clienteId ?? ''}
                    onClose={() => setIsModalPagoNuevoOpen(false)}
                    onPagoRegistrado={handlePagoRegistrado}
                />
            )}

            {/* MODAL NUEVO PAGO */}
            {isModalPagoEditarOpen && (
                <ModalFormPagoEditar
                    pagoId={pagoId ?? ''}
                    onClose={() => setIsModalPagoEditarOpen(false)}
                    onPagoActualizado={handlePagoActualizado}
                />
            )}
        </div>
    )
}
