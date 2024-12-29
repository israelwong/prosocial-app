'use client'
import React from 'react'
import FormClienteEditar from '@/app/admin/dashboard/clientes/components/FormClienteEditar';
import ListaEventosCliente from '../../eventos/components/ListaEventosCliente';
import { useRouter } from 'next/navigation';

interface Props {
    contactoId: string
}

export default function DashbardProspecto({ contactoId }: Props) {
    const router = useRouter();
    return (
        <div className='max-w-screen-lg mx-auto items-center' >

            <div className='gap-4'>

                <div className='flex justify-between items-center mb-10'>
                    <h1 className='text-xl text-zinc-300 uppercase'>Información del contacto</h1>
                    <div>

                        <button
                            className='bg-red-700 px-3 py-2 rounded-md text-white text-sm'
                            onClick={() => router.back()}
                        >
                            Cerrar ventana
                        </button>
                    </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                    <div>
                        <FormClienteEditar clienteId={contactoId} />
                    </div>
                    <div>
                        <ListaEventosCliente clienteId={contactoId} />
                    </div>
                </div>

            </div>
        </div>
    )
}
