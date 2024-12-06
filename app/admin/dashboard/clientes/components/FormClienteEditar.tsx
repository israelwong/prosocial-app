'use client'
import React, { useState, useEffect } from 'react'
import { Cliente } from '@/app/admin/_lib/types'
import { obtenerCliente, actualizarCliente } from '@/app/admin/_lib/cliente.actions'
import { useRouter } from 'next/navigation'

interface Props {
    clienteId: string
}

function FormClienteEditar({ clienteId }: Props) {

    const router = useRouter();

    const [cliente, setCliente] = useState<Cliente | null>(null);
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [direccion, setDireccion] = useState('');
    const [etapa, setEtapa] = useState('prospecto');
    const [estatus, setEstatus] = useState('activo');
    const [canal, setCanal] = useState('');
    const [fechaCreacion, setFechaCreacion] = useState('');
    const [fechaActualizacion, setFechaActualizacion] = useState('');
    const [respuestaServidor, setRespuestaServidor] = useState('');

    const [errors, setErrors] = useState<{ nombre?: string; telefono?: string }>({});

    useEffect(() => {
        obtenerCliente(clienteId)
            .then((cliente) => {
                setCliente(cliente);
                if (cliente) {
                    setNombre(cliente.nombre ?? '');
                    setTelefono(cliente.telefono ?? '');
                    setEmail(cliente.email ?? '');
                    setDireccion(cliente.direccion ?? '');
                    setEtapa(cliente.etapa ?? '');
                    setEstatus(cliente.status ?? '');
                    setCanal(cliente.canalId ?? '');
                    setFechaCreacion(cliente.createdAt.toISOString());
                    setFechaActualizacion(cliente.updatedAt.toISOString());
                }
            })
    }, [clienteId]);

    const handleSubmit = () => {

        if (!nombre) {
            setErrors({ nombre: 'El nombre es requerido' });
            return;
        }

        if (!telefono) {
            setErrors({ telefono: 'El teléfono es requerido' });
            return;
        }

        const updatedCliente = {
            ...cliente,
            nombre,
            telefono,
            email,
            direccion,
            etapa,
            canal
        };
        actualizarCliente(updatedCliente)
            .then(() => {
                setRespuestaServidor('Información actualizada correctamente');
                setTimeout(() => {
                    setRespuestaServidor('');
                }, 3000);
            })
            .catch((error) => {
                console.error('Error actualizando cliente:', error);
                alert('Hubo un error al actualizar el cliente');
            });
    };

    const handleReset = () => {
        if (!confirm('¿Estás seguro de restaurar los valores del cliente?'))
            return;

        if (cliente) {
            setNombre(cliente.nombre ?? '');
            setTelefono(cliente.telefono ?? '');
            setEmail(cliente.email ?? '');
            setDireccion(cliente.direccion ?? '');
            setEtapa(cliente.etapa ?? '');
            setEstatus(cliente.status ?? '');
            setCanal(cliente.canalId ?? '');
        }
    }

    return (
        <div className="max-w-md mx-auto p-5 border border-zinc-800 rounded-lg shadow-md">

            <div>
                <div className="mb-4">
                    <label className="block text-zinc-700 mb-1 text-sm">Nombre</label>
                    <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md"
                    />
                    {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
                </div>
                <div className="mb-4">
                    <label className="block text-zinc-700 mb-1 text-sm">Teléfono</label>
                    <input
                        type="text"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md"
                    />
                    {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
                </div>
                <div className="mb-4">
                    <label className="block text-zinc-700 mb-1 text-sm">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-zinc-700 mb-1 text-sm">Dirección</label>
                    <textarea
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-zinc-700 mb-1 text-sm">Etapa</label>
                    <select
                        value={etapa}
                        onChange={(e) => setEtapa(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md"
                    >
                        <option value="prospecto">Prospecto</option>
                        <option value="cliente">Cliente</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-zinc-700 mb-1 text-sm">Estatus</label>
                    <select
                        value={estatus}
                        onChange={(e) => setEstatus(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md"
                    >
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                    </select>
                </div>
                <div className="mb-4">
                    <p className="block text-zinc-700 mb-1 text-sm">
                        Canal de adquición: {canal ? canal : 'No definido'}
                    </p>

                </div>

                {/* fechas de creación y acrualización */}
                <div className='grid grid-cols-2 mb-5'>
                    <div className="mb-4">
                        <p className="block text-zinc-700 mb-1 text-sm">
                            Creación:
                        </p>
                        <p className='text-sm text-zinc-500'>

                            {new Date(fechaCreacion).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="mb-4">
                        <p className="block text-zinc-700 mb-1 text-sm">
                            Actualización:
                        </p>
                        <p className='text-sm text-zinc-500'>
                            {new Date(fechaActualizacion).toLocaleDateString()}
                        </p>

                    </div>
                </div>


                {respuestaServidor &&
                    <p className="bg-green-700/20 p-5 rounded-md text-green-500 text-sm mb-4">{respuestaServidor}
                    </p>}

                <button
                    onClick={handleSubmit}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                >
                    Actualizar
                </button>

                <button
                    type="button"
                    onClick={handleReset}
                    className="w-full bg-yellow-700 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 mt-4"
                >
                    Restaurar valores
                </button>

                <button
                    type="button"
                    onClick={() => router.back()}
                    className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 mt-4"
                >
                    Cerrar ventana
                </button>
            </div>
        </div>
    )
}

export default FormClienteEditar