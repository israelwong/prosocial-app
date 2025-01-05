'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { Paquete, Servicio, PaqueteServicio } from '@/app/admin/_lib/types'
import { actualizarPaquete, obtenerPaquete } from '@/app/admin/_lib/paquete.actions'
import ListaServicios from './ListaServicios'
import Whishlist from './Whishlist'
import { obtenerConfiguracionActiva } from '@/app/admin/_lib/configuracion.actions'
import { useRouter } from 'next/navigation'
import { Trash } from 'lucide-react'
import { eliminarPaquete, obtenerServiciosPorPaquete } from '@/app/admin/_lib/paquete.actions'
import { obtenerServicio } from '@/app/admin/_lib/servicio.actions'
import { obtenerTiposEvento } from '@/app/admin/_lib/eventoTipo.actions'
import { EventoTipo } from '@/app/admin/_lib/types'

interface Props {
    paqueteId: string
}

function FormPaqueteEditar({ paqueteId }: Props) {

    const router = useRouter();
    const [paquete, setPaquete] = useState<Paquete | null>(null);
    const [servicios, setServicios] = useState<Servicio[]>([]);
    const [totalCostos, setTotalCostos] = useState(0);
    const [totalGastos, setTotalGastos] = useState(0);
    const [totalUtilidadSistema, setTotalUtilidadSistema] = useState(0);
    const [totalPrecioSistema, setTotalPrecioSistema] = useState(0);
    const [sobreprecioPorcentaje, setSobreprecioPorcentaje] = useState(0);
    const [comisionVentaPorcentaje, setComisionVentaPorcentaje] = useState(0);
    const [sobreprecioMonto, setSobreprecioMonto] = useState(0);
    const [comisionVentaMonto, setComisionVentaMonto] = useState(0);
    const [UtilidadDeVenta, setUtilidadDeVenta] = useState(0);
    const [errors, setErrors] = useState({
        nombre: '',
        precio: '',
        precioSistema: ''
    });
    const [respuestaActualizar, setRespuestaActualizar] = useState('');
    const [loading, setLoading] = useState(false);
    const [precioSistemaModificado, setPrecioSistemaModificado] = useState(false);
    const [eventoTipo, setEventoTipo] = useState<EventoTipo>();
    const [eventoTipos, setEventoTipos] = useState<EventoTipo[]>([]);


    useEffect(() => {
        async function fetchDataPaquete() {
            setLoading(true);
            const paquete = await obtenerPaquete(paqueteId);
            setPaquete(paquete);

            const eventoTipos = await obtenerTiposEvento();
            setEventoTipos(eventoTipos);
            const eventoTipo = paquete ? eventoTipos.find(et => et.id === paquete.eventoTipoId) : null;
            setEventoTipo(eventoTipo || undefined);

            //obtener servicios del paquete
            const PaqueteServicio = await obtenerServiciosPorPaquete(paqueteId);

            // Obtener servicios y asegurar quasignar al arreglo: id == servicioid
            const servicios = await Promise.all(PaqueteServicio.map(async (paqueteServicio: PaqueteServicio) => {
                const servicio = await obtenerServicio(paqueteServicio.servicioId);
                return servicio ? { ...servicio, ...paqueteServicio, id: paqueteServicio.servicioId, nombre: servicio.nombre || '' } : { ...paqueteServicio, id: paqueteServicio.servicioId, nombre: '' };
            }));

            const validServicios = servicios.filter(s => s.servicioId && s.nombre);
            if (validServicios.length !== servicios.length) {
                console.warn('Algunos servicios no son válidos:', servicios);
            }

            setServicios(validServicios);
            setLoading(false);

        }
        fetchDataPaquete();

        async function fetchDataConfig() {
            const configuracion = await obtenerConfiguracionActiva();

            if (configuracion) {
                setSobreprecioPorcentaje(configuracion.sobreprecio);
                setComisionVentaPorcentaje(configuracion.comision_venta);
            }

        }
        fetchDataConfig();

    }, [paqueteId]);

    //! Calcular totales
    const calcularTotal = useCallback(() => {
        const totalCostos = servicios.reduce((total, servicio) => total + (servicio.costo || 0) * (servicio.cantidad || 1), 0);
        const totalGastos = servicios.reduce((total, servicio) => total + (servicio.gasto || 0) * (servicio.cantidad || 1), 0);
        const precioSistema = servicios.reduce((total, servicio) => total + (servicio.precio_publico || 0) * (servicio.cantidad || 1), 0);
        const comisionVentaMonto = precioSistema * (comisionVentaPorcentaje / 100);
        const sobreprecioMonto = precioSistema * (sobreprecioPorcentaje / 100);

        //que ya incluye el descuento del sobreprecio
        const utilidadSistema = servicios.reduce((total, servicio) => total + (servicio.utilidad || 0) * (servicio.cantidad || 1), 0);
        const utilidadDeVenta = precioSistema - totalCostos - totalGastos - comisionVentaMonto;

        setTotalPrecioSistema(precioSistema);
        setTotalCostos(totalCostos);
        setTotalGastos(totalGastos);
        setComisionVentaMonto(comisionVentaMonto);
        setSobreprecioMonto(sobreprecioMonto);
        setTotalUtilidadSistema(utilidadSistema);
        setUtilidadDeVenta(utilidadDeVenta);

    }, [servicios, comisionVentaPorcentaje, setSobreprecioMonto, sobreprecioPorcentaje]);

    useEffect(() => {
        calcularTotal();
    }, [calcularTotal]);

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
        setPrecioSistemaModificado(true);
    }

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
        setPrecioSistemaModificado(true);
        calcularTotal();
    }

    //! Eliminar paquete
    const handleEliminarPaquete = async () => {
        const confirmed = confirm('¿Estás seguro de que deseas eliminar este paquete?');
        if (confirmed && paquete) {
            if (paquete?.id) {
                await eliminarPaquete(paquete.id);
            }
            router.back();
        }
        setPrecioSistemaModificado(true);
    }

    //! Actualizar paquete
    const handleActualizarPaquete = async () => {

        if (!validate()) {
            return;
        }

        const paqueteActualizado: Paquete = {
            ...paquete,
            costo: totalCostos,
            gasto: totalGastos,
            utilidad: totalUtilidadSistema,
            precio: paquete?.precio || 0,
            servicios: servicios.map(servicio => ({
                servicioId: servicio.id || '',
                paqueteId: paquete?.id || '',
                cantidad: servicio.cantidad || 0,
                servicioCategoriaId: servicio.servicioCategoriaId || '',
                visible_cliente: servicio.visible_cliente || false,
                posicion: servicio.posicion || 0,
            })),
            eventoTipoId: paquete?.eventoTipoId || '',
            nombre: paquete?.nombre || ''
        }


        try {
            const result = await actualizarPaquete(paqueteActualizado);
            if (result && result.success) {
                setRespuestaActualizar('Paquete actualizado correctamente');
                setTimeout(() => setRespuestaActualizar(''), 3000);
            }
            setPrecioSistemaModificado(false);
        } catch (error) {
            console.error('Error al actualizar el paquete:', error);
            setRespuestaActualizar('Error al actualizar el paquete');
        }

    }

    const validate = () => {
        let isValid = true;
        const newErrors = {
            nombre: '',
            precio: '',
            precioSistema: ''
        }

        if (totalPrecioSistema <= 0) {
            newErrors.precioSistema = '* Agrega al menos un servicio al paquete';
            isValid = false;
        }

        if (!paquete?.nombre) {
            newErrors.nombre = '* El nombre del paquete es requerido';
            isValid = false;
        } else {
            newErrors.nombre = '';
        }

        if (!paquete?.precio || paquete?.precio <= 0) {
            newErrors.precio = '* El precio del paquete es requerido';
            isValid = false;
        } else if (paquete.precio < totalPrecioSistema) {
            newErrors.precio = '* El precio del paquete no puede ser inferior al precio del sistema';
            isValid = false;
        } else {
            newErrors.precio = '';
        }

        setErrors(newErrors);
        return isValid;
    }

    // useEffect(() => {
    //     validate();
    // }, [totalPrecioSistema, paquete?.nombre, paquete?.precio]);

    const handleCerrarVentana = () => {
        if (precioSistemaModificado) {
            const confirmacion = window.confirm('Se perderán los cambios realizados. ¿Estás seguro de que deseas cerrar la ventana?');
            if (!confirmacion) {
                return;
            }
        }
        router.back();
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">
            <p className="text-zinc-600">Cargando información del paquete...</p>
        </div>
    }

    return (
        <div>

            <div className='flex justify-between mb-5 items-center'>

                <h1 className='text-xl items-center uppercase'>
                    Editar Paquete <span className='text-zinc-500'>{paquete?.nombre}</span>
                </h1>

                <button
                    onClick={() => router.back()}
                    className='bg-red-900 text-white px-3 py-2 rounded-md borde'>
                    Cerrar ventana
                </button>
            </div>

            <div className='grid grid-cols-4 gap-5'>

                <div className='sticky top-5'>
                    <p className='text-xl text-zinc-500 mb-5'>
                        Detalles del servicio
                    </p>

                    <div className='mb-3 border p-3 rounded-md border-zinc-800'>
                        <label htmlFor="eventoTipo" className='block text-sm text-zinc-500 mb-2'>
                            Tipo de evento
                        </label>
                        <select
                            id="eventoTipo"
                            value={eventoTipo?.id || ''}
                            onChange={(e) => {
                                const selectedEventoTipo = eventoTipos.find(et => et.id === e.target.value);
                                setEventoTipo(selectedEventoTipo);
                                if (paquete) {
                                    setPaquete({ ...paquete, eventoTipoId: selectedEventoTipo?.id || '' });
                                }
                            }}
                            className='w-full rounded-md bg-zinc-900 border border-zinc-800 p-2'
                        >
                            <option value="" disabled>Selecciona un tipo de evento</option>
                            {eventoTipos.map((tipo) => (
                                <option key={tipo.id} value={tipo.id}>
                                    {tipo.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className='mb-2'>
                        <textarea
                            id="nombrePaquete"
                            value={paquete?.nombre || ''}
                            onChange={(e) => {
                                const nuevoNombre = e.target.value;
                                if (paquete) {
                                    setPaquete({ ...paquete, nombre: nuevoNombre });
                                }
                            }}
                            className='w-full rounded-md bg-zinc-900 border border-zinc-800 p-2 h-32'
                        />
                        <p className='text-sm text-red-500'>
                            {errors.nombre}
                        </p>
                    </div>

                    <div className='bg-zinc-900 mb-3 px-5 py-2 rounded-md border border-zinc-800'>
                        <p className='text-sm'>
                            Precio sistema
                        </p>
                        <p className='text-3xl'>
                            {totalPrecioSistema.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                        </p>
                        <p className='text-sm text-red-500 mt-1'>
                            {errors.precioSistema}
                        </p>
                    </div>

                    <div className='grid grid-cols-4 p-5 bg-zinc-900 mb-3 rounded-md border border-zinc-800'>

                        <div className=''>
                            <p className='text-sm text-zinc-500'>
                                Costos
                            </p>
                            <p className='text-md'>
                                {totalCostos.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                            </p>
                        </div>

                        <div className=''>
                            <p className='text-sm text-zinc-500'>
                                Gastos
                            </p>
                            <p className='text-md'>
                                {totalGastos.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                            </p>
                        </div>

                        <div className=''>
                            <p className='text-sm text-zinc-500'>
                                CDV {comisionVentaPorcentaje}%
                            </p>
                            <p className='text-md'>
                                {comisionVentaMonto.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                            </p>
                        </div>
                        <div className=''>
                            <p className='text-sm text-zinc-500'>
                                SP {sobreprecioPorcentaje}%
                            </p>
                            <p className='text-md'>
                                {sobreprecioMonto.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                            </p>
                        </div>

                    </div>

                    <div className='grid grid-cols-2 gap-2 mb-3'>
                        <div className='bg-zinc-900 p-5 rounded-md border border-zinc-800'>
                            <p className='text-sm text-zinc-500'>
                                Utilidad sistema
                            </p>
                            <p className='text-2xl'>
                                {totalUtilidadSistema.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                            </p>
                        </div>
                        <div className='bg-zinc-900 p-5 rounded-md border border-zinc-800'>
                            <p className='text-sm text-zinc-500'>
                                Utilidad de venta
                            </p>
                            <p className='text-2xl'>
                                {UtilidadDeVenta.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                            </p>
                        </div>
                    </div>

                    <div className='bg-zinc-900 mb-5 p-5 rounded-md border border-zinc-800'>

                        <p className='text-sm text-zinc-500 mb-2'>
                            Precio del paquete
                        </p>

                        <input
                            type="number"
                            id="precioPaquete"
                            value={paquete?.precio || ''}
                            onChange={(e) => {
                                const nuevoPrecio = parseFloat(e.target.value);
                                if (paquete) {
                                    setPaquete({ ...paquete, precio: nuevoPrecio });
                                }
                            }}
                            className='w-full rounded-md bg-zinc-900 border border-zinc-800 px-2 py-3 text-2xl'
                        />

                        <p className='text-sm text-red-500 pt-2'>
                            {errors.precio}
                        </p>

                        {/* //! Actualiar paquete */}

                        {respuestaActualizar && (
                            <p className='text-sm text-green-500 text-center bg-green-800/20 p-3 rounded-md mb-2'>
                                {respuestaActualizar}
                            </p>
                        )}

                        <button
                            onClick={handleActualizarPaquete}
                            className='bg-blue-900 text-white px-3 py-3 rounded-md w-full'
                        >
                            Actualizar paquete
                        </button>

                        <button
                            onClick={handleCerrarVentana}
                            className='bg-zinc-800 text-white px-3 py-3 rounded-md mt-5 w-full'
                        >
                            Cerrar ventana
                        </button>

                        {/* //! eliminar paquete */}
                        <div className='flex justify-center mt-5'>
                            <button className='text-red-600 flex items-center text-sm'
                                onClick={handleEliminarPaquete}>
                                <Trash size={16} className='mr-2' /> Eliminar servicio
                            </button>

                        </div>
                    </div>

                </div>

                <div className='col-span-2'>

                    <Whishlist
                        onActualizarServicio={handleUpdateWhishlist}
                        servicios={servicios}
                    />
                </div>

                <div>

                    <ListaServicios
                        onAgregarServicio={handleAgregarServicio}
                    />

                </div>

            </div >

        </div >
    )
}

export default FormPaqueteEditar