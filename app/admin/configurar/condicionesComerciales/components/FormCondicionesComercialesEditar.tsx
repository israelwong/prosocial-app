'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ListaMetodosPago from './ListaMetodosPago'
import { MetodoPago } from '@/app/admin/_lib/types'
import { actualizarCondicionComercial, obtenerCondicionComercial, obtenerCondicionesComercialesMetodosPago, eliminarCondicionComercial } from '@/app/admin/_lib/condicionesComerciales.actions'
import { obtenerMetodosPago } from '@/app/admin/_lib/metodoPago.actions'
import { Trash } from 'lucide-react'

interface Props {
    condicionesComercialesId: string
}

export default function FormCondicionesComercialesEditar({ condicionesComercialesId }: Props) {


    const router = useRouter()
    const [nombre, setNombre] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [descuento, setDescuento] = useState<number | undefined>(undefined)
    const [errors, setErrors] = useState<{ nombre?: string }>({})
    // const [serverRresponse, setServerResponse] = useState('')
    const [status, setStatus] = useState('')

    const [metodosPago, setMetodosPago] = useState([] as MetodoPago[])
    const [metodosPagoAceptados, setMetodosPagoAceptados] = useState([] as MetodoPago[])
    const [porcentajeAnticipo, setPorcentajeAnticipo] = useState<number | undefined>(0)
    const [tipoEvento, setTipoEvento] = useState('Social')

    // const tipoEventoListado =[
    //     'Social',
    //     'Empresarial',
    // ]

    useEffect(() => {
        const fetchData = async () => {
            const metodosPagoData = await obtenerMetodosPago()
            setMetodosPago(metodosPagoData)
        }
        fetchData()
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const condicionComercial = await obtenerCondicionComercial(condicionesComercialesId)

                if (condicionComercial) {
                    setNombre(condicionComercial.nombre)
                    setDescripcion(condicionComercial.descripcion ?? '')
                    setDescuento(condicionComercial.descuento ?? undefined)
                    setStatus(condicionComercial.status ?? '')
                    setPorcentajeAnticipo(condicionComercial.porcentaje_anticipo ?? 0)
                    setTipoEvento(condicionComercial.tipoEvento ?? 'Social')

                    const metodosPagoAceptados = await obtenerCondicionesComercialesMetodosPago(condicionesComercialesId)
                    setMetodosPagoAceptados(metodosPagoAceptados.map(metodo => ({
                        ...metodo,
                        id: metodo.metodoPagoId,
                        orden: metodo.orden
                    })))
                }

            } catch (error) {
                console.error('Error obteniendo la información de la condición comercial:', error)
            }
        }

        fetchData()
    }, [condicionesComercialesId])

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

        const condicionComercialActualizadas = {
            id: condicionesComercialesId,
            nombre,
            descripcion,
            descuento,
            metodosPago: metodosPagoAceptados,
            porcentaje_anticipo: porcentajeAnticipo,
            status: status,
            tipoEvento
        }

        const response = await actualizarCondicionComercial(condicionComercialActualizadas)
        if (response) {
            router.push('/admin/configurar/condicionesComerciales')
        }
    }

    const handleDelete = async () => {
        if (confirm('¿Estás seguro de eliminar esta condición comercial?')) {
            await eliminarCondicionComercial(condicionesComercialesId)
            router.push('/admin/configurar/condicionesComerciales')
        }
    }

    // Monitorear cambios en metodosPagoAceptados
    useEffect(() => {
        console.log('metodosPagoAceptados', metodosPagoAceptados)
    }, [metodosPagoAceptados])

    return (
        <div className=''>
            <div className='flex justify-between items-center mb-5'>
                <h2 className='text-xl'>
                    Condición comercial
                </h2>
                <button className='bg-red-600 text-white px-4 py-2 rounded-md font-semibold'
                    onClick={() => router.push('/admin/configurar/condicionesComerciales')}>
                    Cerrar ventana
                </button>
            </div>

            <div className='xl:grid xl:grid-cols-2 xl:gap-5 md:w-1/2'>
                <div className=''>
                    <div className='space-y-4 mb-5'>

                        {/* //! tipo evento */}
                        <div>
                            <label className='block text-sm font-medium text-zinc-500'>Tipo de evento</label>
                            <select
                                value={tipoEvento}
                                onChange={(e) => setTipoEvento(e.target.value)}
                                className='mt-1 block w-full px-3 py-2 border border-zinc-800 bg-zinc-900 rounded-md shadow-sm focus:outline-none'
                            >
                                <option value='' disabled>Seleccionar tipo de evento</option>
                                <option value='Social'>Social</option>
                                <option value='Empresarial'>Empresarial</option>
                            </select>
                        </div>

                        {/* status */}
                        <div>
                            <label className='block text-sm font-medium text-zinc-500'>Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className='mt-1 block w-full px-3 py-2 border border-zinc-800 bg-zinc-900 rounded-md shadow-sm focus:outline-none'
                            >
                                <option value='active'>Activo</option>
                                <option value='inactive'>Inactivo</option>
                            </select>
                        </div>

                        {/* Nombre */}
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
                                className='mt-1 block w-full px-3 py-2 border border-zinc-800 bg-zinc-900 rounded-md shadow-sm focus:outline-none h-32'
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

                    {/* {serverRresponse && (
                        <div className='text-sm text-green-400 text-center p-3 bg-green-600/20 rounded-md mb-2'>
                            {serverRresponse}
                        </div>
                    )} */}

                    <div>
                        <button
                            onClick={handleSubmit}
                            className='bg-blue-600 text-white px-4 py-2 rounded-md font-semibold w-full mb-3'>
                            Actualizar
                        </button>
                        <button
                            onClick={() => router.push('/admin/configurar/condicionesComerciales')}
                            className='bg-red-600 text-white px-4 py-2 rounded-md font-semibold w-full'>
                            Cancelar
                        </button>

                        <button className='flex items-center mx-auto py-3 text-red-500 text-sm'
                            onClick={handleDelete}>
                            <Trash size={16} className='mr-1' />
                            Eliminar condición comercial
                        </button>

                    </div>
                </div>
                <div>

                </div>
            </div>

        </div >
    )
}