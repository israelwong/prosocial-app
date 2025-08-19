'use server';

import prisma from '@/app/admin/_lib/prismaClient';
import { obtenerEventoCompleto } from '@/app/admin/_lib/actions/evento/evento/evento.actions';
import { obtenerTiposEvento } from '@/app/admin/_lib/actions/eventoTipo/eventoTipo.actions';
import { obtenerCatalogoCompleto } from '@/app/admin/_lib/actions/catalogo/catalogo.actions';
import { getGlobalConfiguracion } from '@/app/admin/_lib/actions/configuracion/configuracion.actions';
import { obtenerMetodosPago } from '@/app/admin/_lib/actions/metodoPago/metodoPago.actions';
import { obtenerPaquete } from '@/app/admin/_lib/actions/paquetes/paquetes.actions';
import {
    CotizacionNuevaSchema,
    CotizacionEditarSchema,
    CotizacionParamsSchema,
    ServicioPersonalizadoSchema,
    type CotizacionNueva,
    type CotizacionEditar,
    type ServicioPersonalizado
} from './cotizacion.schemas';

/**
 * Obtiene todos los datos necesarios para crear/editar una cotización
 * Optimizado para carga server-side con Promise.all
 */
export async function obtenerDatosCotizacion(
    eventoId: string,
    tipoEventoId?: string,
    paqueteId?: string
) {
    try {
        // Cargar datos en paralelo para máxima eficiencia
        const [
            evento,
            tiposEvento,
            catalogo,
            configuracion,
            condiciones,
            metodosPago,
            paqueteBase
        ] = await Promise.all([
            obtenerEventoCompleto(eventoId),
            obtenerTiposEvento(),
            obtenerCatalogoCompleto(),
            getGlobalConfiguracion(),
            // Obtener condiciones comerciales activas con métodos de pago
            prisma.condicionesComerciales.findMany({
                where: { status: 'active' },
                orderBy: { orden: 'asc' },
                include: {
                    CondicionesComercialesMetodoPago: {
                        select: { metodoPagoId: true }
                    }
                }
            }),
            obtenerMetodosPago(),
            paqueteId ? obtenerPaquete(paqueteId) : null
        ]);

        // Validaciones básicas
        if (!evento) {
            throw new Error(`Evento con ID ${eventoId} no encontrado`);
        }

        if (paqueteId && !paqueteBase) {
            throw new Error(`Paquete con ID ${paqueteId} no encontrado`);
        }

        // Si se especifica tipoEventoId, validar que existe
        let tipoEventoSeleccionado = null;
        if (tipoEventoId) {
            tipoEventoSeleccionado = tiposEvento.find(t => t.id === tipoEventoId);
            if (!tipoEventoSeleccionado) {
                throw new Error(`Tipo de evento con ID ${tipoEventoId} no encontrado`);
            }
            console.log('🔧 obtenerDatosCotizacion: tipoEventoSeleccionado encontrado:', tipoEventoSeleccionado);
        } else {
            console.log('🔧 obtenerDatosCotizacion: No se proporcionó tipoEventoId');
        }

        // Preparar servicios base si hay un paquete
        let serviciosBase: any[] = [];
        if (paqueteBase) {
            // Obtener servicios completos del paquete con todos los campos necesarios
            const paqueteCompleto = await prisma.paquete.findUnique({
                where: { id: paqueteBase.id },
                include: {
                    PaqueteServicio: {
                        include: {
                            Servicio: {
                                include: {
                                    ServicioCategoria: true
                                }
                            }
                        },
                        orderBy: { posicion: 'asc' }
                    }
                }
            });

            if (paqueteCompleto?.PaqueteServicio) {
                serviciosBase = paqueteCompleto.PaqueteServicio.map(ps => ({
                    ...ps.Servicio,
                    cantidad: ps.cantidad,
                    posicion: ps.posicion
                }));
            }
        }

        console.log('🔧 obtenerDatosCotizacion: Antes de return - tipoEventoSeleccionado:', tipoEventoSeleccionado);
        console.log('🔧 obtenerDatosCotizacion: evento.EventoTipo:', evento.EventoTipo);
        console.log('🔧 obtenerDatosCotizacion: tiposEvento[0]:', tiposEvento[0]);

        return {
            evento,
            tiposEvento,
            catalogo,
            configuracion,
            condiciones,
            metodosPago,
            paqueteBase,
            serviciosBase,
            tipoEventoSeleccionado,
            // Metadatos útiles
            metadata: {
                tienePaqueteBase: !!paqueteBase,
                tieneEventoTipoEspecifico: !!tipoEventoSeleccionado,
                totalServicios: catalogo ? catalogo.reduce((acc, seccion) =>
                    acc + (seccion.seccionCategorias?.reduce((secAcc, cat) =>
                        secAcc + (cat.ServicioCategoria?.Servicio.length || 0), 0) || 0), 0) : 0
            }
        };

    } catch (error: any) {
        console.error('Error al obtener datos de cotización:', error);
        throw new Error(`Error al cargar datos: ${error?.message || 'Error desconocido'}`);
    }
}

/**
 * Obtiene una cotización existente con todos sus datos relacionados
 */
export async function obtenerCotizacionCompleta(cotizacionId: string) {
    try {
        const cotizacion = await prisma.cotizacion.findUnique({
            where: { id: cotizacionId },
            include: {
                Evento: {
                    include: {
                        Cliente: true,
                        EventoTipo: true
                    }
                },
                EventoTipo: true,
                CondicionesComerciales: true,
                Costos: {
                    orderBy: { posicion: 'asc' }
                },
                Servicio: {
                    include: {
                        Servicio: {
                            include: {
                                ServicioCategoria: {
                                    include: {
                                        seccionCategoria: {
                                            include: {
                                                Seccion: true
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        ServicioCategoria: {
                            include: {
                                seccionCategoria: {
                                    include: {
                                        Seccion: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: { posicion: 'asc' }
                }
            }
        });

        if (!cotizacion) {
            throw new Error(`Cotización con ID ${cotizacionId} no encontrada`);
        }

        // También obtener datos necesarios para edición
        const [tiposEvento, catalogo, configuracion, condiciones, metodosPago] = await Promise.all([
            obtenerTiposEvento(),
            obtenerCatalogoCompleto(),
            getGlobalConfiguracion(),
            prisma.condicionesComerciales.findMany({
                where: { status: 'active' },
                orderBy: { orden: 'asc' },
                include: {
                    CondicionesComercialesMetodoPago: {
                        select: { metodoPagoId: true }
                    }
                }
            }),
            obtenerMetodosPago()
        ]);

        return {
            cotizacion,
            tiposEvento,
            catalogo,
            configuracion,
            condiciones,
            metodosPago
        };

    } catch (error: any) {
        console.error('Error al obtener cotización completa:', error);
        throw new Error(`Error al cargar cotización: ${error?.message || 'Error desconocido'}`);
    }
}

/**
 * Crea una nueva cotización basada en los datos proporcionados
 * Usa los nuevos schemas con funcionalidad de snapshot
 */
export async function crearCotizacionNueva(data: CotizacionNueva) {
    try {
        console.log('=== INICIO crearCotizacionNueva ===');
        console.log('Data raw recibida:', JSON.stringify(data, null, 2));

        // Validar datos con schema
        console.log('🔍 Validando datos con schema...');
        const validatedData = CotizacionNuevaSchema.parse(data);
        console.log('✅ Datos validados exitosamente');
        console.log('Data validada:', JSON.stringify(validatedData, null, 2));

        console.log('🗃️ Creando cotización principal...');
        const nuevaCotizacion = await prisma.cotizacion.create({
            data: {
                eventoId: validatedData.eventoId,
                eventoTipoId: validatedData.eventoTipoId,
                nombre: validatedData.nombre,
                precio: validatedData.precio,
                condicionesComercialesId: validatedData.condicionesComercialesId,
                status: 'pending',
                visible_cliente: true
            }
        });
        console.log('✅ Cotización principal creada:', { id: nuevaCotizacion.id, nombre: nuevaCotizacion.nombre });

        // Crear servicios por separado para evitar problemas de tipos
        if (validatedData.servicios.length > 0) {
            console.log('🔧 Creando servicios de cotización...');
            console.log('Cantidad de servicios a crear:', validatedData.servicios.length);

            await prisma.cotizacionServicio.createMany({
                data: validatedData.servicios.map(servicio => ({
                    cotizacionId: nuevaCotizacion.id,
                    servicioId: servicio.servicioId,
                    servicioCategoriaId: servicio.servicioCategoriaId,
                    cantidad: servicio.cantidad,
                    precioUnitario: servicio.precioUnitario,
                    subtotal: servicio.precioUnitario * servicio.cantidad,
                    posicion: servicio.posicion,
                    status: 'pendiente',
                    // Campos snapshot para trazabilidad
                    nombre_snapshot: servicio.nombre_snapshot,
                    descripcion_snapshot: servicio.descripcion_snapshot,
                    precio_unitario_snapshot: servicio.precio_unitario_snapshot,
                    costo_snapshot: servicio.costo_snapshot,
                    gasto_snapshot: servicio.gasto_snapshot,
                    utilidad_snapshot: servicio.utilidad_snapshot,
                    precio_publico_snapshot: servicio.precio_publico_snapshot,
                    tipo_utilidad_snapshot: servicio.tipo_utilidad_snapshot,
                    categoria_nombre_snapshot: servicio.categoria_nombre_snapshot,
                    seccion_nombre_snapshot: servicio.seccion_nombre_snapshot,
                    es_personalizado: servicio.es_personalizado,
                    servicio_original_id: servicio.servicio_original_id
                })) as any
            });
            console.log('✅ Servicios creados exitosamente');
        }

        // Crear costos por separado
        if (validatedData.costos.length > 0) {
            console.log('💰 Creando costos adicionales...');
            console.log('Cantidad de costos a crear:', validatedData.costos.length);

            await prisma.cotizacionCosto.createMany({
                data: validatedData.costos.map((costo, index) => ({
                    cotizacionId: nuevaCotizacion.id,
                    nombre: costo.nombre,
                    descripcion: costo.descripcion,
                    costo: costo.costo,
                    tipo: costo.tipo,
                    posicion: costo.posicion || index + 1
                }))
            });
            console.log('✅ Costos creados exitosamente');
        }

        // Retornar cotización completa con relaciones
        console.log('📋 Obteniendo cotización completa...');
        const cotizacionCompleta = await prisma.cotizacion.findUnique({
            where: { id: nuevaCotizacion.id },
            include: {
                Servicio: true,
                Costos: true
            }
        });

        console.log('✅ Cotización completa obtenida');
        console.log('🎉 PROCESO COMPLETADO EXITOSAMENTE');
        console.log('Cotización final:', { id: nuevaCotizacion.id, nombre: nuevaCotizacion.nombre });
        return cotizacionCompleta;

    } catch (error: any) {
        console.error('💥 ERROR CRÍTICO en crearCotizacionNueva:');
        console.error('Error completo:', error);
        console.error('Stack trace:', error.stack);
        console.error('Tipo de error:', typeof error);
        console.error('Mensaje:', error?.message);

        // Si es un error de Prisma, mostrar detalles adicionales
        if (error.code) {
            console.error('Código de error Prisma:', error.code);
            console.error('Meta:', error.meta);
        }

        throw new Error(`Error al crear cotización: ${error?.message || 'Error desconocido'}`);
    }
}

/**
 * Edita una cotización existente usando los nuevos schemas
 */
export async function editarCotizacion(data: CotizacionEditar) {
    try {
        console.log('🔥 editarCotizacion - Datos recibidos:', JSON.stringify(data, null, 2));

        // Validar datos con schema
        console.log('🔥 editarCotizacion - Validando con schema...');
        const validatedData = CotizacionEditarSchema.parse(data);
        console.log('🔥 editarCotizacion - Validación exitosa:', JSON.stringify(validatedData, null, 2));

        const cotizacionActualizada = await prisma.cotizacion.update({
            where: { id: validatedData.id },
            data: {
                nombre: validatedData.nombre,
                precio: validatedData.precio,
                condicionesComercialesId: validatedData.condicionesComercialesId,
                status: validatedData.status,
                visible_cliente: validatedData.visible_cliente,
                // Eliminar servicios existentes y crear nuevos
                Servicio: {
                    deleteMany: {},
                    create: validatedData.servicios.map(servicio => ({
                        servicioId: servicio.servicioId,
                        servicioCategoriaId: servicio.servicioCategoriaId,
                        cantidad: servicio.cantidad,
                        precioUnitario: servicio.precioUnitario,
                        subtotal: servicio.precioUnitario * servicio.cantidad,
                        posicion: servicio.posicion,
                        status: 'pendiente',
                        // Campos snapshot para trazabilidad
                        nombre_snapshot: servicio.nombre_snapshot,
                        descripcion_snapshot: servicio.descripcion_snapshot,
                        precio_unitario_snapshot: servicio.precio_unitario_snapshot,
                        costo_snapshot: servicio.costo_snapshot,
                        gasto_snapshot: servicio.gasto_snapshot,
                        utilidad_snapshot: servicio.utilidad_snapshot,
                        precio_publico_snapshot: servicio.precio_publico_snapshot,
                        tipo_utilidad_snapshot: servicio.tipo_utilidad_snapshot,
                        categoria_nombre_snapshot: servicio.categoria_nombre_snapshot,
                        seccion_nombre_snapshot: servicio.seccion_nombre_snapshot,
                        es_personalizado: servicio.es_personalizado,
                        servicio_original_id: servicio.servicio_original_id
                    })) as any
                },
                // Actualizar costos
                Costos: {
                    deleteMany: {},
                    create: validatedData.costos.map((costo, index) => ({
                        nombre: costo.nombre,
                        descripcion: costo.descripcion,
                        costo: costo.costo,
                        tipo: costo.tipo,
                        posicion: costo.posicion || index + 1
                    }))
                }
            },
            include: {
                Servicio: true,
                Costos: true
            }
        });

        return cotizacionActualizada;

    } catch (error: any) {
        console.error('Error al editar cotización:', error);
        throw new Error(`Error al editar cotización: ${error?.message || 'Error desconocido'}`);
    }
}

/**
 * Agrega un servicio personalizado al vuelo (opcional: guardarlo en catálogo)
 */
export async function agregarServicioPersonalizado(data: ServicioPersonalizado) {
    try {
        // Validar datos con schema
        const validatedData = ServicioPersonalizadoSchema.parse(data);

        let servicioId: string;
        let servicioCategoriaId: string;

        if (validatedData.guardar_en_catalogo) {
            // Buscar o crear categoría
            let categoria = await prisma.servicioCategoria.findFirst({
                where: { nombre: validatedData.categoria_nombre }
            });

            if (!categoria) {
                categoria = await prisma.servicioCategoria.create({
                    data: {
                        nombre: validatedData.categoria_nombre,
                        posicion: 999
                    }
                });
            }

            // Crear servicio en catálogo
            const nuevoServicio = await prisma.servicio.create({
                data: {
                    servicioCategoriaId: categoria.id,
                    nombre: validatedData.nombre,
                    costo: validatedData.costo,
                    gasto: validatedData.gasto,
                    utilidad: validatedData.precioUnitario - validatedData.costo - validatedData.gasto,
                    precio_publico: validatedData.precioUnitario,
                    tipo_utilidad: validatedData.tipo_utilidad,
                    posicion: 999
                }
            });

            servicioId = nuevoServicio.id;
            servicioCategoriaId = categoria.id;
        } else {
            // Crear IDs temporales para servicios no guardados
            servicioId = `temp_${Date.now()}`;
            servicioCategoriaId = `temp_cat_${Date.now()}`;
        }

        // Retornar objeto con formato compatible para cotización
        return {
            servicioId,
            servicioCategoriaId,
            cantidad: validatedData.cantidad,

            // Campos snapshot para trazabilidad
            nombre_snapshot: validatedData.nombre,
            descripcion_snapshot: validatedData.descripcion,
            precio_unitario_snapshot: validatedData.precioUnitario,
            costo_snapshot: validatedData.costo,
            gasto_snapshot: validatedData.gasto,
            utilidad_snapshot: validatedData.precioUnitario - validatedData.costo - validatedData.gasto,
            precio_publico_snapshot: validatedData.precioUnitario,
            tipo_utilidad_snapshot: validatedData.tipo_utilidad,
            categoria_nombre_snapshot: validatedData.categoria_nombre,
            seccion_nombre_snapshot: validatedData.seccion_nombre,

            // Campos operacionales
            precioUnitario: validatedData.precioUnitario,
            es_personalizado: true,
            servicio_original_id: validatedData.guardar_en_catalogo ? servicioId : undefined,
            posicion: 999
        };

    } catch (error: any) {
        console.error('Error al agregar servicio personalizado:', error);
        throw new Error(`Error al agregar servicio personalizado: ${error?.message || 'Error desconocido'}`);
    }
}

/**
 * Agrega o actualiza un costo en una cotización existente
 */
export async function actualizarCostosCotizacion(
    cotizacionId: string,
    costos: Array<{
        id?: string;
        nombre: string;
        descripcion?: string;
        costo: number;
        tipo: 'adicional' | 'descuento' | 'impuesto' | 'comision';
        posicion: number;
    }>
) {
    try {
        // Eliminar costos existentes y crear nuevos
        await prisma.cotizacion.update({
            where: { id: cotizacionId },
            data: {
                Costos: {
                    deleteMany: {},
                    create: costos.map((costo, index) => ({
                        nombre: costo.nombre,
                        descripcion: costo.descripcion,
                        costo: costo.costo,
                        tipo: costo.tipo,
                        posicion: costo.posicion || index + 1
                    }))
                }
            }
        });

        // Retornar cotización actualizada
        return await obtenerCotizacionCompleta(cotizacionId);

    } catch (error: any) {
        console.error('Error al actualizar costos:', error);
        throw new Error(`Error al actualizar costos: ${error?.message || 'Error desconocido'}`);
    }
}

/**
 * Server action unificado para manejar submit de formulario de cotización
 * Maneja tanto creación como edición dependiendo si recibe un ID
 */
export async function manejarSubmitCotizacion(data: any) {
    console.log('🚀 manejarSubmitCotizacion - Datos recibidos:', JSON.stringify(data, null, 2));

    try {
        if (data.id) {
            // Modo edición
            console.log('🔄 Modo edición detectado, llamando editarCotizacion...');
            return await editarCotizacion(data);
        } else {
            // Modo creación
            console.log('🆕 Modo creación detectado, llamando crearCotizacionNueva...');
            return await crearCotizacionNueva(data);
        }
    } catch (error: any) {
        console.error('❌ Error en manejarSubmitCotizacion:', error);
        throw error;
    }
}

/**
 * Obtiene las cotizaciones disponibles para un evento y valida su disponibilidad
 * Retorna: disponibilidad de fecha y cotizaciones para redirección automática o listado
 */
export async function obtenerCotizacionesParaEvento(eventoId: string) {
    try {
        // 1. Verificar que el evento existe y obtener información básica
        const evento = await prisma.evento.findUnique({
            where: { id: eventoId },
            select: {
                id: true,
                fecha_evento: true,
                eventoTipoId: true,
                EventoEtapa: {
                    select: {
                        posicion: true,
                        nombre: true
                    }
                }
            }
        })

        if (!evento) {
            return { error: 'Evento no encontrado', disponible: false }
        }

        // 2. Verificar disponibilidad de fecha en agenda
        const inicioDelDia = new Date(evento.fecha_evento)
        inicioDelDia.setHours(0, 0, 0, 0)

        const finDelDia = new Date(evento.fecha_evento)
        finDelDia.setHours(23, 59, 59, 999)

        const eventosEnConflicto = await prisma.agenda.findMany({
            where: {
                fecha: {
                    gte: inicioDelDia,
                    lte: finDelDia
                },
                eventoId: {
                    not: eventoId // Excluir el evento actual
                },
                status: {
                    not: 'cancelado' // No contar eventos cancelados
                }
            },
            select: {
                id: true,
                Evento: {
                    select: {
                        nombre: true,
                        EventoTipo: {
                            select: {
                                nombre: true
                            }
                        }
                    }
                }
            }
        })

        const fechaDisponible = eventosEnConflicto.length === 0

        // 3. Si la fecha no está disponible, retornar información del conflicto
        if (!fechaDisponible) {
            return {
                disponible: false,
                conflicto: {
                    mensaje: 'Fecha no disponible',
                    eventosEnConflicto: eventosEnConflicto.map(agenda => ({
                        evento: agenda.Evento?.nombre,
                        tipo: agenda.Evento?.EventoTipo?.nombre
                    }))
                }
            }
        }

        // 4. Verificar si el evento ya está contratado (requiere login de cliente)
        const etapaPosicion = evento.EventoEtapa?.posicion || 0
        const eventoContratado = etapaPosicion >= 5

        // 5. Obtener cotizaciones visibles al cliente
        const cotizaciones = await prisma.cotizacion.findMany({
            where: {
                eventoId,
                visible_cliente: true,
                status: {
                    in: ['pending', 'pendiente', 'aprobada', 'approved'] // Incluir ambas variantes
                }
            },
            select: {
                id: true,
                nombre: true,
                precio: true,
                status: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // 5.1. Obtener paquetes pre-diseñados según tipo de evento
        const paquetes = evento.eventoTipoId ? await prisma.paquete.findMany({
            where: {
                eventoTipoId: evento.eventoTipoId,
                status: 'active' // Solo paquetes activos
            },
            select: {
                id: true,
                nombre: true,
                precio: true
            },
            orderBy: {
                precio: 'asc'
            }
        }) : []

        // 6. Verificar si hay cotizaciones aprobadas (requiere login)
        const cotizacionesAprobadas = cotizaciones.filter(cot =>
            ['aprobada', 'approved'].includes(cot.status)
        )
        const requiereClienteLogin = cotizacionesAprobadas.length > 0 || eventoContratado

        if (requiereClienteLogin) {
            return {
                disponible: true,
                requiereLogin: true,
                mensaje: eventoContratado
                    ? 'Evento ya contratado - requiere acceso de cliente'
                    : 'Cotización aprobada - requiere acceso de cliente'
            }
        }

        // 7. Lógica de redirección basada en número de cotizaciones
        if (cotizaciones.length === 0) {
            return {
                disponible: true,
                cotizaciones: [],
                paquetes,
                accion: 'sin_cotizaciones',
                mensaje: 'No hay cotizaciones disponibles para este evento'
            }
        }

        if (cotizaciones.length === 1) {
            return {
                disponible: true,
                cotizaciones,
                paquetes,
                accion: 'redireccion_automatica',
                cotizacionUnica: {
                    id: cotizaciones[0].id,
                    nombre: cotizaciones[0].nombre,
                    precio: cotizaciones[0].precio
                }
            }
        }

        // Múltiples cotizaciones - mostrar lista
        return {
            disponible: true,
            cotizaciones: cotizaciones.map(cot => ({
                id: cot.id,
                nombre: cot.nombre,
                precio: cot.precio
            })),
            paquetes,
            accion: 'mostrar_lista',
            mensaje: `${cotizaciones.length} cotizaciones disponibles`
        }

    } catch (error) {
        console.error('Error al obtener cotizaciones para evento:', error)
        return {
            error: 'Error interno del servidor',
            disponible: false
        }
    }
}
