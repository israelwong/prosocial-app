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
                    acc + seccion.seccionCategorias.reduce((secAcc, cat) =>
                        secAcc + cat.ServicioCategoria.Servicio.length, 0), 0) : 0
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
                                ServicioCategoria: true
                            }
                        },
                        ServicioCategoria: true
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
        // Validar datos con schema
        const validatedData = CotizacionNuevaSchema.parse(data);

        const nuevaCotizacion = await prisma.cotizacion.create({
            data: {
                eventoId: validatedData.eventoId,
                eventoTipoId: validatedData.eventoTipoId,
                nombre: validatedData.nombre,
                precio: validatedData.precio,
                condicionesComercialesId: validatedData.condicionesComercialesId,
                status: 'pending',
                visible_cliente: true,
                Servicio: {
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
                        seccion_nombre_snapshot: servicio.seccion_nombre_snapshot
                    }))
                },
                Costos: {
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

        return nuevaCotizacion;

    } catch (error: any) {
        console.error('Error al crear cotización:', error);
        throw new Error(`Error al crear cotización: ${error?.message || 'Error desconocido'}`);
    }
}

/**
 * Edita una cotización existente usando los nuevos schemas
 */
export async function editarCotizacion(data: CotizacionEditar) {
    try {
        // Validar datos con schema
        const validatedData = CotizacionEditarSchema.parse(data);

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
                        seccion_nombre_snapshot: servicio.seccion_nombre_snapshot
                    }))
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
