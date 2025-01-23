'use client'
import React, { useEffect, useState } from 'react'
import { obtenerCliente } from '@/app/admin/_lib/cliente.actions';
import { Cliente } from '@/app/admin/_lib/types'
import { Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation';

interface Props {
    clienteId: string | undefined;
}

export default function FichaCliente({ clienteId }: Props) {

    const [loading, setLoading] = useState<boolean>(true)
    const [cliente, setCliente] = useState<Cliente | null>(null)
    const router = useRouter()

    useEffect(() => {
        if (clienteId) {
            obtenerCliente(clienteId).then((data) => {
                setCliente(data)
                setLoading(false)
            })
        }
    }, [clienteId])

    if (loading) {
        return <div className='text-zinc-500 border border-zinc-800 rounded-md p-5'>
            Cargando ficha cliente...
        </div>
    }

    return (
        <div>

            <div className='border border-zinc-800 rounded-md p-5'>
                <div className='mb-3 text-xl flex items-center justify-between'>

                    <button className='flex items-center'
                        onClick={() => cliente && router.push(`/admin/dashboard/contactos/${cliente.id}`)}
                    >
                        <Pencil size={15} className='mr-2' />
                        {cliente?.nombre}
                    </button>

                    <span className='px-2 py-1 bg-zinc-700 rounded-md uppercase text-[10px] text-white leading-3'>
                        {cliente?.status}
                    </span>

                </div>

                <ul className='mb-5 space-y-1 text-sm text-zinc-500'>
                    <li>
                        <span className='text-zinc-300'>Correo:</span> {cliente?.email ? cliente.email : 'Pendiente'}
                    </li>
                    <li>
                        <span className='text-zinc-300'>Teléfono:</span> {cliente?.telefono}
                    </li>
                    <li>
                        <span className='text-zinc-300'>Dirección:</span> {cliente?.direccion ? cliente.direccion : 'Pendiente'}
                    </li>
                    <li>
                        <span className='text-zinc-300'>Canal:</span> {cliente?.canalNombre ?? 'Directo'}
                    </li>
                    <li>
                        <span className='text-zinc-300'>Creado:</span> {cliente?.createdAt ? new Date(cliente.createdAt).toLocaleString('es-ES', {
                            year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'
                        }) : 'Pendiente'}
                    </li>
                    <li>
                        <span className='text-zinc-300'>Actualizado:</span> {cliente?.updatedAt ? new Date(cliente.updatedAt).toLocaleString('es-ES', {
                            year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'
                        }).replace(/^\w+,\s/, '') : 'Pendiente'}
                    </li>
                </ul>

                {/* <div className='space-x-2'>

                    <button className='mb-2 px-3 py-2 bg-zinc-900 text-zinc-300 rounded-md border border-zinc-800'
                        onClick={() => {
                            if (cliente?.telefono) {
                                window.open(`tel:${cliente.telefono}`, '_blank');
                            } else {
                                alert('El cliente no tiene un número de teléfono registrado.');
                            }
                        }}
                    >
                        Llamar por teléfono
                    </button>

                    <button className='mb-2 px-3 py-2 bg-green-900 text-zinc-300 rounded-md border border-zinc-800'
                        onClick={() => {
                            if (cliente?.telefono) {
                                window.open(`https://wa.me/${cliente.telefono}`, '_blank');
                            } else {
                                alert('El cliente no tiene un número de teléfono registrado.');
                            }
                        }}
                    >
                        Enviar whatsapp
                    </button>

                </div> */}

            </div>

        </div>
    )
}
