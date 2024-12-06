'use client'
import React, { useState, useEffect } from 'react'
import { EventoTipo } from '@/app/admin/_lib/types'
import { useRouter } from 'next/navigation'
import { obtenerTiposEvento } from '@/app/admin/_lib/eventoTipo.actions'
import { crearCliente } from '@/app/admin/_lib/cliente.actions'

export default function ProspectoNuevo() {
    const router = useRouter();
    const [tiposEvento, setTiposEvento] = useState([] as EventoTipo[]);
    const [nombreInteresado, setNombreInteresado] = useState('');
    const [telefono, setTelefono] = useState('');
    const [correo, setCorreo] = useState('');
    const [tipoEvento, setTipoEvento] = useState('');
    const [fechaCelebracion, setFechaCelebracion] = useState('');
    const [nombreEvento, setNombreEvento] = useState('');

    const [errors, setErrors] = useState({} as { nombreInteresado?: string, telefono?: string, fechaCelebracion?: string, tipoEvento?: string, nombreEvento?: string });

    const [clienteIdExistente, setClienteIdExistente] = useState('');

    useEffect(() => {
        async function fetchTiposEvento() {
            const tipos = await obtenerTiposEvento();
            setTiposEvento(tipos);
        }
        fetchTiposEvento();
    }, []);

    const validar = () => {
        const newErrors = {} as { nombreInteresado?: string, telefono?: string, fechaCelebracion?: string, tipoEvento?: string, nombreEvento?: string };

        if (!nombreInteresado) {
            newErrors.nombreInteresado = 'El nombre es requerido';
        }

        if (!telefono) {
            newErrors.telefono = 'El teléfono es requerido';
        } else if (!/^\d{10}$/.test(telefono)) {
            newErrors.telefono = 'El teléfono debe tener 10 dígitos';
        }

        if (!fechaCelebracion) {
            newErrors.fechaCelebracion = 'La fecha de celebración es requerida';
        }

        if (!tipoEvento) {
            newErrors.tipoEvento = 'El tipo de evento es requerido';
        }

        if (!nombreEvento) {
            newErrors.nombreEvento = 'El nombre del evento es requerido';
        }

        return newErrors;
    }

    const handleSubmit = async () => {

        const newErrors = validar();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const formData = {
            nombre: nombreInteresado,
            telefono,
            email: correo,
            etapa: 'prospecto',
            eventoTipoId: tipoEvento,
            fechaCelebracion: new Date(fechaCelebracion),
            nombreEvento: nombreEvento
        };
        const result = await crearCliente(formData);

        if (!result.success) {
            setClienteIdExistente(result.clienteId || '');
            return;
        } else {
            router.push(`/admin/dashboard/prospectos/${result.clienteId}`);
        }

    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-5 text-zinc-400">
                Prospecto nuevo
            </h1>
            <div className="space-y-4">
                <div className='p-5 rounded-md border border-zinc-800 space-y-4'>
                    <div>
                        <label className="block mb-1 text-sm text-zinc-500">
                            Nombre del interesado:
                        </label>
                        <input
                            type="text"
                            value={nombreInteresado}
                            onChange={(e) => setNombreInteresado(e.target.value)}
                            className="w-full bg-zinc-900 p-2 border border-zinc-800 rounded-md"
                        />
                        {errors.nombreInteresado && <span className="text-red-500">{errors.nombreInteresado}</span>}
                    </div>
                    <div>
                        <label className="block mb-1 text-sm text-zinc-500">Teléfono:</label>
                        <input
                            type="number"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                            className="w-full bg-zinc-900 p-2 border border-zinc-800 rounded-md"
                        />
                        {errors.telefono && <span className="text-red-500">{errors.telefono}</span>}
                    </div>
                    <div>
                        <label className="block mb-1 text-sm text-zinc-500">Correo (opcional):</label>
                        <input
                            type="email"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            className="w-full bg-zinc-900 p-2 border border-zinc-800 rounded-md"
                        />
                    </div>
                </div>

                <div className='p-5 rounded-md border border-zinc-800 space-y-4'>
                    <div>
                        <label className="block mb-1 text-sm text-zinc-500">Fecha de celebración:</label>
                        <input
                            type="date"
                            value={fechaCelebracion}
                            onChange={(e) => setFechaCelebracion(e.target.value)}
                            className="w-full bg-zinc-900 p-2 border border-zinc-800 rounded-md"
                            onFocus={(e) => e.target.showPicker()}
                        />
                        {errors.fechaCelebracion && <span className="text-red-500">{errors.fechaCelebracion}</span>}
                    </div>
                    <div>
                        <label className="block mb-1 text-sm text-zinc-500">Tipo de evento:</label>
                        <select
                            value={tipoEvento}
                            onChange={(e) => setTipoEvento(e.target.value)}
                            className="w-full bg-zinc-900 p-3 border border-zinc-800 rounded-md"
                        >
                            <option value="">Seleccione un tipo de evento</option>
                            {tiposEvento.map((tipo) => (
                                <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                            ))}
                        </select>
                        {errors.tipoEvento && <span className="text-red-500">{errors.tipoEvento}</span>}
                    </div>
                    <div>
                        <label className="block mb-1 text-sm text-zinc-500">Nombre del evento:</label>
                        <input
                            type="text"
                            value={nombreEvento}
                            onChange={(e) => setNombreEvento(e.target.value)}
                            className="w-full bg-zinc-900 p-2 border border-zinc-800 rounded-md"
                        />
                        {errors.nombreEvento && <span className="text-red-500">{errors.nombreEvento}</span>}
                    </div>
                </div>


                {clienteIdExistente && (
                    <div className="bg-red-500 text-white p-2 rounded-md">
                        El teléfono ya existe. <a href={`/admin/dashboard/clientes/${clienteIdExistente}`} className="underline">Ver cliente</a>
                    </div>
                )}

                <button
                    onClick={handleSubmit}
                    className="w-full bg-blue-500 text-white p-2 mt-4 rounded-md"
                >
                    Crear prospecto
                </button>

                <button
                    type="button"
                    className="w-full bg-zinc-800 text-white p-2 mt-4 rounded-md"
                    onClick={() => router.back()}
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
}