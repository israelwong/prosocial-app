'use client'
import React, { useEffect, useState } from 'react'
import { obtenerClientePorEtapa } from '@/app/admin/_lib/cliente.actions'
import { Cliente } from '@/app/admin/_lib/types'
import { useRouter } from 'next/navigation'

export default function ListaProspectos() {

    const [clientes, setClientes] = useState([] as Cliente[]);
    const router = useRouter();

    useEffect(() => {
        async function fetchClientes() {
            const clientes = await obtenerClientePorEtapa('prospecto');
            setClientes(clientes);
        }
        fetchClientes();
    }, []);

    return (
        <div>
            <div className='flex justify-between items-start mb-5'>
                <h1 className='text-2xl text-zinc-400'>
                    Lista de prospectos
                </h1>
                <button
                    className='bg-blue-900 px-3 py-2 rounded-md text-zinc-300 '
                    onClick={() => router.push('/admin/dashboard/prospectos/nuevo')}
                >
                    Registrar prospecto
                </button>
            </div>
            {clientes.length > 0 ? (
                <ul className='w-1/4'>
                    {clientes.map(cliente => (

                        <li key={cliente.id}>
                            <div className='flex justify-between items-center'>
                                {cliente.nombre}
                                <button
                                    className=''
                                    onClick={() => router.push(`/admin/dashboard/prospectos/${cliente.id}`)}
                                >
                                    Editar
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No hay prospectos disponibles.</p>
            )}
        </div>
    )
}
