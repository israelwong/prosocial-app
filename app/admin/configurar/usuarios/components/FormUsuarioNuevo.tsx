'use client'

import React, { useState } from 'react'
import { User } from '@/app/admin/_lib/types'
import { useRouter } from 'next/navigation'
import { crearUsuario } from '@/app/admin/_lib/User.actions'

export default function FormUsuarioNuevo() {

    const router = useRouter()
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('')
    const [telefono, setTelefono] = useState('')
    const [errors, setErrors] = useState({ username: '', email: '', password: '', role: '', telefono: '' })
    const [respuesta, setRespuesta] = useState('')
    const [guardando, setGuardando] = useState(false)

    const roles = ['admin', 'empleado', 'proveedor', 'cliente']

    const validate = () => {
        let valid = true
        // let errors = { username: '', email: '', password: '', role: '', telefono: '' }

        if (!username) {
            errors.username = 'El nombre de usuario es obligatorio'
            valid = false
        }
        // Eliminamos la validación de obligatoriedad del correo electrónico
        if (!password) {
            errors.password = 'La contraseña es obligatoria'
            valid = false
        }
        if (!role) {
            errors.role = 'El rol es obligatorio'
            valid = false
        }
        if (!telefono) {
            errors.telefono = 'El teléfono es obligatorio'
            valid = false
        } else if (!/^\d{10}$/.test(telefono)) {
            errors.telefono = 'El teléfono debe tener 10 dígitos'
            valid = false
        }

        setErrors(errors)
        return valid
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (validate()) {
            // Lógica para crear usuario
            const nuevoUsuario: User = {
                username: username || '',
                email: email || '',
                password: password || '',
                role: role || '',
                telefono: telefono || '',
                status: 'active'
            }

            setGuardando(true)
            const response = await crearUsuario(nuevoUsuario)
            if (response.success) {
                router.push('/admin/configurar/usuarios')
            } else {
                setRespuesta(response.message)
                setGuardando(false)
            }
        }
    }

    return (
        <div className="max-w-screen-sm mx-auto">

            <div className='flex justify-between items-center mb-4'>
                <h1 className='text-2xl text-white'>Registrar usuario</h1>
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
                        type='text'
                        className='w-full p-2 rounded bg-zinc-900 border border-zinc-700 text-white'
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                    />
                    {errors.telefono && <p className='text-red-500'>{errors.telefono}</p>}
                </div>
                <div className="mb-4">
                    <label className="block text-white mb-1">Correo electrónico <span className='text-zinc-500'>(Opcional)</span></label>
                    <input
                        type='email'
                        className='w-full p-2 rounded bg-zinc-900 border border-zinc-700 text-white'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email && <p className='text-red-500'>{errors.email}</p>}
                </div>
                <div className="mb-4">
                    <label className="block text-white mb-1">Contraseña <span className='text-zinc-500'>(Temporal)</span></label>
                    <input
                        type='text'
                        className='w-full p-2 rounded bg-zinc-900 border border-zinc-700 text-white'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {errors.password && <p className='text-red-500'>{errors.password}</p>}
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

                {/* ACTIONS */}
                <div>
                    {respuesta && <p className='text-red-500 mb-2'>{respuesta}</p>}
                    <button
                        type='submit'
                        className='bg-blue-500 py-2 px-4 rounded text-white w-full mb-2'
                        disabled={guardando}
                    >
                        {guardando ? 'Guardando...' : 'Registrar nuevo usuario'}
                    </button>

                    <button
                        className='bg-red-500 py-2 px-4 rounded text-white w-full'
                        onClick={() => router.back()}
                    >
                        Cerrar ventana
                    </button>
                </div>

            </form>
        </div>
    )
}