'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { obtenerMetodoPago, actualizarMetodoPago, eliminarMetodoPago } from '@/app/admin/_lib/metodoPago.actions'
import { Trash } from 'lucide-react'

interface Params {
    metodoPagoId: string
}

export default function FormMetodoPagoEditar({ metodoPagoId }: Params) {

    const router = useRouter()

    const [metodoPago, setMetodoPago] = useState('')
    const [comisionPorcentajeBase, setComisionPorcentajeBase] = useState('')
    const [comisionFijaMonto, setComisionFijaMonto] = useState('')
    const [numMsi, setNumMsi] = useState('')
    const [comisionMsiPorcentaje, setComisionMsiPorcentaje] = useState('')
    const [errors, setErrors] = useState<{ metodoPago: string }>({ metodoPago: '' })

    useEffect(() => {
        const fetchData = async () => {
            const metodoPagoData = await obtenerMetodoPago(metodoPagoId)
            if (metodoPagoData) {
                setMetodoPago(metodoPagoData.metodo_pago)
                setComisionPorcentajeBase(metodoPagoData.comision_porcentaje_base ? metodoPagoData.comision_porcentaje_base.toString() : '')
                setComisionFijaMonto(metodoPagoData.comision_fija_monto ? metodoPagoData.comision_fija_monto.toString() : '')
                setNumMsi(metodoPagoData.num_msi ? metodoPagoData.num_msi.toString() : '')
                setComisionMsiPorcentaje(metodoPagoData.comision_msi_porcentaje ? metodoPagoData.comision_msi_porcentaje.toString() : '')
            }

        }
        fetchData()
    }, [metodoPagoId])


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!metodoPago) {
            setErrors({ metodoPago: 'El campo nombre del método de pago es requerido' })
            return
        }

        const metodoPagoActualizado = {
            id: metodoPagoId,
            metodo_pago: metodoPago.charAt(0).toUpperCase() + metodoPago.slice(1),
            comsion_porcentaje_base: parseFloat(comisionPorcentajeBase),
            comision_fija_monto: parseFloat(comisionFijaMonto),
            num_msi: parseInt(numMsi, 10),
            comision_msi_porcentaje: parseFloat(comisionMsiPorcentaje)
        }

        await actualizarMetodoPago(metodoPagoActualizado)
        router.push('/admin/configurar/metodoPago')

    }

    const handleDeleteMetodoPago = async (id: string) => {
        if (confirm('¿Estás seguro de eliminar este método de pago?')) {
            await eliminarMetodoPago(id)
            router.push('/admin/configurar/metodoPago')
        }
    }

    return (
        <div className='w-1/4'>
            {/* HEADER */}
            <div className='flex justify-between items-center mb-5'>
                <h1 className='text-2xl'>
                    Editar método de pago
                </h1>
            </div>

            {/* CONTENT */}
            <form onSubmit={handleSubmit}>
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

                <button type='submit' className='bg-blue-500 text-white px-3 py-2 rounded-md font-semibold w-full mb-3'>
                    Actualizar
                </button>

                <button className='bg-red-500 text-white px-3 py-2 rounded-md font-semibold w-full'
                    onClick={() => router.back()}>
                    Cerrar ventana
                </button>

                <button className='flex items-center justify-center mx-auto my-3 text-red-600'
                    onClick={() => handleDeleteMetodoPago(metodoPagoId)}>

                    <Trash size={16} className='mr-1' />
                    Eliminar método de pago
                </button>
            </form>
        </div>
    )
}