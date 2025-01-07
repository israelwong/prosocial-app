import React from 'react';
import { Calendar, CircleUserRound } from 'lucide-react';

interface FichaEventoProps {
    evento: {
        id: string;
        evento: string;
        cliente: string;
        creacion: string;
        status: string;
        tipoEvento: string;
        fecha_evento: string;
        user: string;
        fecha_actualizacion: string;
    };
    handleOpen: (id: string, status: string) => void;
}

const FichaEvento: React.FC<FichaEventoProps> = ({ evento, handleOpen }) => {
    return (
        <div key={evento.id} className='relative px-4 py-2 border border-zinc-700 rounded-md mb-5'>
            <h3 className='text-lg text-zinc-300 items-center'>
                <button onClick={() => handleOpen(evento.id, evento.status)}>
                    {evento.evento || 'Por configurar'}
                    <span className='ml-2 px-2 py-1 leading-3 text-[12px] bg-zinc-800 text-yellow-500 rounded-full'>
                        {evento.tipoEvento}
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
                Lead <span className='ml-2 px-2 py-1 leading-3 text-[12px] bg-zinc-700 rounded-md uppercase flex items-center'>
                    <CircleUserRound size={15} className='mr-1' /> {evento.cliente}
                </span>
                {evento.user && (
                    <span className='px-2 py-1 leading-3 text-sm rounded-md flex text-purple-500'>
                        @{evento.user}
                    </span>
                )}
            </div>
            <p className='text-zinc-500 flex items-center text-sm'>
                Registrado {new Date(evento.fecha_actualizacion).toLocaleDateString('es-MX', {
                    timeZone: 'UTC',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}
            </p>
        </div>
    );
};

export default FichaEvento;