// 'use client'
// import React, { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'

// import { supabase } from '@/app/admin/_lib/supabase'
// import { EventoEtapa } from '@/app/admin/_lib/types'
// import { obtenerEventosDetalle } from '@/app/admin/_lib/evento.actions'
// import { obtenerTipoEvento } from '@/app/admin/_lib/eventoTipo.actions'
// import { obtenerCliente } from '@/app/admin/_lib/cliente.actions'
// import { obtenerEventoEtapas } from '@/app/admin/_lib/EventoEtapa.actions'

// import FichaEvento from './FichaEvento'

// export default function ListaEventos() {

//     const router = useRouter()
//     const [eventosDetalle, setEventoDetalle] = useState<EventoDetalle[]>([])
//     const [loading, setLoading] = useState<boolean>(false)
//     const [filtro, setFiltro] = useState<string>('')
//     const [etapas, setEtapas] = useState<EventoEtapa[]>([])


//     const fetchData = async () => {

//         setLoading(true)

//         const etapasPromise = await obtenerEventoEtapas()
//         const primeras2Etapas = etapasPromise.slice(0, 2);
//         setEtapas(primeras2Etapas);


//         const eventosDetallePromise = await obtenerEventosDetalle()
//         setEventoDetalle(eventosDetallePromise.map(evento => ({
//             ...evento,
//             creacion: evento.creacion ? new Date(evento.creacion).toISOString() : '',
//             fecha_evento: evento.fecha_evento ? new Date(evento.fecha_evento).toISOString() : '',
//             fecha_actualizacion: evento.fecha_actualizacion ? new Date(evento.fecha_actualizacion).toISOString() : '',
//             tipoEvento: evento.tipoEvento || '', // Asegúrate de mapear correctamente el campo
//             evento: evento.evento || '',
//             cliente: evento.cliente || '',
//             user: evento.user || ''
//         })))
//         setLoading(false)
//     }

//     const suscripcionSupabase = () => {

//         const subscriptionNuevo = supabase.channel('realtime:Evento:nuevo').on(
//             'postgres_changes',
//             { event: 'INSERT', schema: 'public', table: 'Evento' },

//             async (payload) => {
//                 const newEvento = payload.new;
//                 const nombreCliente = await obtenerCliente(newEvento.clienteId)
//                 const nombreTipoEvento = await obtenerTipoEvento(newEvento.eventoTipoId)

//                 setEventoDetalle(prevEventos => [
//                     ...prevEventos,
//                     {
//                         id: newEvento.id,
//                         cliente: nombreCliente?.nombre || '',
//                         status: newEvento.status,
//                         creacion: newEvento.createdAt,
//                         fecha_evento: newEvento.fecha_evento ? new Date(newEvento.fecha_evento).toISOString() : '',
//                         fecha_actualizacion: newEvento.fecha_actualizacion,
//                         tipoEvento: nombreTipoEvento?.nombre || '',
//                         evento: newEvento.nombre || '',
//                         user: newEvento.user || '',
//                         eventoEtapaId: newEvento.eventoEtapaId || ''
//                     }
//                 ]);
//             }
//         ).subscribe(status => {
//             console.log('Estado de la suscripción:', status)
//         });

//         return () => {
//             supabase.removeChannel(subscriptionNuevo);
//         };
//     }


//     useEffect(() => {
//         // Obtener eventos
//         fetchData();

//         // Suscripción a eventos nuevos
//         suscripcionSupabase();
//     }, [])

//     const eventosFiltrados = eventosDetalle.filter(evento => {
//         const cumpleFiltro =
//             (filtro === '' || evento.evento.toLowerCase().includes(filtro.toLowerCase())) ||
//             (filtro === '' || evento.cliente.toLowerCase().includes(filtro.toLowerCase())) ||
//             (filtro === '' || new Date(evento.creacion).toLocaleDateString('es-MX', {
//                 timeZone: 'UTC',
//                 year: 'numeric',
//                 month: 'long',
//                 day: 'numeric'
//             }).includes(filtro))
//         return cumpleFiltro
//     })

//     const eventosPorEstado = etapas.reduce((acc, etapa) => {
//         acc[etapa.nombre] = eventosFiltrados.filter(evento => evento.eventoEtapaId === etapa.id);
//         return acc;
//     }, {} as Record<string, EventoDetalle[]>);


//     return (
//         <div className='mx-auto max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl'>
//             {loading ? (
//                 <div className='flex items-center justify-center h-screen'>
//                     <p className='text-zinc-300 text-center'>
//                         Cargando eventos...
//                     </p>
//                 </div>
//             ) : (
//                 <div className='overflow-x-auto'>
//                     <div className='flex justify-between items-center mb-5'>
//                         <h1 className='text-2xl text-zinc-400'>
//                             Promesas
//                         </h1>
//                         <button
//                             className='bg-zinc-800 border border-zinc-700 px-3 py-2 rounded-md text-zinc-300 text-sm'
//                             onClick={() => router.push('/admin/dashboard/eventos/nuevo')}
//                         >
//                             Crear nuevo evento
//                         </button>
//                     </div>

//                     <div className='mb-2'>
//                         <input
//                             type='text'
//                             placeholder='Filtrar por nombre del evento, cliente o fecha'
//                             value={filtro}
//                             onChange={(e) => setFiltro(e.target.value)}
//                             className='bg-zinc-800 border border-zinc-700 px-3 py-2 rounded-md text-zinc-300 mb-2 w-full'
//                         />
//                     </div>

//                     <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4'>
//                         {Object.entries(eventosPorEstado).map(([estado, eventos]) => (
//                             <div key={estado}>
//                                 <h2 className='text-xl text-zinc-400 capitalize mb-4'>{estado}</h2>
//                                 {eventos.map(evento => (
//                                     <FichaEvento
//                                         key={evento.id}
//                                         evento={evento}
//                                     />
//                                 ))}
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             )}
//         </div>
//     )
// }