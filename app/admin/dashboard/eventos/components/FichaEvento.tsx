import React from 'react';
import { EventosPorEtapa } from '@/app/admin/_lib/types';
import { Calendar, CircleUserRound } from 'lucide-react';
import { useRouter } from 'next/navigation'

interface Props {
    evento: EventosPorEtapa;
}

export default function FichaEvento({ evento }: Props) {

    const router = useRouter()
    const handleOpen = async (id: string) => {
        router.push(`/admin/dashboard/eventos/${id}`)
    }

    return (
        <div key={evento.id} className={`relative px-4 py-2 ${evento.status === 'inactive' ? 'bg-red-950/30' : 'bg-zinc-900'} rounded-md mb-5 cursor-pointer`}
            onClick={() => handleOpen(evento.id)}>

            <h3 className='text-lg text-zinc-300 items-center'>
                {/* <button > */}

                <span className='mr-2 px-2 py-1 leading-3 text-[12px] bg-zinc-800 text-yellow-500 rounded-full'>
                    {evento.EventoTipo?.nombre}
                </span>

                <span>
                    {evento.nombre || 'Por configurar'}
                </span>
                {/* </button> */}
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
                    <CircleUserRound size={15} className='mr-1' /> {evento.Cliente.nombre}
                </span>
                {evento.userId && (
                    <span className='px-2 py-1 leading-3 text-sm rounded-md flex text-purple-500'>
                        @{evento.User?.username}
                    </span>
                )}
            </div>
            <p className='text-zinc-500 flex items-center text-sm italic'>
                Registrado {new Date(evento.createdAt).toLocaleString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                })} a las {new Date(evento.createdAt).toLocaleTimeString('es-ES', {
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric'
                })}
            </p>
        </div>
    );
};
