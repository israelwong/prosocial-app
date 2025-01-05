'use client'
import React, { useState, useEffect } from 'react'
import { Cliente } from '@/app/admin/_lib/types'
import { obtenerCliente, actualizarCliente, eliminarCliente } from '@/app/admin/_lib/cliente.actions'
import { RefreshCw, Trash } from 'lucide-react'
import { obtenerCanales } from '@/app/admin/_lib/canal.actions'

interface Props {
    clienteId: string
}

function FormClienteEditar({ clienteId }: Props) {

    const [cliente, setCliente] = useState<Cliente | null>(null);
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [direccion, setDireccion] = useState('');
    const [estatus, setEstatus] = useState('prospecto');
    const [canal, setCanal] = useState('');
    const [fechaCreacion, setFechaCreacion] = useState('');
    const [fechaActualizacion, setFechaActualizacion] = useState('');
    const [respuestaServidor, setRespuestaServidor] = useState('');
    const [errorActualizacion, setErrorActualizacion] = useState('');

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
                    setEstatus(cliente.status ?? '');
                    setCanal(cliente.canalId ?? '');
                    setFechaCreacion(cliente.createdAt.toISOString());
                    setFechaActualizacion(cliente.updatedAt.toISOString());
                }
            })

        obtenerCanales().then((canales) => {
            const canal = canales.find(c => c.id === cliente?.canalId);
            setCanal(canal?.nombre ?? '');
        })

    }, [clienteId, cliente?.canalId]);

    const handleSubmit = async () => {

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
            status: estatus,
            canal
        };

        try {
            const response = await actualizarCliente(updatedCliente);
            if (response.success) {
                setRespuestaServidor('Información actualizada correctamente');
                setTimeout(() => {
                    setRespuestaServidor('');
                }, 3000);
            } else {
                const { error } = response;
                if (error && error.includes('telefono')) {
                    setErrorActualizacion('El teléfono que intentas actualizar está asignado a otro cliente');
                } else {
                    setErrorActualizacion(`Hubo un error al actualizar el cliente: ${error}`);
                }
            }
        } catch (error) {
            console.error('Error actualizando cliente:', error);
            alert('Hubo un error al actualizar el cliente');
        }

    };

    const handleReset = () => {
        if (!confirm('¿Estás seguro de restaurar los valores del cliente?'))
            return;

        if (cliente) {
            setNombre(cliente.nombre ?? '');
            setTelefono(cliente.telefono ?? '');
            setEmail(cliente.email ?? '');
            setDireccion(cliente.direccion ?? '');
            setEstatus(cliente.status ?? '');
            setCanal(cliente.canalId ?? '');
        }
    }

    const handleEliminarCliente = () => {
        if (!confirm('¿Estás seguro de eliminar este cliente?'))
            return;

        eliminarCliente(clienteId)
            .then(() => {
                window.location.href = '/admin/dashboard/contactos';
            })
            .catch((error) => {
                console.error('Error eliminando cliente:', error);
                alert('Hubo un error al eliminar el cliente');
            });
    }

    return (
        <div className="">

            <div className='flex justify-between items-center mb-3'>
                <h2 className=' text-xl text-zinc-500'>Datos generales</h2>
                <button onClick={handleReset} className="p-2">
                    <RefreshCw size={16} className='inline-block ml-2' />
                </button>
            </div>

            <div className='border border-zinc-700 rounded-lg shadow-md p-5'>

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
                    <label className="block text-zinc-700 mb-1 text-sm">Estatus</label>
                    <select
                        value={estatus}
                        onChange={(e) => setEstatus(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md"
                    >
                        <option value="prospecto">Prospecto</option>
                        <option value="cliente">Cliente</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-zinc-700 mb-1 text-sm">Canal de adquición</label>
                    <p className="block text-zinc-500 mb-1 text-sm bg-zinc-900 px-3 py-2 rounded-md border border-zinc-800">
                        {canal ? canal : 'No definido'}
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

                {errorActualizacion && <p className="bg-red-700/20 p-5 rounded-md text-red-500 text-sm mb-4">{errorActualizacion}</p>}

                <button
                    onClick={handleSubmit}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                >
                    Actualizar información
                </button>

                <button
                    onClick={() => handleEliminarCliente()}
                    className="w-full text-red-500 text-sm py-2 px-4 rounded-lg mt-4 items-center justify-center"
                >
                    <Trash size={12} className='inline-block mr-1' /> Eliminar cliente
                </button>
            </div>
        </div>
    )
}

export default FormClienteEditar