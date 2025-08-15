import React, { useEffect, useState } from 'react'
import { Pago, MetodoPago } from '@/app/admin/_lib/types'
import { obtenerMetodosPago } from '@/app/admin/_lib/metodoPago.actions'
import { actualizarPago, obtenerPago } from '@/app/admin/_lib/pago.actions'

interface Props {
    pagoId: string
    onClose: () => void
    onPagoActualizado: (success: boolean) => void
}

export default function ModalFormPagoEditar({ pagoId, onClose, onPagoActualizado }: Props) {

    const [metodosPago, setMetodosPago] = useState<MetodoPago[]>()
    const [metodoPago, setMetodoPago] = useState<MetodoPago>()
    const [monto, setMonto] = useState<number | string>('')
    const [concepto, setConcepto] = useState('')
    const [errors, setErrors] = useState<{ [key: string]: string }>({})
    const [actualizandoRegistro, setActualizandoPago] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {

        Promise.all([obtenerPago(pagoId), obtenerMetodosPago()]).then(([pago, metodosPago]) => {
            if (pago) {
                setMonto(pago.monto)
                setConcepto(pago.concepto)
                setMetodoPago({
                    id: pago.metodoPagoId ?? '',
                    metodo_pago: pago.metodo_pago
                })
            }
            setMetodosPago(metodosPago)
        })

        setIsLoading(false)

    }, [pagoId])

    const validateForm = () => {
        const errors: { [key: string]: string } = {}
        if (!monto) {
            errors.monto = 'El monto es requerido'
        }
        if (!concepto) {
            errors.concepto = 'El concepto es requerido'
        }
        if (!metodoPago) {
            errors.metodoPago = 'El método de pago es requerido'
        }
        setErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleRegistrarPago = async () => {
        if (!validateForm()) return

        const pagoActualizado: Pago = {
            id: pagoId,
            metodoPagoId: metodoPago?.id || '',
            metodo_pago: metodoPago?.metodo_pago || '',
            monto: typeof monto === 'string' ? parseFloat(monto) : monto,
            concepto,
            status: 'paid'
        }
        const response = await actualizarPago(pagoActualizado)

        if (response.success) {
            onPagoActualizado(true)
        } else {
            onPagoActualizado(false)
            setActualizandoPago(false)
            alert('Error al actualizar pago')
        }
    }

    if (isLoading) {
        return <p> Cargando datos </p>
    }

    return (
        <div>
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
                <div className="bg-zinc-900 p-6 rounded-md shadow-md w-full max-w-sm">
                    <h3 className='text-lg font-semibold text-zinc-500 mb-5'>
                        Editar pago
                    </h3>

                    <div>
                        <div className='mb-4'>
                            <label htmlFor="concepto" className='block text-sm text-zinc-500 mb-1'>Concepto</label>
                            <input
                                type="text"
                                id="concepto"
                                name="concepto"
                                className='w-full p-2 border border-zinc-800 rounded-md bg-zinc-900'
                                placeholder='Concepto'
                                value={concepto}
                                onChange={(e) => setConcepto(e.target.value)}
                            />
                            {errors.concepto && <p className="text-red-500 text-xs mt-1">{errors.concepto}</p>}
                        </div>

                        <div className='mb-4'>
                            <label htmlFor="monto" className='block text-sm text-zinc-500 mb-1'>Monto</label>
                            <input
                                type="number"
                                id="monto"
                                name="monto"
                                className='w-full p-2 border border-zinc-800 rounded-md bg-zinc-900'
                                placeholder='Monto'
                                value={monto}
                                onChange={(e) => setMonto(parseFloat(e.target.value))}
                            />
                            {errors.monto && <p className="text-red-500 text-xs mt-1">{errors.monto}</p>}
                        </div>

                        <div className='mb-4'>
                            <label htmlFor="metodoPago" className='block text-sm text-zinc-500 mb-1'>Método de Pago</label>
                            <select
                                id="metodoPago"
                                name="metodoPago"
                                className='w-full p-2 border border-zinc-800 rounded-md bg-zinc-900'
                                value={metodoPago?.id || ''}
                                onChange={(e) => {
                                    const selectedMetodo = metodosPago?.find(mp => mp.id === e.target.value)
                                    setMetodoPago(selectedMetodo)
                                }}
                            >
                                <option value="">Seleccione un método de pago</option>
                                {metodosPago?.map((mp) => (
                                    <option key={mp.id} value={mp.id}>
                                        {mp.metodo_pago}
                                    </option>
                                ))}
                            </select>
                            {errors.metodoPago && <p className="text-red-500 text-xs mt-1">{errors.metodoPago}</p>}
                        </div>
                    </div>

                    <button
                        className='text-white p-2 rounded-md bg-green-900 border border-green-700 text-sm w-full mb-2'
                        onClick={handleRegistrarPago}
                        disabled={actualizandoRegistro}>
                        {actualizandoRegistro ? 'Actualizando pago ...' : 'Actualizar pago'}
                    </button>

                    <button
                        className='text-white p-2 rounded-md bg-blue-900 border border-blue-700 text-sm w-full'
                        onClick={onClose}>
                        Cerrar ventana
                    </button>
                </div>
            </div>
        </div>
    )
}