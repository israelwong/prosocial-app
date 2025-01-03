'use client'
import React, { useEffect, useState } from 'react'
import { User } from '@/app/admin/_lib/types'
import { useRouter } from 'next/navigation'
import { obtenerUsuarios } from '@/app/admin/_lib/User.actions'

export default function ListaUsuarios() {

    const router = useRouter()
    const [usuarios, setUsuarios] = useState<User[]>([])
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        obtenerUsuarios().then((res) => {
            setUsuarios(res)
        })
    }, [])

    const filteredUsuarios = usuarios.filter(usuario =>
        usuario.username?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className='max-w-screen-sm mx-auto'>

            <div className='flex justify-between items-center mb-5'>
                <h1 className='text-2xl'>Usuarios registrados</h1>
                <button
                    className='bg-zinc-900 border border-zinc-800 rounded py-2 px-4 text-sm'
                    onClick={() => router.push('/admin/configurar/usuarios/nuevo')}
                >
                    Registrar nuevo usuario
                </button>
            </div>

            <div className='mb-4'>
                <input
                    type='text'
                    className='w-full p-2 rounded bg-zinc-900 border border-zinc-700 text-white'
                    placeholder='Buscar usuario...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className=''>
                <div className='grid grid-cols-1 gap-3'>
                    {filteredUsuarios.map((usuario) => (

                        <div key={usuario.id} className='p-4 bg-zinc-950 rounded shadow'>

                            <div className='flex justify-between items-center mb-2'>
                                <div className='flex items-center'>
                                    <span
                                        className='bg-gray-300 text-gray-800 rounded-full px-2 py-1 text-[12px] leading-3 mr-1 font-semibold'>
                                        {usuario.role}
                                    </span>
                                    <p className='text-lg font-semibold'>{usuario.username}</p>
                                    <span
                                        className={`inline-block w-2 h-2 rounded-full ml-2 ${usuario.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}
                                    ></span>
                                </div>
                                <button
                                    className='bg-zinc-900 border border-zinc-800 text-white py-1 px-2 rounded'
                                    onClick={() => router.push(`/admin/configurar/usuarios/${usuario.id}`)}
                                >
                                    Editar
                                </button>
                            </div>

                            <ul className='text-sm'>
                                <li className='text-zinc-500'>
                                    <strong>Creación:</strong> {usuario.createdAt?.toLocaleString()}
                                </li>
                                <li className='text-zinc-500'>
                                    <strong>Actualización:</strong> {usuario.updatedAt?.toLocaleString()}
                                </li>
                            </ul>
                        </div>
                    ))}
                </div>

            </div>

        </div>
    )
}