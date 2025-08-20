'use client';

import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CotizacionFormSchema, type CotizacionForm } from '@/app/admin/_lib/actions/cotizacion/cotizacion.schemas';
import { manejarSubmitCotizacion } from '@/app/admin/_lib/actions/cotizacion/cotizacion.actions';
import { useRouter } from 'next/navigation';
import { Loader2, MinusCircle, Plus, Minus } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { calcularPaquete, calcularServicioDesdeBase, type ServicioCantidad } from '@/app/admin/_lib/pricing/calculos';
import toast from 'react-hot-toast';
import BotonAutorizarCotizacion from './BotonAutorizarCotizacion';

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
    // Props para modo edición
    cotizacionExistente?: any;
    modo?: 'crear' | 'editar';
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
    metadata,
    cotizacionExistente,
    modo = 'crear'
}: Props) {
    const router = useRouter();

    // Debug del eventoTipoSeleccionado
    console.log('🔍 eventoTipoSeleccionado completo:', eventoTipoSeleccionado);
    console.log('🔍 eventoTipoSeleccionado.id:', eventoTipoSeleccionado?.id);
    console.log('🔍 tipo de eventoTipoSeleccionado.id:', typeof eventoTipoSeleccionado?.id);
    console.log('🔍 Keys de eventoTipoSeleccionado:', Object.keys(eventoTipoSeleccionado || {}));
    console.log('🔍 tiposEvento disponibles:', tiposEvento);

    // Fallback para eventoTipoId - usar el primero disponible si no hay uno seleccionado
    const eventoTipoIdFinal = eventoTipoSeleccionado?.id || tiposEvento?.[0]?.id || '';
    console.log('🔍 eventoTipoIdFinal que se usará:', eventoTipoIdFinal);

    // Estado para modal de servicio personalizado
    const [mostrarModalServicioPersonalizado, setMostrarModalServicioPersonalizado] = useState(false);
    const [servicioPersonalizado, setServicioPersonalizado] = useState({
        nombre: '',
        precio: '',
        categoria: '',
        guardarEnCatalogo: false
    });

    // Estado para servicios personalizados agregados
    const [serviciosPersonalizados, setServiciosPersonalizados] = useState<Record<string, {
        id: string;
        nombre: string;
        precio: number;
        categoria: string;
    }>>(() => {
        // Cargar servicios personalizados existentes si estamos en modo edición
        if (modo === 'editar' && cotizacionExistente?.Servicio) {
            const personalizados: Record<string, any> = {};
            cotizacionExistente.Servicio.forEach((servicio: any) => {
                if (servicio.es_personalizado) {
                    const id = `personalizado_${servicio.id}`;
                    personalizados[id] = {
                        id,
                        nombre: servicio.nombre_snapshot,
                        precio: servicio.precioUnitario,
                        categoria: servicio.categoria_nombre_snapshot || 'Sin categoría'
                    };
                }
            });
            return personalizados;
        }
        return {};
    });

    // Estado para controlar edición en línea
    const [editandoServicio, setEditandoServicio] = useState<string | null>(null);
    const [editandoPrecio, setEditandoPrecio] = useState<string | null>(null);
    // Estado para controlar qué servicios tienen precio personalizado activo
    const [preciosPersonalizados, setPreciosPersonalizados] = useState<Record<string, boolean>>({});
    const [preciosPersonalizadosValores, setPreciosPersonalizadosValores] = useState<Record<string, number>>({});

    // Estado para controlar precio total personalizado
    const [editandoPrecioTotal, setEditandoPrecioTotal] = useState<boolean>(false);
    const [precioTotalPersonalizado, setPrecioTotalPersonalizado] = useState<number | null>(null);

    // Inicializar precios personalizados para cotizaciones existentes
    useEffect(() => {
        if (modo === 'editar' && cotizacionExistente?.Servicio) {
            const preciosPersonalizadosInit: Record<string, boolean> = {};
            const preciosPersonalizadosValoresInit: Record<string, number> = {};

            cotizacionExistente.Servicio.forEach((servicio: any, index: number) => {
                const fieldId = `servicio-${index}`;

                // Si tiene un precio unitario diferente al precio calculado del servicio, es personalizado
                if (servicio.servicioId) {
                    // Buscar el servicio original para comparar precios
                    let servicioOriginal = null;
                    for (const seccion of catalogo || []) {
                        for (const categoria of seccion.seccionCategorias) {
                            servicioOriginal = categoria.ServicioCategoria.Servicio?.find((srv: any) => srv.id === servicio.servicioId);
                            if (servicioOriginal) break;
                        }
                        if (servicioOriginal) break;
                    }

                    if (servicioOriginal && configuracion) {
                        const precioCalculado = calcularServicioDesdeBase({
                            costo: servicioOriginal.costo || 0,
                            gastos: servicioOriginal.gasto || 0,
                            tipo_utilidad: (servicioOriginal.tipo_utilidad === 'producto' ? 'producto' : 'servicio'),
                            configuracion
                        }).precioSistema;

                        // Si el precio guardado es diferente al calculado, es personalizado
                        if (Math.abs(servicio.precioUnitario - precioCalculado) > 0.01) {
                            preciosPersonalizadosInit[fieldId] = true;
                            preciosPersonalizadosValoresInit[fieldId] = servicio.precioUnitario;
                        }
                    }
                } else {
                    // Servicio personalizado (sin servicioId)
                    preciosPersonalizadosInit[fieldId] = true;
                    preciosPersonalizadosValoresInit[fieldId] = servicio.precioUnitario;
                }
            });

            setPreciosPersonalizados(preciosPersonalizadosInit);
            setPreciosPersonalizadosValores(preciosPersonalizadosValoresInit);

            // Inicializar precio total personalizado si existe
            if (cotizacionExistente.precio) {
                // Aquí podrías comparar con el precio calculado para detectar si es personalizado
                // Por ahora solo lo guardamos como referencia
                setPrecioTotalPersonalizado(cotizacionExistente.precio);
            }
        }
    }, [modo, cotizacionExistente, catalogo, configuracion]);

    // Preparar servicios base dependiendo del modo
    const serviciosParaFormulario = modo === 'editar' && cotizacionExistente?.Servicio
        ? cotizacionExistente.Servicio.map((servicio: any) => ({
            servicioId: servicio.servicioId || `personalizado_${servicio.id}`,
            cantidad: servicio.cantidad.toString(),
            precioPersonalizado: servicio.precioUnitario?.toString() || ""
        }))
        : serviciosBase.map(s => ({
            servicioId: s.id,
            cantidad: s.cantidad?.toString() || '1',
            precioPersonalizado: ""
        }));

    // Preparar costos base dependiendo del modo
    const costosParaFormulario = modo === 'editar' && cotizacionExistente?.Costos
        ? cotizacionExistente.Costos.map((costo: any) => ({
            nombre: costo.nombre,
            costo: costo.costo.toString(),
            tipo: costo.tipo
        }))
        : [];

    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: { errors, isSubmitting, isValid }
    } = useForm<CotizacionForm>({
        resolver: zodResolver(CotizacionFormSchema) as any,
        mode: 'onChange', // Validar en tiempo real
        defaultValues: {
            nombre: modo === 'editar' && cotizacionExistente
                ? cotizacionExistente.nombre
                : paqueteBase ? `Paquete ${paqueteBase.nombre}` : 'Nueva Cotización',
            eventoTipoId: eventoTipoIdFinal,
            servicios: serviciosParaFormulario,
            costos: costosParaFormulario
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

    // Field array para costos adicionales
    const {
        fields: costosFields,
        append: appendCosto,
        remove: removeCosto
    } = useFieldArray({
        control,
        name: "costos",
    });

    const watchedServicios = useWatch({ control, name: 'servicios' });
    const watchedCostos = useWatch({ control, name: 'costos' });

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
        const serviciosCantidad: ServicioCantidad[] = watchedServicios.map((s, index) => {
            // Verificar si es un servicio personalizado
            const servicioPersonalizadoData = serviciosPersonalizados[s.servicioId];
            if (servicioPersonalizadoData) {
                return {
                    costo: 0,
                    gasto: 0,
                    utilidad: servicioPersonalizadoData.precio,
                    precio_publico: servicioPersonalizadoData.precio,
                    cantidad: parseInt(s.cantidad || '1', 10),
                    tipo_utilidad: 'servicio'
                };
            }

            // Buscar el servicio en todas las secciones (lógica original)
            let servicio = null;
            for (const seccion of secciones) {
                for (const categoria of seccion.seccionCategorias) {
                    servicio = categoria.ServicioCategoria.Servicio?.find((srv: any) => srv.id === s.servicioId);
                    if (servicio) break;
                }
                if (servicio) break;
            }

            // Usar precio personalizado si está definido
            const precioPersonalizado = parseFloat(s.precioPersonalizado || '0');
            const precioFinal = precioPersonalizado > 0 ? precioPersonalizado : (servicio ? calcularPrecioCorrectoServicio(servicio) : 0);

            return {
                costo: servicio?.costo || 0,
                gasto: servicio?.gasto || 0,
                utilidad: servicio?.utilidad || 0,
                precio_publico: precioFinal,
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

    }, [watchedServicios, configuracion, secciones, serviciosPersonalizados]);

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

    // Funciones para manejar precio personalizado
    const handleActivarPrecioPersonalizado = (fieldId: string, precioActual: number) => {
        setPreciosPersonalizados(prev => ({ ...prev, [fieldId]: true }));
        setPreciosPersonalizadosValores(prev => ({ ...prev, [fieldId]: precioActual }));
        setEditandoPrecio(fieldId);
    };

    const handleCambiarPrecioPersonalizado = (fieldId: string, nuevoPrecio: number) => {
        setPreciosPersonalizadosValores(prev => ({ ...prev, [fieldId]: nuevoPrecio }));
    };

    const handleGuardarPrecioPersonalizado = (fieldId: string) => {
        setEditandoPrecio(null);
        toast.success('Precio personalizado aplicado');
    };

    const handleCancelarPrecioPersonalizado = (fieldId: string) => {
        setPreciosPersonalizados(prev => ({ ...prev, [fieldId]: false }));
        setPreciosPersonalizadosValores(prev => {
            const newValues = { ...prev };
            delete newValues[fieldId];
            return newValues;
        });
        setEditandoPrecio(null);
    };

    // Funciones para manejar precio total personalizado
    const handleActivarPrecioTotal = (precioActual: number) => {
        setEditandoPrecioTotal(true);
        setPrecioTotalPersonalizado(precioActual);
    };

    const handleCambiarPrecioTotal = (nuevoPrecio: number) => {
        setPrecioTotalPersonalizado(nuevoPrecio);
    };

    const handleGuardarPrecioTotal = () => {
        setEditandoPrecioTotal(false);
        toast.success('Precio total personalizado aplicado');
    };

    const handleCancelarPrecioTotal = () => {
        setEditandoPrecioTotal(false);
        setPrecioTotalPersonalizado(null);
    };

    // Funciones para manejar costos adicionales
    const handleEliminarCosto = (index: number) => {
        removeCosto(index);
        toast.success('Costo eliminado');
    };

    // Funciones para servicio personalizado
    const handleCambioServicioPersonalizado = (campo: string, valor: string | boolean) => {
        setServicioPersonalizado(prev => ({
            ...prev,
            [campo]: valor
        }));
    };

    const handleAgregarServicioPersonalizado = () => {
        if (!servicioPersonalizado.nombre.trim() || !servicioPersonalizado.precio) {
            toast.error('Por favor completa el nombre y precio del servicio');
            return;
        }

        // Verificar que el precio sea válido
        const precio = parseFloat(servicioPersonalizado.precio);
        if (isNaN(precio) || precio <= 0) {
            toast.error('Por favor ingresa un precio válido');
            return;
        }

        // Agregar como servicio con ID especial para servicios personalizados
        const servicioId = `personalizado_${Date.now()}`;

        // Guardar en el estado de servicios personalizados
        setServiciosPersonalizados(prev => ({
            ...prev,
            [servicioId]: {
                id: servicioId,
                nombre: servicioPersonalizado.nombre.trim(),
                precio,
                categoria: servicioPersonalizado.categoria
            }
        }));

        append({
            servicioId,
            cantidad: '1',
            precioPersonalizado: precio.toString() // Para servicios personalizados, usar el precio como personalizado
        });

        // Limpiar el formulario y cerrar modal
        setServicioPersonalizado({
            nombre: '',
            precio: '',
            categoria: '',
            guardarEnCatalogo: false
        });
        setMostrarModalServicioPersonalizado(false);
        toast.success('Servicio personalizado agregado');

        // TODO: Si guardarEnCatalogo es true, enviar al servidor para guardarlo permanentemente
        if (servicioPersonalizado.guardarEnCatalogo) {
            console.log('Guardar en catálogo:', {
                nombre: servicioPersonalizado.nombre.trim(),
                precio,
                categoria: servicioPersonalizado.categoria
            });
        }
    };

    // Calcular total de costos adicionales
    const totalCostosAdicionales = useMemo(() => {
        if (!watchedCostos) return 0;
        return watchedCostos.reduce((total, costo) => {
            const valor = parseFloat(costo?.costo || '0');
            const tipo = costo?.tipo || 'adicional';

            // Los descuentos se restan, los demás se suman
            return tipo === 'descuento' ? total - valor : total + valor;
        }, 0);
    }, [watchedCostos]);

    // Precio final incluyendo costos adicionales
    const precioFinal = precioTotalPersonalizado !== null
        ? precioTotalPersonalizado
        : precioSistema + totalCostosAdicionales;

    // Agrupar servicios seleccionados por sección y categoría
    const serviciosAgrupadosSeleccionados = useMemo(() => {
        const agrupados: any = {};

        fields.forEach((field, index) => {
            // Verificar si es un servicio personalizado
            const servicioPersonalizadoData = serviciosPersonalizados[field.servicioId];

            if (servicioPersonalizadoData) {
                // Manejar servicio personalizado
                const seccionNombre = 'Servicios Personalizados';
                const categoriaNombre = servicioPersonalizadoData.categoria || 'Sin categoría';

                if (!agrupados[seccionNombre]) {
                    agrupados[seccionNombre] = {
                        posicion: 999, // Al final
                        categorias: {}
                    };
                }
                if (!agrupados[seccionNombre].categorias[categoriaNombre]) {
                    agrupados[seccionNombre].categorias[categoriaNombre] = {
                        posicion: 999,
                        servicios: []
                    };
                }

                const cantidad = parseInt(watchedServicios[index]?.cantidad || '1', 10);
                const precio = servicioPersonalizadoData.precio;

                agrupados[seccionNombre].categorias[categoriaNombre].servicios.push({
                    id: servicioPersonalizadoData.id,
                    nombre: servicioPersonalizadoData.nombre,
                    fieldIndex: index,
                    fieldId: field.id,
                    cantidad,
                    precio,
                    subtotal: precio * cantidad,
                    posicion: 999,
                    esPersonalizado: true
                });
                return;
            }

            // Buscar el servicio completo y su jerarquía (lógica original)
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

                // Usar precio personalizado si está definido, sino calcular precio normal
                const fieldId = field.id || `${field.servicioId}-${index}`;
                const precioPersonalizadoValor = preciosPersonalizadosValores[fieldId];
                const precio = precioPersonalizadoValor > 0 ? precioPersonalizadoValor : calcularPrecioCorrectoServicio(servicioCompleto);

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
    }, [fields, watchedServicios, secciones, serviciosPersonalizados]);

    // Submit del formulario
    const onSubmit = async (data: CotizacionForm) => {
        console.log('🟢 onSubmit EJECUTADO!');
        console.log('🟢 Data recibida en onSubmit:', data);

        try {
            console.log('Datos del formulario recibidos:', data);

            // Validación básica: debe tener al menos un servicio
            if (!data.servicios || data.servicios.length === 0) {
                toast.error('Debe agregar al menos un servicio antes de guardar');
                return;
            }

            // Preparar servicios para la cotización
            const serviciosCotizacion = data.servicios.map((s, index) => {
                // Verificar si es un servicio personalizado
                const servicioPersonalizadoData = serviciosPersonalizados[s.servicioId];

                if (servicioPersonalizadoData) {
                    // Manejar servicio personalizado
                    const cantidad = parseInt(s.cantidad, 10);
                    const precioUnitario = servicioPersonalizadoData.precio;

                    return {
                        servicioId: null, // No tiene ID de servicio real
                        servicioCategoriaId: null,
                        cantidad,
                        precioUnitario,
                        posicion: 999,

                        // Campos snapshot para trazabilidad
                        seccion_nombre_snapshot: 'Servicios Personalizados',
                        categoria_nombre_snapshot: servicioPersonalizadoData.categoria || 'Sin categoría',
                        nombre_snapshot: servicioPersonalizadoData.nombre,
                        descripcion_snapshot: undefined,
                        precio_unitario_snapshot: precioUnitario,
                        costo_snapshot: 0,
                        gasto_snapshot: 0,
                        utilidad_snapshot: precioUnitario,
                        precio_publico_snapshot: precioUnitario,
                        tipo_utilidad_snapshot: 'servicio',

                        // Campos personalización
                        es_personalizado: true,
                        servicio_original_id: undefined
                    };
                }

                // Buscar el servicio completo (lógica original)
                let servicio = null;
                let categoria = null;
                let seccion = null;

                for (const sec of secciones) {
                    for (const cat of sec.seccionCategorias) {
                        servicio = cat.ServicioCategoria.Servicio?.find((srv: any) => srv.id === s.servicioId);
                        if (servicio) {
                            categoria = cat.ServicioCategoria;
                            seccion = sec;
                            break;
                        }
                    }
                    if (servicio) break;
                }

                if (!servicio) {
                    throw new Error(`Servicio con ID ${s.servicioId} no encontrado`);
                }

                // Verificar si hay precio personalizado para este campo
                const fieldId = `servicio-${index}`;
                const precioPersonalizado = preciosPersonalizadosValores[fieldId];
                const precioUnitario = precioPersonalizado || calcularPrecioCorrectoServicio(servicio);
                const cantidad = parseInt(s.cantidad, 10);
                const utilidad = precioUnitario - (servicio.costo || 0) - (servicio.gasto || 0);

                return {
                    servicioId: servicio.id,
                    servicioCategoriaId: servicio.servicioCategoriaId,
                    cantidad,
                    precioUnitario,
                    posicion: servicio.posicion || index,

                    // Campos snapshot para trazabilidad (Sección → Categoría → Servicio)
                    seccion_nombre_snapshot: seccion?.nombre || undefined,
                    categoria_nombre_snapshot: categoria?.nombre || undefined,
                    nombre_snapshot: servicio.nombre,
                    descripcion_snapshot: undefined,
                    precio_unitario_snapshot: precioUnitario,
                    costo_snapshot: servicio.costo || 0,
                    gasto_snapshot: servicio.gasto || 0,
                    utilidad_snapshot: utilidad,
                    precio_publico_snapshot: servicio.precio_publico || precioUnitario,
                    tipo_utilidad_snapshot: servicio.tipo_utilidad || 'servicio',

                    // Campos personalización
                    es_personalizado: false,
                    servicio_original_id: undefined
                };
            });

            const payload = {
                eventoId: evento.id,
                eventoTipoId: eventoTipoIdFinal, // Usar el ID final validado
                nombre: data.nombre,
                precio: precioFinal, // Usar precio final incluyendo costos
                condicionesComercialesId: data.condicionesComercialesId || undefined,
                servicios: serviciosCotizacion,
                costos: data.costos?.map((costo, index) => ({
                    nombre: costo.nombre,
                    descripcion: undefined,
                    costo: parseFloat(costo.costo) || 0,
                    tipo: costo.tipo,
                    posicion: index + 1
                })) || []
            };

            console.log('Payload a enviar:', payload);

            // Validación extra del payload antes de enviar
            console.log('🔍 Validando payload antes de envío...');
            console.log('- eventoId:', payload.eventoId);
            console.log('- eventoTipoId:', payload.eventoTipoId);
            console.log('- nombre:', payload.nombre);
            console.log('- precio:', payload.precio);
            console.log('- servicios cantidad:', payload.servicios.length);
            console.log('- costos cantidad:', payload.costos.length);

            payload.servicios.forEach((servicio, index) => {
                console.log(`Servicio ${index + 1}:`, {
                    servicioId: servicio.servicioId,
                    servicioCategoriaId: servicio.servicioCategoriaId,
                    cantidad: servicio.cantidad,
                    precioUnitario: servicio.precioUnitario,
                    es_personalizado: servicio.es_personalizado,
                    nombre_snapshot: servicio.nombre_snapshot
                });
            });

            console.log('🚀 Iniciando creación/edición de cotización...');

            if (modo === 'editar' && cotizacionExistente) {
                // Modo edición
                const payloadEdicion = {
                    id: cotizacionExistente.id,
                    nombre: data.nombre,
                    precio: precioFinal,
                    condicionesComercialesId: data.condicionesComercialesId || undefined,
                    status: cotizacionExistente.status || 'pending',
                    visible_cliente: cotizacionExistente.visible_cliente || true,
                    servicios: serviciosCotizacion,
                    costos: data.costos?.map((costo, index) => ({
                        nombre: costo.nombre,
                        descripcion: undefined,
                        costo: parseFloat(costo.costo) || 0,
                        tipo: costo.tipo,
                        posicion: index + 1
                    })) || []
                };

                console.log('Payload edición:', payloadEdicion);
                const cotizacionActualizada = await manejarSubmitCotizacion(payloadEdicion);

                if (cotizacionActualizada?.id) {
                    console.log('✅ Cotización actualizada con ID:', cotizacionActualizada.id);
                    toast.success('Cotización actualizada exitosamente');
                    router.push(`/admin/dashboard/eventos/${evento.id}`);
                } else {
                    throw new Error('No se pudo actualizar la cotización');
                }
            } else {
                // Modo creación
                const cotizacionCreada = await manejarSubmitCotizacion(payload);

                if (cotizacionCreada?.id) {
                    console.log('✅ Cotización creada con ID:', cotizacionCreada.id);
                    toast.success('Cotización creada exitosamente');
                    router.push(`/admin/dashboard/eventos/${evento.id}`);
                } else {
                    throw new Error('No se pudo obtener el ID de la cotización creada');
                }
            }

        } catch (error: any) {
            console.error('Error al crear cotización:', error);
            toast.error(error?.message || 'Error al crear cotización');
        }
    };

    return (
        <>
            <form
                onSubmit={(e) => {
                    console.log('🟡 Form onSubmit triggered!', e);
                    handleSubmit(onSubmit as any)(e);
                }}
                className="space-y-6"
            >
                {/* Layout Responsive */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* Columnas 1-2: Catálogo de Servicios */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-zinc-100">
                                    Catálogo de Servicios
                                </h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => window.open('/admin/configurar/catalogo', '_blank')}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
                                        title="Gestionar catálogo de servicios"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Gestionar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            toast.success('Catálogo actualizado');
                                            // Como los datos vienen de props, mostramos feedback visual sin recargar
                                        }}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition text-sm"
                                        title="Los datos del catálogo se actualizan desde el servidor"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Actualizar
                                    </button>
                                </div>
                            </div>

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
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-zinc-100">
                                    Servicios Seleccionados ({fields.length})
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setMostrarModalServicioPersonalizado(true)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm"
                                >
                                    <Plus size={16} />
                                    Agregar Al Vuelo
                                </button>
                            </div>

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
                                                                    <div className="grid grid-cols-12 gap-3 items-center">
                                                                        {/* Descripción editable con precio unitario incluido */}
                                                                        <div className="col-span-6 min-w-0">
                                                                            {editandoServicio === servicio.fieldId ? (
                                                                                <input
                                                                                    type="text"
                                                                                    defaultValue={servicio.nombre}
                                                                                    placeholder="Descripción del servicio"
                                                                                    className="w-full px-2 py-1 bg-zinc-800 border border-zinc-600 rounded text-zinc-100 text-sm focus:border-blue-500 focus:outline-none"
                                                                                    onBlur={(e) => {
                                                                                        setEditandoServicio(null);
                                                                                        // TODO: Actualizar el nombre si es necesario
                                                                                    }}
                                                                                    onKeyDown={(e) => {
                                                                                        if (e.key === 'Enter') {
                                                                                            setEditandoServicio(null);
                                                                                        }
                                                                                        if (e.key === 'Escape') {
                                                                                            setEditandoServicio(null);
                                                                                        }
                                                                                    }}
                                                                                    autoFocus
                                                                                />
                                                                            ) : (
                                                                                <div
                                                                                    className="font-medium text-zinc-100 text-sm cursor-pointer hover:text-blue-300 transition"
                                                                                    onDoubleClick={() => setEditandoServicio(servicio.fieldId)}
                                                                                    title="Doble click para editar"
                                                                                >
                                                                                    <span>{servicio.nombre}</span>
                                                                                    <span className="font-normal text-zinc-500 text-xs ml-2">
                                                                                        - {servicio.precio.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} c/u
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {/* Controles de cantidad */}
                                                                        <div className="col-span-3 flex items-center justify-center gap-2">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleModificarCantidad(servicio.fieldIndex, 'decrementar')}
                                                                                disabled={servicio.cantidad <= 1}
                                                                                className="p-1 rounded bg-zinc-700 text-zinc-300 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                            >
                                                                                <Minus size={12} />
                                                                            </button>

                                                                            <span className="w-8 text-center text-sm font-medium text-zinc-100">
                                                                                {servicio.cantidad}
                                                                            </span>

                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleModificarCantidad(servicio.fieldIndex, 'incrementar')}
                                                                                className="p-1 rounded bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                                                                            >
                                                                                <Plus size={12} />
                                                                            </button>
                                                                        </div>

                                                                        {/* Subtotal */}
                                                                        <div className="col-span-2 text-right pr-2">
                                                                            <div className="font-semibold text-zinc-100 text-sm">
                                                                                {servicio.subtotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                                                            </div>
                                                                        </div>

                                                                        {/* Botón eliminar */}
                                                                        <div className="col-span-1 text-center">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => remove(servicio.fieldIndex)}
                                                                                className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded"
                                                                                title="Eliminar servicio"
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

                        {/* Sección de Costos Adicionales */}
                        <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-zinc-100">
                                    Costos Adicionales ({costosFields.length})
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => appendCosto({
                                        nombre: "",
                                        costo: "",
                                        tipo: "sesion"
                                    })}
                                    className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-500 transition"
                                    title="Agregar costo personalizado"
                                >
                                    +
                                </button>
                            </div>

                            {costosFields.length === 0 ? (
                                <div className="text-center py-8 text-zinc-400">
                                    <p className="text-sm">No hay costos adicionales</p>
                                    <p className="text-xs text-zinc-500 mt-1">
                                        Usa el botón "+" para agregar costos personalizados
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Agrupar costos por tipo */}
                                    {['sesion', 'evento', 'descuento'].map(tipoGrupo => {
                                        const costosDelTipo = costosFields.filter((_, index) =>
                                            watchedCostos?.[index]?.tipo === tipoGrupo
                                        );

                                        if (costosDelTipo.length === 0) return null;

                                        const tipoLabels = {
                                            sesion: 'Costos de Sesión',
                                            evento: 'Costos de Evento',
                                            descuento: 'Descuentos'
                                        };

                                        const tipoColors = {
                                            sesion: 'border-amber-500 bg-amber-900/20',
                                            evento: 'border-purple-500 bg-purple-900/20',
                                            descuento: 'border-green-500 bg-green-900/20'
                                        };

                                        return (
                                            <div key={tipoGrupo} className={`border rounded-lg p-3 ${tipoColors[tipoGrupo as keyof typeof tipoColors]}`}>
                                                <h4 className="text-sm font-semibold text-zinc-300 mb-3">
                                                    {tipoLabels[tipoGrupo as keyof typeof tipoLabels]}
                                                </h4>
                                                <div className="space-y-2">
                                                    {costosFields.map((field, index) => {
                                                        const costoTipo = watchedCostos?.[index]?.tipo;
                                                        if (costoTipo !== tipoGrupo) return null;

                                                        return (
                                                            <div key={field.id} className="bg-zinc-900/50 rounded-md p-3 border border-zinc-700/40">
                                                                <div className="grid grid-cols-12 gap-3 items-center">
                                                                    {/* Selector de tipo (oculto visualmente pero mantiene funcionalidad) */}
                                                                    <input
                                                                        {...register(`costos.${index}.tipo`)}
                                                                        type="hidden"
                                                                    />

                                                                    {/* Nombre del costo */}
                                                                    <div className="col-span-6">
                                                                        <input
                                                                            {...register(`costos.${index}.nombre`)}
                                                                            placeholder="Nombre del costo"
                                                                            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 text-sm focus:border-blue-500 focus:outline-none"
                                                                        />
                                                                    </div>

                                                                    {/* Monto */}
                                                                    <div className="col-span-4">
                                                                        <div className="flex">
                                                                            <span className="flex items-center px-3 text-zinc-400 bg-zinc-700 border border-r-0 border-zinc-700 rounded-l-md text-sm">
                                                                                $
                                                                            </span>
                                                                            <input
                                                                                {...register(`costos.${index}.costo`)}
                                                                                type="number"
                                                                                step="0.01"
                                                                                placeholder="0.00"
                                                                                className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-r-md text-zinc-100 text-sm focus:border-blue-500 focus:outline-none"
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {/* Cambiar tipo */}
                                                                    <div className="col-span-1">
                                                                        <select
                                                                            {...register(`costos.${index}.tipo`)}
                                                                            className="w-full px-2 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 text-xs focus:border-blue-500 focus:outline-none"
                                                                            title="Tipo de costo"
                                                                        >
                                                                            <option value="sesion">Sesión</option>
                                                                            <option value="evento">Evento</option>
                                                                            <option value="descuento">Descuento</option>
                                                                        </select>
                                                                    </div>

                                                                    {/* Botón eliminar */}
                                                                    <div className="col-span-1 flex justify-center">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleEliminarCosto(index)}
                                                                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1 rounded"
                                                                            title="Eliminar costo"
                                                                        >
                                                                            <MinusCircle size={16} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Resumen de costos */}
                            {costosFields.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-zinc-700/50">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-zinc-400">Total Costos Adicionales:</span>
                                        <span className={`font-semibold ${totalCostosAdicionales >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                                            {totalCostosAdicionales.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                        </span>
                                    </div>
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

                                {/* Descripción de cotización */}
                                <div>
                                    <label htmlFor="descripcion" className="block text-sm font-medium text-zinc-300 mb-1.5">
                                        Descripción <span className="text-zinc-500 text-xs">(Opcional)</span>
                                    </label>
                                    <textarea
                                        id="descripcion"
                                        {...register('descripcion')}
                                        rows={3}
                                        className="flex w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none resize-none"
                                        placeholder="Descripción detallada de la cotización (opcional)"
                                    />
                                    {errors.descripcion && (
                                        <p className="text-red-400 text-xs mt-1">{errors.descripcion.message}</p>
                                    )}
                                </div>

                                {/* Hidden field para eventoTipoId */}
                                <input
                                    type="hidden"
                                    {...register('eventoTipoId')}
                                    value={eventoTipoIdFinal}
                                />
                                {errors.eventoTipoId && (
                                    <div className="text-red-400 text-xs mt-1">
                                        Error en tipo de evento: {errors.eventoTipoId.message}
                                    </div>
                                )}

                                {/* Precio sistema */}
                                {/* Desglose de precios */}
                                {precioSistema > 0 && (
                                    <div className="space-y-3">
                                        {/* Precio base de servicios */}
                                        <div className="p-3 rounded-lg border border-zinc-700/60 bg-zinc-800/40">
                                            <div className="text-xs text-zinc-400 mb-1">Subtotal Servicios</div>
                                            <div className="text-base font-semibold text-zinc-200">
                                                {precioSistema.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                            </div>
                                        </div>

                                        {/* Costos adicionales (si existen) */}
                                        {totalCostosAdicionales !== 0 && (
                                            <div className="p-3 rounded-lg border border-zinc-700/60 bg-zinc-800/40">
                                                <div className="text-xs text-zinc-400 mb-1">Costos Adicionales</div>
                                                <div className={`text-base font-semibold ${totalCostosAdicionales >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                                                    {totalCostosAdicionales >= 0 ? '+' : ''}{totalCostosAdicionales.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Precio final */}
                                        <div className="p-4 rounded-lg border border-blue-500/60 bg-blue-900/20">
                                            <div className="text-xs text-blue-200 mb-1">
                                                Total de Cotización
                                                {precioTotalPersonalizado !== null && (
                                                    <span className="ml-1 text-xs">⚡</span>
                                                )}
                                            </div>
                                            {editandoPrecioTotal ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-blue-300 text-lg">$</span>
                                                    <input
                                                        type="number"
                                                        defaultValue={precioTotalPersonalizado || precioFinal}
                                                        step="0.01"
                                                        min="0"
                                                        className="flex-1 px-2 py-1 bg-zinc-800 border border-zinc-600 rounded text-blue-300 text-xl font-bold focus:border-blue-400 focus:outline-none"
                                                        onBlur={(e) => {
                                                            const nuevoPrecio = parseFloat(e.target.value) || (precioSistema + totalCostosAdicionales);
                                                            handleCambiarPrecioTotal(nuevoPrecio);
                                                            handleGuardarPrecioTotal();
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                const nuevoPrecio = parseFloat((e.target as HTMLInputElement).value) || (precioSistema + totalCostosAdicionales);
                                                                handleCambiarPrecioTotal(nuevoPrecio);
                                                                handleGuardarPrecioTotal();
                                                            }
                                                            if (e.key === 'Escape') {
                                                                handleCancelarPrecioTotal();
                                                            }
                                                        }}
                                                        autoFocus
                                                    />
                                                </div>
                                            ) : (
                                                <div
                                                    className={`text-xl font-bold cursor-pointer hover:text-blue-200 transition ${precioTotalPersonalizado !== null
                                                        ? 'text-blue-300 border-b border-dotted border-blue-400'
                                                        : 'text-blue-300'
                                                        }`}
                                                    onDoubleClick={() => handleActivarPrecioTotal(precioFinal)}
                                                    title="Doble click para personalizar precio total"
                                                >
                                                    {precioFinal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                                </div>
                                            )}
                                            <div className="text-xs text-blue-400 mt-1">
                                                {precioTotalPersonalizado !== null
                                                    ? 'Precio personalizado'
                                                    : (totalCostosAdicionales !== 0 ? 'Incluye costos adicionales' : 'Solo servicios')
                                                }
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Botones de acción */}
                            <div className="mt-6 space-y-3">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    onClick={(e) => {
                                        console.log('🔵 Botón clicked!', e);
                                        console.log('🔵 isSubmitting:', isSubmitting);
                                        console.log('🔵 isValid:', isValid);
                                        console.log('🔵 Form errors:', errors);
                                        console.log('🔵 Servicios length:', fields.length);
                                    }}
                                    className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting && <Loader2 size={16} className="animate-spin mr-2" />}
                                    {modo === 'editar' ? 'Actualizar Cotización' : 'Guardar Cotización'}
                                </button>

                                {/* Botón de Autorización - Solo en modo editar y si hay una cotización existente */}
                                {modo === 'editar' && cotizacionExistente && (
                                    <BotonAutorizarCotizacion
                                        cotizacionId={cotizacionExistente.id}
                                        eventoId={evento.id}
                                        estadoInicial={cotizacionExistente.status}
                                        className="w-full"
                                        mostrarTexto={true}
                                        onAutorizado={() => {
                                            toast.success('Evento autorizado y movido a seguimiento');
                                        }}
                                    />
                                )}

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

            {/* Modal para Servicio Personalizado */}
            {mostrarModalServicioPersonalizado && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md border border-zinc-700">
                        <h3 className="text-lg font-semibold text-zinc-100 mb-2">
                            Agregar Servicio Al Vuelo
                        </h3>
                        <p className="text-sm text-zinc-400 mb-4">
                            Este servicio solo se agregará a esta cotización
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Nombre del Servicio
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: Servicio especial"
                                    value={servicioPersonalizado.nombre}
                                    onChange={(e) => handleCambioServicioPersonalizado('nombre', e.target.value)}
                                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:border-blue-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Precio Unitario
                                </label>
                                <div className="flex">
                                    <span className="flex items-center px-3 text-zinc-400 bg-zinc-700 border border-r-0 border-zinc-700 rounded-l-md">
                                        $
                                    </span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={servicioPersonalizado.precio}
                                        onChange={(e) => handleCambioServicioPersonalizado('precio', e.target.value)}
                                        className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-r-md text-zinc-100 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Categoría
                                </label>
                                <select
                                    value={servicioPersonalizado.categoria}
                                    onChange={(e) => handleCambioServicioPersonalizado('categoria', e.target.value)}
                                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="">Seleccionar categoría...</option>
                                    {secciones.map(seccion =>
                                        seccion.seccionCategorias.map(sc => (
                                            <option key={sc.ServicioCategoria.id} value={sc.ServicioCategoria.nombre}>
                                                {seccion.nombre} → {sc.ServicioCategoria.nombre}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setMostrarModalServicioPersonalizado(false)}
                                className="flex-1 px-4 py-2 bg-zinc-700 text-zinc-100 rounded-md hover:bg-zinc-600"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleAgregarServicioPersonalizado}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                                Agregar a Cotización
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
