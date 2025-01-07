'use client'
import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { crearEvento, validarDisponibilidadFecha } from '@/app/admin/_lib/evento.actions'
import { obtenerTiposEvento } from '@/app/admin/_lib/eventoTipo.actions'
import { obtenerCliente, obtenerClientes } from '@/app/admin/_lib/cliente.actions'
import { Cliente } from '@/app/admin/_lib/types'
import { X, Phone } from 'lucide-react'
import Cookies from 'js-cookie'

export default function FormEventoNuevo() {

    const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
    const [clientes, setClientes] = useState<Cliente[]>([])
    const [nombre, setNombre] = useState('')
    const [eventoTipoId, setEventoTipoId] = useState('')
    const [fechaEvento, setFechaEvento] = useState<Date | null>(null)
    const [tiposEvento, setTiposEvento] = useState<{ id: string, nombre: string }[]>([])
    const [errorEventoTipoId, setErrorEventoTipoId] = useState('')
    const [errorFechaEvento, setErrorFechaEvento] = useState('')
    const [errorCliente, setErrorCliente] = useState('')
    const [mostrarListaClientes, setMostrarListaClientes] = useState(false)
    const [guardandoEvento, setGuardandoEvento] = useState(false)
    const [fechaDisponible, setFechaDisponible] = useState(false)

    const [user, setUser] = useState<{ id: string } | null>(null);
    const searchParams = useSearchParams();
    const router = useRouter()

    useEffect(() => {

        const clienteId = searchParams ? searchParams.get('clienteId') : null;
        if (clienteId) {
            const fetchCliente = async () => {
                const clientePromise = await obtenerCliente(clienteId)
                if (clientePromise) {
                    setClienteSeleccionado(clientePromise)
                }
            }
            fetchCliente()
        }

        const fetchClientes = async () => {
            const clientes = await obtenerClientes()
            setClientes(clientes)
        }
        fetchClientes()

        const fetchTipoEventos = async () => {
            const tiposEventos = await obtenerTiposEvento()
            setTiposEvento(tiposEventos)
        }
        fetchTipoEventos()

        const userData = Cookies.get('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }

    }, [searchParams])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        let hasError = false

        if (!eventoTipoId) {
            setErrorEventoTipoId('El tipo de evento es obligatorio')
            hasError = true
        } else {
            setErrorEventoTipoId('')
        }

        if (!fechaEvento) {
            setErrorFechaEvento('La fecha del evento es obligatoria')
            hasError = true
        } else {
            setErrorFechaEvento('')
        }

        if (!clienteSeleccionado) {
            setErrorCliente('Seleccione un cliente')
            hasError = true
        } else {
            setErrorCliente('')
        }

        if (hasError) {
            return
        }

        const eventoNuevo = {
            clienteId: clienteSeleccionado?.id || '',
            eventoTipoId,
            nombre: nombre.toLowerCase().replace(/\b\w/g, char => char.toUpperCase()),
            fecha_evento: fechaEvento || new Date(), // Ensure fecha_evento is always a Date
            status: 'seguimiento',
            userId: user ? user.id : '',
        }


        setGuardandoEvento(true)
        const response = await crearEvento(eventoNuevo)

        if (response) {
            router.push(`/admin/dashboard/eventos/${response.id}`)
        } else {
            alert('Error al crear el evento')
        }
        // setGuardandoEvento(false)
    }

    const handleClienteSeleccionado = (cliente: Cliente) => {
        setClienteSeleccionado(cliente)
        setMostrarListaClientes(false)
        router.push(`?clienteId=${cliente.id}`)
    }

    const handleEliminarClienteSeleccionado = () => {
        // if (window.confirm('¿Está seguro que deseas cambiar el cliente actual?')) {
        setClienteSeleccionado(null)
        setMostrarListaClientes(true)
        router.replace(``)
        if (searchParams) {
            const params = new URLSearchParams(searchParams.toString());
            params.delete('clienteId');
            router.replace(`?${params.toString()}`);
        }

    }

    const validarFecha = (fecha: Date) => {
        const fechaSinHora = new Date(fecha.toISOString()); // Solo la parte de la fecha
        setFechaEvento(fechaSinHora)
        validarDisponibilidadFecha(fechaSinHora).then(disponible => {
            // console.log(disponible)
            if (!disponible) {
                setFechaDisponible(true)
                setErrorFechaEvento('')
            } else {
                setFechaDisponible(false)
                setErrorFechaEvento('Ya existe un evento para esta fecha')
            }
        })
    }

    // console.log(user)

    return (
        <div className="max-w-md mx-auto shadow-md ">
            <div>
                <h2 className="text-2xl font-bold mb-5">Crear nuevo evento</h2>
            </div>
            <div>
                {clienteSeleccionado ? (
                    <div className="flex items-center justify-between mb-5 px-2 py-2 bg-zinc-900 rounded border border-zinc-800 w-full">

                        <p className="text-zinc-500 ">
                            Cliente: <span className='font-semibold'>{clienteSeleccionado.nombre}</span>
                        </p>

                        <button
                            type="button"
                            onClick={handleEliminarClienteSeleccionado}
                            className=""
                        >
                            <X size={16} className="inline-block mr-2" />
                        </button>
                    </div>
                ) : (
                    <div className="mb-4">
                        {mostrarListaClientes ? (
                            <>

                                <p className="text-zinc-500 text-xl mb-2">
                                    Selecciona un contacto existente
                                </p>

                                <ul className="bg-zinc-900 border border-zinc-800 rounded w-full py-2 px-3 text-zinc-300 mb-2">
                                    {clientes.map(cliente => (
                                        <li key={cliente.id} onClick={() => handleClienteSeleccionado(cliente)} className="cursor-pointer hover:bg-zinc-800 flex">
                                            {cliente.nombre}
                                            <span className='text-zinc-600 ms-2 italic text-sm flex items-center'>
                                                <Phone size={12} className='mr-1' />{cliente.telefono}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="flex">
                                    <button
                                        className='border bg-zinc-800 text-white text-sm py-2 px-4 rounded-md rounded-bl-md border-t border-l border-b border-zinc-800 mr-2 w-full'
                                        onClick={() => router.push('/admin/dashboard/contactos')}
                                    >
                                        Gestionar contactos
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => router.push('/admin/dashboard/contactos/nuevo')}
                                        className="bg-blue-800 text-white text-sm py-2 px-4 rounded-md rounded-br-md border-t border-r border-b border-zinc-800 w-full"
                                    >
                                        Registrar contacto nuevo
                                    </button>


                                </div>

                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setMostrarListaClientes(true)}
                                className="bg-zinc-800 text-white py-2 px-4 rounded border border-zinc-700 w-full"
                            >
                                Seleccionar cliente
                            </button>
                        )}
                        {errorCliente && <p className="text-red-500 text-sm">{errorCliente}</p>}
                    </div>
                )}
            </div>

            <div className='rounded-lg p-5 bg-zinc-900'>

                <form onSubmit={handleSubmit} className='space-y-5'>

                    <div className="mb-4">
                        <label className="block text-zinc-600 text-sm mb-2" htmlFor="fechaevento">
                            Fecha de celebración
                        </label>
                        <input
                            type="date"
                            id="fechaevento"
                            name="fechaevento"
                            value={fechaEvento ? fechaEvento.toISOString().split("T")[0] : ''} // Convierte al formato requerido
                            onChange={e => validarFecha(new Date(e.target.value))}
                            className="bg-zinc-900 border border-zinc-800 rounded w-full py-2 px-3 text-zinc-300"
                        />
                        {errorFechaEvento ? (
                            <p className="text-red-500 text-sm">{errorFechaEvento}</p>
                        ) : (
                            fechaDisponible && <p className="text-green-500 text-sm">Fecha disponible</p>
                        )}
                    </div>


                    <div className="mb-4">
                        <label className="block text-zinc-600 text-sm mb-2" htmlFor="eventoTipoId">
                            Tipo de evento
                        </label>
                        <select
                            id="eventoTipoId"
                            name="eventoTipoId"
                            value={eventoTipoId}
                            onChange={(e) => setEventoTipoId(e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 rounded w-full py-2 px-3 text-zinc-300"
                        >
                            <option value="">Seleccione un tipo de evento</option>
                            {tiposEvento.map(tipo => (
                                <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                            ))}
                        </select>
                        {errorEventoTipoId && <p className="text-red-500 text-sm">{errorEventoTipoId}</p>}
                    </div>


                    <div className="mb-4">
                        <label className="block text-zinc-600 text-sm mb-2" htmlFor="nombre">
                            Nombre del evento (Opcional)
                        </label>
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 rounded w-full py-2 px-3 text-zinc-300"
                        />
                    </div>

                    <div className="space-y-3">
                        <button
                            type="submit"
                            className={`font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full ${guardandoEvento || !fechaDisponible ? 'bg-zinc-800 text-zinc-500' : 'bg-blue-500 text-white'}`}
                            disabled={guardandoEvento || !fechaDisponible}
                        >
                            {guardandoEvento ? 'Registrando nuevo evento...' : 'Registrar nuevo evento'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push('/admin/dashboard/eventos')}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>

            </div>
        </div>
    )
}