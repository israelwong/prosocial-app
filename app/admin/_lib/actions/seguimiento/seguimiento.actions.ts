// Ruta: app/admin/_lib/actions/seguimiento/seguimiento.actions.ts

'use server';

import { EVENTO_STATUS, COTIZACION_STATUS, PAGO_STATUS } from '@/app/admin/_lib/constants/status';
import { ETAPA_CODES } from '@/app/admin/_lib/constants/etapas';
import prisma from '@/app/admin/_lib/prismaClient';
import { revalidatePath } from 'next/cache';
import {
    SeguimientoBusquedaSchema,
    SeguimientoEtapaUpdateSchema,
    type SeguimientoBusquedaForm,
    type SeguimientoEtapaUpdateForm,
    type EventoSeguimiento,
    type EtapaSeguimiento,
    type SeguimientoEtapas
} from './seguimiento.schemas';

// ========================================
// FUNCIONES DE CONSULTA
// ========================================

/**
 * Obtener eventos en seguimiento agrupados por etapa
 * Filtrar por etapas específicas: Aprobado, En edición, En revisión por cliente
 */
export async function obtenerEventosSeguimientoPorEtapa(
    params?: SeguimientoBusquedaForm
): Promise<SeguimientoEtapas> {
    try {
        const validatedParams = SeguimientoBusquedaSchema.parse(params || {});

        // PASO 1: ✅ NUEVO - Obtener etapas por IDs directos (producción)
        const etapasEspecificas = await prisma.eventoEtapa.findMany({
            where: {
                id: {
                    in: [
                        'cm6499aqs0002gu1ae4k1a7ls', // Aprobado
                        'cm6499n9v0003gu1a9bj1neri', // En edición
                        'cm649aflf0004gu1agr90z9o3', // En revisión por cliente
                        'cm649e21l0007gu1a6xu17vk9'  // En garantía
                    ]
                }
            },
            orderBy: { posicion: 'asc' }
        });

        const etapaIds = etapasEspecificas.map(etapa => etapa.id);

        // PASO 2: Obtener eventos solo de las etapas específicas
        const eventosEtapasEspecificas = await prisma.evento.findMany({
            where: {
                eventoEtapaId: {
                    in: etapaIds
                }
            },
            include: {
                Cliente: true,
                EventoTipo: true,
                EventoEtapa: true,
                Cotizacion: {
                    include: {
                        Servicio: true,
                        Pago: true
                    }
                }
            },
            orderBy: { fecha_evento: 'asc' }
        });

        // console.log('=== DEBUG ETAPAS ESPECÍFICAS ===');
        // console.log('Etapas encontradas:', etapasEspecificas.length);
        etapasEspecificas.forEach(etapa => {
            console.log(`- ${etapa.nombre} (pos: ${etapa.posicion})`);
        });
        // console.log('Eventos en etapas específicas:', eventosEtapasEspecificas.length);

        // PASO 3: Procesar y transformar datos
        const eventosTransformados: EventoSeguimiento[] = eventosEtapasEspecificas.map(evento => {
            const cotizacion = evento.Cotizacion[0]; // Primera cotización

            // ✅ CALCULAR TOTAL PAGADO - Solo pagos con status válidos
            const pagosValidos = cotizacion?.Pago.filter(pago =>
                pago.status === PAGO_STATUS.PAID ||
                pago.status === PAGO_STATUS.COMPLETADO ||
                pago.status === 'succeeded'
            ) || [];
            const totalPagado = pagosValidos.reduce((sum: number, pago: { monto: number }) => sum + pago.monto, 0);

            // ✅ CALCULAR PRECIO TOTAL - Considerando descuentos
            const precioServicios = cotizacion?.Servicio.reduce(
                (sum: number, cs: { precio_unitario_snapshot: number; cantidad: number }) =>
                    sum + (cs.precio_unitario_snapshot * cs.cantidad), 0
            ) || 0;

            // Usar precio base de cotización si no hay servicios
            const precioBase = precioServicios > 0 ? precioServicios : (cotizacion?.precio || 0);

            // Aplicar descuento si existe
            const descuento = cotizacion?.descuento || 0;
            const precio = precioBase - descuento;

            // ✅ CALCULAR BALANCE FINAL
            const balance = precio - totalPagado;

            // Calcular días restantes hasta el evento
            const hoy = new Date();
            const fechaEvento = new Date(evento.fecha_evento);
            const diasRestantes = Math.ceil((fechaEvento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

            // Debug logging para verificar cálculos
            // console.log(`- ${evento.nombre} | Cliente: ${evento.Cliente?.nombre} | Precio Servicios: $${precioServicios} | Precio Base: $${precioBase} | Descuento: $${descuento} | Precio Final: $${precio} | Pagos Válidos: ${pagosValidos.length} | Total Pagado: $${totalPagado} | Balance: $${balance}`);

            return {
                id: evento.id,
                nombre: evento.nombre,
                fecha_evento: evento.fecha_evento,
                status: evento.status,
                createdAt: evento.createdAt,
                updatedAt: evento.updatedAt,

                // Datos del cliente
                clienteId: evento.clienteId,
                clienteNombre: evento.Cliente.nombre,

                // Datos del tipo de evento
                eventoTipoId: evento.eventoTipoId,
                tipoEventoNombre: evento.EventoTipo?.nombre || 'Sin tipo',

                // Datos de la etapa
                eventoEtapaId: evento.eventoEtapaId,
                etapaNombre: evento.EventoEtapa?.nombre || 'Sin etapa',
                etapaPosicion: evento.EventoEtapa?.posicion || 0,

                // Datos de cotización
                cotizacionId: cotizacion?.id || null,
                cotizacionAprobada: cotizacion?.status === COTIZACION_STATUS.APROBADA,
                precio,

                // Datos de pagos
                totalPagado,
                balance,

                // Campos calculados
                diasRestantes,
                statusPago: balance === 0 ? 'pagado' : balance > 0 ? 'pendiente' : 'sobregiro'
            };
        });

        // console.log('Eventos transformados:', eventosTransformados.length);
        eventosTransformados.forEach(evento => {
            console.log(`- ${evento.nombre} | Cliente: ${evento.clienteNombre} | Etapa: ${evento.etapaNombre} | Cotización: ${evento.cotizacionAprobada ? 'APROBADA' : 'NO APROBADA'}`);
        });

        // PASO 4: Agrupar por etapa (solo etapas específicas)
        const resultado: SeguimientoEtapas = {};

        etapasEspecificas.forEach(etapa => {
            const eventosEtapa = eventosTransformados.filter(evento => evento.eventoEtapaId === etapa.id);
            resultado[etapa.nombre] = eventosEtapa;
            console.log(`Etapa "${etapa.nombre}": ${eventosEtapa.length} eventos`);
        });

        return resultado;

    } catch (error) {
        console.error('Error al obtener eventos seguimiento:', error);
        throw new Error('Error al obtener eventos de seguimiento');
    }
}

/**
 * Obtener eventos en seguimiento agrupados por etapa para ListaEventosAprobados
 * Usa el precio de la cotización aprobada para cálculos financieros correctos
 */
export async function obtenerEventosSeguimientoPorEtapaListaAprobados(
    params?: SeguimientoBusquedaForm
): Promise<SeguimientoEtapas> {
    try {
        const validatedParams = SeguimientoBusquedaSchema.parse(params || {});

        // PASO 1: ✅ NUEVO - Obtener etapas por IDs directos (producción)
        const etapasEspecificas = await prisma.eventoEtapa.findMany({
            where: {
                id: {
                    in: [
                        'cm6499aqs0002gu1ae4k1a7ls', // Aprobado
                        'cm6499n9v0003gu1a9bj1neri', // En edición
                        'cm649aflf0004gu1agr90z9o3', // En revisión por cliente
                        'cm649e21l0007gu1a6xu17vk9'  // En garantía
                    ]
                }
            },
            orderBy: { posicion: 'asc' }
        });

        const etapaIds = etapasEspecificas.map(etapa => etapa.id);

        // PASO 2: Obtener eventos solo de las etapas específicas con cotización aprobada
        const eventosEtapasEspecificas = await prisma.evento.findMany({
            where: {
                eventoEtapaId: {
                    in: etapaIds
                },
                // Solo eventos que tengan al menos una cotización aprobada o autorizada
                Cotizacion: {
                    some: {
                        OR: [
                            { status: COTIZACION_STATUS.APROBADA },
                            { status: COTIZACION_STATUS.AUTORIZADO }
                        ]
                    }
                }
            },
            include: {
                Cliente: true,
                EventoTipo: true,
                EventoEtapa: true,
                Cotizacion: {
                    where: {
                        OR: [
                            { status: COTIZACION_STATUS.APROBADA },
                            { status: COTIZACION_STATUS.AUTORIZADO }
                        ]
                    },
                    include: {
                        Pago: true
                    },
                    orderBy: {
                        createdAt: 'desc' // La más reciente
                    },
                    take: 1 // Solo la primera (más reciente)
                }
            },
            orderBy: { fecha_evento: 'asc' }
        });

        // console.log('=== DEBUG ETAPAS ESPECÍFICAS LISTA APROBADOS ===');
        // console.log('Etapas encontradas:', etapasEspecificas.length);
        etapasEspecificas.forEach(etapa => {
            console.log(`- ${etapa.nombre} (pos: ${etapa.posicion})`);
        });
        // console.log('Eventos en etapas específicas:', eventosEtapasEspecificas.length);

        // PASO 3: Procesar y transformar datos
        const eventosTransformados: EventoSeguimiento[] = eventosEtapasEspecificas.map(evento => {
            const cotizacionAprobada = evento.Cotizacion[0]; // Primera cotización aprobada

            // ✅ CALCULAR TOTAL PAGADO - Solo pagos con status válidos
            const pagosValidos = cotizacionAprobada?.Pago.filter(pago =>
                pago.status === PAGO_STATUS.PAID ||
                pago.status === PAGO_STATUS.COMPLETADO ||
                pago.status === 'succeeded'
            ) || [];
            const totalPagado = pagosValidos.reduce((sum: number, pago: { monto: number }) => sum + pago.monto, 0);

            // ✅ CALCULAR PRECIO FINAL - Considerando descuentos
            const precioBase = cotizacionAprobada?.precio || 0;
            const descuento = cotizacionAprobada?.descuento || 0;
            const precio = precioBase - descuento;

            // ✅ CALCULAR BALANCE FINAL
            const balance = precio - totalPagado;

            // Calcular días restantes hasta el evento
            const hoy = new Date();
            const fechaEvento = new Date(evento.fecha_evento);
            const diasRestantes = Math.ceil((fechaEvento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

            // Debug logging para verificar cálculos
            // console.log(`- ${evento.nombre} | Cliente: ${evento.Cliente.nombre} | Etapa: ${evento.EventoEtapa?.nombre} | Precio Cotización: $${precioBase} | Descuento: $${descuento} | Precio Final: $${precio} | Pagos Válidos: ${pagosValidos.length} | Total Pagado: $${totalPagado} | Balance: $${balance}`);

            return {
                id: evento.id,
                nombre: evento.nombre,
                fecha_evento: evento.fecha_evento,
                status: evento.status,
                createdAt: evento.createdAt,
                updatedAt: evento.updatedAt,

                // Datos del cliente
                clienteId: evento.clienteId,
                clienteNombre: evento.Cliente.nombre,

                // Datos del tipo de evento
                eventoTipoId: evento.eventoTipoId,
                tipoEventoNombre: evento.EventoTipo?.nombre || 'Sin tipo',

                // Datos de la etapa
                eventoEtapaId: evento.eventoEtapaId,
                etapaNombre: evento.EventoEtapa?.nombre || 'Sin etapa',
                etapaPosicion: evento.EventoEtapa?.posicion || 0,

                // Datos de cotización
                cotizacionId: cotizacionAprobada?.id || null,
                cotizacionAprobada: true, // Siempre true ya que filtramos por aprobadas
                precio, // Precio de la cotización aprobada

                // Datos de pagos
                totalPagado,
                balance,

                // Campos calculados
                diasRestantes,
                statusPago: balance === 0 ? 'pagado' : balance > 0 ? 'pendiente' : 'sobregiro'
            };
        });

        // console.log('Eventos transformados LISTA APROBADOS:', eventosTransformados.length);
        eventosTransformados.forEach(evento => {
            console.log(`- ${evento.nombre} | Cliente: ${evento.clienteNombre} | Etapa: ${evento.etapaNombre} | Precio Cotización: $${evento.precio} | Balance: $${evento.balance}`);
        });

        // PASO 4: Agrupar por etapa (solo etapas específicas)
        const resultado: SeguimientoEtapas = {};

        etapasEspecificas.forEach(etapa => {
            const eventosEtapa = eventosTransformados.filter(evento => evento.eventoEtapaId === etapa.id);
            resultado[etapa.nombre] = eventosEtapa;
            console.log(`Etapa "${etapa.nombre}": ${eventosEtapa.length} eventos`);
        });

        return resultado;

    } catch (error) {
        console.error('Error al obtener eventos seguimiento lista aprobados:', error);
        throw new Error('Error al obtener eventos de seguimiento para lista aprobados');
    }
}

/**
 * Obtener eventos de seguimiento en formato de lista simple
 */
export async function obtenerEventosSeguimiento(
    params?: SeguimientoBusquedaForm
): Promise<EventoSeguimiento[]> {
    try {
        const eventosPorEtapa = await obtenerEventosSeguimientoPorEtapa(params);

        // Convertir objeto agrupado a array plano
        const eventosPlanos: EventoSeguimiento[] = [];
        Object.values(eventosPorEtapa).forEach(eventos => {
            eventosPlanos.push(...eventos);
        });

        // Ordenar por fecha de evento (más cercano primero)
        return eventosPlanos.sort((a, b) =>
            new Date(a.fecha_evento).getTime() - new Date(b.fecha_evento).getTime()
        );

    } catch (error) {
        console.error('Error al obtener lista eventos seguimiento:', error);
        throw new Error('Error al obtener eventos de seguimiento');
    }
}

/**
 * Obtener etapas de seguimiento con conteos
 */
export async function obtenerEtapasSeguimiento(): Promise<EtapaSeguimiento[]> {
    try {
        const etapas = await prisma.eventoEtapa.findMany({
            where: {
                OR: [
                    { nombre: { contains: 'Aprobado', mode: 'insensitive' } },
                    { nombre: { contains: 'Aprobada', mode: 'insensitive' } },
                    { nombre: { contains: 'revisión', mode: 'insensitive' } },
                    { nombre: { contains: 'cliente', mode: 'insensitive' } },
                    { nombre: { contains: 'garantía', mode: 'insensitive' } },
                    { nombre: { contains: 'seguimiento', mode: 'insensitive' } },
                    { posicion: { gte: 3 } }
                ]
            },
            include: {
                Evento: {
                    where: {
                        Cotizacion: {
                            some: { status: COTIZACION_STATUS.APROBADA }
                        }
                    },
                    include: {
                        Cliente: true,
                        EventoTipo: true,
                        Cotizacion: {
                            where: { status: COTIZACION_STATUS.APROBADA },
                            include: {
                                Servicio: true,
                                Pago: {
                                    where: { status: 'paid' }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { posicion: 'asc' }
        });

        return etapas.map(etapa => ({
            id: etapa.id,
            nombre: etapa.nombre,
            posicion: etapa.posicion,
            eventos: etapa.Evento.map(evento => {
                const cotizacion = evento.Cotizacion[0];
                const totalPagado = cotizacion?.Pago.reduce((sum: number, pago: { monto: number }) => sum + pago.monto, 0) || 0;
                const precio = cotizacion?.Servicio.reduce(
                    (sum: number, cs: { precio_unitario_snapshot: number; cantidad: number }) => sum + (cs.precio_unitario_snapshot * cs.cantidad), 0
                ) || 0;
                const balance = precio - totalPagado;
                const hoy = new Date();
                const fechaEvento = new Date(evento.fecha_evento);
                const diasRestantes = Math.ceil((fechaEvento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

                return {
                    id: evento.id,
                    nombre: evento.nombre,
                    fecha_evento: evento.fecha_evento,
                    status: evento.status,
                    createdAt: evento.createdAt,
                    updatedAt: evento.updatedAt,
                    clienteId: evento.clienteId,
                    clienteNombre: evento.Cliente.nombre,
                    eventoTipoId: evento.eventoTipoId,
                    tipoEventoNombre: evento.EventoTipo?.nombre || 'Sin tipo',
                    eventoEtapaId: evento.eventoEtapaId,
                    etapaNombre: etapa.nombre,
                    etapaPosicion: etapa.posicion,
                    cotizacionId: cotizacion?.id || null,
                    cotizacionAprobada: !!cotizacion,
                    precio,
                    totalPagado,
                    balance,
                    diasRestantes,
                    statusPago: balance === 0 ? 'pagado' : balance > 0 ? 'pendiente' : 'sobregiro'
                } as EventoSeguimiento;
            })
        }));

    } catch (error) {
        console.error('Error al obtener etapas seguimiento:', error);
        throw new Error('Error al obtener etapas de seguimiento');
    }
}

// ========================================
// FUNCIONES DE MUTACIÓN
// ========================================

/**
 * Actualizar etapa de un evento en seguimiento
 */
export async function actualizarEtapaEvento(data: SeguimientoEtapaUpdateForm) {
    try {
        const validatedData = SeguimientoEtapaUpdateSchema.parse(data);

        // Verificar que el evento existe
        const eventoExiste = await prisma.evento.findUnique({
            where: { id: validatedData.eventoId },
            include: {
                EventoEtapa: true
            }
        });

        if (!eventoExiste) {
            return {
                success: false,
                error: 'Evento no encontrado'
            };
        }

        // Verificar que la nueva etapa existe
        const nuevaEtapaExiste = await prisma.eventoEtapa.findUnique({
            where: { id: validatedData.eventoEtapaId }
        });

        if (!nuevaEtapaExiste) {
            return {
                success: false,
                error: 'Etapa destino no encontrada'
            };
        }

        const eventoActualizado = await prisma.evento.update({
            where: { id: validatedData.eventoId },
            data: { eventoEtapaId: validatedData.eventoEtapaId },
            include: {
                EventoEtapa: true
            }
        });

        revalidatePath('/admin/dashboard/seguimiento');

        return {
            success: true,
            data: eventoActualizado,
            message: `Evento movido a etapa: ${eventoActualizado.EventoEtapa?.nombre}`
        };

    } catch (error) {
        console.error('Error al actualizar etapa evento:', error);
        return {
            success: false,
            error: 'Error al actualizar etapa del evento'
        };
    }
}// ========================================
// FUNCIONES ESPECÍFICAS DEL MÓDULO
// ========================================

/**
 * Obtener resumen de métricas de seguimiento
 */
export async function obtenerMetricasSeguimiento() {
    try {
        const etapas = await obtenerEtapasSeguimiento();

        const totalEventos = etapas.reduce((sum, etapa) => sum + etapa.eventos.length, 0);
        const eventosPagados = etapas.reduce((sum, etapa) =>
            sum + etapa.eventos.filter(e => e.balance === 0).length, 0
        );
        const eventosPendientes = totalEventos - eventosPagados;

        const montoTotal = etapas.reduce((sum, etapa) =>
            sum + etapa.eventos.reduce((etapaSum, evento) => etapaSum + evento.precio, 0), 0
        );

        const montoPagado = etapas.reduce((sum, etapa) =>
            sum + etapa.eventos.reduce((etapaSum, evento) => etapaSum + evento.totalPagado, 0), 0
        );

        const montoPendiente = montoTotal - montoPagado;

        return {
            totalEventos,
            eventosPagados,
            eventosPendientes,
            montoTotal,
            montoPagado,
            montoPendiente,
            porcentajePagado: montoTotal > 0 ? (montoPagado / montoTotal) * 100 : 0
        };

    } catch (error) {
        console.error('Error al obtener métricas seguimiento:', error);
        throw new Error('Error al obtener métricas de seguimiento');
    }
}
