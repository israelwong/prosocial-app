'use client'
import React, { useEffect, useState } from 'react'
import { obtenerClientes } from '@/app/admin/_lib/cliente.actions'
import { Cliente } from '@/app/admin/_lib/types'
import { useRouter } from 'next/navigation'

export default function ListaProspectos() {

    const [clientes, setClientes] = useState([] as Cliente[]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function fetchClientes() {
            setLoading(true);
            const clientes = await obtenerClientes();
            setClientes(clientes);
            setLoading(false);
        }
        fetchClientes();
    }, []);

    const filteredClientes = clientes.filter(cliente =>
        cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cliente.createdAt && new Date(cliente.createdAt).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'long' }).toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className='max-w-screen-sm mx-auto iteme-center'>
            <div className='flex justify-between items-center mb-5'>
                <h1 className='text-2xl text-zinc-400'>
                    Lista de contactos
                </h1>
                <button
                    className='bg-zinc-800 border border-zinc-700 px-3 py-2 rounded-md text-zinc-300'
                    onClick={() => router.push('/admin/dashboard/contactos/nuevo')}
                >
                    Registrar nuevo contacto
                </button>
            </div>
            <input
                type='text'
                placeholder='Buscar prospecto por nombre o fecha...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='mb-5 p-2 border border-gray-300 rounded-md w-full text-zinc-800'
            />
            {loading ? (
                <p className='text-zinc-400'>
                    Cargando contactos...
                </p>
            ) : (
                filteredClientes.length > 0 ? (
                    <div className='grid grid-cols-1 gap-4'>
                        {filteredClientes.map(cliente => (
                            <div key={cliente.id} className='border border-zinc-800 p-4 rounded-md bg-zinc-900 cursor-pointer'
                                onClick={() => router.push(`/admin/dashboard/contactos/${cliente.id}`)}>
                                <div className='flex justify-between items-center'>
                                    <h2 className='text-xl text-zinc-300'>{cliente.nombre}</h2>
                                    <span
                                        className={`uppercase px-2 py-1 rounded-full text-[10px] font-semibold leading-3 ${cliente.status === 'cliente' ? 'bg-green-800 text-green-400' : 'bg-red-800 text-red-400'}`}>
                                        {cliente.status}
                                    </span>
                                </div>
                                <p className='text-zinc-400 italic'>
                                    Creado el {cliente.createdAt ? new Date(cliente.createdAt).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'medium' }) : 'N/A'}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No hay prospectos disponibles.</p>
                )
            )}
        </div>
    )

}