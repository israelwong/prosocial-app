'use client'
import React, { useEffect, useState, useCallback } from 'react'
import { Cliente, Evento, Paquete } from '@/app/admin/_lib/types'
import { actualizarEvento, obtenerEventoPorId, eliminarEvento } from '@/app/admin/_lib/evento.actions'
import { obtenerTiposEvento } from '@/app/admin/_lib/eventoTipo.actions'
import { obtenerCliente } from '@/app/admin/_lib/cliente.actions'
import { obtenerCanales } from '@/app/admin/_lib/canal.actions'
import { useRouter } from 'next/navigation'
import ListaCotizaciones from '../../cotizaciones/components/ListaCotizaciones'
import { obtenerPaquetesPorTipoEvento } from '@/app/admin/_lib/paquete.actions'
import { Shuffle, Pencil, Trash2 } from 'lucide-react'
import FichaBitacora from './FichaBitacora'

interface Props {
    eventoId: string
}

export default function FormEventoEditar({ eventoId }: Props) {

    const [evento, setEvento] = useState<Evento>()
    const [cliente, setCliente] = useState<Cliente>()

    const [tipificacionStatus, setTipificacionStatus] = useState<string[]>([])

    //! variables del evento
    const [nombre, setNombre] = useState<string>('')
    const [eventoTipoId, setEventoTipoId] = useState<string | null>(null)
    const [tipoEvento, setTipoEvento] = useState<string | undefined>(undefined)
    const [status, setStatus] = useState<string | undefined>(undefined)
    const [fechaEvento, setFechaEvento] = useState<Date | null>(null)
    const [clienteId, setClienteId] = useState<string | undefined>(undefined)
    const [fechaCreacion, setFechaCreacion] = useState<Date | null>(null)
    const [fechaActualizacion, setFechaActualizacion] = useState<Date | null>(null)
    const [error, setError] = useState('')
    const router = useRouter()
    const [actualizandoEvento, setActualizandoEvento] = useState(false)
    const [respuestaServidor, setRespuestaServidor] = useState('')
    const [generandoCotizacion, setGenerandoCotizacion] = useState(false)
    const [errorEliminar, setErrorEliminar] = useState('')

    //! paquetes
    const [paquetes, setPaquetes] = useState<Paquete[]>([])

    useEffect(() => {
        const fetchData = async () => {
            try {

                //obtener tipos de evento
                const eventosTipoPromise = await obtenerTiposEvento();

                //obtener datos del evento
                const eventoPromise = await obtenerEventoPorId(eventoId);

                if (eventoPromise) {
                    setEvento(eventoPromise);
                    setNombre(eventoPromise.nombre ?? '');
                    setEventoTipoId(eventoPromise.eventoTipoId);
                    setStatus(eventoPromise.status);
                    setFechaEvento(new Date(eventoPromise.fecha_evento));
                    setClienteId(eventoPromise.clienteId);
                    setFechaCreacion(new Date(eventoPromise.createdAt));
                    setFechaActualizacion(new Date(eventoPromise.updatedAt));

                    if (eventoPromise.eventoTipoId) {
                        const tipoEvento = eventosTipoPromise.find(tipo => tipo.id === eventoPromise.eventoTipoId);
                        if (tipoEvento) {
                            setTipoEvento(tipoEvento.nombre);
                        }

                        const paquetes = await obtenerPaquetesPorTipoEvento(eventoPromise.eventoTipoId);
                        if (paquetes) {
                            setPaquetes(paquetes);
                        }
                    }

                    const cliente = await obtenerCliente(eventoPromise.clienteId);
                    if (cliente) {
                        setCliente(cliente);

                        const canales = await obtenerCanales();
                        const canal = canales.find(canal => canal.id === cliente.canalId);
                        if (canal) {
                            setCliente({ ...cliente, canalNombre: canal.nombre });
                        }
                    }
                }


            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Error fetching data');
            }
        };
        fetchData();

        const tipificacionStatusOptions = [
            'nuevo',
            'seguimiento',
            'aprobado',
            'entregado',
            'cancelado'
        ];
        setTipificacionStatus(tipificacionStatusOptions);

    }, [eventoId]);

    const handleSubmit = async () => {

        setError('')
        const response = await actualizarEvento(
            {
                id: eventoId,
                clienteId: clienteId || '',
                eventoTipoId,
                nombre,
                status: status,
                fecha_evento: fechaEvento ?? new Date()
            }
        )
        if (response) {
            setRespuestaServidor('Información actualizada correctamente')
            setTimeout(() => {
                setRespuestaServidor('')
            }, 3000);
        }
        setActualizandoEvento(false)
    }

    const handleNuevaCotizacion = useCallback((paqueteId: string) => {
        setGenerandoCotizacion(true)
        router.push(`/admin/dashboard/cotizaciones/nueva?eventoId=${evento?.id}&eventoTipoId=${evento?.eventoTipoId}&&paqueteId=${paqueteId}`)
    }, [evento?.id, evento?.eventoTipoId, router])

    const handleEliminarEvento = async () => {
        if (confirm('¿Estás seguro de eliminar este evento?')) {
            const response = await eliminarEvento(eventoId)

            if (response.success) {
                router.push('/admin/dashboard/eventos')
            } else {
                setErrorEliminar('No se puede eliminar este evento, primero debes eliminar las cotizaciones asociadas.')
            }
        }
    }

    return (
        <div className="">

            {/* //! HEADER */}
            <div className='flex flex-col md:flex-row justify-between items-center mb-5'>
                <h2 className="text-2xl font-bold mb-4">Detalles del evento</h2>

                <div className="flex flex-col md:flex-row items-start space-y-2 md:space-y-0 md:space-x-2">

                    {status === 'aprobado' && (
                        <button
                            className='bg-blue-500  text-white font-bold py-2 px-4 rounded flex items-center'
                            onClick={() => router.push(`/admin/dashboard/seguimiento/${eventoId}`)}
                        >
                            <Shuffle size={15} className='mr-2' /> Gestionar
                        </button>
                    )}

                    <button
                        onClick={() => router.push('/admin/dashboard/eventos')}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Cerrar ventana
                    </button>
                </div>

            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            {/* //! FICHA CLIENTE */}
            <div className='max-w-full mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5'>

                <div className=''>

                    <div className='font-bold mb-5 text-xl text-zinc-500'>
                        Ficha cliente
                    </div>

                    <div className='border border-zinc-800 rounded-md p-5'>
                        <div className='mb-3 text-xl flex items-center justify-between'>

                            <button className='flex items-center'
                                onClick={() => cliente && router.push(`/admin/dashboard/contactos/${cliente.id}`)}
                            >
                                <Pencil size={15} className='mr-2' />
                                {cliente?.nombre}
                            </button>
                            <span className='leading-3 px-2 py-1 bg-zinc-700 rounded-md uppercase text-[10px] text-white'>
                                {cliente?.status}
                            </span>
                        </div>

                        <ul className='mb-5 space-y-1 text-sm text-zinc-500'>
                            <li>
                                <span className='text-zinc-300'>Correo:</span> {cliente?.email}
                            </li>
                            <li>
                                <span className='text-zinc-300'>Teléfono:</span> {cliente?.telefono}
                            </li>
                            <li>
                                <span className='text-zinc-300'>Dirección:</span> {cliente?.direccion ? cliente.direccion : 'Pendiente'}
                            </li>
                            <li>
                                <span className='text-zinc-300'>Canal:</span> {cliente?.canalNombre ?? 'Directo'}
                            </li>
                            <li>
                                <span className='text-zinc-300'>Creado:</span> {cliente?.createdAt ? new Date(cliente.createdAt).toLocaleString('es-ES', {
                                    year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'
                                }) : 'Pendiente'}
                            </li>
                            <li>
                                <span className='text-zinc-300'>Actualizado:</span> {cliente?.updatedAt ? new Date(cliente.updatedAt).toLocaleString('es-ES', {
                                    year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'
                                }).replace(/^\w+,\s/, '') : 'Pendiente'}
                            </li>
                        </ul>

                        <div className='space-x-2'>

                            <button className='mb-2 px-3 py-2 bg-zinc-900 text-zinc-300 rounded-md border border-zinc-800'
                                onClick={() => {
                                    if (cliente?.telefono) {
                                        window.open(`tel:${cliente.telefono}`, '_blank');
                                    } else {
                                        alert('El cliente no tiene un número de teléfono registrado.');
                                    }
                                }}
                            >
                                Llamar por teléfono
                            </button>

                            <button className='mb-2 px-3 py-2 bg-green-900 text-zinc-300 rounded-md border border-zinc-800'
                                onClick={() => {
                                    if (cliente?.telefono) {
                                        window.open(`https://wa.me/${cliente.telefono}`, '_blank');
                                    } else {
                                        alert('El cliente no tiene un número de teléfono registrado.');
                                    }
                                }}
                            >
                                Enviar whatsapp
                            </button>

                        </div>

                    </div>

                </div>

                {/* //! DETALLES DEL EVENTO */}
                <div className=''>

                    <div className='space-y-5'>

                        <div className='text-zinc-500 text-xl font-bold'>
                            Detalles de evento
                        </div>

                        <div className='border border-zinc-800 rounded-md p-5 '>

                            <div className="mb-4">
                                <label className="block text-zinc-600 text-sm mb-2" htmlFor="nombre">
                                    Nombre del evento

                                    {!nombre && <span className="bg-red-700 text-red-300 px-2 py-1 leading-3 rounded-full ml-2 text-[12px] animate-pulse">Por definir</span>}

                                </label>
                                <input
                                    type="text"
                                    id="nombre"
                                    name="nombre"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    placeholder='Nombre del evento'
                                    className="bg-zinc-900 border border-zinc-800 rounded w-full py-2 px-3 text-zinc-600 placeholder-zinc-700 placeholder-italic"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-zinc-600 text-sm mb-2" htmlFor="eventoTipoId">
                                    Tipo de Evento
                                </label>

                                <div
                                    className="bg-zinc-900 border border-zinc-800 rounded w-full py-2 px-3 text-zinc-500"
                                >
                                    {tipoEvento}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-zinc-600 text-sm mb-2" htmlFor="fechaevento">
                                    Fecha de evento
                                </label>
                                <input
                                    type="date"
                                    id="fechaevento"
                                    name="fechaevento"
                                    value={fechaEvento ? fechaEvento.toISOString().split("T")[0] : ''} // Convierte al formato requerido
                                    onChange={e => setFechaEvento(new Date(e.target.value))}
                                    className="bg-zinc-900 border border-yellow-600 rounded w-full py-2 px-3 text-zinc-300"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-zinc-600 text-sm mb-2" htmlFor="estatus">
                                    Estatus
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="bg-zinc-900 border border-zinc-800 rounded w-full py-2 px-3 text-zinc-300"
                                >
                                    {tipificacionStatus.map((statusOption) => (
                                        <option key={statusOption} value={statusOption}>
                                            {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className='grid grid-cols-2'>

                                <p className='text-sm text-zinc-500 italic mb-0'>
                                    Creación  {fechaCreacion ? new Date(fechaCreacion).toLocaleString('es-ES', {
                                        year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'
                                    }) : ''}
                                </p>

                                <p className='text-sm text-zinc-500 italic mb-5'>
                                    Actualización {fechaActualizacion ? new Date(fechaActualizacion).toLocaleString('es-ES', {
                                        year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'
                                    }) : ''}
                                </p>
                            </div>

                            <div className="space-y-3">
                                {respuestaServidor &&
                                    <p className="p-3 bg-green-600 text-green-200 text-center rounded-md">{respuestaServidor}</p>
                                }

                                <button
                                    onClick={handleSubmit}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                                    disabled={actualizandoEvento}
                                >
                                    {actualizandoEvento ? 'Actualizando información...' : 'Actualizar información'}
                                </button>

                                <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                                    onClick={() => router.back()}
                                >
                                    Cerrar ventana
                                </button>

                                {/* //! DESCOMENTAR EN PRODUCCUÓN */}
                                {/* //! DESCOMENTAR EN PRODUCCUÓN */}
                                {/* //! DESCOMENTAR EN PRODUCCUÓN */}
                                {/* {status !== 'aprobado' && ( */}
                                <button
                                    onClick={() => handleEliminarEvento()}
                                    className="text-red-500 py-2 flex items-center justify-center w-full text-sm"
                                >
                                    <Trash2 size={15} className='mr-2' />
                                    Eliminar evento
                                </button>
                                {/* )} */}
                                {errorEliminar && <p className="text-red-500 text-sm">{errorEliminar}</p>}
                            </div>

                        </div>
                    </div>
                </div>

                {/* //! COTIZACIONES */}
                <div className=''>
                    <div className='font-bold mb-5 text-xl text-zinc-500 flex justify-between items-center'>
                        <div>
                            Cotizaciones
                        </div>
                        <div>
                            {generandoCotizacion ? (
                                <p className="text-yellow-500 italic">Generando cotización...</p>
                            ) : (
                                <select
                                    className='opciones_cotizacion bg-zinc-900 px-3 py-2 rounded-md border border-zinc-600 text-sm mr-2'
                                    onChange={(e) => handleNuevaCotizacion(e.target.value)}
                                >
                                    <option>Generar nueva</option>
                                    {paquetes.map(paquete => (
                                        <option key={paquete.id} value={paquete.id}>{paquete.nombre}</option>
                                    ))}
                                    <option value="personalizada">Personalizada</option>
                                </select>
                            )}
                        </div>
                    </div>

                    <div className='border border-zinc-800 rounded-md p-5'>
                        {cliente && evento && <ListaCotizaciones evento={evento} cliente={cliente} />}
                    </div>
                </div>

                <div className=''>
                    <FichaBitacora eventoId={eventoId} />
                </div>


            </div>
        </div>
    )
}
