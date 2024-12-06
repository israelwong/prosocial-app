'use client'
import React, { useEffect, useState } from 'react'
import { MetodoPago } from '@/app/admin/_lib/types'
import { obtenerMetodosPago, actualizarStatusMetodoPago } from '@/app/admin/_lib/metodoPago.actions'
import { useRouter } from 'next/navigation'

export default function ListaMetodosPago() {

    const router = useRouter()
    const [metodosPago, setMetodosPago] = useState([] as MetodoPago[])

    useEffect(() => {
        const fetchData = async () => {
            const metodosPagoData = await obtenerMetodosPago()
            setMetodosPago(metodosPagoData)
        }
        fetchData()
    }, [])

    const handleActualizarStatusMetodoPago = async (id: string, status: string) => {
        await actualizarStatusMetodoPago(id, status)
        const metodosPagoData = await obtenerMetodosPago()
        setMetodosPago(metodosPagoData)
    }


    return (
        <div>

            <div className='flex justify-between mb-5'>
                <h1 className="text-3xl font-semibold">Métodos de Pago</h1>

                <button
                    className="btn btn-primary bg-blue-500 px-3 py-2 rounded-md font-semibold"
                    onClick={() => router.push('/admin/configurar/metodoPago/nuevo')}
                >
                    Agregar método de pago
                </button>
            </div>

            <div className='text-zinc-400 mb-5'>
                <ul className='list-disc list-inside'>
                    <li>Definir métodos de pago ayudarán al sistema para calcular los cargos cobrados por la finthech en caso de que el cliente relize un pago a través de la pasarela de pago</li>
                    <li>Los métodos de pago definidos y activos serán mostrados en la pasarela de pago</li>
                    <li>En caso de que alguna comindicón comercial acepte meses sin intereses, solo se mostrarán los que esten activos</li>
                </ul>
            </div>

            {metodosPago.length === 0 ? (
                <p className="text-center text-gray-500 py-10">
                    No hay métodos de pago disponibles.
                </p>
            ) : (
                <table className="min-w-full bg-zinc-800 border border-zinc-600 rounded-md">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b border-b-zinc-600 text-left">Método de Pago</th>
                            <th className="py-2 px-4 border-b border-b-zinc-600">Comisión Base</th>
                            <th className="py-2 px-4 border-b border-b-zinc-600">Comisión Fija Monto</th>
                            <th className="py-2 px-4 border-b border-b-zinc-600">Número de MSI</th>
                            <th className="py-2 px-4 border-b border-b-zinc-600">Comisión MSI Porcentaje</th>
                            <th className="py-2 px-4 border-b border-b-zinc-600">Estado</th>
                            <th className="py-2 px-4 border-b border-b-zinc-600">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {metodosPago.map((metodo, index) => (
                            <tr key={index}>
                                <td className="py-2 px-4 border-b border-b-zinc-700 text-left">
                                    {metodo.metodo_pago}
                                </td>
                                <td className="py-2 px-4 border-b border-b-zinc-700 text-center">{metodo.comision_porcentaje_base ? `${metodo.comision_porcentaje_base}%` : 'N/A'}</td>
                                <td className="py-2 px-4 border-b border-b-zinc-700 text-center">{metodo.comision_fija_monto ? `$${metodo.comision_fija_monto}` : 'N/A'}</td>
                                <td className="py-2 px-4 border-b border-b-zinc-700 text-center">{metodo.num_msi || 'N/A'}</td>
                                <td className="py-2 px-4 border-b border-b-zinc-700 text-center">{metodo.comision_msi_porcentaje ? `${metodo.comision_msi_porcentaje}%` : 'N/A'}</td>
                                <td className="py-2 px-4 border-b border-b-zinc-700 text-center">
                                    <button
                                        className={`px-2 py-1 rounded-md ${metodo.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}
                                        onClick={() => {
                                            const newStatus = metodo.status === 'active' ? 'inactive' : 'active';
                                            if (metodo.id) {
                                                handleActualizarStatusMetodoPago(metodo.id, newStatus)
                                            }
                                        }}
                                    >
                                        {metodo.status === 'active' ? 'Activo' : 'Inactivo'}
                                    </button>
                                </td>
                                <td className="py-2 px-4 border-b border-b-zinc-700 text-center">
                                    <button
                                        className="px-2 py-1 rounded-md bg-blue-500"
                                        onClick={() => router.push(`metodoPago/${metodo.id}`)}
                                    >
                                        Editar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

        </div>
    )
}
