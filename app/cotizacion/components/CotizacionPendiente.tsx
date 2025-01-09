'use client';
import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation';
import { obtenerCondicionesComercialesMetodosPago } from '@/app/admin/_lib/condicionesComerciales.actions';
import { obtenerMetodoPago } from '@/app/admin/_lib/metodoPago.actions';
import { Servicio, MetodoPago, CondicionesComerciales, ServicioCategoria } from '@/app/admin/_lib/types'
import { cotizacionDetalle } from '@/app/admin/_lib/cotizacion.actions';
import { ChevronDown, ChevronUp } from 'lucide-react';
import SkeletonPendiente from './skeletonPendiente';
import Contrato from './Contrato';
import Wishlist from './Wishlist';
// import { obtenerConfiguracionActiva } from '@/app/admin/_lib/configuracion.actions'
// import { obtenerServicio } from '@/app/admin/_lib/servicio.actions'
// import { obtenerCotizacionServicios } from '@/app/admin/_lib/cotizacion.actions';
import { registrarVisita } from '@/app/admin/_lib/cotizacionVisita.actions';

interface Props {
    cotizacionId: string
}

export default function CotizacionPendiente({ cotizacionId }: Props) {

    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [totalPrecioSistema, setTotalPrecioSistema] = useState(0);
    const [nombreCotizacion, setNombreCotizacion] = useState('');
    const [servicios, setServicios] = useState<Servicio[]>([]);
    const [condicionComercial, setCondicionComercial] = useState<CondicionesComerciales | null>(null);
    const [metodoPago, setMetodoPago] = useState<MetodoPago | null>(null);
    const [msi, setMsi] = useState(0);
    const [pagoMensual, setPagoMensual] = useState(0);
    const [descuento, setDescuento] = useState(0);
    const [precioFinal, setPrecioFinal] = useState(0);
    const [condicionesComerciales, setCondicionesComerciales] = useState([] as CondicionesComerciales[]);

    const [nombreCliente, setNombreCliente] = useState('');
    const [emailCliente, setEmailCliente] = useState('');
    const [telefonoCliente, setTelefonoCliente] = useState('');
    const [clienteId, setClienteId] = useState('');
    const [tipoEvento, setTipoEvento] = useState('');
    const [fechaEvento, setFechaEvento] = useState<Date | null>(null);
    const [nombreEvento, setNombreEvento] = useState('');

    const [confirmacionContrato, setConfirmacionContrato] = useState(false);
    const [toggleContrato, setToggleContrato] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const [metodoPagoId, setMetodoPagoId] = useState<string | undefined>('');
    const [condicionComercialesId, setCondicionComercialId] = useState<string | undefined>('');

    const [porcentajeAnticipo, setPorcentajeAnticipo] = useState(0);
    const [pagoAnticipo, setPagoAnticipo] = useState(0);
    const [categorias, setCategorias] = useState<ServicioCategoria[]>([])

    const [fromLista, setFromLista] = useState(false);

    useEffect(() => {
        async function fetchData() {

            setLoading(true);
            const {
                cotizacion,
                evento,
                eventoTipo,
                cliente,
                servicios,
                ServicioCategoria,
                cotizacionServicio,
                condicionesComerciales,
            } = await cotizacionDetalle(cotizacionId);

            if (cotizacion) {

                setNombreCotizacion(cotizacion.nombre || '');
                setCondicionComercialId(cotizacion?.condicionesComercialesId ?? '');
                setMetodoPagoId(cotizacion?.condicionesComercialesMetodoPagoId ?? '');

                if (cotizacion?.condicionesComercialesId && cotizacion?.condicionesComercialesMetodoPagoId) {
                    const url = new URL(window.location.href);
                    url.searchParams.set('condicionComercialId', cotizacion?.condicionesComercialesId);
                    url.searchParams.set('metodoPagoId', cotizacion?.condicionesComercialesMetodoPagoId);
                    window.history.replaceState(null, '', url.toString());
                }

                const serviciosData = await Promise.all(cotizacionServicio.map(async (servicio: { servicioId: string; cantidad: number; posicion: number; servicioCategoriaId: string; }) => {
                    const servicioData = servicios.find(servicioData => servicioData.id === servicio.servicioId);
                    return {
                        ...servicioData,
                        cantidad: servicio.cantidad,
                        nombre: servicioData?.nombre || '',
                        posicion: servicio.posicion,
                        servicioCategoriaId: servicio.servicioCategoriaId,
                    };
                }));
                setServicios(serviciosData);
                setCategorias(ServicioCategoria);
            }

            if (Array.isArray(condicionesComerciales)) {
                const updatedCondicionesComerciales = await Promise.all(condicionesComerciales.map(async (condicion: CondicionesComerciales) => {
                    const metodos_pago_condicion = await obtenerCondicionesComercialesMetodosPago(condicion.id!);
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
                            payment_method: metodo_pago?.payment_method,
                        };
                    }));
                    metodos_pago_con_nombre.sort((a, b) => Number(a.orden ?? 0) - Number(b.orden ?? 0));
                    return { ...condicion, metodosPago: metodos_pago_con_nombre };
                }));
                setCondicionesComerciales(updatedCondicionesComerciales);
            }

            if (cliente) {
                setClienteId(cliente?.id || '');
                setNombreCliente(cliente?.nombre || '');
                setEmailCliente(cliente?.email || '');
                setTelefonoCliente(cliente?.telefono || '');
                setNombreCotizacion(cotizacion?.nombre || '');
                setTipoEvento(eventoTipo?.nombre || '');
                setNombreEvento(evento?.nombre || '');
                setFechaEvento(evento?.fecha_evento || null);
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

        setMsi(num_msi);
        setPagoMensual(pago_mensual);
        setDescuento(descuento);
        setPrecioFinal(precio_final);
        setTotalPrecioSistema(precioSistema);

        const pagoAnticipo = precio_final * (condicionComercial?.porcentaje_anticipo || 0) / 100;
        setPagoAnticipo(pagoAnticipo);
        setPorcentajeAnticipo(condicionComercial?.porcentaje_anticipo || 0);

    }, [condicionComercial, metodoPago]);

    //! Obtener condición comercial y método de pago para llamar handleSeleccionCondicionMetodoPago y mostrar los datos
    useEffect(() => {

        const urlParams = new URLSearchParams(window.location.search);
        const condicionComercialIdFromUrl = urlParams.get('condicionComercialId');
        const metodoPagoIdFromUrl = urlParams.get('metodoPagoId');
        const fromListaParam = urlParams.get('param');
        const isPrev = urlParams.get('preview');


        if (!isPrev && process.env.NODE_ENV !== 'development') {
            registrarVisita(cotizacionId);
        }

        // REVISAR SI VIENE DE LISTA
        if (fromListaParam) {
            setFromLista(fromListaParam === 'lista');
        }

        if (condicionComercialIdFromUrl) {
            setCondicionComercialId(condicionComercialIdFromUrl);
        } else {
            setCondicionComercialId(condicionComercial?.id || '');
        }

        if (metodoPagoIdFromUrl) {
            setMetodoPagoId(metodoPagoIdFromUrl);
        } else {
            setMetodoPagoId(metodoPago?.id || '');
        }



        if (condicionComercialesId && metodoPagoId) {
            const condicion = condicionesComerciales.find(cond => cond.id === condicionComercialesId);
            const metodo = condicion?.metodosPago?.find(mp => mp.id === metodoPagoId);
            if (condicion && metodo) {
                handleSeleccionCondicionMetodoPago(condicion, metodo);
            }
        }

    }, [cotizacionId, condicionComercialesId, metodoPagoId, condicionesComerciales, condicionComercial?.id, metodoPago?.id]);

    //! calcular totales cuando se actualiza la lista
    useEffect(() => {
        calcularTotal(servicios);
    }, [servicios, condicionComercial, metodoPago, metodoPagoId, calcularTotal]);

    const handleSeleccionCondicionMetodoPago = (condicion: CondicionesComerciales, metodo: MetodoPago) => {
        setMetodoPagoId(metodo.id);
        setMetodoPago(metodo);
        setMsi(metodo.num_msi || 0);
        setCondicionComercial(condicion);
        setCondicionComercialId(condicion.id);
        const url = new URL(window.location.href);
        url.searchParams.set('condicionComercialId', condicion.id || '');
        url.searchParams.set('metodoPagoId', metodo.id || '');
        window.history.replaceState(null, '', url.toString());
    }

    const checkout = async () => {

        setIsProcessing(true);

        let concepto = '';
        if (porcentajeAnticipo > 0 && porcentajeAnticipo < 100) {
            concepto = `Pago del ${porcentajeAnticipo}% del servicio de ${tipoEvento} ${nombreEvento}`;
        } else if (porcentajeAnticipo === 100) {
            concepto = `Pago total del servicio de ${tipoEvento} ${nombreEvento}`;
        }
        const descripcion = `Fecha compromiso para el ${fechaEvento ? new Date(fechaEvento.getTime() + 86400000).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''} ${metodoPago?.num_msi ? '. ' + metodoPago?.num_msi + ' MSI' : ''}. ${condicionComercial?.nombre}. ${condicionComercial?.descripcion}`;

        try {

            //! Procesar pago con tarjeta
            const datosPagoTarjeta = {
                monto: parseFloat(pagoAnticipo.toFixed(2)),
                concepto,
                descripcion,
                paymentMethod: metodoPago?.payment_method || '',
                num_msi: metodoPago?.num_msi?.toString() ?? '0',
                cotizacionId,
                condicionComercialesId,
                metodoPagoId,
                clienteId,
                nombreCliente,
                emailCliente,
                telefonoCliente,
            };

            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datosPagoTarjeta),
            });

            const data = await response.json();

            if (response.ok) {
                window.location.href = data.url;
            } else {
                console.error('Error:', data.error);
            }

        } catch (error) {
            console.error('Error al procesar el pago:', error);
            setIsProcessing(false);
        }
    }

    const handleRegresar = () => {
        router.back()
    }

    return (
        <div >
            {loading ? (
                <SkeletonPendiente />
            ) : (
                <div className=''>
                    <div className={`max-w-screen-sm mx-auto`}>

                        <div>
                            {fromLista &&
                                <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 mt-4 z-20">
                                    <div className="relative">
                                        <button onClick={handleRegresar} className="relative z-10 px-4 py-3 text-white bg-red-700 rounded-full hover:bg-red-600 text-sm">
                                            Cerrar ventana
                                        </button>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-full h-full bg-red-500 rounded-full animate-ping opacity-50"></div>
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>

                        {/* MENSAJE INICIAL */}
                        {!fromLista ? (
                            <div className='mt-8 p-5'>
                                <p className='text-left text-4xl font-Bebas-Neue mb-2 text-zinc-200'>
                                    Hola {nombreCliente},
                                </p>
                                <p className='text-left  mx-auto text-zinc-500'>
                                    Te compartimos tu cotización <span className='uppercase font-semibold text-zinc-200'>{nombreCotizacion}</span> para el evento de {tipoEvento} de <span className='underline uppercase text-zinc-200'>{nombreEvento}</span> que celebrarás el {fechaEvento ? new Date(fechaEvento.getTime() + 86400000).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}.
                                </p>
                            </div>
                        ) : (
                            <div className='mt-8 p-5'>
                                <p className='uppercase text-left text-2xl font-Bebas-Neue text-zinc-200'>
                                    <span className='uppercase font-semibold text-zinc-200'>{nombreCotizacion}</span>
                                </p>
                                <p className='text-left  mx-auto text-zinc-500'>
                                    para el evento de {tipoEvento} de <span className='underline uppercase text-zinc-200'>{nombreEvento}</span> que celebrarás el {fechaEvento ? new Date(fechaEvento.getTime() + 86400000).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}.
                                </p>
                            </div>
                        )}

                        <div className='mx-auto p-5'>

                            {/* //! WISHLIST */}
                            <div className='mb-10'>
                                <p className='text-xl text-zinc-500 mb-2'>
                                    ¿Qué servicios incluye?
                                </p>
                                <div className='bg-zinc-900 border border-zinc-600 p-3 rounded-md mb-5'>

                                    <Wishlist
                                        servicios={servicios}
                                        categorias={categorias}
                                    />
                                </div>
                            </div>


                            {/* //! CONDICIONES COMERCIALES */}
                            <div className='mb-10'>
                                <p className='text-xl text-zinc-500 mb-3'>
                                    Elige una condición comercial
                                </p>

                                {condicionesComerciales.map((condicion, index) => (

                                    <div key={index} className={`mb-3 px-5 py-3 ${condicion.id === condicionComercialesId && condicionComercialesId && metodoPagoId ? 'border-blue-500 bg-zinc-700/50 ' : 'border-zinc-800'} ${!condicion.id ? 'border-zinc-800' : ''} bg-zinc-900 border rounded-md`}>
                                        <p className='text-md text-zinc-300'>
                                            {condicion.nombre}
                                        </p>

                                        {condicion.descripcion && (
                                            <p className='text-[14px] mb-2 italic text-zinc-500'>
                                                {condicion.descripcion}
                                            </p>
                                        )}
                                        {/* //! Buscar metodo pago  */}
                                        <div className='flex justify-start gap-5'>

                                            {condicion.metodosPago && condicion.metodosPago.map((metodo, metodoIndex) => {
                                                if (metodo.metodo_pago === 'Efectivo') {
                                                    return null;
                                                }
                                                return (
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
                                                );
                                            })}

                                        </div>
                                    </div>
                                ))}

                            </div>

                            <div className=''>

                                {/* //! TOTAL A PAGAR */}
                                <p className='text-xl text-zinc-500 mb-2'>
                                    Proyección financiera
                                </p>

                                <div className='border border-zinc-400 p-5 rounded-md'>

                                    <div className='flex'>
                                        <p className={`text-3xl mr-5 ${descuento > 0 ? 'line-through text-zinc-500' : ''}`}>
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

                                    {metodoPagoId && porcentajeAnticipo < 100 && (
                                        <p className='text-blue-500 mt-2 '>
                                            Anticipo del {porcentajeAnticipo}%: <span className='font-semibold'>{pagoAnticipo.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
                                        </p>
                                    )}

                                    {condicionComercial?.nombre && (
                                        <div className=''>
                                            <p className='pt-3 text-sm'>Condiciones comerciales:  <span className='text-zinc-600'> {condicionComercial?.nombre}. {condicionComercial?.descripcion}</span></p>
                                        </div>
                                    )}
                                </div>

                                {/* //!VER CONTRATO */}
                                {metodoPagoId && (
                                    <div className='mt-5 border border-zinc-600 rounded-md mb-5 '>

                                        <button
                                            className={`${metodoPagoId ? '' : 'bg-zinc-600'} w-full px-3 py-3 font-semibold rounded-md text-sm flex items-center text-zinc-200 justify-start`}
                                            disabled={!metodoPagoId}
                                            onClick={() => setToggleContrato(prev => !prev)}
                                        >
                                            {toggleContrato ? 'Ocultar borrador del contrato' : 'Revisar borrador de contrato antes de pagar'}
                                            {toggleContrato ? <ChevronUp className="ml-2" /> : <ChevronDown className="ml-2" />}
                                        </button>

                                        {toggleContrato && (
                                            <div className="">
                                                <Contrato
                                                    nombreCliente={nombreCliente}
                                                    nombreEvento={nombreEvento}
                                                    tipoEvento={tipoEvento}
                                                    fechaEvento={fechaEvento || new Date()}
                                                    condicionesComerciales={condicionComercial?.nombre || ''}
                                                    totalPrecioSistema={totalPrecioSistema}
                                                    descuento={descuento}
                                                    precioFinal={precioFinal}
                                                />

                                                <button
                                                    className={`${metodoPagoId ? '' : 'bg-zinc-600'} w-full px-3 py-3 font-semibold rounded-md text-sm flex items-center text-zinc-200 justify-start`}
                                                    disabled={!metodoPagoId}
                                                    onClick={() => setToggleContrato(prev => !prev)}
                                                >
                                                    {toggleContrato ? 'Ocultar borrador del contrato' : 'Revisar borrador de contrato antes de pagar'}
                                                    {toggleContrato ? <ChevronUp className="ml-2" /> : <ChevronDown className="ml-2" />}
                                                </button>

                                            </div>
                                        )}
                                    </div>
                                )}

                            </div>

                            {metodoPagoId ? (
                                <>
                                    {/* //! CONFIRMACIÓN CONDICIONES CONTRATO */}
                                    <div className='p-2 mb-5 leading-5 text-sm'>
                                        <label htmlFor="confirmacionContrato" className="flex items-center cursor-pointer">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    id="confirmacionContrato"
                                                    checked={confirmacionContrato}
                                                    onChange={(e) => setConfirmacionContrato(e.target.checked)}
                                                    className="sr-only"
                                                />
                                                <div className={`block w-14 h-8 rounded-full ${confirmacionContrato ? 'bg-green-600' : 'bg-zinc-600'}`}></div>
                                                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${confirmacionContrato ? 'transform translate-x-full bg-blue-600' : ''}`}></div>
                                            </div>
                                            <span className="ml-3 text-gray-200">Confirmo haber leído el contrato y estoy de acuerdo con los términos y condiciones.</span>
                                        </label>
                                    </div>

                                    {/* //!CHECKOUT */}
                                    <button
                                        className={`${confirmacionContrato ? 'bg-blue-600' : 'bg-zinc-600'} w-full px-3 py-3 font-semibold rounded-md uppercase text-sm flex items-center text-zinc-200 justify-center mt-3`}
                                        disabled={!confirmacionContrato || isProcessing}
                                        onClick={checkout}
                                    >
                                        {isProcessing ? 'Procesando...' : porcentajeAnticipo === 100 ? 'Pagarás el total' : `Pagarás el ${porcentajeAnticipo}% de anticipo ${pagoAnticipo.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`}
                                    </button>
                                </>
                            ) :
                                (
                                    <div className='p-5 mb-10'>
                                        <p className='text-red-500'>Selecciona una condición comercial y método de pago para continuar.</p>
                                    </div>
                                )
                            }

                        </div>


                    </div>
                </div>

            )}
        </div>
    )
}