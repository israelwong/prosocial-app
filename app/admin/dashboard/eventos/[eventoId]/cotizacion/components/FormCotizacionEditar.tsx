'use client';
import { Copy, Shuffle, SquareArrowOutUpRight, User } from 'lucide-react'
import React, { useEffect, useState, useCallback } from 'react'
import { Servicio, MetodoPago, CondicionesComerciales } from '@/app/admin/_lib/types'
import { COTIZACION_STATUS, PAGO_STATUS } from '@/app/admin/_lib/constants/status'

import { obtenerConfiguracionActiva } from '@/app/admin/_lib/actions/configuracion/configuracion.actions'
import { obtenerCotizacionCompleta as obtenerCotizacion, eliminarCotizacion, actualizarCotizacion } from '@/app/admin/_lib/actions/cotizacion/cotizacion.actions';
import { obtenerCondicionesComercialesActivas, obtenerCondicionesComercialesMetodosPago } from '@/app/admin/_lib/actions/condicionesComerciales/condicionesComerciales.actions';
import { actualizarEventoStatus } from '@/app/admin/_lib/actions/evento/evento.actions';
import { obtenerEventoBasicoPorId } from '@/app/admin/_lib/actions/evento/evento.actions';
import { obtenerCliente } from '@/app/admin/_lib/actions/cliente/cliente.actions';
import { obtenerMetodoPago } from '@/app/admin/_lib/actions/metodoPago/metodoPago.actions';
import { obtenerServicio } from '@/app/admin/_lib/actions/servicios/servicios.actions'
import { crearPago } from '@/app/admin/_lib/actions/pagos';
import { obtenerConteoCotizacionVisitas } from '@/app/admin/_lib/actions/cotizacionVisita/cotizacionVisita.actions'

// import ListaServicios from './ListaServicios' // Componente eliminado en refactoring
// import Wishlist from './Wishlist' // Componente eliminado en refactoring

import { useRouter } from 'next/navigation'
import { Trash, X } from 'lucide-react';

import { Eye } from 'lucide-react'


interface Props {
    cotizacionId: string
}

export default function FormCotizaacionEditar({ cotizacionId }: Props) {

    const router = useRouter();
    const [loading, setLoading] = useState(true); // Estado de carga
    const [eventoId, setEventoId] = useState<string | undefined>('');
    const [eventoTipoId, setEventoTipoId] = useState<string | undefined>('');
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
    const [utilidadDeVenta, setUtilidadDeVenta] = useState(0);
    const [utilidadSistema, setUtilidadSistema] = useState(0);
    const [metodoPagoId, setMetodoPagoId] = useState<string | undefined>('');
    const [errors, setErrors] = useState({ nombre: '', });
    const [condicionesComerciales, setCondicionesComerciales] = useState([] as CondicionesComerciales[]);
    const [codigoCotizacion, setCodigoCotizacion] = useState('');
    const [respuestaGuardado, setRespuestaGuardado] = useState<string | null>(null);
    const [condicionesComercialesId, setCondicionComercialId] = useState<string | undefined>('');
    const [cotizacionStatus, setCotizacionEstatus] = useState('');
    const [copiado, setCopiado] = useState(false);
    const [pagoAnticipo, setPagoAnticipo] = useState(0);
    const [actualizando, setActualizando] = useState(false);
    const [pagandoEfectivo, setPagandoEfectivo] = useState(false);
    const [errorMonto, setErrorMonto] = useState('');
    const [confirmarMonto, setConfirmarMonto] = useState('');
    const [confirmarPorcentajeAnticipo, setConfirmarPorcentajeAnticipo] = useState('');
    const [pagoPendiente, setPagoPendiente] = useState(0);
    const [errorConfirmarMonto, setErrorConfirmarMonto] = useState(false);
    const [eventoNombre, setEventoNombre] = useState('');
    const [eventoFecha, setEventoFecha] = useState('');
    const [clienteId, setClienteId] = useState('');
    const [clienteNombre, setClienteNombre] = useState('');
    const [clienteTelefono, setClienteTelefono] = useState('');
    const [eventoTipo, setEventoTipo] = useState('');

    const [visitas, setVisitas] = useState<number>(0)

    useEffect(() => {

        async function fetchData() {
            setLoading(true);

            const cotizacionPromise = obtenerCotizacion(cotizacionId);
            const configuracionPromise = obtenerConfiguracionActiva();
            const condicionesComercialesPromise = obtenerCondicionesComercialesActivas();

            const [resultado, configuracion, condicionesComerciales] = await Promise.all([
                cotizacionPromise,
                configuracionPromise,
                condicionesComercialesPromise
            ]);

            obtenerConteoCotizacionVisitas(cotizacionId).then((conteo) => {
                // console.log('Visitas:', conteo);
                setVisitas(conteo);
            });

            if (resultado.cotizacion) {
                const cotizacionData = resultado.cotizacion;

                // console.log('cotizacion:', cotizacionData);

                setNombreCotizacion(cotizacionData.nombre || '');
                setEventoId(cotizacionData.eventoId);
                setEventoTipoId(cotizacionData.eventoTipoId);
                setCondicionComercialId(cotizacionData.condicionesComercialesId ?? '');
                setMetodoPagoId(cotizacionData.condicionesComercialesMetodoPagoId ?? '');
                setCotizacionEstatus(cotizacionData.status);//!
                setEventoTipo(cotizacionData.EventoTipo?.nombre || '');

                // Usar los servicios que ya vienen con la cotización completa
                const serviciosCotizacion = cotizacionData.Servicio || [];

                // Procesar los servicios
                const serviciosData = await Promise.all(serviciosCotizacion.map(async (servicio: any) => {
                    if (!servicio.servicioId) {
                        // Opcional: manejar el caso donde servicioId es null o undefined
                        return null;
                    }
                    const servicioData = await obtenerServicio(servicio.servicioId as string);
                    return {
                        ...servicioData,
                        cantidad: servicio.cantidad,
                        nombre: servicioData?.nombre || '',
                        posicion: servicio.posicion,
                        servicioCategoriaId: servicio.servicioCategoriaId,
                        userId: servicio.userId,
                    };
                }));
                setServicios(
                    serviciosData
                        .filter((s): s is NonNullable<typeof s> => s !== null)
                        .map(s => ({
                            ...s,
                            cantidad: s.cantidad ?? 1, // Asegura que cantidad nunca sea undefined
                            servicioCategoriaId: s.servicioCategoriaId === null ? undefined : s.servicioCategoriaId,
                            userId: s.userId === null ? undefined : s.userId,
                        }))
                );

                //obtener evento por id
                const evento = await obtenerEventoBasicoPorId(cotizacionData.eventoId);
                if (evento) {
                    setEventoNombre(evento.nombre || '');
                    setEventoFecha(evento.fecha_evento?.toISOString() || '');

                    const cliente = await obtenerCliente(evento.clienteId);
                    setClienteId(evento.clienteId);
                    setClienteNombre(cliente?.nombre || '');
                    setClienteTelefono(cliente?.telefono || '');
                }
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

            setLoading(false);
        }
        fetchData();
    }, [cotizacionId]);

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
        const precio_final = precioSistema - descuento; //!

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
            `US${Math.floor(utilidadSistema)}-UV${Math.floor(utilidadDeVenta)}`;

        if (perdida_ganancia < 0) {
            codigo_cotizacion += `-P${Math.floor(perdida_ganancia)}`;
        }

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
    }, [servicios, sobreprecioPorcentaje, comisionVentaPorcentaje, condicionComercial, metodoPago, metodoPagoId, calcularTotal]);

    const handleSeleccionCondicionMetodoPago = (condicion: CondicionesComerciales, metodo: MetodoPago) => {
        // console.table(metodo.metodoPagoId);
        setMetodoPagoId(metodo.id);
        setMetodoPago(metodo);
        setCondicionComercial(condicion);
        setCondicionComercialId(condicion.id);
    }

    const handleActualizarCotizacion = async () => {

        if (!nombreCotizacion) {
            setErrors(prevErrors => ({ ...prevErrors, nombre: 'El nombre de la cotización es requerido' }));
            return;
        } else {
            setErrors(prevErrors => ({ ...prevErrors, nombre: '' }));
        }

        const cotizacionActualizada = {
            id: cotizacionId,
            eventoTipoId: eventoTipoId || '',
            eventoId: eventoId || '',
            nombre: nombreCotizacion.charAt(0).toUpperCase() + nombreCotizacion.slice(1),
            precio: parseFloat(precioFinal.toFixed(2)),
            condicionesComercialesId: condicionComercial?.id ?? null,
            condicionesComercialesMetodoPagoId: metodoPago?.id ?? null,
            metodoPagoId: metodoPago?.id ?? null,
            servicios,
            utilidadDeVenta: parseFloat(utilidadDeVenta.toFixed(2)),
            utilidadSistema: parseFloat(utilidadSistema.toFixed(2)),
            status: cotizacionStatus
        }


        setActualizando(true);
        const respuesta = await actualizarCotizacion(cotizacionActualizada);
        setRespuestaGuardado(respuesta.success ? 'Cotización actualizada' : respuesta.error || 'Error al actualizar la cotización');
        setTimeout(() => {
            setRespuestaGuardado(null);
        }, 2000);
        setActualizando(false);
    }

    const handleEliminarCotizacion = async () => {
        const confirmar = confirm('¿Estás seguro de eliminar la cotización?');
        if (confirmar) {
            const respuesta = await eliminarCotizacion(cotizacionId);
            if (respuesta.success) {
                router.back();
            }
        }
    }

    const handleCopiar = () => {
        navigator.clipboard.writeText(`https://www.prosocial.mx/evento/${eventoId}/cotizacion/${cotizacionId}`)
        setCopiado(true)
        setTimeout(() => {
            setCopiado(false)
        }, 1000)
    }

    const handlePagoEfectivo = async () => {
        const confirmar = confirm('¿Estás seguro de confirmar el pago en efectivo?');
        if (confirmar) {

            setPagandoEfectivo(true);

            const cotizacionActualizada = {
                id: cotizacionId,
                eventoTipoId: eventoTipoId || '',
                eventoId: eventoId || '',
                nombre: nombreCotizacion.charAt(0).toUpperCase() + nombreCotizacion.slice(1),
                precio: parseFloat(precioFinal.toFixed(2)),
                condicionesComercialesId: condicionComercial?.id ?? null,
                condicionesComercialesMetodoPagoId: metodoPago?.id ?? null,
                metodoPagoId: metodoPago?.metodoPagoId ?? null,
                servicios,
                utilidadDeVenta: parseFloat(utilidadDeVenta.toFixed(2)),
                utilidadSistema: parseFloat(utilidadSistema.toFixed(2)),
                status: COTIZACION_STATUS.APROBADA
            }
            await actualizarCotizacion(cotizacionActualizada);

            await actualizarEventoStatus(
                eventoId || '',
                'aprobado'
            );

            //crear pago
            const pago = {
                cotizacionId,
                clienteId,
                condicionesComercialesId: condicionComercial?.id ?? null,
                condicionesComercialesMetodoPagoId: metodoPago?.id ?? null,
                metodoPagoId: metodoPago?.metodoPagoId ?? null,
                metodo_pago: metodoPago?.metodo_pago ?? '',
                monto: parseFloat(confirmarMonto.replace(/[^0-9.-]+/g, '')),
                concepto: parseFloat(confirmarPorcentajeAnticipo) === 100 ? 'Pago del total del servicio' : `Pago del ${confirmarPorcentajeAnticipo}%  de anticipo`,
                status: PAGO_STATUS.PAID,
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

    const handleEnviarWhatsapp = (asunto: string) => {
        if (asunto === 'compatir') {
            const fechaEventoLocal = new Date(eventoFecha);
            fechaEventoLocal.setMinutes(fechaEventoLocal.getMinutes() + fechaEventoLocal.getTimezoneOffset());
            const mensaje = `Hola ${clienteNombre}, te compartimos la cotización para el evento de ${eventoNombre} que celebrarán el día ${fechaEventoLocal.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}:\n\nhttps://www.prosocial.mx/evento/${eventoId}/cotizacion/${cotizacionId}`;
            window.open(`https://api.whatsapp.com/send?phone=52${clienteTelefono}&text=${encodeURIComponent(mensaje)}`, '_blank');
        } else {
            window.open(`https://api.whatsapp.com/send?phone=52${clienteTelefono}`, '_blank');
        }
    }

    return (
        <div>
            {loading ? (
                <div className="flex justify-center items-center h-screen text-zinc-500 italic">
                    <p>Cargando cotización...</p>
                </div>
            ) : (
                <div className='w-full'>

                    {/* HEADER */}
                    <div className='md:flex justify-between items-center mb-5 flex flex-wrap'>

                        <div className='mb-5 md:mb-0'>
                            <h1 className='text-2xl'>
                                Cotización del evento {eventoNombre === '' ? (
                                    <span className='bg-red-700 text-white px-3 py-1 rounded-full ml-2 text-sm leading-3 animate-pulse'>
                                        Nombre del evento no definido
                                    </span>
                                ) : (
                                    <>
                                        <span className='text-green-500'>
                                            {eventoNombre}
                                        </span>
                                    </>
                                )}

                            </h1>
                            <p className='text-sm text-zinc-500 italic'>
                                Celebración el <u>{eventoFecha ? new Date(eventoFecha).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</u>
                            </p>
                        </div>

                        {/* //! MENU */}
                        <div className='items-center flex flex-wrap  justify-start md:space-x-2 space-y-1 md:space-y-0 gap-2 md:text-md text-sm'>

                            <p className='text-yellow-500 text-lg flex items-center'>
                                <Eye size={16} className='mr-2' /> {visitas}
                            </p>


                            <button className='px-4 py-2 border border-yellow-800 rounded-md bg-zinc-900 flex items-center' onClick={() => router.push(`/admin/dashboard/contactos/${clienteId}`)}>
                                <User size={16} className='mr-1' /> Cliente {clienteNombre}
                            </button>

                            <button
                                onClick={() => handleCopiar()}
                                className='flex items-center justify-center px-4 py-2 border border-zinc-800 rounded-md bg-zinc-900 mb-2 text-center'
                            >
                                <Copy size={12} className='mr-1' /> {copiado ? 'Copiado' : 'Copiar'} link
                            </button>

                            <button
                                onClick={() => window.open(`/cotizacion/${cotizacionId}?preview=true`, '_blank')}
                                className='flex items-center px-4 py-2 border border-purple-800 rounded-md justify-center mb-2'
                            >
                                <SquareArrowOutUpRight size={12} className='mr-1' /> Vista previa
                            </button>

                            <button
                                onClick={() => handleEnviarWhatsapp('compatir')}
                                className='flex items-center px-4 py-2 border border-green-800 rounded-md  justify-center mb-2 text-green-600'
                            >
                                <i className="fab fa-whatsapp text-md mr-1"></i> Compartir cotización
                            </button>

                            <button
                                onClick={() => handleEnviarWhatsapp('conversar')}
                                className='flex items-center px-4 py-2 border border-zinc-800 rounded-md bg-green-900 justify-center mb-2'
                            >
                                <i className="fab fa-whatsapp text-md mr-1"></i> Conversar
                            </button>

                            {cotizacionStatus === COTIZACION_STATUS.APROBADA && (
                                <button
                                    className='px-4 py-2 border border-blue-800 rounded-md bg-blue-900 flex items-center'
                                    onClick={() => router.push(`/admin/dashboard/seguimiento/${eventoId}`)}
                                >
                                    <Shuffle size={16} className='mr-1' />
                                    Gestionar
                                </button>
                            )}

                            <button
                                className='flex items-center px-4 py-2 border border-red-800 rounded-md bg-red-900'
                                onClick={() => router.back()}>
                                Cerrar ventana
                            </button>
                        </div>
                    </div>

                    <div className='md:grid md:grid-cols-3 md:gap-5'>

                        {/* INFORMACIÓN DE LA COTIZACION */}
                        <div className='md:sticky md:top-5 '>

                            <p className='text-xl text-zinc-500 mb-5'>
                                Detalles del servicio
                            </p>

                            {/* NOMBRE COTIZACIÓN */}
                            <div className='mb-2 rounded-md bg-zinc-900 border border-zinc-800 px-5 py-2 w-full'>
                                <p className='text-sm text-zinc-500 mb-1'>
                                    Nombre de la cotización
                                </p>
                                <input
                                    type="text"
                                    id="nombreCotizacion"
                                    value={nombreCotizacion}
                                    onChange={(e) => {
                                        const nuevoNombre = e.target.value;
                                        setNombreCotizacion(nuevoNombre);
                                    }}
                                    className='w-full text-xl rounded-md bg-zinc-900 border-foreground focus:outline-none'
                                />
                                <p className='text-sm text-red-500'>
                                    {errors.nombre}
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
                                                <div className='flex items-start'>
                                                    <p className='pt-3 text-sm'>Condiciones comerciales:  <span className='text-zinc-600'> {condicionComercial?.nombre}. {condicionComercial?.descripcion}</span></p>
                                                    <button
                                                        onClick={() => {
                                                            setCondicionComercial(null)
                                                            setCondicionComercialId('')
                                                            setMetodoPago(null)
                                                            setMetodoPagoId('')
                                                        }}
                                                        className='ml-2 pt-4'
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>


                            {/* //! CONDICIONES COMERCIALES */}
                            <div className='mb-5'>

                                <p className='text-xl text-zinc-500 mb-3'>
                                    Condiciones comerciales disponibles
                                </p>

                                {condicionesComerciales
                                    .filter(condicion =>
                                        (eventoTipo === 'Empresarial' && condicion.tipoEvento === 'Empresarial') ||
                                        (eventoTipo !== 'Empresarial' && condicion.tipoEvento === 'Social')
                                    )
                                    .map((condicion, index) => (
                                        <div key={index} className={`mb-3 px-5 py-3 bg-zinc-900 border ${condicionesComercialesId === condicion.id ? 'border-blue-800' : 'border-zinc-800'} rounded-md`}>
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

                            {metodoPago?.metodo_pago === 'Efectivo' && cotizacionStatus !== COTIZACION_STATUS.APROBADA && (
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

                            {respuestaGuardado && (
                                <p className='text-sm text-green-500 text-center bg-green-800/20 p-3 rounded-md mb-2'>
                                    {respuestaGuardado}
                                </p>
                            )}

                            {(metodoPago?.metodo_pago !== 'Efectivo' || cotizacionStatus === COTIZACION_STATUS.APROBADA) && (
                                <button
                                    onClick={() => !actualizando && handleActualizarCotizacion()}
                                    className={`bg-blue-900 text-white px-3 py-3 rounded-md w-full mb-2 ${actualizando ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={actualizando}
                                >
                                    {actualizando ? 'Actualizando información...' : 'Actualizar cotización'}
                                </button>
                            )}

                            <button
                                className='bg-red-700 text-white px-3 py-3 w-full rounded-md mb-2'
                                onClick={() => router.back()}
                            >
                                Cerrar ventana
                            </button>

                            <p className={`text-center text-zinc-600 border border-zinc-800 rounded-md px-5 py-2`}>
                                COD-{codigoCotizacion}
                            </p>

                            <button
                                className='text-red-700 px-3 py-3 rounded-md mt-3 flex items-center justify-center mx-auto'
                                onClick={() => handleEliminarCotizacion()}
                            >
                                <Trash size={16} className='mr-1' />
                                Eliminar cotización
                            </button>


                        </div>

                        {/* WISHLIST */}
                        {/* <div>
                            <div className='flex justify-between items-center mb-5'>
                                <p className='text-xl text-zinc-500'>
                                    Wishlist
                                </p>
                            </div>

                            <Wishlist
                                onActualizarServicio={handleUpdateWhishlist}
                                servicios={servicios}
                            />
                        </div> */}

                        {/* LISTA DE SERVICIOS */}
                        {/* <div className='h-full rounded-md'>
                            <p className='text-xl text-zinc-500 mb-5'>
                                Servicios disponibles
                            </p>
                            <ListaServicios
                                onAgregarServicio={handleAgregarServicio}
                            />
                        </div> */}

                    </div>
                </div>
            )
            }
        </div >
    )
}