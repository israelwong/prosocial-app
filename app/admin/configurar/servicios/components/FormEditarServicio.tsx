'use client';
import React, { useState, useEffect } from 'react';
import ListaGastos from '../components/ListaGastos';

import { obtenerConfiguracionActiva } from '@/app/admin/_lib/configuracion.actions';
import { obtenerCategories } from '@/app/admin/_lib/categorias.actions';
import { actualizarServicio, obtenerServicio, eliminarServicio } from '@/app/admin/_lib/servicio.actions';
import { Configuracion } from '@/app/admin/_lib/types';
import { ServicioCategoria } from '@/app/admin/_lib/types';
import { ServicioGasto } from '@/app/admin/_lib/types';
import { useRouter } from 'next/navigation';
import { obtenerGastosPorServicio } from '@/app/admin/_lib/gastos.actions';
import { Trash2 } from 'lucide-react';

interface Props {
    servicioId: string;
}

const FormEditarServicio = ({ servicioId }: Props) => {

    const router = useRouter();
    const [configuracion, setConfiguracion] = useState<Configuracion>();
    const [categorias, setCategorias] = useState([] as ServicioCategoria[]);
    const [categoria, setCategoria] = useState<ServicioCategoria | null>(null);
    const [nombre, setNombre] = useState('');
    const [costo, setCosto] = useState('');
    const [gasto, setGasto] = useState(0);
    const [utilidadPorcentaje, setUtilidadPorcentaje] = useState<number | undefined>(undefined);
    const [utilidadMonto, setUtilidadMonto] = useState('');
    const [precio, setPrecio] = useState('');
    const [sobreprecioPorcentaje, setSobreprecioPorcentaje] = useState(0);
    const [sobreprecioPrecioPublico, setSobreprecioPrecioPublico] = useState(0);
    const [comisionDeVentaPorcentaje, setComisionDeVentaPorcentaje] = useState(0);
    const [precioPublico, setPrecioPublico] = useState('');
    const [comisionDeVentaPrecioPublico, setComisionDeVentaPrecioPublico] = useState(0);
    const [gananciaPrecioPublico, setGananciaPrecioPublico] = useState(0);
    const [visibilidadCliente, setVisibilidadCliente] = useState(true);
    const [gastosTemporales, setGastosTemporales] = useState([] as ServicioGasto[]);
    const [tipo, setTipo] = useState('servicio'); //tipo_utilidad
    const [statusUpdate, setStatusUpdate] = useState('');
    const [actualizando, setActualizando] = useState(false);
    const [actualizandoParaCerrar, setActualizandoParaCerrar] = useState(false);

    const [errors, setErrors] = useState<{
        nombre?: string; costo?: string; precio?: string; categoria?: string;
        utilidadMonto?: string; utilidadPorcentaje?: string; precio_publico?: string;
        validarGanancia?: string;
    }>({});


    //! VALIDACIONES
    const validate = () => {

        const newErrors: {
            nombre?: string; costo?: string; precio?: string; utilidadMonto?: string; utilidadPorcentaje?: string;
            categoria?: string; precio_publico?: string; validarGanancia?: string;
        } = {};

        if (!nombre) newErrors.nombre = 'El nombre es requerido';
        if (!costo) newErrors.costo = 'El costo es requerido';
        if (utilidadPorcentaje === undefined) newErrors.utilidadPorcentaje = 'El porcentaje de utilidad es requerido';
        if (!utilidadMonto) newErrors.utilidadMonto = 'El monto de utilidad es requerido';
        if (!categoria) newErrors.categoria = 'La categoría es requerida';
        if (!precioPublico) newErrors.precio_publico = 'El precio público es requerido';
        if (categoria?.id === '') newErrors.categoria = 'La categoría es requerida';
        if (Number(gananciaPrecioPublico) < Number(utilidadMonto)) {
            newErrors.validarGanancia = 'La utilidad esperada es menor que la utilidad deseada';
        }

        return newErrors;
    };

    //! actualizar servicio
    const handleSubmit = async (action: string) => {

        const newErrors = validate();
        // console.log(newErrors);

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const servicioActualizado = {
            id: servicioId,
            servicioCategoriaId: categoria?.id || '',
            nombre: nombre.charAt(0).toUpperCase() + nombre.slice(1),
            costo: Number(costo),
            gasto: Number(gasto),
            utilidad: Number(gananciaPrecioPublico),
            precio_publico: Number(precioPublico),
            visible_cliente: visibilidadCliente,
            gastos: gastosTemporales,
            tipo_utilidad: tipo,
        };

        const result = await actualizarServicio(servicioActualizado);
        if (action === 'updateAndClose') {
            setActualizandoParaCerrar(true);
            router.push('/admin/configurar/servicios');
        } else {
            if (result.success) {
                setActualizando(true);
                setStatusUpdate('Servicio actualizado correctamente');
                setTimeout(() => {
                    setStatusUpdate('');
                }, 2000);
                setActualizando(false);
            }
        }
    };

    //! Gestionar gastos
    const agregarGastoTemporal = (gasto: ServicioGasto) => {
        setGastosTemporales([...gastosTemporales, gasto]);
    };

    const eliminarGastoTemporal = (index: number) => {
        setGastosTemporales(gastosTemporales.filter((_, i) => i !== index));
    };

    const handleEditarGasto = (index: number, gastoActualizado: ServicioGasto) => {
        const nuevosGastos = [...gastosTemporales];
        nuevosGastos[index] = gastoActualizado;
        setGastosTemporales(nuevosGastos);
    };

    //! EFFECTS INICIALES
    useEffect(() => {
        obtenerConfiguracionActiva().then(configuracion => {
            if (configuracion) { setConfiguracion(configuracion); }
        });

        obtenerCategories().then(categorias => {
            if (categorias) { setCategorias(categorias); }
        });
    }, []);

    useEffect(() => {


        Promise.all([
            obtenerServicio(servicioId),
            obtenerGastosPorServicio(servicioId)
        ]).then(([servicio, gastos]) => {
            if (servicio) {
                const selectedCategoria = categorias.find(cat => cat.id === servicio.servicioCategoriaId);
                setCategoria(selectedCategoria || null);
                setNombre(servicio.nombre);
                setCosto(servicio.costo.toString());
                setPrecioPublico(servicio.precio_publico.toString());
                setVisibilidadCliente(servicio.visible_cliente);
                setTipo(servicio.tipo_utilidad); // Asignar tipo de utilidad al cargar el módulo
            }

            if (servicio?.tipo_utilidad === 'servicio') {
                setTipo('servicio');
                setUtilidadPorcentaje(configuracion?.utilidad_servicio);
            } else {
                setTipo('producto');
                setUtilidadPorcentaje(configuracion?.utilidad_producto);
            }

            if (gastos) {
                setGastosTemporales(gastos);
            }
        });

    }, [servicioId, categorias, configuracion?.utilidad_producto, configuracion?.utilidad_servicio, tipo]);


    //! Calculo de precio sistema
    useEffect(() => {
        const calcularPrecioSistema = () => {

            const costo_total = Number(costo) || 0;
            const gasto_total = gastosTemporales.reduce((acc, gasto) => acc + gasto.costo, 0);
            const utilidadPorcentajeNum = Number(utilidadPorcentaje) || 0;
            const utilidad_deseada = (costo_total) * (utilidadPorcentajeNum / 100);
            const sobreprecio_porcentaje = configuracion?.sobreprecio || 0;
            const comision_venta_porcentaje = configuracion?.comision_venta || 0;

            //formula para calcular el precio del sistema
            const precioSistema =
                (costo_total + gasto_total + utilidad_deseada) /
                (1 - (((comision_venta_porcentaje ?? 0) / 100) + (sobreprecio_porcentaje / 100)));

            setSobreprecioPorcentaje(sobreprecio_porcentaje);
            setComisionDeVentaPorcentaje(comision_venta_porcentaje);
            setPrecio(precioSistema.toString());
            setUtilidadMonto(utilidad_deseada.toString());
            setGasto(gasto_total);

        };

        calcularPrecioSistema();
    }, [costo, gastosTemporales, configuracion, configuracion?.comision_venta, configuracion?.sobreprecio, utilidadPorcentaje]);

    //! calculo de precio  publico
    useEffect(() => {
        const calcularPrecioPublico = () => {
            const comision_venta_precio_publico = Number(precioPublico) * (comisionDeVentaPorcentaje / 100);
            const costo_total = parseFloat(costo);
            const sobreprecio_precio_publico = Number(precioPublico) * (sobreprecioPorcentaje / 100);
            const ganancia_precio_publico =
                Number(precioPublico) -
                Number(comision_venta_precio_publico + sobreprecio_precio_publico + costo_total + gasto);

            setGananciaPrecioPublico(ganancia_precio_publico);
            setComisionDeVentaPrecioPublico(comision_venta_precio_publico);
            setSobreprecioPrecioPublico(sobreprecio_precio_publico);

            if (ganancia_precio_publico < Number(utilidadMonto)) {
                setErrors(prevErrors => ({
                    ...prevErrors,
                    validarGanancia: 'La utilidad esperada es menor que la utilidad deseada'
                }));
            } else {
                setErrors(prevErrors => ({
                    ...prevErrors,
                    validarGanancia: ''
                }));
            }
        };

        calcularPrecioPublico();
    }, [precioPublico, comisionDeVentaPorcentaje, sobreprecioPorcentaje, costo, gasto, utilidadMonto]);

    //! Cambio de tipo de utilidad
    const handleChangeTipoUtilidad = (tipo: string) => {
        setTipo(tipo);
        if (tipo === 'servicio') {
            setUtilidadPorcentaje(configuracion?.utilidad_servicio);
        } else {
            setUtilidadPorcentaje(configuracion?.utilidad_producto);
        }
    };
    //! Eliminar servicio
    const handleDeleteServicio = async () => {
        if (confirm('¿Estás seguro de eliminar este servicio?')) {
            await eliminarServicio(servicioId);
            router.push('/admin/configurar/servicios');
        }
    }

    return (
        <div className='text-black p-5 mx-auto max-w-screen-sm'>

            {/* HEADER */}
            <div className='grid grid-cols-2 items-center mb-5'>

                <h2 className="leading-7 text-gray-300 text-xl font-semibold">
                    Editar servicio
                </h2>
                <div className='flex justify-end'>
                    <label className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={visibilidadCliente}
                                onChange={(e) => setVisibilidadCliente(e.target.checked)}
                                className="sr-only bg-zinc-900 border border-zinc-800"
                            />
                            <div className={`block w-14 h-8 rounded-full transition ${visibilidadCliente ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${visibilidadCliente ? 'transform translate-x-full' : ''}`}></div>
                        </div>
                        <span
                            className="ml-3 text-zinc-500 text-xl ">
                            {visibilidadCliente ? 'Visible al cliente' : 'No visible al cliente'}
                        </span>
                    </label>
                </div>
            </div>

            {/* CATEGORIAS */}
            <div className="mb-4">
                <label className="block text-gray-500 text-sm mb-1">
                    Categoría
                </label>
                <select
                    value={categoria?.id || ''}
                    onChange={(e) => {
                        const selectedCategoria = categorias.find(cat => cat.id === e.target.value);
                        setCategoria(selectedCategoria || null);
                    }}
                    className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-200"
                >
                    <option value="" disabled>Seleccione una categoría</option>
                    {categorias.map(categoria => (
                        <option key={categoria.id} value={categoria.id}>
                            {categoria.nombre}
                        </option>
                    ))}
                </select>
                {errors.categoria && <p className="text-red-500 text-sm pt-1">{errors.categoria}</p>}
            </div>

            <div className="">

                <div className="mb-4">
                    <textarea
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full px-3 py-2 border h-24 rounded-md bg-zinc-900 border-zinc-800 text-zinc-200"
                    />
                    {errors.nombre && <p className="text-red-500 text-sm">{errors.nombre}</p>}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">

                    {/* COSTO */}
                    <div className="p-3 border border-zinc-600 rounded-md">
                        <label className="block text-gray-500 text-sm mb-1">
                            Costo del servicio
                        </label>
                        <input
                            type="number"
                            value={costo}
                            onChange={(e) => setCosto(e.target.value)}
                            className="w-full px-3 py-2 rounded block bg-zinc-900 border border-zinc-800 text-zinc-200"
                            placeholder="Ingrese el costo del servicio"
                        />
                        {errors.costo && <p className="text-red-500 text-sm">{errors.costo}</p>}
                    </div>

                    {/* SELECT TIPO UTILIDAD  */}
                    <div className="p-3 border border-zinc-600 rounded-md">
                        <label className="block text-gray-500 text-sm mb-1">
                            Aplicar tipo de utilidad
                        </label>
                        <select
                            value={tipo}
                            onChange={(e) => handleChangeTipoUtilidad(e.target.value)}
                            className="px-5 py-2 bg-zinc-900 border border-zinc-800 text-zinc-200 rounded w-full"
                        >
                            <option value="servicio">Servicio</option>
                            <option value="producto">Producto</option>
                        </select>
                    </div>

                </div>

                {/* GASTOS */}
                <div className='p-3 bg-zinc-900 border border-zinc-700 rounded-md mb-3'>
                    <label className="block text-gray-500 text-sm mb-1">
                        Gastos asociados:
                    </label>
                    <ListaGastos
                        gastos={gastosTemporales}
                        onAgregarGasto={agregarGastoTemporal}
                        onEliminarGasto={eliminarGastoTemporal}
                        onEditarGasto={handleEditarGasto}
                    />
                    <p className='text-white text-sm py-2'>
                        Gastos totales: {gasto.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                    </p>
                </div>


                <div className='text-zinc-600 border-zinc-700 rounded-md mb-3
                grid grid-cols-2 gap-2'>

                    {/* PRECIO SISTEMA */}
                    <div className="p-3 border border-zinc-600 rounded-md">
                        <label className="block text-gray-500 text-sm mb-1">
                            Precio del sistema
                        </label>

                        <div className='text-white text-2xl py-2 px-2 bg-zinc-900 border border-zinc-800'>
                            {Number(precio).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                        </div>
                    </div>

                    {/* PRECIO PÚBLICO */}
                    <div className="p-3 border border-zinc-600 rounded-md">
                        <label className="block text-gray-500 text-sm mb-1">
                            Precio público
                        </label>
                        <div className='text-white flex-grow'>
                            <input
                                type="number"
                                id="precio_publico"
                                name="precio_publico"
                                value={precioPublico}
                                onChange={(e) => setPrecioPublico(e.target.value)}
                                className="p-2 rounded-md w-full flex-grow text-left bg-zinc-900 border border-zinc-800 text-zinc-200 text-2xl"
                            />
                            {errors.precio_publico && <p className="text-red-500 text-sm mt-1">{errors.precio_publico}</p>}
                        </div>
                    </div>
                </div>

                {/* COMPROBACIÓN */}
                <div className='p-3 bg-zinc-00 border text-zinc-600 border-zinc-700 rounded-md mb-3'>

                    <p className=' mb-1 text-sm'>
                        Validación de ganancia al {utilidadPorcentaje}% de utilidad, pago de comisión de venta al {comisionDeVentaPorcentaje}% y margen de sobreprecio por el {sobreprecioPorcentaje}% para usarlo en descuentos y promociones.
                    </p>

                    <div className="grid grid-cols-4 gap-1">

                        <div className='p-2 text-sm'>
                            <label htmlFor="gasto" className="block font-medium text-gray-300">
                                CDV {comisionDeVentaPorcentaje}%
                            </label>
                            <p className='text-zinc-500'>
                                {comisionDeVentaPrecioPublico.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                            </p>
                        </div>

                        <div className='p-2 text-sm'>
                            <label htmlFor="utilidad" className="block font-medium text-gray-300">
                                SP {sobreprecioPorcentaje}%
                            </label>
                            <p className='text-zinc-500'>
                                {sobreprecioPrecioPublico.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                            </p>
                        </div>


                        <div className='p-2 text-sm'>
                            <label htmlFor="costo" className="block font-medium text-gray-300 ">
                                UB {utilidadPorcentaje}%
                            </label>
                            <p className='text-zinc-500'>
                                {Number(utilidadMonto).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                            </p>
                        </div>


                        <div className={`p-2 text-sm ${gananciaPrecioPublico < Number(utilidadMonto) ? 'bg-red-800/30 rounded-md text-red-600' : 'bg-green-800/30 rounded-md text-green-600'}`}>
                            <label htmlFor="utilidad" className="block font-medium text-gray-300">
                                Ganancia
                            </label>
                            <p className=''>
                                {isNaN(gananciaPrecioPublico) ? '$0' : gananciaPrecioPublico.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                            </p>
                        </div>

                    </div>
                </div>


                {errors.validarGanancia &&
                    <p className="bg-red-800/50 p-5 text-center rounded-md mb-3 text-red-500 text-sm">{errors.validarGanancia}</p>
                }

                {statusUpdate && <p
                    className="
                    bg-green-800/50 
                    bottom-5
                    right-5
                    p-5 text-center 
                    rounded-md mb-3 
                    text-green-500 text-sm"
                >
                    {statusUpdate}
                </p>}

                <div className='flex justify-between gap-2'>
                    <button
                        onClick={() => handleSubmit('updateAndClose')}
                        className={`w-full py-2 rounded ${actualizandoParaCerrar ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-700 hover:bg-blue-700'} text-white`}
                        disabled={actualizandoParaCerrar}
                    >
                        {actualizandoParaCerrar ? 'Actualizando...' : 'Actualizar y cerrar ventana'}
                    </button>
                    <button
                        onClick={() => handleSubmit('update')}
                        className={`w-full py-2 rounded ${actualizando ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700'} text-white`}
                        disabled={actualizando}
                    >
                        {actualizando ? 'Actualizando...' : 'Actualizar'}
                    </button>
                </div>
                <button
                    onClick={() => router.push('/admin/configurar/servicios')}
                    className="w-full bg-red-500 text-white py-2 rounded mt-4 hover:bg-red-700"
                >
                    Cerrar ventana
                </button>

                <div className='flex justify-center mt-4'>
                    <button className='text-red-600 flex items-center'
                        onClick={handleDeleteServicio}>
                        <Trash2 size={16} className='mr-2' /> Eliminar servicio
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FormEditarServicio;