'use client'
import React, { useEffect, useState } from 'react'
import { obtenerEventoPorId } from '@/app/admin/_lib/evento.actions'

import FichaEvento from './FichaEventoV2'
import FichaBitacora from './FichaBitacora'
import FichaClienteEditar from './FichaClienteEditar'
import ListaCotizaciones from '../../cotizaciones/components/ListaCotizacionesV2'

import { useRouter } from 'next/navigation'

interface Props {
    eventoId: string
}

export default function FormEventoEditarV2({ eventoId }: Props) {

    const [clienteId, setClienteId] = useState<string>('')
    const [eventoTipoId, setEventoTipoId] = useState<string>('')
    const [nombreCliente, setNombreCliente] = useState<string>('')
    const [telefono, setTelefono] = useState<string>('')
    const [nombreEtapa, setNombreEtapa] = useState<string>('')
    const [eventoAsignado, setEventoAsignado] = useState<boolean>(false)

    const router = useRouter()

    useEffect(() => {
        obtenerEventoPorId(eventoId).then((data) => {
            if (data) {
                // console.log(data)
                setClienteId(data.clienteId);
                setEventoTipoId(data.eventoTipoId ?? '');
                setNombreCliente(data.Cliente.nombre);
                setTelefono(data.Cliente.telefono ?? '');
                setNombreEtapa(data.EventoEtapa?.nombre ?? '');
                if (data.userId) {
                    setEventoAsignado(true)
                }
            }
        });
    }, [eventoId])


    //! Envia mensaje con link de whatsapp
    const handleAbrirConversacion = () => {
        const mensaje = `Hola ${nombreCliente} 👋, ¿Cómo estás?`
        window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank')
    }

    const hookEventoAsignado = (status: boolean) => {
        // console.log('hookEventoAsignado', status)
        if (status) {
            setEventoAsignado(true)
        } else {
            setEventoAsignado(false)
        }
    }

    return (
        <div >

            <div className='mb-10 flex justify-between items-center '>
                <h1 className='font-bold text-3xl text-zinc-500'>
                    Detalles del evento
                </h1>
                <div>

                    {nombreEtapa !== 'Nuevo' && nombreEtapa !== 'Seguimiento' && (
                        <button
                            className='bg-blue-500 text-white px-4 py-2 rounded-md mr-2'
                            onClick={() => router.push(`/admin/dashboard/seguimiento/${eventoId}`)}
                        >
                            Gestionar evento {nombreEtapa}
                        </button>
                    )}

                    <button className='bg-green-700 text-white px-4 py-2 rounded-md mr-2'
                        onClick={() => handleAbrirConversacion()}
                    >
                        Abrir conversación
                    </button>

                    <button
                        className='bg-red-500 text-white px-4 py-2 rounded-md'
                        onClick={() => router.back()}>
                        Cerrar ventana
                    </button>
                </div>
            </div>

            <div className='grid grid-cols-4 gap-6'>

                {/* FICHA CLIENTE */}
                <div>
                    <FichaClienteEditar clienteId={clienteId} />
                </div>

                <div>
                    <FichaEvento
                        eventoId={eventoId}
                        onAsignacionEvento={hookEventoAsignado}
                    />
                </div>

                <div>
                    {eventoTipoId ? (
                        <ListaCotizaciones
                            eventoId={eventoId}
                            eventoTipoId={eventoTipoId}
                            eventoAsignado={eventoAsignado}
                        />
                    ) : (
                        <div className='border border-zinc-800 rounded-md p-5 text-zinc-500'>
                            Cargando módulo de cotizaciones...
                        </div>
                    )}
                </div>

                <div>
                    <FichaBitacora eventoId={eventoId} />
                </div>
            </div>

        </div>
    )
}
