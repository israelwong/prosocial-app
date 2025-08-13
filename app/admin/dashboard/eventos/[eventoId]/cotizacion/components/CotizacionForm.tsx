'use client';

import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CotizacionFormSchema, type CotizacionForm } from '@/app/admin/_lib/actions/cotizacion/cotizacion.schemas';
import { crearCotizacionNueva } from '@/app/admin/_lib/actions/cotizacion/cotizacion.actions';
import { useRouter } from 'next/navigation';
import { Loader2, MinusCircle, Plus, Minus } from 'lucide-react';
import { useMemo } from 'react';
import { calcularPaquete, calcularServicioDesdeBase, type ServicioCantidad } from '@/app/admin/_lib/pricing/calculos';
import toast from 'react-hot-toast';

// Tipos de datos basados en las estructuras existentes
interface CatalogoSeccion {
    id: string;
    nombre: string;
    posicion: number | null;
    seccionCategorias: {
        ServicioCategoria: any; // Categoria con servicios
    }[];
}

interface Props {
    evento: any;
    tiposEvento: any[];
    catalogo: CatalogoSeccion[];
    configuracion: any;
    condiciones: any[];
    metodosPago: any[];
    paqueteBase?: any;
    serviciosBase?: any[];
    eventoTipoSeleccionado: any;
    metadata: {
        tienePaqueteBase: boolean;
        tieneEventoTipoEspecifico: boolean;
        totalServicios: number;
    };
}

export default function CotizacionForm({
    evento,
    tiposEvento,
    catalogo,
    configuracion,
    condiciones,
    metodosPago,
    paqueteBase,
    serviciosBase = [],
    eventoTipoSeleccionado,
    metadata
}: Props) {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<CotizacionForm>({
        resolver: zodResolver(CotizacionFormSchema),
        defaultValues: {
            nombre: paqueteBase ? `Cotización ${paqueteBase.nombre}` : 'Nueva Cotización',
            eventoTipoId: eventoTipoSeleccionado.id,
            servicios: serviciosBase.map(s => ({
                servicioId: s.id,
                cantidad: s.cantidad?.toString() || '1'
            }))
        },
    });

    // Helper para calcular precio correcto de un servicio
    const calcularPrecioCorrectoServicio = (servicio: any): number => {
        if (!configuracion) return servicio.precio_publico || 0;

        const resultado = calcularServicioDesdeBase({
            costo: servicio.costo || 0,
            gastos: servicio.gasto || 0,
            tipo_utilidad: (servicio.tipo_utilidad === 'producto' ? 'producto' : 'servicio'),
            configuracion
        });

        return resultado.precioSistema;
    };

    const { fields, append, remove } = useFieldArray({
        control,
        name: "servicios",
    });

    const watchedServicios = useWatch({ control, name: 'servicios' });

    // Servicios disponibles por sección (normalizar estructura como en PaqueteForm)
    const secciones = useMemo(() => {
        if (!catalogo) return [];

        // Ordenar secciones por posición
        const seccionesOrdenadas = [...catalogo].sort((a, b) => (a.posicion || 0) - (b.posicion || 0));

        // Ordenar categorías y servicios dentro de cada sección
        return seccionesOrdenadas.map(seccion => ({
            ...seccion,
            seccionCategorias: [...seccion.seccionCategorias]
                .sort((a, b) => (a.ServicioCategoria.posicion || 0) - (b.ServicioCategoria.posicion || 0))
                .map(sc => ({
                    ...sc,
                    ServicioCategoria: {
                        ...sc.ServicioCategoria,
                        Servicio: sc.ServicioCategoria.Servicio
                            ? [...sc.ServicioCategoria.Servicio].sort((a, b) => (a.posicion || 0) - (b.posicion || 0))
                            : []
                    }
                }))
        }));
    }, [catalogo]);

    // Cálculos en tiempo real
    const calculosEnTiempoReal = useMemo(() => {
        if (!configuracion || watchedServicios.length === 0) return null;

        // Obtener servicios completos para cálculos
        const serviciosCantidad: ServicioCantidad[] = watchedServicios.map(s => {
            // Buscar el servicio en todas las secciones
            let servicio = null;
            for (const seccion of secciones) {
                for (const categoria of seccion.seccionCategorias) {
                    servicio = categoria.ServicioCategoria.Servicio?.find((srv: any) => srv.id === s.servicioId);
                    if (servicio) break;
                }
                if (servicio) break;
            }

            return {
                costo: servicio?.costo || 0,
                gasto: servicio?.gasto || 0,
                utilidad: servicio?.utilidad || 0,
                precio_publico: servicio ? calcularPrecioCorrectoServicio(servicio) : 0,
                cantidad: parseInt(s.cantidad || '1', 10),
                tipo_utilidad: servicio?.tipo_utilidad || 'servicio'
            };
        });

        return calcularPaquete({
            servicios: serviciosCantidad,
            configuracion,
            precioVenta: 0, // Se calculará automáticamente
            descuentoPorcentaje: 0,
            metodoPago: null,
            condicion: null,
            usarSumaPreciosServicio: true
        });

    }, [watchedServicios, configuracion, secciones]);

    // Precio sistema sugerido
    const precioSistema = calculosEnTiempoReal?.precioSistemaPaquete || 0;

    // Verificar si un servicio ya está seleccionado
    const servicioEstaSeleccionado = (servicioId: string) => {
        return fields.some(field => field.servicioId === servicioId);
    };

    // Agregar servicio al formulario
    const handleAddServicio = (servicio: any) => {
        const yaExiste = fields.some(field => field.servicioId === servicio.id);
        if (yaExiste) {
            toast.error('Este servicio ya está agregado');
            return;
        }

        append({
            servicioId: servicio.id,
            cantidad: '1'
        });
        toast.success(`${servicio.nombre} agregado`);
    };

    // Modificar cantidad de un servicio
    const handleModificarCantidad = (index: number, operacion: 'incrementar' | 'decrementar') => {
        const cantidadActual = parseInt(watchedServicios[index]?.cantidad || '1', 10);

        if (operacion === 'decrementar' && cantidadActual <= 1) {
            return;
        }

        const nuevaCantidad = operacion === 'incrementar'
            ? cantidadActual + 1
            : cantidadActual - 1;

        setValue(`servicios.${index}.cantidad`, nuevaCantidad.toString());
    };

    // Agrupar servicios seleccionados por sección y categoría
    const serviciosAgrupadosSeleccionados = useMemo(() => {
        const agrupados: any = {};

        fields.forEach((field, index) => {
            // Buscar el servicio completo y su jerarquía
            let servicioCompleto = null;
            let seccionNombre = '';
            let categoriaNombre = '';
            let posicionServicio = 0;
            let posicionSeccion = 0;
            let posicionCategoria = 0;

            for (const seccion of secciones) {
                for (const categoria of seccion.seccionCategorias) {
                    const servicio = categoria.ServicioCategoria.Servicio?.find((srv: any) => srv.id === field.servicioId);
                    if (servicio) {
                        servicioCompleto = servicio;
                        seccionNombre = seccion.nombre;
                        categoriaNombre = categoria.ServicioCategoria.nombre;
                        posicionServicio = servicio.posicion || 0;
                        posicionSeccion = seccion.posicion || 0;
                        posicionCategoria = categoria.ServicioCategoria.posicion || 0;
                        break;
                    }
                }
                if (servicioCompleto) break;
            }

            if (servicioCompleto) {
                if (!agrupados[seccionNombre]) {
                    agrupados[seccionNombre] = {
                        posicion: posicionSeccion,
                        categorias: {}
                    };
                }
                if (!agrupados[seccionNombre].categorias[categoriaNombre]) {
                    agrupados[seccionNombre].categorias[categoriaNombre] = {
                        posicion: posicionCategoria,
                        servicios: []
                    };
                }

                const cantidad = parseInt(watchedServicios[index]?.cantidad || '1', 10);
                const precio = calcularPrecioCorrectoServicio(servicioCompleto);

                agrupados[seccionNombre].categorias[categoriaNombre].servicios.push({
                    ...servicioCompleto,
                    fieldIndex: index,
                    fieldId: field.id,
                    cantidad,
                    precio,
                    subtotal: precio * cantidad,
                    posicion: posicionServicio
                });
            }
        });

        // Ordenar servicios dentro de cada categoría
        Object.keys(agrupados).forEach(seccionNombre => {
            Object.keys(agrupados[seccionNombre].categorias).forEach(categoriaNombre => {
                agrupados[seccionNombre].categorias[categoriaNombre].servicios.sort((a: any, b: any) => (a.posicion || 0) - (b.posicion || 0));
            });
        });

        // Convertir a estructura ordenada para el renderizado
        const seccionesOrdenadas = Object.entries(agrupados)
            .sort(([, a]: any, [, b]: any) => (a.posicion || 0) - (b.posicion || 0))
            .reduce((acc, [seccionNombre, seccionData]: any) => {
                const categoriasOrdenadas = Object.entries(seccionData.categorias)
                    .sort(([, a]: any, [, b]: any) => (a.posicion || 0) - (b.posicion || 0))
                    .reduce((catAcc, [categoriaNombre, categoriaData]: any) => {
                        catAcc[categoriaNombre] = categoriaData.servicios;
                        return catAcc;
                    }, {} as any);

                acc[seccionNombre] = categoriasOrdenadas;
                return acc;
            }, {} as any);

        return seccionesOrdenadas;
    }, [fields, watchedServicios, secciones]);

    // Submit del formulario
    const onSubmit = async (data: CotizacionForm) => {
        try {
            // Preparar servicios para la cotización
            const serviciosCotizacion = data.servicios.map((s, index) => {
                // Buscar el servicio completo
                let servicio = null;
                for (const seccion of secciones) {
                    for (const categoria of seccion.seccionCategorias) {
                        servicio = categoria.ServicioCategoria.Servicio?.find((srv: any) => srv.id === s.servicioId);
                        if (servicio) break;
                    }
                    if (servicio) break;
                }

                if (!servicio) {
                    throw new Error(`Servicio con ID ${s.servicioId} no encontrado`);
                }

                const precioUnitario = calcularPrecioCorrectoServicio(servicio);

                return {
                    servicioId: servicio.id,
                    servicioCategoriaId: servicio.servicioCategoriaId,
                    cantidad: parseInt(s.cantidad, 10),
                    precioUnitario,
                    costo: servicio.costo || 0,
                    nombre: servicio.nombre,
                    posicion: servicio.posicion || index
                };
            });

            await crearCotizacionNueva({
                eventoId: evento.id,
                eventoTipoId: data.eventoTipoId,
                nombre: data.nombre,
                precio: precioSistema, // Usar precio sistema automáticamente
                servicios: serviciosCotizacion
            });

            toast.success('Cotización creada exitosamente');
            router.push(`/admin/dashboard/eventos/${evento.id}`);

        } catch (error: any) {
            console.error('Error al crear cotización:', error);
            toast.error(error?.message || 'Error al crear cotización');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Layout Responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* Columnas 1-2: Catálogo de Servicios */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                        <h3 className="text-lg font-semibold text-zinc-100 mb-4">
                            Catálogo de Servicios
                        </h3>

                        <div className="space-y-4 max-h-[600px] overflow-y-auto">
                            {secciones.map(seccion => (
                                <div key={seccion.id} className="border border-zinc-700/60 rounded-lg p-4 bg-zinc-900/30 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-base font-semibold text-zinc-300">{seccion.nombre}</h4>
                                        <span className="text-xs text-zinc-500">
                                            {seccion.seccionCategorias.reduce((acc, sc) => acc + (sc.ServicioCategoria.Servicio?.length || 0), 0)} servicios
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        {seccion.seccionCategorias.map(sc => (
                                            <div key={sc.ServicioCategoria.id} className="space-y-2 border border-zinc-700/40 rounded-md p-3 bg-zinc-800/40">
                                                <h5 className="text-sm font-medium text-zinc-400">
                                                    {sc.ServicioCategoria.nombre}
                                                </h5>
                                                <div className="space-y-1.5">
                                                    {sc.ServicioCategoria.Servicio?.map((servicio: any) => {
                                                        const estaSeleccionado = servicioEstaSeleccionado(servicio.id);
                                                        return (
                                                            <div
                                                                key={servicio.id}
                                                                onClick={() => handleAddServicio(servicio)}
                                                                className={`p-2.5 rounded-md border flex justify-between items-center transition group ${estaSeleccionado
                                                                    ? 'border-zinc-800/50 bg-zinc-900/40 opacity-50 cursor-default'
                                                                    : 'border-zinc-800 bg-zinc-900/80 cursor-pointer hover:border-blue-500 hover:bg-zinc-800/80'
                                                                    }`}
                                                            >
                                                                <span className={`text-sm truncate pr-2 ${estaSeleccionado
                                                                    ? 'text-zinc-500'
                                                                    : 'text-zinc-200 group-hover:text-white'
                                                                    }`}>
                                                                    {servicio.nombre}
                                                                    {estaSeleccionado && <span className="ml-2 text-xs">(Agregado)</span>}
                                                                </span>
                                                                <span className={`text-xs ${estaSeleccionado
                                                                    ? 'text-zinc-600'
                                                                    : 'text-zinc-400 group-hover:text-zinc-300'
                                                                    }`}>
                                                                    {calcularPrecioCorrectoServicio(servicio).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Columnas 3-4: Servicios Seleccionados */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                        <h3 className="text-lg font-semibold text-zinc-100 mb-4">
                            Servicios Seleccionados ({fields.length})
                        </h3>

                        {fields.length === 0 ? (
                            <div className="text-center py-12 text-zinc-400">
                                <p className="text-lg mb-2">No hay servicios seleccionados</p>
                                <p className="text-sm">Agrega servicios desde el catálogo</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {Object.entries(serviciosAgrupadosSeleccionados).map(([seccion, categorias]) => (
                                    <div key={seccion} className="border border-zinc-700/50 rounded-lg p-4 bg-zinc-800/30">
                                        <h4 className="text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wide">
                                            {seccion}
                                        </h4>

                                        <div className="space-y-4">
                                            {Object.entries(categorias as any).map(([categoria, servicios]) => (
                                                <div key={categoria} className="space-y-2">
                                                    <h5 className="text-sm font-semibold text-blue-400 px-2 py-1 bg-blue-900/20 rounded border-l-2 border-blue-500">
                                                        {categoria}
                                                    </h5>

                                                    <div className="space-y-2">
                                                        {(servicios as any[]).map((servicio) => (
                                                            <div key={servicio.fieldId} className="bg-zinc-900/50 rounded-md p-3 border border-zinc-700/40">
                                                                <div className="flex items-center justify-between">
                                                                    {/* Descripción completa */}
                                                                    <div className="flex-1 min-w-0 pr-4">
                                                                        <div className="font-medium text-zinc-100 text-sm">
                                                                            {servicio.nombre}
                                                                        </div>
                                                                    </div>

                                                                    {/* Subtotal */}
                                                                    <div className="text-right mr-4">
                                                                        <div className="font-semibold text-zinc-100">
                                                                            {servicio.subtotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                                                        </div>
                                                                        <div className="text-xs text-zinc-400">
                                                                            {servicio.precio.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} c/u
                                                                        </div>
                                                                    </div>

                                                                    {/* Controles de cantidad */}
                                                                    <div className="flex items-center gap-2">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleModificarCantidad(servicio.fieldIndex, 'decrementar')}
                                                                            disabled={servicio.cantidad <= 1}
                                                                            className="p-1 rounded bg-zinc-700 text-zinc-300 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                        >
                                                                            <Minus size={14} />
                                                                        </button>

                                                                        <span className="w-8 text-center text-sm font-medium text-zinc-100">
                                                                            {servicio.cantidad}
                                                                        </span>

                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleModificarCantidad(servicio.fieldIndex, 'incrementar')}
                                                                            className="p-1 rounded bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                                                                        >
                                                                            <Plus size={14} />
                                                                        </button>

                                                                        <button
                                                                            type="button"
                                                                            onClick={() => remove(servicio.fieldIndex)}
                                                                            className="p-1 ml-2 text-red-400 hover:text-red-300"
                                                                        >
                                                                            <MinusCircle size={16} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Columna 5: Detalles de la Cotización */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                        <h3 className="text-lg font-semibold text-zinc-100 mb-4">Detalles de Cotización</h3>

                        <div className="space-y-4">
                            {/* Nombre de cotización */}
                            <div>
                                <label htmlFor="nombre" className="block text-sm font-medium text-zinc-300 mb-1.5">
                                    Nombre de Cotización
                                </label>
                                <input
                                    id="nombre"
                                    {...register('nombre')}
                                    className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                                    placeholder="Nombre descriptivo"
                                />
                                {errors.nombre && (
                                    <p className="text-red-400 text-xs mt-1">{errors.nombre.message}</p>
                                )}
                            </div>

                            {/* Tipo de evento - Solo lectura */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                                    Tipo de Evento
                                </label>
                                <div className="flex h-10 w-full items-center rounded-md border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-400">
                                    {eventoTipoSeleccionado.nombre}
                                </div>
                            </div>

                            {/* Precio sistema */}
                            {precioSistema > 0 && (
                                <div className="p-3 rounded-lg border border-blue-500/60 bg-blue-900/20">
                                    <div className="text-xs text-blue-200 mb-1">Precio de Cotización</div>
                                    <div className="text-lg font-semibold text-blue-300">
                                        {precioSistema.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                    </div>
                                    <div className="text-xs text-blue-400 mt-1">
                                        Calculado automáticamente
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Botones de acción */}
                        <div className="mt-6 space-y-3">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting && <Loader2 size={16} className="animate-spin mr-2" />}
                                Guardar Cotización
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push(`/admin/dashboard/eventos/${evento.id}`)}
                                className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 bg-zinc-700 text-zinc-100 hover:bg-zinc-600"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
