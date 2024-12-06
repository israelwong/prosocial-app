'use client'
import React from 'react'
import FormClienteEditar from '@/app/admin/dashboard/clientes/components/FormClienteEditar';
import ListaEventosCliente from '../../evento/components/ListaEventosCliente';
import { useRouter } from 'next/navigation';

interface Props {
    prospectoId: string
}

export default function DashbardProspecto({ prospectoId }: Props) {
    const router = useRouter();
    return (
        <div>

            <div className='flex justify-between items-center mb-5'>
                <h1 className='text-2xl text-zinc-300'>Información del prospecto</h1>
                <div>

                    <button
                        className='bg-red-700 px-3 py-2 rounded-md text-white'
                        onClick={() => router.back()}
                    >
                        Cerrar ventana
                    </button>
                </div>
            </div>

            <div className='grid grid-cols-4 gap-4'>
                <div>
                    <FormClienteEditar clienteId={prospectoId} />
                </div>
                <div className='col-span-3'>
                    <ListaEventosCliente clienteId={prospectoId} />
                </div>

            </div>



        </div>
    )
}
