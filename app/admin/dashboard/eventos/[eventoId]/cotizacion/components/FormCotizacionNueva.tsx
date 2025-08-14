'use client';
import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'

import { CondicionesComerciales, Servicio, PaqueteServicio, MetodoPago } from '@/app/admin/_lib/types'

import { obtenerCondicionesComercialesActivas, obtenerCondicionesComercialesMetodosPago } from '@/app/admin/_lib/condicionesComerciales.actions';
import { obtenerPaquete, obtenerServiciosPorPaquete } from '@/app/admin/_lib/paquete.actions'
import { obtenerConfiguracionActiva } from '@/app/admin/_lib/configuracion.actions'
import { obtenerServicio } from '@/app/admin/_lib/servicio.actions'
import { obtenerTipoEvento } from '@/app/admin/_lib/eventoTipo.actions'
import { obtenerMetodoPago } from '@/app/admin/_lib/metodoPago.actions';
import { crearCotizacion, crearCotizacionAutorizada } from '@/app/admin/_lib/cotizacion.actions';
import { crearPago } from '@/app/admin/_lib/pago.actions';

// import Wishlist from './Wishlist'
// import ListaServicios from './ListaServicios'
import { X } from 'lucide-react';

export default function FormCotizacionNueva() {

    const router = useRouter();
    const [loading, setLoading] = useState(true); // Estado de carga

    const searchParams = useSearchParams();
    const eventoId = searchParams ? searchParams.get('eventoId') : null; //para asociar la cotizacion a un evento
    const paqueteId = searchParams ? searchParams.get('paqueteId') : null;
    const eventoTipoId = searchParams ? searchParams.get('eventoTipoId') : null;
    const clienteId = searchParams ? searchParams.get('clienteId') : null;

    const [eventoTipo, setEventoTipo] = useState<string | undefined>('');
    const [nombreCotizacion, setNombreCotizacion] = useState('');
    const [sobreprecioPorcentaje, setSobreprecioPorcentaje] = useState(0);
    const [comisionVentaPorcentaje, setComisionVentaPorcentaje] = useState(0);
    const [totalPrecioSistema, setTotalPrecioSistema] = useState(0);

    const [servicios, setServicios] = useState<Servicio[]>([]);
    const [listaBackup, setListaBackup] = useState<Servicio[]>([]);

    const [condicionComercial, setCondicionComercial] = useState<CondicionesComerciales | null>(null);
    const [metodoPago, setMetodoPago] = useState<MetodoPago | null>(null);
    const [msi, setMsi] = useState(0);
    const [pagoMensual, setPagoMensual] = useState(0);
    const [descuento, setDescuento] = useState(0);
    const [precioFinal, setPrecioFinal] = useState(0);
    const [utilidadDeVenta, setUtilidadDeVenta] = useState(0);
    const [utilidadSistema, setUtilidadSistema] = useState(0);
    const [guardandoCotizacion, setGuardandoCotizacion] = useState(false);
    const [errors, setErrors] = useState({
        nombre: '',
    });

    const [condicionesComerciales, setCondicionesComerciales] = useState([] as CondicionesComerciales[]);
    const [codigoCotizacion, setCodigoCotizacion] = useState('');
    const [errorPrecioFinal, setErrorPrecioFinal] = useState(false);

    //!added
    const [pagoAnticipo, setPagoAnticipo] = useState(0);
    const [pagandoEfectivo, setPagandoEfectivo] = useState(false);
    const [confirmarMonto, setConfirmarMonto] = useState('');
    const [confirmarPorcentajeAnticipo, setConfirmarPorcentajeAnticipo] = useState('');
    const [pagoPendiente, setPagoPendiente] = useState(0);
    const [metodoPagoId, setMetodoPagoId] = useState<string | undefined>('');
    const [condicionesComercialesId, setCondicionComercialId] = useState<string | undefined>('');
    const [errorConfirmarMonto, setErrorConfirmarMonto] = useState(false);
    const [errorMonto, setErrorMonto] = useState('');

    useEffect(() => {

        // Obtener datos del paquete
        async function fetchDataPaquete() {

            setLoading(true);

            // Obtener tipo evento
            if (eventoTipoId) {
                const tipo_evento = await obtenerTipoEvento(eventoTipoId);
                setEventoTipo(tipo_evento?.nombre);
            }

            if (paqueteId) {
                const paquete = await obtenerPaquete(paqueteId);
                setNombreCotizacion(paquete?.nombre || '');
            }

            // Obtener servicios del paquete
            const PaqueteServicio = paqueteId ? await obtenerServiciosPorPaquete(paqueteId) : [];

            // Obtener servicios y asegurar que se asignen al arreglo: id == servicioId
            const servicios = await Promise.all(PaqueteServicio.map(async (paqueteServicio: PaqueteServicio) => {
                const servicio = await obtenerServicio(paqueteServicio.servicioId);
                return servicio ? { ...servicio, ...paqueteServicio, id: paqueteServicio.servicioId, nombre: servicio.nombre || '' } : { ...paqueteServicio, id: paqueteServicio.servicioId, nombre: '' };
            }));

            setServicios(servicios);
            setListaBackup(servicios);
            setLoading(false);
        }
        fetchDataPaquete();

        // Obtener configuración activa
        obtenerConfiguracionActiva().then(async configuracion => {
            if (configuracion) {
                setSobreprecioPorcentaje(configuracion.sobreprecio);
                setComisionVentaPorcentaje(configuracion.comision_venta);
            }
        });

        // Obtener condiciones comerciales
        obtenerCondicionesComercialesActivas().then(async condicionesComerciales => {
            if (condicionesComerciales) {
                const updatedCondicionesComerciales = await Promise.all(condicionesComerciales.map(async (condicion) => {
                    // Obtener los métodos de pago para cada condición comercial
                    const metodos_pago_condicion = await obtenerCondicionesComercialesMetodosPago(condicion.id);

                    // Obtener el nombre del método de pago
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

                    //ordenar arreglo por orden
                    metodos_pago_con_nombre.sort((a, b) => Number(a.orden ?? 0) - Number(b.orden ?? 0));

                    // Retornar la condición con los métodos de pago y nombre
                    return { ...condicion, metodosPago: metodos_pago_con_nombre };
                }));
                setCondicionesComerciales(updatedCondicionesComerciales);
            }
        });

    }, [eventoTipoId, paqueteId]);

    const handleUpdateWhishlist = (servicio: Servicio) => {
        const servicioExistente = servicios.find(s => s.id === servicio.id);
        if (servicioExistente) {
            if (servicio.cantidad === 0) {
                setServicios(prevServicios => prevServicios.filter(s => s.id !== servicio.id));
            } else {
                setServicios(prevServicios =>
                    prevServicios.map(s =>
                        s.id === servicio.id ? servicio : s
                    )
                );
            }
        }
        calcularTotal(servicios);
    }

    const handleAgregarServicio = (servicio: Servicio) => {
        const servicioExistente = servicios.find(s => s.id === servicio.id);
        if (servicioExistente) {
            setServicios(prevServicios =>
                prevServicios.map(s =>
                    s.id === servicio.id ? { ...s, cantidad: (s.cantidad || 1) + 1 } : s
                )
            );
        } else {
            setServicios(prevServicios => {
                servicio.cantidad = 1;
                const nuevoServicio = servicio;
                return [...prevServicios, nuevoServicio];
            });
        }
    }

    //! Calcular totales
    const calcularTotal = useCallback((servicios: Servicio[]) => {

        setPrecioFinal(0);
        setErrorPrecioFinal(false);
        setErrors(prevErrors => ({ ...prevErrors, nombre: '' }));

        const totalCostos = servicios.reduce((total, servicio) => total + (servicio.costo || 0) * (servicio.cantidad || 1), 0);
        const totalGastos = servicios.reduce((total, servicio) => total + (servicio.gasto || 0) * (servicio.cantidad || 1), 0);
        const precioSistema = servicios.reduce((total, servicio) => total + (servicio.precio_publico || 0) * (servicio.cantidad || 1), 0);
        const utilidadSistema = servicios.reduce((total, servicio) => total + (servicio.utilidad || 0) * (servicio.cantidad || 1), 0);//desc sobreprecio aplicado

        const num_msi = metodoPago?.num_msi || 0;
        const comision_porcentaje_base = metodoPago?.comision_porcentaje_base
        const comision_fija_monto = metodoPago?.comision_fija_monto
        const comision_msi_porcentaje = metodoPago?.comision_msi_porcentaje

        const pago_mensual = num_msi > 0 ? precioSistema / num_msi : 0;
        const descuento = precioSistema * ((condicionComercial?.descuento ?? 0) / 100);
        const precio_final = precioSistema - descuento;

        const comision_stripe = (
            (comision_fija_monto ?? 0) +
            (precio_final * Number((comision_porcentaje_base ?? 0) / 100))
        )

        const comision_pago_cuotas = (
            (precio_final * Number((comision_msi_porcentaje ?? 0) / 100))
        )

        const comisionVentaMonto = precio_final * (comisionVentaPorcentaje / 100);
        const utilidadDeVenta = precio_final - totalCostos - totalGastos - comisionVentaMonto - comision_stripe - comision_pago_cuotas;
        const perdida_ganancia = utilidadDeVenta - utilidadSistema;

        let codigo_cotizacion =
            `UBS${Math.floor(utilidadSistema)}-UBV${Math.floor(utilidadDeVenta)}`;

        if (perdida_ganancia < 0) {
            codigo_cotizacion += `-P${Math.floor(perdida_ganancia)}`;
        }

        //!added
        if (condicionComercial?.porcentaje_anticipo) {
            const pago_anticipo = precio_final * (condicionComercial.porcentaje_anticipo / 100);

            setPagoAnticipo(pago_anticipo);
            const pagoPendiente = precio_final - pago_anticipo;
            setPagoPendiente(pagoPendiente);

            setConfirmarMonto(pago_anticipo.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }));
            setConfirmarPorcentajeAnticipo(condicionComercial.porcentaje_anticipo.toString());
        }

        setCodigoCotizacion(codigo_cotizacion);
        setMetodoPago(metodoPago);
        setMsi(num_msi);
        setPagoMensual(pago_mensual);
        setDescuento(descuento);
        setPrecioFinal(precio_final);
        setTotalPrecioSistema(precioSistema);
        setUtilidadDeVenta(utilidadDeVenta);
        setUtilidadSistema(utilidadSistema);

    }, [comisionVentaPorcentaje, condicionComercial, metodoPago]);

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
    }, [servicios, sobreprecioPorcentaje, comisionVentaPorcentaje, condicionComercial, metodoPago, calcularTotal]);

    const handleSeleccionCondicionMetodoPago = (condicion: CondicionesComerciales, metodo: MetodoPago) => {
        // console.table(metodo.metodoPagoId);
        setMetodoPagoId(metodo.id);
        setMetodoPago(metodo);
        setCondicionComercial(condicion);
        setCondicionComercialId(condicion.id);
    }

    //! handle Lista
    const handleVaciarLista = () => {
        if (!confirm('¿Estás seguro de vaciar la lista?')) return
        setServicios([])
    }

    const handleRestaurarLista = () => {
        if (!confirm('¿Estás seguro de restaurar la lista?')) return
        setServicios(listaBackup)
    }

    const handleCrearCotizacion = async () => {

        setGuardandoCotizacion(true);

        if (!nombreCotizacion) {
            setErrors(prevErrors => ({ ...prevErrors, nombre: 'El nombre de la cotización es requerido' }));
            setGuardandoCotizacion(false);
            return;
        } else {
            setErrors(prevErrors => ({ ...prevErrors, nombre: '' }));
        }

        if (precioFinal <= 0) {
            alert('El precio final no puede ser 0');
            setGuardandoCotizacion(false);
            setErrorPrecioFinal(true);
            return;
        }

        const nuevaCotizacion = {
            eventoTipoId: eventoTipoId || '',
            eventoId: eventoId || '',
            nombre: nombreCotizacion.charAt(0).toUpperCase() + nombreCotizacion.slice(1),
            precio: parseFloat(precioFinal.toFixed(2)),
            condicionesComercialesId: condicionComercial?.id,
            condicionesComercialesMetodoPagoId: metodoPago?.id,
            servicios,
            utilidadDeVenta: parseFloat(utilidadDeVenta.toFixed(2)),
            utilidadSistema: parseFloat(utilidadSistema.toFixed(2)),
        }
        // console.log(nuevaCotizacion);
        await crearCotizacion(nuevaCotizacion);
        router.back();

    }

    //! Pago en efectivo
    const handlePagoEfectivo = async () => {
        const confirmar = confirm('¿Estás seguro de confirmar el pago en efectivo?');
        if (confirmar) {

            if (!nombreCotizacion) {
                setErrors(prevErrors => ({ ...prevErrors, nombre: 'El nombre de la cotización es requerido' }));
                setGuardandoCotizacion(false);
                return;
            } else {
                setErrors(prevErrors => ({ ...prevErrors, nombre: '' }));
            }

            if (precioFinal <= 0) {
                alert('El precio final no puede ser 0');
                setGuardandoCotizacion(false);
                setErrorPrecioFinal(true);
                return;
            }

            const nuevaCotizacion = {
                eventoTipoId: eventoTipoId || '',
                eventoId: eventoId || '',
                nombre: nombreCotizacion.charAt(0).toUpperCase() + nombreCotizacion.slice(1),
                precio: parseFloat(precioFinal.toFixed(2)),
                condicionesComercialesId: condicionComercial?.id,
                condicionesComercialesMetodoPagoId: metodoPago?.id,
                servicios,
                utilidadDeVenta: parseFloat(utilidadDeVenta.toFixed(2)),
                utilidadSistema: parseFloat(utilidadSistema.toFixed(2)),
            }

            setPagandoEfectivo(true);
            const result = await crearCotizacionAutorizada(nuevaCotizacion);

            //crear pago
            const pago = {
                cotizacionId: result.cotizacionId,
                clienteId,
                condicionesComercialesId: condicionComercial?.id ?? null,
                condicionesComercialesMetodoPagoId: metodoPago?.id ?? null,
                metodoPagoId: metodoPago?.metodoPagoId ?? null,
                metodo_pago: metodoPago?.metodo_pago ?? '',
                monto: parseFloat(confirmarMonto.replace(/[^0-9.-]+/g, '')),
                concepto: parseFloat(confirmarPorcentajeAnticipo) === 100 ? 'Pago del total del servicio' : `Pago del ${confirmarPorcentajeAnticipo}%  de anticipo`,
                status: 'paid',
            }
            await crearPago(pago);
            router.push(`/admin/dashboard/seguimiento/${eventoId}`);
        }
    }

    const handleConfirmarMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        const value = parseFloat(e.target.value.replace(/[^0-9.-]+/g, ''));
        setConfirmarMonto(e.target.value);

        if (isNaN(value)) {
            setErrorMonto('El monto debe ser un número válido.');
        } else if (value < pagoAnticipo) {
            setErrorMonto('El monto debe ser igual o mayor al monto de anticipo.');
            setErrorConfirmarMonto(true);
        } else if (value > precioFinal) {
            setErrorConfirmarMonto(true);
            setErrorMonto('El monto no puede ser mayor al precio final.');
        } else {
            setErrorConfirmarMonto(true);
            setErrorMonto('');
        }

        const porcentajeAnticipoCalculado = isNaN(value) || isNaN(precioFinal) ? 0 : (value / precioFinal) * 100;
        setConfirmarPorcentajeAnticipo(porcentajeAnticipoCalculado.toFixed(2));

        const pagoPendiente = isNaN(precioFinal) || isNaN(value) ? pagoAnticipo : precioFinal - value;
        setPagoPendiente(pagoPendiente);

        if (isNaN(value) || isNaN(precioFinal)) {
            setErrorConfirmarMonto(true);
        } else {
            setErrorConfirmarMonto(false);
        }

    };

    const handleResetPagoAnticipo = () => {
        setConfirmarMonto(pagoAnticipo.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }));
        setErrorMonto('');
        setConfirmarPorcentajeAnticipo(condicionComercial?.porcentaje_anticipo?.toString() || '');
    }

    return (
        <div>
            {loading ? (
                <div className="flex justify-center items-center h-screen">
                    <p className='text-zinc-500 italic'>Cargando información ...</p>
                </div>
            ) : (
                <div>

                    {/* HEADER */}
                    <div className='flex justify-between items-center mb-5'>
                        <h1 className='text-2xl'>
                            Nueva cotización para {eventoTipo}
                        </h1>
                        <button className='bg-red-700 px-3 py-2 rounded-md' onClick={() => router.back()}>
                            Cancelar
                        </button>
                    </div>

                    <div className='grid grid-cols-3 gap-5'>

                        {/* INFORMACIÓN DE LA COTIZACION */}
                        <div className='sticky top-5'>

                            <p className='text-xl text-zinc-500 mb-5'>
                                Detalles del servicio
                            </p>

                            {/* NOMBRE COTIZACIÓN */}
                            <div className='mb-2 rounded-md bg-zinc-900 border border-yellow-800 px-5 py-2 '>
                                <p className='text-sm text-zinc-500 mb-1'>
                                    Nombre de la cotización
                                </p>
                                <input
                                    type="text"
                                    id="nombreCotizacion"
                                    value={nombreCotizacion}
                                    onChange={(e) => {
                                        const nuevoNombre = e.target.value || 'Personalizada';
                                        setNombreCotizacion(nuevoNombre);
                                    }}
                                    className='w-full text-xl rounded-md bg-zinc-900 border-foreground focus:outline-none'
                                />
                                <p className='text-sm text-red-500'>
                                    {errors.nombre}
                                </p>
                            </div>

                            {/* PRECIO SISTEMA */}
                            <div className='rounded-md bg-zinc-900 border border-zinc-800 px-5 py-2 mb-5'>
                                <div>
                                    <p className='text-sm text-zinc-500 mb-1'>
                                        Precio sistema
                                    </p>
                                    <p className='text-3xl'>
                                        {(isNaN(totalPrecioSistema) ? 0 : totalPrecioSistema).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                    </p>
                                </div>

                            </div>

                            {/* //! CONDICIONES COMERCIALES */}
                            <div className='mb-5'>

                                <p className='text-xl text-zinc-500 mb-3'>
                                    Condiciones comerciales disponibles
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

                                        <div className='flex justify-start gap-5'>
                                            {condicion.metodosPago && condicion.metodosPago.map((metodo, metodoIndex) => (
                                                <div key={metodoIndex} className='text-sm text-zinc-500'>
                                                    <input
                                                        type="radio"
                                                        id={`metodo-${condicion.id}-${metodoIndex}`}
                                                        name={`metodo-${condicion.id}`}
                                                        value={metodo.metodo_pago}
                                                        checked={metodoPago?.id === metodo.id}
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

                            {/* //! TOTAL A PAGAR */}
                            <div className='mb-3 border border-zinc-400 p-5 rounded-md'>
                                <div>
                                    <p className='text-sm text-zinc-500'>
                                        Proyección financiera
                                    </p>
                                    <p className='text-3xl'>
                                        {precioFinal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                    </p>
                                    {descuento > 0 && (
                                        <p className='text-zinc-900 mt-2 py-2 px-2 leading-3 bg-yellow-500 inline-block'>DESC.{condicionComercial?.descuento}% OFF
                                            <span className='font-bold ml-1'>
                                                {descuento.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                            </span>
                                        </p>
                                    )}
                                </div>


                                {msi > 0 && (
                                    <p>{msi} pagos de {pagoMensual.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} cada uno</p>
                                )}

                                {condicionComercial?.nombre && (
                                    <div className='flex items-start'>
                                        <p className='pt-3 text-sm'>Condiciones comerciales:  <span className='text-zinc-600'> {condicionComercial?.nombre}. {condicionComercial?.descripcion}</span></p>
                                        <button
                                            onClick={() => {
                                                setCondicionComercial(null)
                                                setMetodoPago(null)

                                            }}
                                            className='ml-2 pt-4'
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {errorPrecioFinal && (
                                <p className='text-red-500 text-sm mb-5'>
                                    El precio final no puede ser $0.
                                </p>
                            )}

                            {/* //!CONFIRMAR MONTO A PAGAR */}
                            {condicionComercial && (
                                <div className='mb-5'>
                                    <p className='text-xl text-zinc-500 mb-2'>
                                        Confirmar monto a pagar
                                    </p>

                                    <div className='grid grid-cols-2 gap-5 rounded-md bg-zinc-900 p-5'>

                                        <div>
                                            <p className={`text-sm text-${parseFloat(confirmarPorcentajeAnticipo) === 100 ? 'green' : 'yellow'}-500 `}>
                                                {parseFloat(confirmarPorcentajeAnticipo) === 100 ? 'Pago total del servicio' : `Pago del ${confirmarPorcentajeAnticipo}% de anticipo`}
                                            </p>
                                            <input
                                                type="text"
                                                id="monto"
                                                value={confirmarMonto}
                                                onChange={(e) => handleConfirmarMontoChange(e)}
                                                className='w-full  border-foreground focus:outline-none text-2xl bg-zinc-900'
                                                disabled={parseFloat(confirmarPorcentajeAnticipo) === 100}
                                            />
                                            {errorMonto && (
                                                <div className='mt-3 flex items-start'>
                                                    <p className='text-red-500 text-sm'>
                                                        {errorMonto}
                                                    </p>
                                                    <button
                                                        onClick={() => handleResetPagoAnticipo()}
                                                        className='text-[10px] bg-zinc-900 text-red-400 px-2 py-1 rounded-md ml-2 border border-red-500'
                                                    >
                                                        Restaurar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className='text-zinc-500 text-sm'>
                                                Pendiente por pagar:
                                            </p>
                                            <p className='text-2xl'>
                                                {pagoPendiente.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                            </p>

                                        </div>
                                    </div>

                                </div>
                            )}

                            {/* //! PAGO EN EFECTIVO */}
                            {metodoPago?.metodo_pago === 'Efectivo' && (
                                <div>
                                    <button
                                        onClick={() => !pagandoEfectivo && !errorConfirmarMonto && handlePagoEfectivo()}
                                        className={`bg-${errorConfirmarMonto ? 'yellow-700' : 'green-700'} text-white px-3 py-3 w-full rounded-md mb-2 ${pagandoEfectivo ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={pagandoEfectivo || errorConfirmarMonto}
                                    >
                                        {pagandoEfectivo ? 'Un momento por favor...' : errorConfirmarMonto ? 'Por favor, corrige el monto antes de confirmar el pago.' : 'Confirmar pago en efectivo'}
                                    </button>
                                </div>
                            )}

                            {/* //!GUARDAR COTIZACIÓN */}
                            {!pagandoEfectivo && (
                                <button
                                    onClick={() => { handleCrearCotizacion(); }}
                                    className={`text-white px-3 py-3 rounded-md w-full font-semibold mb-2 ${guardandoCotizacion ? 'bg-zinc-500' : 'bg-blue-900'}`}
                                    disabled={guardandoCotizacion}
                                >
                                    {guardandoCotizacion ? 'Guardando cotización...' : 'Guardar cotización'}
                                </button>
                            )}

                            <p className={`text-sm italic text-center pt-3 text-zinc-600`}>
                                COD-{codigoCotizacion}
                            </p>


                        </div>

                        {/* WISHLIST */}
                        <div>
                            <div className='flex justify-between items-center mb-5'>
                                <p className='text-xl text-zinc-500'>
                                    Wishlist
                                </p>

                                <div className='space-x-2'>
                                    <button
                                        onClick={handleVaciarLista}
                                        className='text-zinc-600 rounded-md border border-zinc-600 px-3 py-1 text-sm'
                                    >
                                        Vaciar lista
                                    </button>

                                    {paqueteId !== 'personalizada' && (
                                        <button
                                            className='text-zinc-600 rounded-md border border-zinc-600 px-3 py-1 text-sm'
                                            onClick={handleRestaurarLista}
                                        >
                                            Restaurar
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* <Wishlist
                                onActualizarServicio={handleUpdateWhishlist}
                                servicios={servicios}
                            /> */}
                            <div className="p-4 bg-amber-600/10 border border-amber-600/20 rounded-lg">
                                <p className="text-amber-400 text-sm">
                                    Componente Wishlist deshabilitado durante refactoring
                                </p>
                            </div>
                        </div>

                        {/* LISTA DE SERVICIOS */}
                        <div className='h-full rounded-md'>
                            <p className='text-xl text-zinc-500 mb-5'>
                                Servicios disponibles
                            </p>
                            {/* <ListaServicios
                                onAgregarServicio={handleAgregarServicio}
                            /> */}
                            <div className="p-4 bg-amber-600/10 border border-amber-600/20 rounded-lg">
                                <p className="text-amber-400 text-sm">
                                    Componente ListaServicios deshabilitado durante refactoring
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}