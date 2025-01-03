'use client'

import React, { useEffect, useState } from 'react'
import { User } from '@/app/admin/_lib/types'
import { useRouter } from 'next/navigation'
import { obtenerUsuario, actualizarUsuario, eliminarUsuario } from '@/app/admin/_lib/User.actions'
import { Trash } from 'lucide-react'

interface Props {
    usuarioId: string;
}

export default function FormUsuarioEditar({ usuarioId }: Props) {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('')
    const [telefono, setTelefono] = useState('')
    const [status, setStatus] = useState('')
    const [errors, setErrors] = useState({ username: '', role: '', telefono: '', status: '' })
    const [respuesta, setRespuesta] = useState('')
    const [guardando, setGuardando] = useState(false)
    const [eliminando, setEliminando] = useState(false)

    const roles = ['admin', 'empleado', 'proveedor', 'cliente']
    const statuses = ['active', 'inactive']

    useEffect(() => {
        const fetchUsuario = async () => {
            const usuario = await obtenerUsuario(usuarioId)
            if (usuario) {
                setUsername(usuario.username || '')
                setEmail(usuario.email || '')
                setRole(usuario.role || '')
                setTelefono(usuario.telefono || '')
                setStatus(usuario.status || '')
            }
        }
        fetchUsuario()
    }, [usuarioId])

    const validate = () => {
        let valid = true
        // let errors = { username: '', password: '', role: '', telefono: '', status: '' }

        if (!username) {
            errors.username = 'El nombre de usuario es obligatorio'
            valid = false
        }

        if (!role) {
            errors.role = 'El rol es obligatorio'
            valid = false
        }
        if (!telefono) {
            errors.telefono = 'El teléfono es obligatorio'
            valid = false
        } else if (telefono.length !== 10) {
            errors.telefono = 'El teléfono debe tener 10 dígitos'
            valid = false
        }
        if (!status) {
            errors.status = 'El estado es obligatorio'
            valid = false
        }

        setErrors(errors)
        return valid
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (validate()) {

            const usuarioActualizado: User = {
                id: usuarioId,
                username,
                email,
                role,
                telefono,
                status
            }

            let nuevoPassword = password
            if (!nuevoPassword) {
                nuevoPassword = ''
            }

            setGuardando(true)
            const response = await actualizarUsuario(nuevoPassword, usuarioActualizado)
            if (response && response.success) {
                router.push('/admin/configurar/usuarios')
            } else {
                setRespuesta(response ? response.message : 'Error al actualizar el usuario')
                setGuardando(false)
            }
        }
    }

    const handleDeleteUsuario = async () => {
        if (confirm('¿Estás seguro de eliminar este usuario?')) {
            setEliminando(true)
            const response = await eliminarUsuario(usuarioId)
            if (response.success) {
                router.push('/admin/configurar/usuarios')
            } else {
                setRespuesta(response ? response.message : 'Error al eliminar el usuario')
                setEliminando(false)
            }
        }
    }

    return (
        <div className="max-w-screen-sm mx-auto">

            <div className='flex justify-between items-center mb-4'>
                <h1 className='text-2xl text-white'>Editar usuario</h1>
                <button
                    className='bg-red-500 py-2 px-4 rounded text-white'
                    onClick={() => router.back()}
                >
                    Cerrar ventana
                </button>
            </div>

            <form onSubmit={handleSubmit} className='dark:bg-zinc-900 p-6 rounded-lg '>
                <div className="mb-4">
                    <label className="block text-white mb-1">Nombre de usuario</label>
                    <input
                        type='text'
                        className='w-full p-2 rounded bg-zinc-900 border border-zinc-700 text-white'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    {errors.username && <p className='text-red-500'>{errors.username}</p>}
                </div>

                <div className="mb-4">
                    <label className="block text-white mb-1">Teléfono</label>
                    <input
                        type='number'
                        className='w-full p-2 rounded bg-zinc-900 border border-zinc-700 text-white'
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                    />
                    {errors.telefono && <p className='text-red-500'>{errors.telefono}</p>}
                </div>

                <div className="mb-4">
                    <label className="block text-white mb-1">Correo electrónico</label>
                    <input
                        type='email'
                        className='w-full p-2 rounded bg-zinc-900 border border-zinc-700 text-white'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-white mb-1">Contraseña <span className='text-zinc-500'>(Temporal)</span></label>
                    <input
                        type='text'
                        className='w-full p-2 rounded bg-zinc-900 border border-zinc-700 text-white'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-white mb-1">Rol</label>
                    <select
                        className='w-full p-2 rounded bg-zinc-900 border border-zinc-700 text-white'
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option value=''>Seleccione un rol</option>
                        {roles.map((r) => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                    {errors.role && <p className='text-red-500'>{errors.role}</p>}
                </div>

                <div className="mb-4">
                    <label className="block text-white mb-1">Estado</label>
                    <select
                        className='w-full p-2 rounded bg-zinc-900 border border-zinc-700 text-white'
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value=''>Seleccione un estado</option>
                        {statuses.map((s) => (
                            <option key={s} value={s}>
                                {s === 'active' ? 'Activo' : 'Inactivo'}
                            </option>
                        ))}
                    </select>
                    {errors.status && <p className='text-red-500'>{errors.status}</p>}
                </div>

                {/* ACTIONS */}
                <div>
                    {respuesta && <p className='text-red-500 mb-2'>{respuesta}</p>}
                    <button
                        type='submit'
                        className='bg-blue-500 py-2 px-4 rounded text-white w-full mb-2'
                        disabled={guardando}
                    >
                        {guardando ? 'Guardando...' : 'Actualizar usuario'}
                    </button>

                    <button
                        className='bg-red-500 py-2 px-4 rounded text-white w-full'
                        onClick={() => router.back()}
                    >
                        Cerrar ventana
                    </button>
                    <button
                        className='text-red-500 py-2 px-4 w-full mt-2 flex items-center justify-center'
                        onClick={() => handleDeleteUsuario()}
                        disabled={eliminando}
                    >
                        <Trash size={12} className='mr-1' />
                        {eliminando ? 'Eliminando...' : 'Eliminar usuario'}
                    </button>
                </div>

            </form>
        </div>
    )
}