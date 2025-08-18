'use client'
import React, { useState, useEffect } from 'react'
import { obtenerTiposEvento } from '@/app/admin/_lib/eventoTipo.actions'
import { EventoTipo } from '@/app/admin/_lib/types'
import { LeadForm as LeadFormType } from '@/app/admin/_lib/types'
import { registrarLead } from '@/app/admin/_lib/LeadForm'

export default function LeadForm() {

    const [tiposEvento, setTiposEvento] = useState<EventoTipo[]>([]);
    const [fechaEvento, setFechaEvento] = useState<Date | null>(null)
    const [nombreInteresado, setNombreInteresado] = useState('');
    const [telefonoContacto, setTelefonoContacto] = useState('');
    const [selectedTipoEvento, setSelectedTipoEvento] = useState<EventoTipo>();
    const [solicitando, setSolicitando] = useState(false);
    const [respuesta, setRespuesta] = useState(false);
    const [telefonoExistente, setTelefonoExistente] = useState(false);
    const [errores, setErrores] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        obtenerTiposEvento().then((data) => {
            setTiposEvento(data);
        });
    }, []);

    const validate = () => {
        let valid = true;
        const errors: { [key: string]: string } = {};

        if (!fechaEvento) {
            errors.fechaEvento = 'Fecha del evento es requerida';
            valid = false;
        }

        if (!nombreInteresado) {
            errors.nombreInteresado = 'Nombre del interesado es requerido';
            valid = false;
        }

        if (!telefonoContacto) {
            errors.telefonoContacto = 'Número de teléfono es requerido';
            valid = false;
        } else if (telefonoContacto.length < 10) {
            errors.telefonoContacto = 'Número de teléfono debe tener al menos 10 dígitos';
            valid = false;
        }

        if (!selectedTipoEvento) {
            errors.tipoEvento = 'Tipo de evento es requerido';
            valid = false;
        }

        setErrores(errors);
        return valid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validate()) {
            console.log('Enviando formulario...')

            try {
                const newLead: LeadFormType = {
                    nombre: nombreInteresado.charAt(0).toUpperCase() + nombreInteresado.slice(1),
                    telefono: telefonoContacto,
                    fecha_evento: fechaEvento || new Date(),
                    eventoTipoId: selectedTipoEvento?.id || '',
                }

                setSolicitando(true)
                registrarLead(newLead).then((response) => {
                    console.log('Respuesta del servidor:', response)
                    if (response.success) {
                        setRespuesta(true)
                    } else {
                        setRespuesta(false)
                        setTelefonoExistente(true)
                    }
                    setSolicitando(false)

                })
            } catch (error) {
                console.error('Error al registrar el lead:', error)
            }
        }
    };

    return (
        <div className='p-5'>
            {!respuesta ? (
                <form className="mx-auto" onSubmit={handleSubmit}>
                    <p className="md:text-center md:px-8 md:text-6xl text-left text-3xl font-Bebas-Neue text-gray-500 mb-5">
                        Sabemos que tu evento es único
                    </p>
                    <p className="font-light mb-5">
                        Nos encantaría agendar una <span className='text-yellow-600 font-semibold'>reunión virtual</span> para conocer los detalles de tu evento y entregarte un presupuesto a la medida.
                    </p>
                    <div className="mb-4">
                        <label className="block text-zinc-600 text-sm mb-2" htmlFor="fechaevento">
                            ¿En que fecha celebrarás tu evento?
                        </label>
                        <input
                            type="date"
                            id="fechaevento"
                            name="fechaevento"
                            value={fechaEvento ? fechaEvento.toISOString().split("T")[0] : ''}
                            onChange={e => setFechaEvento(new Date(e.target.value))}
                            className="bg-zinc-900 border border-zinc-800 rounded w-full text-lg py-3 px-3 text-zinc-300"
                            min={new Date().toISOString().split("T")[0]}
                        />
                        {errores.fechaEvento && <p className="text-red-500 text-xs mt-1">{errores.fechaEvento}</p>}
                    </div>

                    <div className='mb-5'>
                        <label htmlFor="tipo-evento" className="block text-zinc-500 text-sm font-bold mb-2">
                            ¿Qué tipo de evento celebrarás?
                        </label>
                        <select
                            id="tipo-evento"
                            className="w-full border bg-zinc-900 border-zinc-800 py-4 px-3 rounded "
                            onChange={(e) => {
                                const value = tiposEvento.find(tipo => tipo.id === e.target.value);
                                setSelectedTipoEvento(value || undefined);
                            }}
                        >
                            <option value="">Tipo de evento</option>
                            {tiposEvento
                                .filter((tipo) => tipo.nombre.toLowerCase() !== 'otro')
                                .map((tipo) => (
                                    <option key={tipo.id} value={tipo.id}>
                                        {tipo.nombre}
                                    </option>
                                ))}
                        </select>
                        {errores.tipoEvento && <p className="text-red-500 text-xs mt-1">{errores.tipoEvento}</p>}
                    </div>

                    <div className='bg-zinc-900 p-5 rounded-md mb-5 border border-dashed border-zinc-800'>
                        <label htmlFor="nombre-interesado" className="block text-zinc-300 text-lg font-bold mb-5">
                            Datos del interesado
                        </label>
                        <div className='mb-5'>
                            <label className='text-sm text-zinc-200 leading-3'>
                                Nombre y apellido
                            </label>
                            <input
                                id="nombre-interesado"
                                type="text"
                                className="w-full border bg-zinc-900 border-zinc-800 py-2 px-3 rounded placeholder-zinc-700"
                                placeholder='Ingresa tu nombre'
                                value={nombreInteresado}
                                onChange={(e) => setNombreInteresado(e.target.value)}
                            />
                            {errores.nombreInteresado && <p className="text-red-500 text-xs mt-1">{errores.nombreInteresado}</p>}
                        </div>
                        <div className=''>
                            <label className='text-sm text-zinc-200 leading-3'>
                                Número de whatsapp
                            </label>
                            <input
                                id="telefono-contacto"
                                type="tel"
                                className="w-full border bg-zinc-900 border-zinc-800 py-2 px-3 rounded placeholder-zinc-700"
                                value={telefonoContacto}
                                placeholder="Número a 10 digiros"
                                onChange={(e) => setTelefonoContacto(e.target.value)}
                            />
                            {errores.telefonoContacto && <p className="text-red-500 text-xs mt-1">{errores.telefonoContacto}</p>}
                        </div>
                    </div>

                    {telefonoExistente && (
                        <>
                            <p className='text-red-100 text-sm my-5 p-3 bg-red-800 rounded'>
                                Una persona con este número telefonico ya ha solicitado información previamente.
                            </p>
                        </>
                    )}

                    <button
                        type="submit"
                        className={`w-full text-white font-bold py-3 px-4 rounded ${solicitando ? 'bg-zinc-500' : 'bg-blue-500'}`}
                        disabled={solicitando}
                    >
                        {solicitando ? 'Enviando solicitud de información...' : 'Solicitar más información'}
                    </button>
                </form>
            ) : (
                <div className='p-5'>
                    <div className='text-xl text-zinc-300'>
                        <p className='text-3xl mb-3'>
                            ¡Gracias {nombreInteresado}!
                        </p>
                    </div>

                    <div className='text-lg text-zinc-300'>
                        <p className='mb-5'>
                            Te prometemos contactarte lo antes posible para coordinar una reunión virtual.
                        </p>

                        <p>
                            Nos saludamos pronto 👋
                        </p>

                    </div>
                </div>
            )}
        </div>
    )
}