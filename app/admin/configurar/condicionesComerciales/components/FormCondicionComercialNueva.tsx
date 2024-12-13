'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ListaMetodosPago from './ListaMetodosPago'
import { MetodoPago } from '@/app/admin/_lib/types'
import { crearCondicionComercial } from '@/app/admin/_lib/condicionesComerciales.actions'
import { obtenerMetodosPago } from '@/app/admin/_lib/metodoPago.actions'

export default function FormCondicionComercialNueva() {

    const router = useRouter()
    const [nombre, setNombre] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [descuento, setDescuento] = useState<number | undefined>(undefined)
    const [errors, setErrors] = useState<{ nombre?: string }>({})

    const [metodosPago, setMetodosPago] = useState([] as MetodoPago[])
    const [metodosPagoAceptados, setMetodosPagoAceptados] = useState([] as MetodoPago[])

    const [porcentajeAnticipo, setPorcentajeAnticipo] = useState<number | undefined>(0)

    useEffect(() => {
        const fetchData = async () => {
            const metodosPagoData = await obtenerMetodosPago()
            setMetodosPago(metodosPagoData)
        }
        fetchData()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const newErrors: { nombre?: string } = {}

        if (!nombre) {
            newErrors.nombre = 'El nombre es requerido'
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        const condicionComercial = {
            nombre,
            descripcion,
            descuento,
            metodosPago: metodosPagoAceptados,
            porcentaje_anticipo: porcentajeAnticipo
        }
        await crearCondicionComercial(condicionComercial)
        router.push('/admin/configurar/condicionesComerciales')
    }

    //monitorear cambios en metodosPagoAceptados
    useEffect(() => {
        console.log('metodosPagoAceptados', metodosPagoAceptados)
    }, [metodosPagoAceptados])

    return (
        <div>
            <div className='flex justify-between items-center mb-5'>
                <h2 className='text-2xl'>
                    Nueva condición comercial
                </h2>
                <button className='bg-red-600 text-white px-4 py-2 rounded-md font-semibold'
                    onClick={() => router.push('/admin/configurar/condicionesComerciales')}>
                    Cerrar ventana
                </button>
            </div>

            <div className='grid grid-cols-4 gap-5'>
                <div className=''>
                    <div className='space-y-4 mb-5'>
                        <div>
                            <label className='block text-sm font-medium text-zinc-500'>Nombre</label>
                            <input
                                type='text'
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                className='mt-1 block w-full px-3 py-2 border border-zinc-800 bg-zinc-900 rounded-md shadow-sm focus:outline-none '
                            />
                            {errors.nombre && <p className='text-red-500 text-sm pt-1'>{errors.nombre}</p>}
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-zinc-500'>Descripción</label>
                            <textarea
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                className='mt-1 block w-full px-3 py-2 border border-zinc-800 bg-zinc-900 rounded-md shadow-sm focus:outline-none '
                            />
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-zinc-500'>Descuento</label>
                            <input
                                type='number'
                                value={descuento !== undefined ? descuento : ''}
                                onChange={(e) => setDescuento(e.target.value ? parseFloat(e.target.value) : undefined)}
                                className='mt-1 block w-full px-3 py-2 border border-zinc-800 bg-zinc-900 rounded-md shadow-sm focus:outline-none '
                            />
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-zinc-500'>Porcentaje anticipo</label>
                            <input
                                type='number'
                                value={porcentajeAnticipo !== undefined ? porcentajeAnticipo : ''}
                                onChange={(e) => setPorcentajeAnticipo(e.target.value ? parseFloat(e.target.value) : undefined)}
                                className='mt-1 block w-full px-3 py-2 border border-zinc-800 bg-zinc-900 rounded-md shadow-sm focus:outline-none '
                            />
                        </div>
                    </div>

                    <div className='mb-5 p-5 bg-zinc-900 rounded-md border border-zinc-800'>
                        <ListaMetodosPago
                            onMetodosPagoAceptados={metodosPagoAceptados}
                            metodosPago={metodosPago}
                            onMetodosPagoChange={setMetodosPagoAceptados}
                        />
                    </div>

                    <div>
                        <button
                            onClick={handleSubmit}
                            className='bg-blue-600 text-white px-4 py-2 rounded-md font-semibold w-full mb-3'>
                            Guardar
                        </button>
                        <button
                            className='bg-red-600 text-white px-4 py-2 rounded-md font-semibold w-full'
                            onClick={() => router.push('/admin/configurar/condicionesComerciales')}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
                <div>

                </div>
            </div>

        </div>
    )
}