'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearMetodoPago } from '@/app/admin/_lib/metodoPago.actions'

export default function FormMetodoPagoNuevo() {
    const router = useRouter()

    const [metodoPago, setMetodoPago] = useState('')
    const [comisionPorcentajeBase, setComisionPorcentajeBase] = useState('')
    const [comisionFijaMonto, setComisionFijaMonto] = useState('')
    const [numMsi, setNumMsi] = useState('')
    const [comisionMsiPorcentaje, setComisionMsiPorcentaje] = useState('')
    const [payment_method, setPaymentMethod] = useState('')
    const [errors] = useState({ metodoPago: '' })

    const handleSubmit = async () => {

        if (!metodoPago) {
            errors.metodoPago = 'El nombre del método de pago es obligatorio'
            return
        }

        const nuevoMetodo = {
            metodo_pago: metodoPago.charAt(0).toUpperCase() + metodoPago.slice(1),
            comsion_porcentaje_base: parseFloat(comisionPorcentajeBase),
            comision_fija_monto: parseFloat(comisionFijaMonto),
            num_msi: parseInt(numMsi, 10),
            comision_msi_porcentaje: parseFloat(comisionMsiPorcentaje),
            payment_method: payment_method
        }

        await crearMetodoPago(nuevoMetodo)
        router.push('/admin/configurar/metodoPago')

    }

    return (
        <div className='w-1/4'>
            {/* HEADER */}
            <div className='flex justify-between items-center mb-5'>
                <h1 className='text-2xl'>
                    Nuevo método de pago
                </h1>
            </div>

            {/* CONTENT */}
            <div>
                <div className='mb-4'>
                    <label className='block text-zinc-500'>Nombre del método de Pago</label>
                    <input
                        type='text'
                        value={metodoPago}
                        onChange={(e) => setMetodoPago(e.target.value)}
                        className='mt-1 block w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md shadow-sm focus:outline-none'
                    />
                    {errors.metodoPago && <p className='text-red-500 pt-1'>{errors.metodoPago}</p>}
                </div>
                <div className='mb-4'>
                    <label className='block text-zinc-500'>Comisión Porcentaje Base</label>
                    <input
                        type='text'
                        value={comisionPorcentajeBase}
                        onChange={(e) => setComisionPorcentajeBase(e.target.value)}
                        className='mt-1 block w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md shadow-sm focus:outline-none'
                    />
                </div>
                <div className='mb-4'>
                    <label className='block text-zinc-500'>Comisión Fija Monto</label>
                    <input
                        type='text'
                        value={comisionFijaMonto}
                        onChange={(e) => setComisionFijaMonto(e.target.value)}
                        className='mt-1 block w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md shadow-sm focus:outline-none'
                    />
                </div>
                <div className='mb-4'>
                    <label className='block text-zinc-500'>Número de MSI</label>
                    <input
                        type='text'
                        value={numMsi}
                        onChange={(e) => setNumMsi(e.target.value)}
                        className='mt-1 block w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md shadow-sm focus:outline-none'
                    />
                </div>
                <div className='mb-4'>
                    <label className='block text-zinc-500'>Comisión por pago en cuotas</label>
                    <input
                        type='text'
                        value={comisionMsiPorcentaje}
                        onChange={(e) => setComisionMsiPorcentaje(e.target.value)}
                        className='mt-1 block w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md shadow-sm focus:outline-none'
                    />
                </div>
                <div className='mb-4'>
                    <label className='block text-zinc-500'>Payment Method Stripe</label>
                    <input
                        type='text'
                        value={payment_method}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className='mt-1 block w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md shadow-sm focus:outline-none'
                    />
                </div>
                <button type='submit' className='bg-blue-500 text-white px-3 py-2 rounded-md font-semibold w-full mb-3'
                    onClick={() => handleSubmit()}>
                    Guardar
                </button>

                <button className='bg-red-500 text-white px-3 py-2 rounded-md font-semibold w-full'
                    onClick={() => router.back()}>
                    Cancelar
                </button>
            </div>
        </div>
    )
}