// 'use client';
// import React, { useEffect, useState } from 'react';
// import { useSearchParams } from 'next/navigation';
// import { cotizacionDetalle } from '@/app/admin/_lib/cotizacion.actions';
// import { useRouter } from 'next/navigation';
// import { obtenerCondicionComercial } from '@/app/admin/_lib/condicionesComerciales.actions';
// import { RotateCcw } from 'lucide-react';

// export default function PagoEfectivo() {
//     const searchParams = useSearchParams();

//     const cotizacionId = searchParams?.get('cotizacionId') || '';
//     const montoPromesa = searchParams?.get('monto') || '';
//     const porcentajeAnticipo = searchParams?.get('porcentajeAnticipo') || '';
//     const metodoPagoId = searchParams?.get('metodoPagoId') || '';
//     const condicionesComercialesId = searchParams?.get('condicionesComercialesId') || '';

//     const [nombreCliente, setNombreCliente] = useState('');
//     const [eventoNombre, setEventoNombre] = useState('');
//     const [eventoFecha, setEventoFecha] = useState('');
//     const [eventoTipo, setEventoTipo] = useState('');
//     const [condicionesComercialesMetodoPagoId, setCondicionesComercialesMetodoPagoId] = useState('');
//     const [metodoPago, setMetodoPago] = useState('');
//     const [concepto, setConcepto] = useState('');
//     const [precio, setPrecio] = useState(0);
//     const [monto, setMonto] = useState('');
//     const [errorMonto, setErrorMonto] = useState('');

//     useEffect(() => {
//         const fetchData = async () => {
//             if (cotizacionDetalle) {
//                 const cotizacionDetallePromise = await cotizacionDetalle(cotizacionId);
//                 if (cotizacionDetallePromise) {
//                     setNombreCliente(cotizacionDetallePromise.cliente?.nombre || '');
//                     setEventoNombre(cotizacionDetallePromise.evento?.nombre || '');
//                     setEventoFecha(cotizacionDetallePromise.evento?.fecha_evento?.toISOString() || '');
//                     setEventoTipo(cotizacionDetallePromise.eventoTipo?.nombre || '');
//                     setCondicionesComercialesMetodoPagoId(cotizacionDetallePromise.cotizacion?.condicionesComercialesMetodoPagoId || '');
//                     setMetodoPago('Efectivo');
//                     setMonto(new Intl.NumberFormat('en-US').format(Number(montoPromesa)));

//                     setPrecio(Number(cotizacionDetallePromise.cotizacion?.precio) || 0);
//                 }

//                 await obtenerCondicionComercial(condicionesComercialesId);

//                 if (Number(porcentajeAnticipo) === 100) {
//                     setConcepto('Pago total del evento');
//                 } else {
//                     setConcepto(`Pago de anticipo del ${porcentajeAnticipo}%`);
//                 }
//             }
//         };

//         fetchData();
//     }, [cotizacionId, condicionesComercialesId]);

//     const router = useRouter();

//     const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         // Elimina separadores existentes
//         const rawValue = e.target.value.replace(/,/g, '');

//         if (!isNaN(Number(rawValue)) && rawValue !== '') {
//             setMonto(new Intl.NumberFormat('en-US').format(Number(rawValue))); // Formatea con separadores
//         } else {
//             setMonto('');
//         }

//         if (rawValue === '' || Number(rawValue) < Number(montoPromesa)) {
//             setErrorMonto('El monto no puede ser menor a la promesa de pago');
//         } else {
//             setErrorMonto('');
//         }

//         if (rawValue === '' || Number(rawValue) > Number(precio)) {
//             setErrorMonto('El monto no puede ser mayor al precio total del servicio');
//         } else {
//             setErrorMonto('');
//         }

//     };

//     const getRawMonto = () => monto.replace(/,/g, '');

//     return (
//         <div className='container mx-auto max-w-screen-sm'>
//             <div className='flex items-center justify-between'>
//                 <h1 className='text-2xl'>Pago en efectivo</h1>
//                 <button className='bg-red-700 text-white px-4 py-2 rounded' onClick={() => router.back()}>
//                     Cancelar
//                 </button>
//             </div>

//             <div>
//                 <p>Cliente: {nombreCliente}</p>
//                 <p>Evento: {eventoNombre}</p>
//                 <p>Precio total del servicio: {precio.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
//                 <p>
//                     Fecha compromiso:{" "}
//                     {new Date(eventoFecha).toLocaleDateString('es-MX', {
//                         year: 'numeric',
//                         month: 'long',
//                         day: 'numeric',
//                     })}
//                 </p>
//                 <p>Tipo de evento: {eventoTipo}</p>
//                 <p>Metodo de pago: {metodoPago}</p>
//                 <p>Concepto: {concepto}</p>

//                 {/* //!CANTIDAD PAGO EN EFECTIVO */}
//                 <div className="my-4">
//                     <label htmlFor="monto" className="block text-sm font-medium text-gray-700">
//                         Monto:
//                     </label>

//                     <div
//                         className="mt-1 relative rounded-md flex items-center border border-zinc-800 py-2 px-3 bg-zinc-900">

//                         <div className="mt-1 relative rounded-md flex items-center  py-2 px-3 bg-zinc-900">
//                             <span className="text-zinc-500 text-4xl mr-2">$</span>
//                             <input
//                                 type="text"
//                                 id="monto"
//                                 name="monto"
//                                 value={monto}
//                                 onChange={handleMontoChange}
//                                 className="block text-4xl border-0 bg-zinc-900 text-white focus:ring-0 rounded px-3 py-2 appearance-none focus:outline-none [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
//                                 placeholder="0.00"
//                             />
//                         </div>
//                         <button
//                             className='px-4 py-2 rounded ml-4'
//                             onClick={() => setMonto(new Intl.NumberFormat('en-US').format(Number(montoPromesa)))}
//                         >
//                             <RotateCcw size={30} className='text-zinc-400' />
//                         </button>
//                     </div>
//                     {errorMonto && <p className="py-2 text-red-500 text-sm">{errorMonto}</p>}
//                 </div>

//                 <button
//                     className='bg-green-700 text-white px-4 py-2 rounded'
//                     onClick={() => console.log(`Monto sin formato: ${getRawMonto()}`)}
//                 >
//                     Registrar pago
//                 </button>
//             </div>
//         </div>
//     );
// }
