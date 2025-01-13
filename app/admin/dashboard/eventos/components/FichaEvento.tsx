import React from 'react';
import { Calendar, CircleUserRound } from 'lucide-react';
import { asignarEventoUser } from '@/app/admin/_lib/evento.actions'
import { EventoDetalle } from '@/app/admin/_lib/types';
import { useRouter } from 'next/navigation'


interface Props {
    evento: EventoDetalle;
    userId: string;
}

export default function FichaEvento({ evento, userId }: Props) {

    const router = useRouter()

    const handleOpen = async (id: string) => {

        //si nuevo, actualizar a seguimiento y asignar a usuario quien lo abrio
        if (evento.status === 'nuevo') {
            console.log('Evento nuevo', userId, evento.id)
            await asignarEventoUser(evento.id, userId, 'seguimiento')
            router.push(`/admin/dashboard/eventos/${id}`)
        }
        router.push(`/admin/dashboard/eventos/${id}`)
    }

    return (
        <div key={evento.id} className='relative px-4 py-2 border border-zinc-700 rounded-md mb-5'>

            <h3 className='text-lg text-zinc-300 items-center'>
                <button onClick={() => handleOpen(evento.id)}>

                    <span className='mr-2 px-2 py-1 leading-3 text-[12px] bg-zinc-800 text-yellow-500 rounded-full'>
                        {evento.tipoEvento}
                    </span>

                    <span>
                        {evento.evento || 'Por configurar'}
                    </span>
                </button>
            </h3>
            <p className='flex items-center mb-2 text-zinc-300'>
                <Calendar size={15} className='mr-2' /> Fecha de evento {new Date(evento.fecha_evento).toLocaleDateString('es-MX', {
                    timeZone: 'UTC',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}
            </p>
            <div className='space-x-1 mb-2 flex items-center'>
                Prospecto <span className='ml-2 px-2 py-1 leading-3 text-[12px] bg-zinc-700 rounded-md uppercase flex items-center'>
                    <CircleUserRound size={15} className='mr-1' /> {evento.cliente}
                </span>
                {evento.user && (
                    <span className='px-2 py-1 leading-3 text-sm rounded-md flex text-purple-500'>
                        @{evento.user}
                    </span>
                )}
            </div>
            <p className='text-zinc-500 flex items-center text-sm italic'>
                Registrado {new Date(evento.creacion).toLocaleString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                })} a las {new Date(evento.creacion).toLocaleTimeString('es-ES', {
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric'
                })}
            </p>
        </div>
    );
};
