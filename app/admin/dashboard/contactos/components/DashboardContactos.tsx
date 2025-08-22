'use client'
import React from 'react'
import FormClienteEditar from './FormClienteEditar';
import ListaEventosCliente from './ListaEventosCliente';
import { useRouter } from 'next/navigation';

interface Props {
    contactoId: string
}

export default function DashbardProspecto({ contactoId }: Props) {
    const router = useRouter();
    return (
        <div className='max-w-screen-2xl mx-auto items-center px-4' >

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

                {/* Layout en dos columnas */}
                <div className='grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8'>
                    {/* Columna izquierda: Detalles del cliente */}
                    <div className='bg-zinc-900 border border-zinc-800 rounded-lg p-4 lg:p-6'>
                        <h2 className='text-lg text-zinc-300 mb-4 border-b border-zinc-800 pb-2'>
                            Detalles del Cliente
                        </h2>
                        <FormClienteEditar clienteId={contactoId} />
                    </div>

                    {/* Columna derecha: Eventos asociados */}
                    <div className='bg-zinc-900 border border-zinc-800 rounded-lg p-4 lg:p-6'>
                        <h2 className='text-lg text-zinc-300 mb-4 border-b border-zinc-800 pb-2'>
                            Eventos Asociados
                        </h2>
                        <ListaEventosCliente clienteId={contactoId} />
                    </div>
                </div>

            </div>
        </div>
    )
}
