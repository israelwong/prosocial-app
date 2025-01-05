'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearCliente } from '@/app/admin/_lib/cliente.actions'
import { obtenerCanales } from '@/app/admin/_lib/canal.actions'
import { Canal } from '@/app/admin/_lib/types'
import Cookies from 'js-cookie'

export default function FormContactoNuevo() {

    const router = useRouter();
    const [nombreInteresado, setNombreInteresado] = useState('');
    const [telefono, setTelefono] = useState('');
    const [correo, setCorreo] = useState('');
    const [guardandoCliente, setGuardandoCliente] = useState(false);
    const [errors, setErrors] = useState({} as { nombreInteresado?: string, telefono?: string, fechaEvento?: string, tipoEvento?: string, nombreEvento?: string, correo?: string, canalId?: string });
    const [clienteIdExistente, setClienteIdExistente] = useState('');
    const [errorClienteExistente, setErrorClienteExistente] = useState('');
    const [canales, setCanales] = useState([] as Canal[]);
    const [user, setUser] = useState<{ id: string } | null>(null);
    const [canalId, setCanalId] = useState('');

    useEffect(() => {
        const fetchCanales = async () => {
            const result = await obtenerCanales();
            setCanales(result);
        }
        fetchCanales();

        const userData = Cookies.get('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }

    }, [])

    const validar = () => {
        const newErrors = {} as { nombreInteresado?: string, telefono?: string, fechaEvento?: string, tipoEvento?: string, nombreEvento?: string, correo?: string, canalId?: string };

        if (!nombreInteresado) {
            newErrors.nombreInteresado = 'El nombre es requerido';
        }

        if (!telefono) {
            newErrors.telefono = 'El teléfono es requerido';
        } else if (!/^\d{10}$/.test(telefono)) {
            newErrors.telefono = 'El teléfono debe tener 10 dígitos';
        }

        if (!correo) {
            newErrors.correo = 'El correo es requerido';
        }

        if (!canalId) {
            newErrors.canalId = 'El canal de adquisición es requerido';
        }

        return newErrors;
    }

    const handleSubmit = async () => {

        const newErrors = validar();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
        const formData = {
            nombre: capitalize(nombreInteresado),
            telefono: telefono,
            email: correo,
            status: 'prospecto',
            userId: user ? user.id : '',
            canalId: canalId,
            etapa: 'nuevo' // or any default value for etapa

        };
        setGuardandoCliente(true)
        const result = await crearCliente(formData);
        // console.log(result.message);

        if (!result.success) {
            setErrorClienteExistente(result.message || '');
            setClienteIdExistente(result.clienteId || '');
            setGuardandoCliente(false);
            return;
        } else {
            router.push(`/admin/dashboard/eventos/nuevo?clienteId=${result.clienteId}`);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-5 text-zinc-400">
                Nuevo contacto
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
                        <label className="block mb-1 text-sm text-zinc-500">Correo:</label>
                        <input
                            type="email"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            className="w-full bg-zinc-900 p-2 border border-zinc-800 rounded-md"
                        />
                        {errors.correo && <span className="text-red-500">{errors.correo}</span>}
                    </div>

                    <div>
                        <label className="block mb-1 text-sm text-zinc-500">Canal de adquisición:</label>
                        <select
                            className="w-full bg-zinc-900 p-2 border border-zinc-800 rounded-md"
                            value={canalId}
                            onChange={(e) => { setCanalId(e.target.value) }}
                        >
                            <option value="">Selecciona un canal de adquisición</option>
                            {canales.map((canal) => (
                                <option key={canal.id} value={canal.id}>
                                    {canal.nombre}
                                </option>
                            ))}
                        </select>
                        {errors.canalId && <span className="text-red-500">{errors.canalId}</span>}
                    </div>
                </div>


                {errorClienteExistente && (
                    <div className="bg-red-500 text-white p-2 rounded-md text-center">
                        Este número está asociado a otro contacto. <a href={`/admin/dashboard/contactos/${clienteIdExistente}`} className="underline">revisar</a>
                    </div>
                )}

                <button
                    onClick={handleSubmit}
                    className={`font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full ${guardandoCliente ? 'bg-zinc-800 text-zinc-500' : 'bg-blue-500 text-white'}`}
                    disabled={guardandoCliente}
                >
                    {guardandoCliente ? 'Guardando contacto...' : 'Registrar contacto'}
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