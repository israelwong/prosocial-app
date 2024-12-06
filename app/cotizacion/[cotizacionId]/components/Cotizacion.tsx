'use client';
import React, { useEffect, useState, useCallback } from 'react'
import { obtenerConfiguracionActiva } from '@/app/admin/_lib/configuracion.actions'
import { obtenerCondicionesComercialesActivas, obtenerCondicionesComercialesMetodosPago } from '@/app/admin/_lib/condicionesComerciales.actions';
import { obtenerMetodoPago } from '@/app/admin/_lib/metodoPago.actions';
import { obtenerServicio } from '@/app/admin/_lib/servicio.actions'
import { cotizacionDetalle } from '@/app/admin/_lib/cotizacion.actions';
import Image from 'next/image';
// import Galeria from './Galeria';

import {
    Servicio,
    MetodoPago,
    CondicionesComerciales
} from '@/app/admin/_lib/types'

import Wishlist from './Wishlist';

import { obtenerCotizacion, obtenerCotizacionServicios } from '@/app/admin/_lib/cotizacion.actions';
// import { useRouter } from 'next/navigation'

interface Props {
    cotizacionId: string
}

export default function Cotizacion({ cotizacionId }: Props) {

    // const router = useRouter();
    const [loading, setLoading] = useState(true); // Estado de carga
    const [sobreprecioPorcentaje, setSobreprecioPorcentaje] = useState(0);
    const [comisionVentaPorcentaje, setComisionVentaPorcentaje] = useState(0);
    const [totalPrecioSistema, setTotalPrecioSistema] = useState(0);
    const [nombreCotizacion, setNombreCotizacion] = useState('');
    const [servicios, setServicios] = useState<Servicio[]>([]);
    const [condicionComercial, setCondicionComercial] = useState<CondicionesComerciales | null>(null);
    const [metodoPago, setMetodoPago] = useState<MetodoPago | null>(null);
    const [msi, setMsi] = useState(0);
    const [pagoMensual, setPagoMensual] = useState(0);
    const [descuento, setDescuento] = useState(0);
    const [precioFinal, setPrecioFinal] = useState(0);
    const [metodoPagoId, setMetodoPagoId] = useState<string | undefined>('');
    const [condicionesComerciales, setCondicionesComerciales] = useState([] as CondicionesComerciales[]);
    const [condicionesComercialesId, setCondicionComercialId] = useState<string | undefined>('');
    const [nombreCliente, setNombreCliente] = useState('');
    const [tipoEvento, setTipoEvento] = useState('');
    const [fechaEvento, setFechaEvento] = useState('');
    const [nombreEvento, setNombreEvento] = useState('');

    useEffect(() => {
        async function fetchData() {
            setLoading(true);

            const cotizacionPromise = obtenerCotizacion(cotizacionId);
            const configuracionPromise = obtenerConfiguracionActiva();
            const condicionesComercialesPromise = obtenerCondicionesComercialesActivas();
            const cotizacionDetalleEventoPromise = cotizacionDetalle(cotizacionId);

            const [cotizacion, configuracion, condicionesComerciales, cotizacionDetalleEvento] = await Promise.all([
                cotizacionPromise,
                configuracionPromise,
                condicionesComercialesPromise,
                cotizacionDetalleEventoPromise
            ]);

            if (cotizacion) {
                setNombreCotizacion(cotizacion.nombre || '');
                setCondicionComercialId(cotizacion.condicionesComercialesId ?? '');
                setMetodoPagoId(cotizacion.condicionesComercialesMetodoPagoId ?? '');
                const serviciosCotizacion = await obtenerCotizacionServicios(cotizacionId);

                // Obtener los servicios
                const serviciosData = await Promise.all(serviciosCotizacion.map(async (servicio: { servicioId: string; cantidad: number; posicion: number; servicioCategoriaId: string; }) => {
                    const servicioData = await obtenerServicio(servicio.servicioId);
                    return {
                        ...servicioData,
                        cantidad: servicio.cantidad,
                        nombre: servicioData?.nombre || '',
                        posicion: servicio.posicion,
                        servicioCategoriaId: servicio.servicioCategoriaId,
                    };
                }));
                setServicios(serviciosData);
            }

            if (configuracion) {
                setSobreprecioPorcentaje(configuracion.sobreprecio);
                setComisionVentaPorcentaje(configuracion.comision_venta);
            }

            if (condicionesComerciales) {
                const updatedCondicionesComerciales = await Promise.all(condicionesComerciales.map(async (condicion) => {
                    const metodos_pago_condicion = await obtenerCondicionesComercialesMetodosPago(condicion.id);
                    const metodos_pago_con_nombre = await Promise.all(metodos_pago_condicion.map(async (metodo) => {
                        const metodo_pago = await obtenerMetodoPago(metodo.metodoPagoId);
                        return {
                            ...metodo,
                            metodo_pago: metodo_pago?.metodo_pago || '',
                            num_msi: metodo_pago?.num_msi || 0,
                            orden: metodo.orden || 0,
                            comision_porcentaje_base: metodo_pago?.comision_porcentaje_base,
                            comision_fija_monto: metodo_pago?.comision_fija_monto,
                            comision_msi_porcentaje: metodo_pago?.comision_msi_porcentaje,
                        };
                    }));
                    metodos_pago_con_nombre.sort((a, b) => Number(a.orden ?? 0) - Number(b.orden ?? 0));
                    return { ...condicion, metodosPago: metodos_pago_con_nombre };
                }));
                setCondicionesComerciales(updatedCondicionesComerciales);
            }

            if (cotizacionDetalleEvento) {
                setNombreCliente(cotizacionDetalleEvento.cliente?.nombre || '');
                setTipoEvento(cotizacionDetalleEvento.eventoTipo?.nombre || '');
                setNombreEvento(cotizacionDetalleEvento.evento?.nombre || '');
                setFechaEvento(cotizacionDetalleEvento.evento?.fecha_evento ? cotizacionDetalleEvento.evento.fecha_evento.toISOString() : '');

            }

            setLoading(false);
        }
        fetchData();
    }, [cotizacionId]);


    //! Calcular totales
    const calcularTotal = useCallback((servicios: Servicio[]) => {
        const precioSistema = servicios.reduce((total, servicio) => total + (servicio.precio_publico || 0) * (servicio.cantidad || 1), 0);
        const num_msi = metodoPago?.num_msi || 0;
        const pago_mensual = num_msi > 0 ? precioSistema / num_msi : 0;
        const descuento = precioSistema * ((condicionComercial?.descuento ?? 0) / 100);
        const precio_final = precioSistema - descuento;

        setMetodoPago(metodoPago);
        setMsi(num_msi);
        setPagoMensual(pago_mensual);
        setDescuento(descuento);
        setPrecioFinal(precio_final);
        setTotalPrecioSistema(precioSistema);

    }, [condicionComercial, metodoPago]);


    //! Obtener condición comercial y método de pago para llamar handleSeleccionCondicionMetodoPago y mostrar los datos
    useEffect(() => {
        if (condicionesComercialesId && metodoPagoId) {
            const condicion = condicionesComerciales.find(cond => cond.id === condicionesComercialesId);
            const metodo = condicion?.metodosPago?.find(mp => mp.id === metodoPagoId);
            if (condicion && metodo) {
                handleSeleccionCondicionMetodoPago(condicion, metodo);
            }
        }
    }, [condicionesComercialesId, metodoPagoId, condicionesComerciales]);

    //! calcular totales cuando se actualiza la lista
    useEffect(() => {
        calcularTotal(servicios);
    }, [servicios, sobreprecioPorcentaje, comisionVentaPorcentaje, condicionComercial, metodoPago, metodoPagoId, calcularTotal]);

    const handleSeleccionCondicionMetodoPago = (condicion: CondicionesComerciales, metodo: MetodoPago) => {
        setMetodoPagoId(metodo.id);
        setMetodoPago(metodo);
        setCondicionComercial(condicion);
        setCondicionComercialId(condicion.id);
    }

    return (
        <div>
            {loading ? (
                <div className="flex justify-center items-center h-screen">
                    <p>Cargando...</p>
                </div>
            ) : (
                <div className=''>


                    {/* HEADER */}
                    <div className='flex justify-between items-center font-Bebas-Neue border-b border-dotted border-b-zinc-600 px-5 py-2 bg-zinc-900/90'>
                        <div className='flex text-2xl text-zinc-300'>
                            <Image className='mr-2' src='https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/logos/isotipo_gris.svg' width={20} height={20} alt='Logo' />
                            ProSocial
                        </div>
                        <p className='text-2xl uppercase text-zinc-700'>
                            Cotización
                        </p>
                    </div>

                    {/* MENSAJE */}
                    <div className='mt-8 p-5'>
                        <p className='text-left text-4xl font-Bebas-Neue mb-2 text-zinc-200'>
                            Hola {nombreCliente},
                        </p>
                        <p className='text-left max-w-screen-md mx-auto text-zinc-500'>
                            Te compartimos tu presupuesto <span className='uppercase font-semibold text-zinc-200'>{nombreCotizacion}</span> para el evento de {tipoEvento} de <span className='underline uppercase text-zinc-200'>{nombreEvento}</span> que celebrarás el {new Date(fechaEvento).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
                        </p>
                    </div>


                    <div className='md:grid md:grid-cols-2 gap-4 max-w-screen-lg mx-auto p-5'>

                        {/* WISHLIST */}
                        <div className=''>
                            <p className='text-xl text-zinc-500 mb-3'>
                                ¿Qué servicios incluye?
                            </p>
                            <Wishlist servicios={servicios} />
                        </div>

                        {/* INFORMACIÓN DE LA COTIZACION */}
                        <div className=''>
                            <div className=''>
                                <p className='text-xl text-zinc-500 mb-3'>
                                    Proyección financiera
                                </p>
                            </div>

                            {/* //! TOTAL A PAGAR */}
                            <div className='mb-3 border border-zinc-400 p-5 rounded-md'>
                                <div>

                                    <div className=''>

                                        <div>
                                            <div className='flex'>
                                                <p className={`text-3xl mr-5 ${descuento > 0 ? 'line-through' : ''}`}>
                                                    {(isNaN(totalPrecioSistema) ? 0 : totalPrecioSistema).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                                </p>

                                                {descuento > 0 && (
                                                    <p className='text-3xl'>
                                                        {precioFinal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                                    </p>
                                                )}
                                            </div>

                                            {descuento > 0 && (
                                                <p className='text-zinc-900 mt-2 py-2 px-2 leading-3 bg-yellow-500 inline-block'>DESC.{condicionComercial?.descuento}% OFF
                                                    <span className='font-bold ml-1'>
                                                        {descuento.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                                    </span>
                                                </p>
                                            )}

                                            {msi > 0 && (
                                                <p>{msi} pagos de {pagoMensual.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} cada uno</p>
                                            )}

                                            {condicionComercial?.nombre && (
                                                <div className=''>
                                                    <p className='pt-3 text-sm'>Condiciones comerciales:  <span className='text-zinc-600'> {condicionComercial?.nombre}. {condicionComercial?.descripcion}</span></p>
                                                </div>
                                            )}
                                        </div>

                                    </div>

                                </div>
                            </div>

                            {/* //! CONDICIONES COMERCIALES */}
                            <div className='mb-5'>

                                <p className='text-xl text-zinc-500 mb-3'>
                                    Condiciones comerciales
                                </p>

                                {condicionesComerciales.map((condicion, index) => (
                                    <div key={index} className='mb-3 px-5 py-3 bg-zinc-900 border border-zinc-800 rounded-md'>
                                        <p className='text-md text-zinc-300'>
                                            {condicion.nombre}
                                        </p>
                                        {condicion.descripcion && (
                                            <p className='text-[14px] mb-3 italic text-zinc-500'>
                                                {condicion.descripcion}
                                            </p>
                                        )}
                                        {/* //! Buscar metodo pago  */}
                                        <div className='flex justify-start gap-5'>
                                            {condicion.metodosPago && condicion.metodosPago.map((metodo, metodoIndex) => (
                                                <div key={metodoIndex} className='text-sm text-zinc-500'>
                                                    <input
                                                        type="radio"
                                                        id={`metodo-${condicion.id}-${metodoIndex}`}
                                                        name={`metodo-${condicion.id}`}
                                                        value={metodo.metodo_pago}
                                                        checked={metodoPagoId === metodo.id}
                                                        className='mr-2'
                                                        onChange={() => handleSeleccionCondicionMetodoPago(condicion, metodo)}
                                                    />

                                                    <label htmlFor={`metodo-${condicion.id}-${metodoIndex}`}>
                                                        {metodo.metodo_pago}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>

                                    </div>
                                ))}

                            </div>

                            <div>
                                {condicionesComercialesId === 'cm422ulc90001mvbejtvr21zr' ? (
                                    <button className='bg-blue-600 w-full px-3 py-3 font-semibold rounded-md uppercase text-sm'>
                                        Reservar ahora
                                    </button>
                                ) : (
                                    <button className='bg-purple-600 w-full px-3 py-3 font-semibold rounded-md uppercase text-sm'>

                                        Pagar el total ahora
                                    </button>
                                )}
                            </div>


                        </div>

                    </div>
                    {/* <Galeria
                        bucked={'vestido'}
                    /> */}
                </div>

            )}
        </div>
    )
}