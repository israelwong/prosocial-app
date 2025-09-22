// Ruta: app/admin/_lib/actions/seguimiento/seguimiento-detalle.actions.ts

'use server';

import prisma from '@/app/admin/_lib/prismaClient';
import { revalidatePath } from 'next/cache';
import {
    EventoDetalleParamsSchema,
    EventoEtapaUpdateSchema,
    PagoCreateSchema,
    PagoUpdateSchema,
    AgendaCreateSchema,
    AgendaUpdateSchema,
    type EventoDetalleParams,
    type EventoEtapaUpdateForm,
    type PagoCreateForm,
    type PagoUpdateForm,
    type AgendaCreateForm,
    type AgendaUpdateForm,
    type EventoDetalleCompleto,
    type EventoExtendido,
    type ResumenFinanciero,
    type ServicioDetalle,
    type AgendaDetalle,
    type EventoDetalleActionResult,
    AGENDA_STATUS_COLORS,
    SERVICIO_STATUS_COLORS
} from './seguimiento-detalle.schemas';
import { PAGO_STATUS, COTIZACION_STATUS } from '@/app/admin/_lib/constants/status';

// ========================================
// FUNCIÓN PRINCIPAL DE CONSULTA
// ========================================

/**
 * Obtener todos los datos necesarios para la página de detalle del evento
 * Esta función centraliza todas las consultas necesarias en una sola llamada
 */
export async function obtenerEventoDetalleCompleto(
    eventoId: string,
    cotizacionId?: string
): Promise<EventoDetalleCompleto | null> {
    try {
        // console.log('🔍 Obteniendo datos completos para evento:', eventoId);
        // console.log('🔍 CotizacionId específica:', cotizacionId);
        // console.log('🔍 Tipo de eventoId:', typeof eventoId);
        // console.log('🔍 Longitud del eventoId:', eventoId.length);

        // Validar parámetros
        const validatedParams = EventoDetalleParamsSchema.parse({ eventoId, cotizacionId });
        // console.log('🔍 Parámetros validados:', validatedParams);

        // Consulta principal optimizada con todos los includes necesarios
        const evento = await prisma.evento.findUnique({
            where: { id: validatedParams.eventoId },
            include: {
                Cliente: true,
                EventoTipo: true,
                EventoEtapa: true,
                Cotizacion: {
                    include: {
                        // 💰 PAGOS - Histórico completo con método de pago
                        Pago: {
                            include: {
                                MetodoPago: true
                            },
                            orderBy: { createdAt: 'desc' }
                        },
                        // 🛠️ SERVICIOS - Lista completa de servicios de la cotización  
                        Servicio: {
                            include: {
                                // @ts-ignore - Temporal hasta resolver tipos de Prisma
                                User: true, // ✅ Incluir usuario asignado
                                // @ts-ignore - Incluir nóminas relacionadas
                                NominaServicio: {
                                    include: {
                                        Nomina: {
                                            select: {
                                                id: true,
                                                status: true,
                                                monto_neto: true,
                                                fecha_pago: true,
                                                fecha_autorizacion: true
                                            }
                                        }
                                    }
                                },
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
                            // 🔧 ORDENAMIENTO CORREGIDO: Usar posición del Servicio original, NO de CotizacionServicio
                            orderBy: [
                                { Servicio: { posicion: 'asc' } },     // Posición del servicio original en el catálogo
                                { posicion: 'asc' }                    // Fallback: posición en cotización
                            ]
                        },
                        // 📋 CONDICIONES COMERCIALES
                        CondicionesComerciales: true,
                    },
                    where: cotizacionId
                        ? { id: cotizacionId } // Si se especifica cotizacionId, buscar esa específica
                        : { // Si no, buscar cotizaciones aprobadas o autorizadas (para dashboard)
                            OR: [
                                { status: 'aprobado' },
                                { status: 'aprobada' },  // Ambos valores posibles
                                { status: COTIZACION_STATUS.AUTORIZADO } // Incluir también autorizadas
                            ]
                        },
                    orderBy: { createdAt: 'desc' },
                    take: 1
                },
                // 📅 AGENDA - Con todos los datos necesarios
                Agenda: {
                    include: {
                        User: true
                    },
                    orderBy: { fecha: 'asc' }
                }
            }
        });

        if (!evento) {
            console.log(`⚠️ Evento con ID ${eventoId} no encontrado`);
            return null;
        }

        // Consultas adicionales en paralelo - simplificadas
        const [etapasDisponibles, serviciosCategorias, usuarios] = await Promise.all([
            // Etapas disponibles
            prisma.eventoEtapa.findMany({
                orderBy: { posicion: 'asc' }
            }),

            // Categorías de servicios
            prisma.servicioCategoria.findMany({
                orderBy: { posicion: 'asc' }
            }),

            // Usuarios del sistema - simplificado
            prisma.user.findMany({
                select: {
                    id: true,
                    username: true,
                    email: true,
                    telefono: true
                },
                orderBy: { id: 'asc' }
            })
        ]);

        // Procesar y calcular datos adicionales
        const cotizacion = (evento as any).Cotizacion?.[0] || null;

        // 🔍 DEBUG: Veamos qué cotizaciones encontramos
        // console.log('🔍 DEBUG Cotizaciones encontradas:', {
        //     total: (evento as any).Cotizacion?.length || 0,
        //     cotizaciones: (evento as any).Cotizacion?.map((c: any) => ({
        //         id: c.id,
        //         status: c.status,
        //         precio: c.precio,
        //         servicios: c.Servicio?.length || 0,
        //         pagos: c.Pago?.length || 0
        //     })) || []
        // });

        const pagos = procesarPagosDetalle(cotizacion?.Pago || []);

        // Calcular resumen financiero
        const resumenFinanciero = calcularResumenFinanciero(cotizacion, pagos);

        // Procesar evento extendido
        const eventoExtendido = procesarEventoExtendido(evento as any);

        // Procesar servicios con detalles
        const serviciosDetalle = procesarServiciosDetalle(cotizacion?.Servicio || [], usuarios);

        // 🔍 DEBUG: Servicios procesados
        // console.log('🔍 DEBUG Servicios procesados:', {
        //     totalServicios: serviciosDetalle.length,
        //     servicios: serviciosDetalle.map(s => ({
        //         id: s.id,
        //         nombre: s.nombre,
        //         categoria: s.categoriaNombre,
        //         seccion: s.seccion,
        //         precio: s.precio,
        //         cantidad: s.cantidad,
        //         subtotal: s.subtotal,
        //         posicion: s.posicion // ✅ Agregar posición al debug
        //     }))
        // });

        // 🔍 DEBUG: Servicios RAW desde base de datos
        // console.log('🔍 DEBUG Servicios RAW desde DB:', {
        //     totalServicios: (cotizacion?.Servicio || []).length,
        //     serviciosRaw: (cotizacion?.Servicio || []).map((s: any) => ({
        //         id: s.id,
        //         nombre_snapshot: s.nombre_snapshot,
        //         posicion_cotizacion: s.posicion,                    // Posición en CotizacionServicio
        //         posicion_servicio_original: s.Servicio?.posicion,   // Posición del Servicio original
        //         orden_en_array: (cotizacion?.Servicio || []).indexOf(s)
        //     }))
        // });

        // Procesar agenda con detalles - simplificado
        const agendaDetalle = (evento as any).Agenda.map((item: any) => ({
            ...item,
            tipoNombre: item.agendaTipo || 'Sin tipo',
            responsableNombre: item.User?.username || 'Sin asignar',
            diasFaltantes: item.fecha ? Math.ceil((new Date(item.fecha).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0,
            statusDisplay: item.status || 'pendiente',
            colorStatus: AGENDA_STATUS_COLORS[item.status as keyof typeof AGENDA_STATUS_COLORS] || AGENDA_STATUS_COLORS.pendiente,
            iconoTipo: 'calendar'
        }));

        // Obtener condición comercial
        const condicionComercial = cotizacion?.CondicionesComerciales
            ? `${cotizacion.CondicionesComerciales.nombre} - ${cotizacion.CondicionesComerciales.descripcion}`
            : null;

        const resultado: EventoDetalleCompleto = {
            // Información básica
            evento: eventoExtendido,
            cliente: (evento as any).Cliente,
            tipoEvento: (evento as any).EventoTipo,

            // Gestión de etapas
            etapaActual: (evento as any).EventoEtapa,
            etapasDisponibles,

            // Información financiera
            cotizacion,
            pagos,
            resumenFinanciero,
            condicionComercial,

            // Servicios y recursos
            serviciosCategorias,
            serviciosDetalle,
            usuarios,

            // Agenda y seguimiento - simplificado
            agenda: agendaDetalle,
            agendaTipos: [], // Temporal hasta corregir el esquema

            // Metadatos
            fechaCargaDatos: new Date(),
            ultimaActualizacion: evento.updatedAt
        };

        // console.log('✅ Datos completos obtenidos exitosamente');
        return resultado;

    } catch (error) {
        console.error('❌ Error obteniendo datos completos del evento:', error);
        throw new Error('Error al obtener datos del evento');
    }
}

// ========================================
// FUNCIONES DE MUTACIÓN
// ========================================

/**
 * Actualizar etapa del evento
 */
export async function actualizarEtapaEventoDetalle(
    data: EventoEtapaUpdateForm
): Promise<EventoDetalleActionResult> {
    try {
        const validatedData = EventoEtapaUpdateSchema.parse(data);

        const eventoActualizado = await prisma.evento.update({
            where: { id: validatedData.eventoId },
            data: { eventoEtapaId: validatedData.eventoEtapaId },
            include: {
                EventoEtapa: true
            }
        });

        revalidatePath(`/admin/dashboard/seguimiento/${validatedData.eventoId}`);
        revalidatePath('/admin/dashboard/seguimiento');

        return {
            success: true,
            data: eventoActualizado,
            message: `Evento movido a etapa: ${eventoActualizado.EventoEtapa?.nombre}`,
            timestamp: new Date()
        };

    } catch (error) {
        console.error('Error actualizando etapa:', error);
        return {
            success: false,
            error: 'Error al actualizar etapa del evento',
            timestamp: new Date()
        };
    }
}

/**
 * Crear nuevo pago
 */
export async function crearPagoEventoDetalle(
    data: PagoCreateForm
): Promise<EventoDetalleActionResult> {
    try {
        const validatedData = PagoCreateSchema.parse(data);

        const nuevoPago = await prisma.pago.create({
            data: validatedData,
            include: {
                MetodoPago: true
            }
        });

        revalidatePath(`/admin/dashboard/seguimiento/*`);

        return {
            success: true,
            data: nuevoPago,
            message: 'Pago registrado exitosamente',
            timestamp: new Date()
        };

    } catch (error) {
        console.error('Error creando pago:', error);
        return {
            success: false,
            error: 'Error al registrar el pago',
            timestamp: new Date()
        };
    }
}

/**
 * Actualizar pago existente
 */
export async function actualizarPagoEventoDetalle(
    data: PagoUpdateForm
): Promise<EventoDetalleActionResult> {
    try {
        const validatedData = PagoUpdateSchema.parse(data);
        const { id, ...updateData } = validatedData;

        const pagoActualizado = await prisma.pago.update({
            where: { id },
            data: updateData,
            include: {
                MetodoPago: true
            }
        });

        revalidatePath(`/admin/dashboard/seguimiento/*`);

        return {
            success: true,
            data: pagoActualizado,
            message: 'Pago actualizado exitosamente',
            timestamp: new Date()
        };

    } catch (error) {
        console.error('Error actualizando pago:', error);
        return {
            success: false,
            error: 'Error al actualizar el pago',
            timestamp: new Date()
        };
    }
}

/**
 * Eliminar pago
 */
export async function eliminarPagoEventoDetalle(
    pagoId: string
): Promise<EventoDetalleActionResult> {
    try {
        await prisma.pago.delete({
            where: { id: pagoId }
        });

        revalidatePath(`/admin/dashboard/seguimiento/*`);

        return {
            success: true,
            message: 'Pago eliminado exitosamente',
            timestamp: new Date()
        };

    } catch (error) {
        console.error('Error eliminando pago:', error);
        return {
            success: false,
            error: 'Error al eliminar el pago',
            timestamp: new Date()
        };
    }
}

/**
 * Crear nueva entrada en agenda
 */
export async function crearAgendaEventoDetalle(
    data: AgendaCreateForm
): Promise<EventoDetalleActionResult> {
    try {
        const validatedData = AgendaCreateSchema.parse(data);

        const nuevaAgenda = await prisma.agenda.create({
            data: validatedData,
            include: {
                User: true
            }
        });

        revalidatePath(`/admin/dashboard/seguimiento/${validatedData.eventoId}`);

        return {
            success: true,
            data: nuevaAgenda,
            message: 'Entrada de agenda creada exitosamente',
            timestamp: new Date()
        };

    } catch (error) {
        console.error('Error creando agenda:', error);
        return {
            success: false,
            error: 'Error al crear entrada de agenda',
            timestamp: new Date()
        };
    }
}

/**
 * Actualizar entrada de agenda
 */
export async function actualizarAgendaEventoDetalle(
    data: AgendaUpdateForm
): Promise<EventoDetalleActionResult> {
    try {
        const validatedData = AgendaUpdateSchema.parse(data);
        const { id, ...updateData } = validatedData;

        const agendaActualizada = await prisma.agenda.update({
            where: { id },
            data: updateData,
            include: {
                User: true
            }
        });

        revalidatePath(`/admin/dashboard/seguimiento/*`);

        return {
            success: true,
            data: agendaActualizada,
            message: 'Agenda actualizada exitosamente',
            timestamp: new Date()
        };

    } catch (error) {
        console.error('Error actualizando agenda:', error);
        return {
            success: false,
            error: 'Error al actualizar la agenda',
            timestamp: new Date()
        };
    }
}

// ========================================
// FUNCIONES AUXILIARES
// ========================================

/**
 * Calcular resumen financiero completo
 */
function calcularResumenFinanciero(cotizacion: any, pagos: any[]): ResumenFinanciero {
    const precio = cotizacion?.precio || 0;
    const totalPagado = pagos.reduce((sum, pago) => sum + pago.monto, 0);
    const balance = precio - totalPagado;
    const porcentajePagado = precio > 0 ? (totalPagado / precio) * 100 : 0;

    const ultimoPago = pagos.length > 0 ? {
        fecha: pagos[0].createdAt,
        monto: pagos[0].monto,
        metodo: pagos[0].MetodoPago?.nombre || 'Desconocido'
    } : undefined;

    return {
        precio,
        totalPagado,
        balance,
        porcentajePagado,
        cantidadPagos: pagos.length,
        ultimoPago
    };
}

/**
 * Procesar evento con datos extendidos
 */
function procesarEventoExtendido(evento: any): EventoExtendido {
    const hoy = new Date();
    const fechaEvento = new Date(evento.fecha_evento);
    const diasHastaEvento = Math.ceil((fechaEvento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

    let statusEvento: 'futuro' | 'hoy' | 'pasado' = 'futuro';
    if (diasHastaEvento < 0) statusEvento = 'pasado';
    else if (diasHastaEvento === 0) statusEvento = 'hoy';

    return {
        ...evento,
        clienteNombre: evento.Cliente?.nombre || 'Sin cliente',
        tipoEventoNombre: evento.EventoTipo?.nombre || 'Sin tipo',
        etapaNombre: evento.EventoEtapa?.nombre || 'Sin etapa',
        diasHastaEvento,
        statusEvento
    };
}

/**
 * Procesar pagos con información detallada
 */
function procesarPagosDetalle(pagos: any[]): any[] {
    return pagos.map(pago => ({
        ...pago,
        cantidad: pago.monto, // Mapear monto a cantidad para compatibilidad
        metodoPago: pago.MetodoPago?.nombre || pago.metodo_pago || 'Sin método',
        fechaFormateada: pago.createdAt ? new Date(pago.createdAt).toLocaleDateString() : 'Sin fecha',
        montoFormateado: pago.monto ? `$${pago.monto.toLocaleString()}` : '$0',
        statusDisplay: pago.status || 'pendiente',
        tipoTransaccionDisplay: pago.tipo_transaccion || 'ingreso',
        categoriaDisplay: pago.categoria_transaccion || 'abono'
    }));
}

/**
 * Procesar servicios con información detallada
 * Incluye tanto servicios de catálogo como servicios personalizados
 */
function procesarServiciosDetalle(servicios: any[], usuarios: any[]): ServicioDetalle[] {
    // console.log('🔍 DEBUG procesarServiciosDetalle entrada:', {
    //     totalServicios: servicios.length,
    //     serviciosOrdenEntrada: servicios.map((s, idx) => ({
    //         index: idx,
    //         id: s.id,
    //         nombre_snapshot: s.nombre_snapshot,
    //         posicion: s.posicion
    //     }))
    // });

    const serviciosProcesados = servicios.map(cotizacionServicio => {
        // console.log('🔍 Procesando servicio:', {
        //     id: cotizacionServicio.id,
        //     nombre_snapshot: cotizacionServicio.nombre_snapshot,
        //     categoria_nombre_snapshot: cotizacionServicio.categoria_nombre_snapshot,
        //     seccion_nombre_snapshot: cotizacionServicio.seccion_nombre_snapshot,
        //     precio_unitario_snapshot: cotizacionServicio.precio_unitario_snapshot,
        //     cantidad: cotizacionServicio.cantidad,
        //     subtotal: cotizacionServicio.subtotal,
        //     posicion: cotizacionServicio.posicion,
        //     objetoCompleto: JSON.stringify(cotizacionServicio, null, 2)
        // });
        // Buscar usuario asignado
        const responsable = usuarios.find(u => u.id === cotizacionServicio.userId);

        // Determinar nombre del servicio (usar snapshot primero, luego fallback)
        const nombre = cotizacionServicio.nombre_snapshot ||
            cotizacionServicio.nombre ||
            cotizacionServicio.Servicio?.nombre ||
            'Servicio sin nombre';

        // Determinar categoría (usar snapshot primero, luego relación)
        const categoriaNombre = cotizacionServicio.categoria_nombre_snapshot ||
            cotizacionServicio.categoria_nombre ||
            cotizacionServicio.ServicioCategoria?.nombre ||
            cotizacionServicio.Servicio?.ServicioCategoria?.nombre ||
            'Sin categoría';

        // Determinar sección (usar snapshot primero, luego relación)
        const seccionNombre = cotizacionServicio.seccion_nombre_snapshot ||
            cotizacionServicio.seccion_nombre ||
            cotizacionServicio.ServicioCategoria?.seccionCategoria?.Seccion?.nombre ||
            cotizacionServicio.Servicio?.ServicioCategoria?.seccionCategoria?.Seccion?.nombre ||
            categoriaNombre; // Fallback a la categoría si no hay sección

        // Calcular precio correcto
        const precio = cotizacionServicio.precioUnitario ||
            cotizacionServicio.precio_unitario_snapshot ||
            0;

        return {
            id: cotizacionServicio.id,
            cotizacionId: cotizacionServicio.cotizacionId,
            servicioId: cotizacionServicio.servicioId,
            nombre,
            descripcion: cotizacionServicio.descripcion_snapshot || cotizacionServicio.descripcion,
            precio,
            cantidad: cotizacionServicio.cantidad || 1,
            subtotal: cotizacionServicio.subtotal || (precio * (cotizacionServicio.cantidad || 1)),
            categoria: categoriaNombre,
            categoriaNombre,
            seccion: seccionNombre, // Agregamos la sección

            // Información del responsable asignado
            responsableId: cotizacionServicio.userId,
            responsableNombre: responsable?.username || responsable?.email || 'Sin asignar',
            responsableEmail: responsable?.email,

            // Estado y fechas
            status: cotizacionServicio.status || 'pendiente',
            statusDisplay: cotizacionServicio.status || 'pendiente',
            colorStatus: SERVICIO_STATUS_COLORS[cotizacionServicio.status as keyof typeof SERVICIO_STATUS_COLORS] || SERVICIO_STATUS_COLORS.pendiente,
            fechaAsignacion: cotizacionServicio.fechaAsignacion,
            FechaEntrega: cotizacionServicio.FechaEntrega,

            // Metadatos
            posicion: cotizacionServicio.posicion || 0,
            es_personalizado: cotizacionServicio.es_personalizado || false,
            createdAt: cotizacionServicio.createdAt,
            updatedAt: cotizacionServicio.updatedAt
        };
    });

    // 🔍 DEBUG: Servicios ANTES del ordenamiento
    // console.log('🔍 DEBUG Servicios ANTES del sort:', serviciosProcesados.map((s, idx) => ({
    //     index: idx,
    //     id: s.id,
    //     nombre: s.nombre,
    //     posicion: s.posicion
    // })));

    // ✅ ORDENAR POR POSICIÓN para garantizar el orden correcto
    const serviciosOrdenados = serviciosProcesados.sort((a, b) => (a.posicion || 0) - (b.posicion || 0));

    // 🔍 DEBUG: Servicios DESPUÉS del ordenamiento
    // console.log('🔍 DEBUG Servicios DESPUÉS del sort:', serviciosOrdenados.map((s, idx) => ({
    //     index: idx,
    //     id: s.id,
    //     nombre: s.nombre,
    //     posicion: s.posicion
    // })));

    return serviciosOrdenados;
}

/**
 * Procesar agenda con información detallada
 */
function procesarAgendaDetalle(agenda: any[], usuarios: any[]): AgendaDetalle[] {
    const hoy = new Date();

    return agenda.map(item => {
        const responsable = usuarios.find(u => u.id === item.responsableId);
        const fechaItem = new Date(item.fecha);
        const diasFaltantes = Math.ceil((fechaItem.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

        return {
            ...item,
            tipoNombre: item.AgendaTipo?.nombre || 'Sin tipo',
            responsableNombre: responsable?.nombre,
            diasFaltantes,
            statusDisplay: item.status || 'pendiente',
            colorStatus: AGENDA_STATUS_COLORS[item.status as keyof typeof AGENDA_STATUS_COLORS] || AGENDA_STATUS_COLORS.pendiente,
            iconoTipo: item.AgendaTipo?.icono || 'calendar'
        };
    });
}
