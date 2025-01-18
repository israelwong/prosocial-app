'use client'
import React, { useState, useEffect } from 'react'
import { obtenerTiposEvento } from '@/app/admin/_lib/eventoTipo.actions'
import { EventoTipo } from '@/app/admin/_lib/types'
import { validarDisponibilidadFecha } from '@/app/admin/_lib/evento.actions'
import { CircleCheck, CalendarX } from 'lucide-react'
import { LeadForm as LeadFormType } from '@/app/admin/_lib/types'
import { registrarLead } from '@/app/admin/_lib/LeadForm'

export default function LeadForm() {
    const [tiposEvento, setTiposEvento] = useState<EventoTipo[]>([]);
    const [nombreInteresado, setNombreInteresado] = useState('');
    const [nombreEvento, setNombreEvento] = useState('');
    const [correoElectronico, setCorreoElectronico] = useState('');
    const [telefonoContacto, setTelefonoContacto] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [selectedTipoEvento, setSelectedTipoEvento] = useState<EventoTipo>();
    const [labelEvento, setLabelEvento] = useState('');

    const [fechaEvento, setFechaEvento] = useState<Date | null>(null)
    const [fechaDisponible, setFechaDisponible] = useState(false);

    const [solicitando, setSolicitando] = useState(false);
    const [respuesta, setRespuesta] = useState(false);
    const [telefonoExistente, setTelefonoExistente] = useState(false);
    const [correoExistente, setCorreoExistente] = useState(false);
    const [clienteExistente, setClienteExistente] = useState(false);

    useEffect(() => {
        obtenerTiposEvento().then((data) => {
            setTiposEvento(data);
        });
    }, []);


    useEffect(() => {
        if (selectedTipoEvento) {
            const nombre = selectedTipoEvento?.nombre || '';
            if (nombre.toLowerCase().includes('xv años')) {
                setLabelEvento('Ingresa el nombre de la festejada');
            } else if (nombre.toLowerCase().includes('boda')) {
                setLabelEvento('Ingresa el nombre de los novios');
            } else if (nombre.toLowerCase().includes('empresa')) {
                setLabelEvento('Ingresa el nombre de la empresa');
            } else if (nombre.toLowerCase().includes('bautizo')) {
                setLabelEvento('Ingresa el nombre de el/la festejado/a');
            } else if (nombre.toLowerCase().includes('aniversario')) {
                setLabelEvento('Ingresa el nombre de los festejados');
            } else if (nombre.toLowerCase().includes('cumpleaños')) {
                setLabelEvento('Ingresa el nombre de el/la festejado/a');
            } else {
                setLabelEvento('');
            }
        }
    }, [selectedTipoEvento]);

    const validarFecha = (fecha: Date) => {
        const fechaSinHora = new Date(fecha.toISOString()); // Solo la parte de la fecha
        setFechaEvento(fechaSinHora)
        validarDisponibilidadFecha(fechaSinHora).then(disponible => {
            if (!disponible) {
                setFechaDisponible(true)
            } else {
                setFechaDisponible(false)
                setSelectedTipoEvento(undefined)
            }
        })
    }

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!fechaEvento) newErrors.fechaEvento = 'Fecha del evento es requerida';
        if (!selectedTipoEvento) newErrors.tipoEvento = 'Tipo de evento es requerido';
        if (!nombreInteresado) newErrors.nombreInteresado = 'Nombre del interesado es requerido';
        if (!nombreEvento) newErrors.nombreEvento = 'El campos es requerido';
        // if (!correoElectronico) newErrors.correoElectronico = 'Correo electrónico es requerido';
        if (!telefonoContacto || telefonoContacto.length < 10) newErrors.telefonoContacto = 'Teléfono de contacto es requerido y debe tener al menos 10 dígitos';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {

            try {

                const newLead: LeadFormType = {
                    nombre: nombreInteresado.charAt(0).toUpperCase() + nombreInteresado.slice(1),
                    email: correoElectronico.toLocaleLowerCase(),
                    telefono: telefonoContacto,
                    fecha_evento: fechaEvento || new Date(),
                    eventoTipoId: selectedTipoEvento?.id || '',
                    nombreEvento: nombreEvento.charAt(0).toUpperCase() + nombreEvento.slice(1),
                }

                setSolicitando(true)

                registrarLead(newLead).then((response) => {

                    console.log('Respuesta del servidor:', response)

                    if (response.success) {
                        setRespuesta(true)
                    } else if (response.message === 'El cliente ya existe') {
                        setRespuesta(false)
                        setClienteExistente(true)
                        setTelefonoExistente(false)
                        setCorreoExistente(false)
                    } else if (response.message === 'El teléfono ya existe') {
                        setRespuesta(false)
                        setTelefonoExistente(true)
                    } else if (response.message === 'El email ya existe') {
                        setRespuesta(false)
                        setCorreoExistente(true)
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

                    <p
                        className="
                            md:text-center 
                            text-left
                            md:text-6xl 
                            text-3xl
                            font-Bebas-Neue
                            text-gray-500
                            md:px-8
                            mb-5
                            ">
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
                            value={fechaEvento ? fechaEvento.toISOString().split("T")[0] : ''} // Convierte al formato requerido
                            onChange={e => validarFecha(new Date(e.target.value))}
                            className="bg-zinc-900 border border-zinc-800 rounded w-full text-lg py-3 px-3 text-zinc-300"
                            min={new Date().toISOString().split("T")[0]} // Deshabilita días anteriores a hoy
                        />
                        {fechaEvento && (
                            !fechaDisponible ? (
                                <div className="text-white flex items-center justify-center p-3 bg-red-600 rounded-md mt-5">
                                    <span>
                                        <CalendarX size={20} className='mr-1' />
                                    </span>
                                    <p>
                                        Fecha no disponible para reservar
                                    </p>
                                </div>
                            ) : (
                                fechaDisponible && <p className="text-green-100 flex items-center justify-center mt-5 p-3 bg-green-800 rounded-md border border-green-700">
                                    <span className='mr-1'>
                                        <CircleCheck size={20} />
                                    </span>
                                    Fecha disponible para reservar
                                </p>
                            )
                        )}
                    </div>


                    {fechaDisponible && (
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
                            {errors.tipoEvento && <p className="text-red-500 text-xs mt-1">{errors.tipoEvento}</p>}
                        </div>
                    )}

                    {selectedTipoEvento && (
                        <div className='mb-5'>
                            <input
                                id="nombre-evento"
                                type="text"
                                className="w-full border bg-zinc-900 py-3 px-3 rounded text-lg border-yellow-600 placeholder-zinc-600"
                                placeholder={labelEvento}
                                value={nombreEvento}
                                onChange={(e) => setNombreEvento(e.target.value)}
                            />
                            {errors.nombreEvento && <p className="text-red-500 text-xs mt-1">{errors.nombreEvento}</p>}
                        </div>
                    )}

                    {fechaDisponible && (
                        <>
                            <div className='bg-zinc-900 p-5 rounded-md mb-5 border border-dashed border-zinc-800'>

                                <label htmlFor="nombre-interesado" className="block text-zinc-300 text-lg font-bold mb-5">
                                    Datos de contacto
                                </label>

                                <div className='mb-5'>
                                    <label className='text-sm text-zinc-200 leading-3'>
                                        Nombre del interesado
                                    </label>
                                    <input
                                        id="nombre-interesado"
                                        type="text"
                                        className="w-full border bg-zinc-900 border-zinc-800 py-2 px-3 rounded placeholder-zinc-700"
                                        placeholder='Ingresa tu nombre'
                                        value={nombreInteresado}
                                        onChange={(e) => setNombreInteresado(e.target.value)}
                                    />
                                    {errors.nombreInteresado && <p className="text-red-500 text-xs mt-1">{errors.nombreInteresado}</p>}
                                </div>


                                <div className='mb-5'>
                                    <label className='text-sm text-zinc-200 leading-3'>
                                        Correo electrónico <span className='text-zinc-500'>(opcional)</span>
                                    </label>
                                    <input
                                        id="correo-electronico"
                                        type="email"
                                        className="w-full border bg-zinc-900 border-zinc-800 py-2 px-3 rounded placeholder-zinc-700"
                                        placeholder="Correo electrónico"
                                        value={correoElectronico}
                                        onChange={(e) => setCorreoElectronico(e.target.value)}
                                    />
                                    {errors.correoElectronico && <p className="text-red-500 text-xs mt-1">{errors.correoElectronico}</p>}
                                </div>

                                <div className='mb-5'>
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
                                    {errors.telefonoContacto && <p className="text-red-500 text-xs mt-1">{errors.telefonoContacto}</p>}
                                </div>
                            </div>

                            {clienteExistente && (
                                <p className='text-red-500 text-sm mt-3'>
                                    Al parecer una persona con este correo y número de teléfono ya solicito información anteriormente
                                </p>
                            )}

                            {telefonoExistente && (
                                <p className='text-red-500 text-sm mt-3'>
                                    Al parecer una persona con este correo existe un registro con este número de teléfono
                                </p>
                            )}

                            {correoExistente && (
                                <p className='text-red-500 text-sm mt-3'>
                                    Ya existe un registro con este correo electrónico
                                </p>
                            )}

                            <button
                                type="submit"
                                className={`w-full text-white font-bold py-3 px-4 rounded ${solicitando ? 'bg-zinc-500' : 'bg-blue-500'}`}
                                disabled={solicitando}
                            >
                                {solicitando ? 'Solicitando...' : 'Solicitar más información'}
                            </button>


                        </>

                    )}

                </form>
            ) : (
                <div className='p-5'>
                    <div className='text-xl text-zinc-300'>
                        <p className='text-2xl mb-3'>
                            ¡Gracias {nombreInteresado}!
                        </p>
                    </div>
                    <p className='text-lg text-zinc-300'>
                        Te promotemos contactarte lo antes posible para coordinar la reunión virtual.
                    </p>
                </div>
            )}

        </div>
    )
}
