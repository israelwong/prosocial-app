'use server';

import prisma from '@/app/admin/_lib/prismaClient';
import { retryDatabaseOperation } from '@/app/admin/_lib/utils/database-retry';
import { obtenerEventoCompleto } from '@/app/admin/_lib/actions/evento/evento.actions';
import { obtenerTiposEvento } from '@/app/admin/_lib/actions/evento/tipo/eventoTipo.actions';
import { obtenerCatalogoCompleto } from '@/app/admin/_lib/actions/catalogo/catalogo.actions';
import { getGlobalConfiguracion } from '@/app/admin/_lib/actions/configuracion/configuracion.actions';
import { obtenerMetodosPago } from '@/app/admin/_lib/actions/metodoPago/metodoPago.actions';
import { obtenerPaquete } from '@/app/admin/_lib/actions/paquetes/paquetes.actions';
import { COTIZACION_STATUS, AGENDA_STATUS, EVENTO_STATUS, PAGO_STATUS } from '@/app/admin/_lib/constants/status';
import { revalidatePath } from 'next/cache';
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
            // console.log('🔧 obtenerDatosCotizacion: tipoEventoSeleccionado encontrado:', tipoEventoSeleccionado);
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

        // console.log('🔧 obtenerDatosCotizacion: Antes de return - tipoEventoSeleccionado:', tipoEventoSeleccionado);
        // console.log('🔧 obtenerDatosCotizacion: evento.EventoTipo:', evento.EventoTipo);
        // console.log('🔧 obtenerDatosCotizacion: tiposEvento[0]:', tiposEvento[0]);

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
                Costos: { // 🔧 Usar nombre correcto del schema restaurado
                    orderBy: { posicion: 'asc' }
                },
                Servicio: { // 🔧 Usar nombre correcto del schema restaurado
                    include: {
                        Servicio: {
                            include: {
                                ServicioCategoria: {
                                    include: {
                                        seccionCategoria: { // 🔧 Usar nombre correcto del schema restaurado
                                            include: {
                                                Seccion: true // 🔧 Usar nombre correcto del schema restaurado
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        ServicioCategoria: {
                            include: {
                                seccionCategoria: { // 🔧 Usar nombre correcto del schema restaurado
                                    include: {
                                        Seccion: true
                                    }
                                }
                            }
                        }
                    },
                    // ✅ ORDENAMIENTO JERÁRQUICO COMPLETO: Sección → Categoría → Servicio
                    orderBy: [
                        // 1️⃣ Ordenar por posición de la SECCIÓN
                        {
                            Servicio: {
                                ServicioCategoria: {
                                    seccionCategoria: {
                                        Seccion: { posicion: 'asc' }
                                    }
                                }
                            }
                        },
                        // 2️⃣ Ordenar por posición de la CATEGORÍA
                        {
                            Servicio: {
                                ServicioCategoria: { posicion: 'asc' }
                            }
                        },
                        // 3️⃣ Ordenar por posición del SERVICIO
                        { Servicio: { posicion: 'asc' } },
                        // 4️⃣ Fallback: posición en cotización
                        { posicion: 'asc' }
                    ]
                }
            }
        });

        // console.log('🔍 Buscando cotización:', { cotizacionId, found: !!cotizacion });

        if (!cotizacion) {
            // Log adicional para debugging
            // console.error('❌ Cotización no encontrada:', {
            //     cotizacionId,
            //     isValidFormat: /^[a-z0-9]+$/.test(cotizacionId),
            //     containsDummy: cotizacionId.includes('dummy')
            // });

            if (cotizacionId.includes('dummy')) {
                throw new Error(`El ID de cotización "${cotizacionId}" parece ser un ID de prueba/dummy. Usa un ID de cotización real de la base de datos.`);
            }

            throw new Error(`Cotización con ID ${cotizacionId} no encontrada en la base de datos`);
        }

        // 🔍 DEBUG: Verificar ordenamiento de servicios en cotización pública
        // console.log('🔍 DEBUG Cotización Pública - Servicios ordenados:', {
        //     cotizacionId: cotizacion.id,
        //     totalServicios: cotizacion.Servicio.length,
        //     serviciosOrden: cotizacion.Servicio.map((s: any, index: number) => ({
        //         index: index + 1,
        //         nombre: s.nombre_snapshot || s.Servicio?.nombre,
        //         posicion_cotizacion: s.posicion,
        //         posicion_servicio_original: s.Servicio?.posicion,
        //         categoria: s.categoria_nombre_snapshot || s.Servicio?.ServicioCategoria?.nombre
        //     }))
        // });

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
        // console.log('=== INICIO crearCotizacionNueva ===');
        // console.log('Data raw recibida:', JSON.stringify(data, null, 2));

        // Validar datos con schema
        // console.log('🔍 Validando datos con schema...');
        const validatedData = CotizacionNuevaSchema.parse(data);
        // console.log('✅ Datos validados exitosamente');
        // console.log('Data validada:', JSON.stringify(validatedData, null, 2));

        // console.log('🗃️ Creando cotización principal...');
        const nuevaCotizacion = await prisma.cotizacion.create({
            data: {
                eventoId: validatedData.eventoId,
                eventoTipoId: validatedData.eventoTipoId,
                nombre: validatedData.nombre,
                descripcion: validatedData.descripcion,
                precio: validatedData.precio,
                dias_minimos_contratacion: validatedData.dias_minimos_contratacion,
                condicionesComercialesId: validatedData.condicionesComercialesId,
                status: COTIZACION_STATUS.PENDIENTE,
                visible_cliente: true
            }
        });
        // console.log('✅ Cotización principal creada:', { id: nuevaCotizacion.id, nombre: nuevaCotizacion.nombre });

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
                    status: COTIZACION_STATUS.PENDIENTE,
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
            // console.log('💰 Creando costos adicionales...');
            // console.log('Cantidad de costos a crear:', validatedData.costos.length);

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

        // console.log('✅ Cotización completa obtenida');
        // console.log('🎉 PROCESO COMPLETADO EXITOSAMENTE');
        // console.log('Cotización final:', { id: nuevaCotizacion.id, nombre: nuevaCotizacion.nombre });
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
 * @deprecated Usar editarCotizacionConPreservacion para preservar asignaciones de personal
 * Esta función elimina y recrea todos los servicios, perdiendo asignaciones de usuarios y nóminas
 */
export async function editarCotizacion(data: CotizacionEditar) {
    try {
        console.log('🔥 editarCotizacion - Datos recibidos:', JSON.stringify(data, null, 2));

        // Validar datos con schema
        // console.log('🔥 editarCotizacion - Validando con schema...');
        const validatedData = CotizacionEditarSchema.parse(data);
        // console.log('🔥 editarCotizacion - Validación exitosa:', JSON.stringify(validatedData, null, 2));

        const cotizacionActualizada = await prisma.cotizacion.update({
            where: { id: validatedData.id },
            data: {
                nombre: validatedData.nombre,
                descripcion: validatedData.descripcion,
                precio: validatedData.precio,
                dias_minimos_contratacion: validatedData.dias_minimos_contratacion,
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
                        status: COTIZACION_STATUS.PENDIENTE,
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
 * Edita una cotización existente PRESERVANDO asignaciones de personal y nóminas
 * Esta función implementa un merge inteligente en lugar de delete/create
 */
export async function editarCotizacionConPreservacion(data: CotizacionEditar) {
    try {
        console.log('🔥 editarCotizacionConPreservacion - Datos recibidos:', JSON.stringify(data, null, 2));

        // Validar datos con schema
        const validatedData = CotizacionEditarSchema.parse(data);
        console.log('✅ Datos validados correctamente');

        // Definir tipos para los servicios con datos operacionales
        type ServicioExistente = {
            id: string;
            cotizacionId: string;
            servicioId: string | null;
            servicioCategoriaId: string | null;
            cantidad: number;
            posicion: number;
            userId: string | null;
            fechaAsignacion: Date | null;
            nombre_snapshot: string;
            descripcion_snapshot: string | null;
            precio_unitario_snapshot: number;
            costo_snapshot: number;
            gasto_snapshot: number;
            User?: {
                id: string;
                username: string | null;
                email: string | null;
            } | null;
            NominaServicio?: Array<{
                Nomina: {
                    id: string;
                    status: string;
                    concepto: string;
                    monto_neto: number;
                };
            }>;
        };

        type ServicioNuevo = typeof validatedData.servicios[0] & {
            indice: number;
        };

        type ServicioModificado = {
            existente: ServicioExistente;
            nuevo: typeof validatedData.servicios[0];
            indice: number;
        };

        // 1. Obtener servicios existentes CON datos operacionales
        const serviciosExistentes = await prisma.cotizacionServicio.findMany({
            where: { cotizacionId: validatedData.id },
            include: {
                User: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                },
                NominaServicio: {
                    include: {
                        Nomina: {
                            select: {
                                id: true,
                                status: true,
                                concepto: true,
                                monto_neto: true
                            }
                        }
                    }
                }
            }
        });

        console.log(`📋 Servicios existentes encontrados: ${serviciosExistentes.length}`);

        // 2. Crear mapas para comparación inteligente
        const serviciosNuevos: ServicioNuevo[] = [];
        const serviciosModificados: ServicioModificado[] = [];
        const serviciosAEliminar: ServicioExistente[] = [];

        // Crear mapa de servicios existentes por clave única compuesta
        const mapExistentes = new Map<string, ServicioExistente>();
        serviciosExistentes.forEach(servicio => {
            // Clave única: servicioId + servicioCategoriaId + nombre_snapshot (para servicios personalizados)
            const clave = `${servicio.servicioId || 'null'}-${servicio.servicioCategoriaId || 'null'}-${servicio.nombre_snapshot}`;
            mapExistentes.set(clave, servicio as ServicioExistente);
        });

        // 3. Categorizar servicios del formulario
        validatedData.servicios.forEach((servicioForm, index) => {
            const clave = `${servicioForm.servicioId || 'null'}-${servicioForm.servicioCategoriaId || 'null'}-${servicioForm.nombre_snapshot}`;

            if (mapExistentes.has(clave)) {
                // Servicio existente - verificar si hay cambios
                const existente = mapExistentes.get(clave)!;
                const hayCambios = (
                    existente.cantidad !== servicioForm.cantidad ||
                    existente.posicion !== servicioForm.posicion ||
                    existente.precio_unitario_snapshot !== servicioForm.precio_unitario_snapshot ||
                    existente.costo_snapshot !== servicioForm.costo_snapshot ||
                    existente.gasto_snapshot !== servicioForm.gasto_snapshot ||
                    existente.descripcion_snapshot !== servicioForm.descripcion_snapshot
                );

                if (hayCambios) {
                    serviciosModificados.push({
                        existente,
                        nuevo: servicioForm,
                        indice: index
                    });
                }

                mapExistentes.delete(clave); // Marcar como procesado
            } else {
                // Servicio nuevo
                serviciosNuevos.push({
                    ...servicioForm,
                    indice: index
                });
            }
        });

        // Los servicios restantes en el map son para eliminar
        serviciosAEliminar.push(...Array.from(mapExistentes.values()));

        console.log(`📊 Análisis de cambios:
            - Nuevos: ${serviciosNuevos.length}
            - Modificados: ${serviciosModificados.length} 
            - A eliminar: ${serviciosAEliminar.length}`);

        // 4. Validar eliminaciones críticas
        const erroresEliminacion: string[] = [];
        for (const servicio of serviciosAEliminar) {
            // Verificar si tiene usuario asignado
            if (servicio.userId && servicio.User) {
                console.log(`⚠️ Servicio "${servicio.nombre_snapshot}" tiene usuario asignado: ${servicio.User.username}`);
            }

            // Verificar si tiene nóminas activas
            const nominasActivas = servicio.NominaServicio?.filter(
                nomServ => nomServ.Nomina.status === 'pendiente' || nomServ.Nomina.status === 'pagado'
            ) || [];

            if (nominasActivas.length > 0) {
                const conceptos = nominasActivas.map(n => n.Nomina.concepto).join(', ');
                erroresEliminacion.push(
                    `Servicio "${servicio.nombre_snapshot}": tiene ${nominasActivas.length} nómina(s) activa(s) (${conceptos})`
                );
            }
        }

        if (erroresEliminacion.length > 0) {
            throw new Error(
                `No se pueden eliminar los siguientes servicios por tener pagos asociados:\n\n${erroresEliminacion.join('\n')}\n\nCancela primero los pagos pendientes antes de continuar.`
            );
        }

        // 5. Ejecutar transacción con cambios inteligentes
        console.log('🔄 Iniciando transacción de actualización inteligente...');

        const cotizacionActualizada = await prisma.$transaction(async (tx) => {
            // 5.1 Actualizar cotización principal
            console.log('📝 Actualizando datos principales de cotización...');
            const cotizacion = await tx.cotizacion.update({
                where: { id: validatedData.id },
                data: {
                    nombre: validatedData.nombre,
                    descripcion: validatedData.descripcion,
                    precio: validatedData.precio,
                    dias_minimos_contratacion: validatedData.dias_minimos_contratacion,
                    condicionesComercialesId: validatedData.condicionesComercialesId,
                    status: validatedData.status,
                    visible_cliente: validatedData.visible_cliente
                }
            });

            // 5.2 CREAR servicios nuevos
            console.log(`➕ Creando ${serviciosNuevos.length} servicios nuevos...`);
            if (serviciosNuevos.length > 0) {
                const creacionPromises = serviciosNuevos.map(servicioNuevo =>
                    tx.cotizacionServicio.create({
                        data: {
                            cotizacionId: validatedData.id,
                            servicioId: servicioNuevo.servicioId,
                            servicioCategoriaId: servicioNuevo.servicioCategoriaId,
                            cantidad: servicioNuevo.cantidad,
                            precioUnitario: servicioNuevo.precioUnitario,
                            subtotal: servicioNuevo.precioUnitario * servicioNuevo.cantidad,
                            posicion: servicioNuevo.posicion,
                            status: COTIZACION_STATUS.PENDIENTE,
                            // Campos snapshot
                            nombre_snapshot: servicioNuevo.nombre_snapshot,
                            descripcion_snapshot: servicioNuevo.descripcion_snapshot,
                            precio_unitario_snapshot: servicioNuevo.precio_unitario_snapshot,
                            costo_snapshot: servicioNuevo.costo_snapshot,
                            gasto_snapshot: servicioNuevo.gasto_snapshot,
                            utilidad_snapshot: servicioNuevo.utilidad_snapshot,
                            precio_publico_snapshot: servicioNuevo.precio_publico_snapshot,
                            tipo_utilidad_snapshot: servicioNuevo.tipo_utilidad_snapshot,
                            categoria_nombre_snapshot: servicioNuevo.categoria_nombre_snapshot,
                            seccion_nombre_snapshot: servicioNuevo.seccion_nombre_snapshot,
                            es_personalizado: servicioNuevo.es_personalizado,
                            servicio_original_id: servicioNuevo.servicio_original_id,
                            // userId: null (sin asignar inicialmente)
                            // fechaAsignacion: null (sin asignar inicialmente)
                        }
                    })
                );
                await Promise.all(creacionPromises);

                // Log después de todas las creaciones
                serviciosNuevos.forEach(servicio => {
                    console.log(`  ✅ Creado: ${servicio.nombre_snapshot}`);
                });
            }

            // 5.3 ACTUALIZAR servicios modificados (PRESERVANDO datos operacionales)
            console.log(`📝 Actualizando ${serviciosModificados.length} servicios modificados...`);
            if (serviciosModificados.length > 0) {
                const actualizacionPromises = serviciosModificados.map(({ existente, nuevo }) =>
                    tx.cotizacionServicio.update({
                        where: { id: existente.id },
                        data: {
                            // Actualizar solo campos del formulario
                            cantidad: nuevo.cantidad,
                            posicion: nuevo.posicion,
                            precioUnitario: nuevo.precioUnitario,
                            subtotal: nuevo.precioUnitario * nuevo.cantidad,

                            // Campos snapshot actualizados
                            nombre_snapshot: nuevo.nombre_snapshot,
                            descripcion_snapshot: nuevo.descripcion_snapshot,
                            precio_unitario_snapshot: nuevo.precio_unitario_snapshot,
                            costo_snapshot: nuevo.costo_snapshot,
                            gasto_snapshot: nuevo.gasto_snapshot,
                            utilidad_snapshot: nuevo.utilidad_snapshot,
                            precio_publico_snapshot: nuevo.precio_publico_snapshot,
                            tipo_utilidad_snapshot: nuevo.tipo_utilidad_snapshot,
                            categoria_nombre_snapshot: nuevo.categoria_nombre_snapshot,
                            seccion_nombre_snapshot: nuevo.seccion_nombre_snapshot,

                            // PRESERVAR EXPLÍCITAMENTE datos operacionales:
                            // userId: NO SE TOCA - mantiene asignación existente
                            // fechaAsignacion: NO SE TOCA - mantiene fecha de asignación
                            // FechaEntrega: NO SE TOCA - mantiene fechas programadas
                            // NominaServicio: NO SE TOCA - es relación, se mantiene automáticamente
                        }
                    })
                );
                await Promise.all(actualizacionPromises);

                // Log después de todas las actualizaciones
                serviciosModificados.forEach(({ existente, nuevo }) => {
                    console.log(`  ✅ Actualizado: ${nuevo.nombre_snapshot}${existente.userId ? ' (con personal asignado)' : ''}`);
                });
            }

            // 5.4 ELIMINAR servicios removidos (ya validados)
            console.log(`🗑️ Eliminando ${serviciosAEliminar.length} servicios removidos...`);
            if (serviciosAEliminar.length > 0) {
                const eliminacionPromises = serviciosAEliminar.map(servicioEliminar =>
                    tx.cotizacionServicio.delete({
                        where: { id: servicioEliminar.id }
                    })
                );
                await Promise.all(eliminacionPromises);

                // Log después de todas las eliminaciones
                serviciosAEliminar.forEach(servicio => {
                    console.log(`  ✅ Eliminado: ${servicio.nombre_snapshot}${servicio.userId ? ' (se liberó personal asignado)' : ''}`);
                });
            }

            // 5.5 Actualizar costos
            console.log('💰 Actualizando costos...');
            await tx.cotizacionCosto.deleteMany({
                where: { cotizacionId: validatedData.id }
            });

            if (validatedData.costos.length > 0) {
                await tx.cotizacionCosto.createMany({
                    data: validatedData.costos.map((costo, index) => ({
                        cotizacionId: validatedData.id,
                        nombre: costo.nombre,
                        descripcion: costo.descripcion,
                        costo: costo.costo,
                        tipo: costo.tipo,
                        posicion: costo.posicion || index + 1
                    }))
                });
            }

            return cotizacion;
            // 6. Obtener cotización completa dentro de la misma transacción
            const cotizacionCompleta = await tx.cotizacion.findUnique({
                where: { id: validatedData.id },
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
                        orderBy: [
                            {
                                Servicio: {
                                    ServicioCategoria: {
                                        seccionCategoria: {
                                            Seccion: { posicion: 'asc' }
                                        }
                                    }
                                }
                            },
                            {
                                Servicio: {
                                    ServicioCategoria: { posicion: 'asc' }
                                }
                            },
                            { posicion: 'asc' }
                        ]
                    }
                }
            });

            return cotizacionCompleta;
        });

        console.log('✅ Transacción completada exitosamente');

        // Devolver en el formato esperado por el frontend
        return { cotizacion: cotizacionActualizada };

    } catch (error: any) {
        console.error('❌ Error en actualización con preservación:', error);
        throw new Error(`Error al editar cotización preservando datos: ${error?.message || 'Error desconocido'}`);
    }
}/**
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
            // Modo edición - Usar función con preservación de asignaciones
            console.log('🔄 Modo edición detectado, llamando editarCotizacionConPreservacion...');
            return await editarCotizacionConPreservacion(data);
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
        return await retryDatabaseOperation(async () => {
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

            // Obtener eventos únicos en conflicto (agrupados por eventoId)
            const agendaEnConflicto = await prisma.agenda.findMany({
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
                    eventoId: true,
                    Evento: {
                        select: {
                            id: true,
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

            // Agrupar por eventoId para evitar eventos duplicados
            const eventosUnicosMap = new Map()
            agendaEnConflicto.forEach(agenda => {
                if (!eventosUnicosMap.has(agenda.eventoId)) {
                    eventosUnicosMap.set(agenda.eventoId, {
                        eventoId: agenda.eventoId,
                        evento: agenda.Evento?.nombre,
                        tipo: agenda.Evento?.EventoTipo?.nombre
                    })
                }
            })

            const eventosEnConflicto = Array.from(eventosUnicosMap.values())

            const fechaDisponible = eventosEnConflicto.length === 0

            // 3. Si la fecha no está disponible, retornar información del conflicto
            if (!fechaDisponible) {
                return {
                    disponible: false,
                    conflicto: {
                        mensaje: 'Fecha no disponible',
                        eventosEnConflicto: eventosEnConflicto.map(evento => ({
                            eventoId: evento.eventoId,
                            evento: evento.evento,
                            tipo: evento.tipo
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
                        in: [
                            'pending', // Valor legacy a migrar
                            COTIZACION_STATUS.PENDIENTE,
                            COTIZACION_STATUS.APROBADA,
                            'approved' // Valor legacy a migrar
                        ]
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
                [COTIZACION_STATUS.APROBADA, 'approved'].includes(cot.status as any) // Incluir valor legacy
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

        }, {
            maxRetries: 3,
            baseDelay: 1000
        });

    } catch (error) {
        console.error('Error al obtener cotizaciones para evento:', error)
        return {
            error: 'Error interno del servidor',
            disponible: false
        }
    }
}

/**
 * Elimina una cotización por su ID
 */
export async function eliminarCotizacion(cotizacionId: string) {
    try {
        // console.log('🗑️ [SERVIDOR] Iniciando eliminación de cotización:', cotizacionId);

        // Validar que el ID sea válido
        if (!cotizacionId || typeof cotizacionId !== 'string') {
            console.log('❌ [SERVIDOR] ID inválido:', cotizacionId);
            return {
                success: false,
                error: 'ID de cotización inválido'
            };
        }

        // Verificar que la cotización existe
        // console.log('🔍 [SERVIDOR] Buscando cotización en BD:', cotizacionId);
        const cotizacionExistente = await prisma.cotizacion.findUnique({
            where: { id: cotizacionId },
            select: {
                id: true,
                nombre: true,
                eventoId: true
            }
        });

        // console.log('🔍 [SERVIDOR] Resultado de búsqueda:', cotizacionExistente);

        if (!cotizacionExistente) {
            // Buscar en todas las cotizaciones para debugging
            const todasLasCotizaciones = await prisma.cotizacion.findMany({
                select: { id: true, nombre: true },
                take: 10 // Solo las primeras 10 para no saturar logs
            });
            // console.log('📋 [SERVIDOR] Primeras 10 cotizaciones en BD:', todasLasCotizaciones);

            // Retornar éxito silencioso si es una eliminación duplicada
            // console.log('ℹ️ [SERVIDOR] Cotización ya eliminada - retornando éxito silencioso');
            return {
                success: true,
                message: 'Cotización ya había sido eliminada previamente',
                alreadyDeleted: true,
                details: {
                    cotizacionId,
                    disponibles: todasLasCotizaciones.length
                }
            };
        }        // Eliminar la cotización
        // console.log('🗑️ [SERVIDOR] Eliminando cotización:', cotizacionExistente);
        await prisma.cotizacion.delete({
            where: { id: cotizacionId }
        });

        // console.log('✅ [SERVIDOR] Cotización eliminada exitosamente');
        return {
            success: true,
            message: 'Cotización eliminada exitosamente'
        };

    } catch (error) {
        console.error('💥 [SERVIDOR] Error al eliminar cotización:', error);
        return {
            success: false,
            error: 'Error interno del servidor al eliminar la cotización'
        };
    }
}

// =============================================================================
// FUNCIONES MIGRADAS DESDE ARCHIVOS LEGACY
// =============================================================================

/**
 * Obtener cotizaciones por evento - MIGRADA desde @/app/admin/_lib/cotizacion.actions
 * Función para obtener cotizaciones con conteo de visitas
 * Utilizada por: FichaCotizacionesUnificada
 */
export async function obtenerCotizacionesPorEventoLegacy(eventoId: string) {
    const cotizaciones = await prisma.cotizacion.findMany({
        where: {
            eventoId,
        },
        orderBy: {
            createdAt: 'asc'
        }
    });

    const cotizacionesWithVisitaCount = await Promise.all(cotizaciones.map(async (cotizacion) => {
        const visitas = await prisma.cotizacionVisita.count({
            where: {
                cotizacionId: cotizacion.id
            }
        });
        return {
            ...cotizacion,
            visitas
        };
    }));

    return cotizacionesWithVisitaCount;
}

/**
 * Archivar cotización - MIGRADA desde @/app/admin/_lib/cotizacion.actions
 * Función para archivar una cotización sin eliminarla
 */
export async function archivarCotizacion(cotizacionId: string) {
    try {
        console.log(`📁 Archivando cotización ${cotizacionId}...`);

        // Verificar que la cotización existe
        const cotizacion = await prisma.cotizacion.findUnique({
            where: { id: cotizacionId },
            select: {
                id: true,
                nombre: true,
                status: true,
                archivada: true
            }
        });

        if (!cotizacion) {
            return { error: 'Cotización no encontrada' };
        }

        if (cotizacion.archivada) {
            return { error: 'La cotización ya está archivada' };
        }

        // Archivar la cotización
        await prisma.cotizacion.update({
            where: { id: cotizacionId },
            data: { archivada: true }
        });

        console.log(`✅ Cotización "${cotizacion.nombre}" archivada exitosamente`);
        return {
            success: true,
            message: `Cotización "${cotizacion.nombre}" archivada exitosamente`
        };

    } catch (error) {
        console.error('Error al archivar cotización:', error);
        return { error: 'Error al archivar cotización' };
    }
}

/**
 * Desarchivar cotización - MIGRADA desde @/app/admin/_lib/cotizacion.actions
 * Función para desarchivar una cotización previamente archivada
 */
export async function desarchivarCotizacion(cotizacionId: string) {
    try {
        console.log(`📂 Desarchivando cotización ${cotizacionId}...`);

        const cotizacion = await prisma.cotizacion.findUnique({
            where: { id: cotizacionId },
            select: {
                id: true,
                nombre: true,
                archivada: true
            }
        });

        if (!cotizacion) {
            return { error: 'Cotización no encontrada' };
        }

        if (!cotizacion.archivada) {
            return { error: 'La cotización no está archivada' };
        }

        // Desarchivar la cotización
        await prisma.cotizacion.update({
            where: { id: cotizacionId },
            data: { archivada: false }
        });

        console.log(`✅ Cotización "${cotizacion.nombre}" desarchivada exitosamente`);
        return {
            success: true,
            message: `Cotización "${cotizacion.nombre}" desarchivada exitosamente`
        };

    } catch (error) {
        console.error('Error al desarchivar cotización:', error);
        return { error: 'Error al desarchivar cotización' };
    }
}

/**
 * Clonar cotización - MIGRADA desde @/app/admin/_lib/cotizacion.actions
 * Función para crear una copia de una cotización existente
 */
export async function clonarCotizacion(cotizacionId: string) {
    try {
        console.log(`📋 Clonando cotización ${cotizacionId}...`);

        const cotizacion = await prisma.cotizacion.findUnique({
            where: { id: cotizacionId }
        });

        if (!cotizacion) {
            return { error: 'Cotización no encontrada' };
        }

        const cotizacionServicios = await prisma.cotizacionServicio.findMany({
            where: { cotizacionId }
        });

        const existingCotizaciones = await prisma.cotizacion.findMany({
            where: {
                nombre: {
                    startsWith: cotizacion.nombre
                }
            }
        });

        const copyNumber = existingCotizaciones.length + 1;
        const newCotizacionNombre = `${cotizacion.nombre} - (copia ${copyNumber})`;

        const newCotizacion = await prisma.cotizacion.create({
            data: {
                eventoId: cotizacion.eventoId,
                eventoTipoId: cotizacion.eventoTipoId,
                nombre: newCotizacionNombre,
                descripcion: cotizacion.descripcion,
                precio: cotizacion.precio,
                condicionesComercialesId: cotizacion.condicionesComercialesId,
                status: COTIZACION_STATUS.PENDIENTE,
                visible_cliente: true,
                archivada: false
            }
        });

        for (const cotizacionServicio of cotizacionServicios) {
            await prisma.cotizacionServicio.create({
                data: {
                    cotizacionId: newCotizacion.id,
                    servicioId: cotizacionServicio.servicioId,
                    cantidad: cotizacionServicio.cantidad,
                    posicion: cotizacionServicio.posicion,
                    servicioCategoriaId: cotizacionServicio.servicioCategoriaId,
                    precioUnitario: cotizacionServicio.precioUnitario,
                    subtotal: cotizacionServicio.subtotal,
                    status: COTIZACION_STATUS.PENDIENTE,
                    // Copiar campos snapshot
                    nombre_snapshot: cotizacionServicio.nombre_snapshot,
                    descripcion_snapshot: cotizacionServicio.descripcion_snapshot,
                    precio_unitario_snapshot: cotizacionServicio.precio_unitario_snapshot,
                    costo_snapshot: cotizacionServicio.costo_snapshot,
                    gasto_snapshot: cotizacionServicio.gasto_snapshot,
                    utilidad_snapshot: cotizacionServicio.utilidad_snapshot,
                    precio_publico_snapshot: cotizacionServicio.precio_publico_snapshot,
                    tipo_utilidad_snapshot: cotizacionServicio.tipo_utilidad_snapshot,
                    categoria_nombre_snapshot: cotizacionServicio.categoria_nombre_snapshot,
                    seccion_nombre_snapshot: cotizacionServicio.seccion_nombre_snapshot,
                    es_personalizado: cotizacionServicio.es_personalizado,
                    servicio_original_id: cotizacionServicio.servicio_original_id
                }
            });
        }

        // Copiar costos si existen
        const cotizacionCostos = await prisma.cotizacionCosto.findMany({
            where: { cotizacionId }
        });

        for (const costo of cotizacionCostos) {
            await prisma.cotizacionCosto.create({
                data: {
                    cotizacionId: newCotizacion.id,
                    nombre: costo.nombre,
                    descripcion: costo.descripcion,
                    costo: costo.costo,
                    tipo: costo.tipo,
                    posicion: costo.posicion
                }
            });
        }

        console.log(`✅ Cotización clonada exitosamente: ${newCotizacionNombre}`);
        return {
            success: true,
            cotizacionId: newCotizacion.id,
            message: `Cotización clonada como: ${newCotizacionNombre}`
        };

    } catch (error) {
        console.error('Error al clonar cotización:', error);
        return { error: 'Error al clonar cotización' };
    }
}

// =============================================================================
// FUNCIONES DE AUTORIZACIÓN - MIGRADAS desde @/app/admin/_lib/autorizarCotizacion.actions
// =============================================================================

interface AutorizarCotizacionResult {
    success?: boolean;
    error?: string;
    message?: string;
    cotizacionesArchivadas?: number;
}

/**
 * Autorizar cotización - MIGRADA desde @/app/admin/_lib/autorizarCotizacion.actions
 * Función principal para autorizar una cotización y mover el evento al pipeline de seguimiento
 */
export async function autorizarCotizacion(cotizacionId: string): Promise<AutorizarCotizacionResult> {
    try {
        console.log('🔥 Iniciando aprobación de cotización:', cotizacionId);

        // 1. Obtener la cotización completa
        const cotizacion = await prisma.cotizacion.findUnique({
            where: { id: cotizacionId },
            include: {
                Evento: {
                    include: {
                        Cliente: true,
                        EventoTipo: true
                    }
                }
            }
        });

        if (!cotizacion) {
            return { error: 'Cotización no encontrada' };
        }

        if (cotizacion.status === COTIZACION_STATUS.APROBADA) {
            return { error: 'La cotización ya está aprobada' };
        }

        const evento = cotizacion.Evento;

        // 2. Buscar la etapa "Autorizado" (posición 2 típicamente)
        const etapaAutorizado = await prisma.eventoEtapa.findFirst({
            where: {
                OR: [
                    { nombre: { contains: 'autorizado', mode: 'insensitive' } },
                    { nombre: { contains: 'aprobado', mode: 'insensitive' } },
                    { posicion: 2 }
                ]
            },
            orderBy: { posicion: 'asc' }
        });

        if (!etapaAutorizado) {
            return { error: 'No se encontró la etapa de autorización en el sistema' };
        }

        console.log('📋 Etapa de autorización encontrada:', etapaAutorizado.nombre);

        // 3. Realizar las actualizaciones en una transacción
        const result = await prisma.$transaction(async (tx) => {
            // Actualizar status de la cotización de pendiente a aprobada
            await tx.cotizacion.update({
                where: { id: cotizacionId },
                data: {
                    status: COTIZACION_STATUS.APROBADA,
                    updatedAt: new Date()
                }
            });

            // Actualizar status del evento a aprobado
            await tx.evento.update({
                where: { id: evento.id },
                data: {
                    status: EVENTO_STATUS.APROBADO,
                    eventoEtapaId: etapaAutorizado.id,
                    updatedAt: new Date()
                }
            });

            // Contar y archivar todas las demás cotizaciones del mismo evento que no estén autorizadas
            const cotizacionesParaArchivar = await tx.cotizacion.count({
                where: {
                    eventoId: evento.id,
                    id: { not: cotizacionId }, // Excluir la cotización que se está autorizando
                    status: { not: COTIZACION_STATUS.APROBADA }, // Solo contar las no aprobadas
                    archivada: false // Solo las que no estén ya archivadas
                }
            });

            const archivadas = await tx.cotizacion.updateMany({
                where: {
                    eventoId: evento.id,
                    id: { not: cotizacionId }, // Excluir la cotización que se está autorizando
                    status: { not: COTIZACION_STATUS.APROBADA }, // Solo archivar las no aprobadas
                    archivada: false // Solo las que no estén ya archivadas
                },
                data: {
                    archivada: true,
                    updatedAt: new Date()
                }
            });

            console.log(`🗃️ ${archivadas.count} cotizaciones del evento archivadas automáticamente`);

            // Crear entrada en la agenda si no existe (como confirmada)
            const agendaExistente = await tx.agenda.findFirst({
                where: {
                    eventoId: evento.id,
                    fecha: evento.fecha_evento
                }
            });

            if (!agendaExistente) {
                await tx.agenda.create({
                    data: {
                        eventoId: evento.id,
                        fecha: evento.fecha_evento,
                        concepto: `${evento.EventoTipo?.nombre || 'Evento'} - ${evento.Cliente.nombre}`,
                        status: AGENDA_STATUS.CONFIRMADO,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                });
                console.log('📅 Evento agregado a la agenda como confirmado');
            } else {
                // Si ya existe, actualizar a confirmado
                await tx.agenda.update({
                    where: { id: agendaExistente.id },
                    data: {
                        status: AGENDA_STATUS.CONFIRMADO,
                        updatedAt: new Date()
                    }
                });
                console.log('📅 Evento existente en agenda actualizado a confirmado');
            }

            // Crear entrada en bitácora del evento
            const comentarioBitacora = `Cotización "${cotizacion.nombre}" aprobada. Evento movido a etapa: ${etapaAutorizado.nombre}` +
                (archivadas.count > 0 ? `. ${archivadas.count} cotización(es) adicional(es) archivadas automáticamente.` : '') +
                '. Evento agregado/confirmado en agenda.';

            await tx.eventoBitacora.create({
                data: {
                    eventoId: evento.id,
                    comentario: comentarioBitacora,
                    importancia: '2',
                    status: 'active',
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });

            return {
                cotizacionId,
                eventoId: evento.id,
                etapaId: etapaAutorizado.id,
                etapaNombre: etapaAutorizado.nombre,
                cotizacionesArchivadas: archivadas.count
            };
        });

        // 4. Revalidar caches
        revalidatePath('/admin/dashboard/eventos');
        revalidatePath('/admin/dashboard/seguimiento');
        revalidatePath(`/admin/dashboard/eventos/${evento.id}`);
        revalidatePath(`/admin/dashboard/eventos/${evento.id}/cotizacion`);

        // console.log('✅ Cotización aprobada exitosamente:', {
        //     cotizacion: cotizacionId,
        //     evento: evento.id,
        //     etapa: result.etapaNombre,
        //     archivadas: result.cotizacionesArchivadas
        // });

        const mensaje = `Cotización aprobada exitosamente. El evento fue movido a la etapa: ${result.etapaNombre}` +
            (result.cotizacionesArchivadas > 0 ? `. ${result.cotizacionesArchivadas} cotización(es) adicional(es) fueron archivadas automáticamente.` : '') +
            '. Evento confirmado en agenda.';

        return {
            success: true,
            message: mensaje,
            cotizacionesArchivadas: result.cotizacionesArchivadas
        };

    } catch (error: unknown) {
        console.error('❌ Error al aprobar cotización:', error);

        if (error instanceof Error) {
            return { error: `Error al aprobar cotización: ${error.message}` };
        }

        return { error: 'Error desconocido al aprobar cotización' };
    }
}

/**
 * Verificar estado de autorización - MIGRADA desde @/app/admin/_lib/autorizarCotizacion.actions
 * Función para verificar el estado actual de autorización de una cotización
 */
export async function verificarEstadoAutorizacion(cotizacionId: string) {
    try {
        const cotizacion = await prisma.cotizacion.findUnique({
            where: { id: cotizacionId },
            select: {
                status: true,
                Evento: {
                    select: {
                        eventoEtapaId: true,
                        EventoEtapa: {
                            select: {
                                nombre: true,
                                posicion: true
                            }
                        }
                    }
                }
            }
        });

        return {
            cotizacionStatus: cotizacion?.status,
            eventoEtapa: cotizacion?.Evento.EventoEtapa?.nombre,
            estaAutorizado: cotizacion?.status === COTIZACION_STATUS.AUTORIZADO
        };

    } catch (error) {
        console.error('Error verificando estado de autorización:', error);
        return { error: 'Error verificando estado' };
    }
}

/**
 * Autorizar cotización con condiciones comerciales
 * Nueva función que maneja la autorización con datos específicos del modal
 */
interface AutorizarCotizacionConDatosParams {
    cotizacionId: string;
    condicionComercialId: string;
    metodoPagoId: string;
    montoAPagar: number;
}

interface AutorizarCotizacionConDatosResult {
    success?: boolean;
    error?: string;
    message?: string;
    cotizacionesArchivadas?: number;
}

export async function autorizarCotizacionConDatos(params: AutorizarCotizacionConDatosParams): Promise<AutorizarCotizacionConDatosResult> {
    try {
        console.log('🔥 Iniciando autorización de cotización con datos:', params);

        const { cotizacionId, condicionComercialId, metodoPagoId, montoAPagar } = params;

        // 1. Obtener la cotización completa
        const cotizacion = await prisma.cotizacion.findUnique({
            where: { id: cotizacionId },
            include: {
                Evento: {
                    include: {
                        Cliente: true,
                        EventoTipo: true
                    }
                }
            }
        });

        if (!cotizacion) {
            return { error: 'Cotización no encontrada' };
        }

        if (cotizacion.status === COTIZACION_STATUS.APROBADA) {
            return { error: 'La cotización ya está aprobada' };
        }

        if (cotizacion.status === COTIZACION_STATUS.AUTORIZADO) {
            return { error: 'La cotización ya está autorizada' };
        }

        // 2. Verificar que existan las condiciones comerciales y método de pago
        const [condicionComercial, metodoPago] = await Promise.all([
            prisma.condicionesComerciales.findUnique({
                where: { id: condicionComercialId }
            }),
            prisma.metodoPago.findUnique({
                where: { id: metodoPagoId }
            })
        ]);

        if (!condicionComercial) {
            return { error: 'Condición comercial no encontrada' };
        }

        if (!metodoPago) {
            return { error: 'Método de pago no encontrado' };
        }

        const evento = cotizacion.Evento;

        // 3. Buscar la etapa "Autorizado" 
        const etapaAutorizado = await prisma.eventoEtapa.findFirst({
            where: {
                OR: [
                    { nombre: { contains: 'autorizado', mode: 'insensitive' } },
                    { nombre: { contains: 'aprobado', mode: 'insensitive' } },
                    { posicion: 2 }
                ]
            },
            orderBy: { posicion: 'asc' }
        });

        if (!etapaAutorizado) {
            return { error: 'No se encontró la etapa de autorización en el sistema' };
        }

        console.log('📋 Etapa de autorización encontrada:', etapaAutorizado.nombre);

        // 4. Realizar las actualizaciones en una transacción
        const result = await prisma.$transaction(async (tx) => {
            // Actualizar status de la cotización a autorizada
            await tx.cotizacion.update({
                where: { id: cotizacionId },
                data: {
                    status: COTIZACION_STATUS.AUTORIZADO,
                    condicionesComercialesId: condicionComercialId,
                    updatedAt: new Date()
                }
            });

            // Buscar la relación CondicionesComercialesMetodoPago
            const condicionMetodoPago = await tx.condicionesComercialesMetodoPago.findFirst({
                where: {
                    condicionesComercialesId: condicionComercialId,
                    metodoPagoId: metodoPagoId,
                    status: 'active'
                }
            });

            if (!condicionMetodoPago) {
                throw new Error('No se encontró la relación entre la condición comercial y el método de pago');
            }

            // Crear el pago inicial con los datos proporcionados
            await tx.pago.create({
                data: {
                    cotizacionId: cotizacionId,
                    condicionesComercialesId: condicionComercialId,
                    condicionesComercialesMetodoPagoId: condicionMetodoPago.id,
                    metodoPagoId: metodoPagoId,
                    metodo_pago: metodoPago.metodo_pago,
                    monto: montoAPagar,
                    concepto: `Anticipo - ${cotizacion.nombre}`,
                    status: PAGO_STATUS.PAID // Cambiar a PAID que es el status correcto para pagos completados
                }
            });

            // Archivar otras cotizaciones del mismo evento
            const archivadas = await tx.cotizacion.updateMany({
                where: {
                    eventoId: evento.id,
                    id: { not: cotizacionId },
                    status: { notIn: [COTIZACION_STATUS.ARCHIVADA] }
                },
                data: {
                    archivada: true,
                    status: COTIZACION_STATUS.ARCHIVADA,
                    updatedAt: new Date()
                }
            });

            // Actualizar evento: cambiar etapa y status
            await tx.evento.update({
                where: { id: evento.id },
                data: {
                    eventoEtapaId: etapaAutorizado.id,
                    status: EVENTO_STATUS.APROBADO,
                    updatedAt: new Date()
                }
            });

            // Agregar o actualizar evento en agenda
            const agendaExistente = await tx.agenda.findFirst({
                where: { eventoId: evento.id }
            });

            if (!agendaExistente) {
                await tx.agenda.create({
                    data: {
                        eventoId: evento.id,
                        fecha: evento.fecha_evento,
                        concepto: `${evento.EventoTipo?.nombre || 'Evento'} - ${evento.Cliente.nombre}`,
                        status: AGENDA_STATUS.CONFIRMADO,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                });
                console.log('📅 Evento agregado a la agenda como confirmado');
            } else {
                await tx.agenda.update({
                    where: { id: agendaExistente.id },
                    data: {
                        status: AGENDA_STATUS.CONFIRMADO,
                        updatedAt: new Date()
                    }
                });
                console.log('📅 Evento existente en agenda actualizado a confirmado');
            }

            // Crear entrada en bitácora del evento
            const comentarioBitacora = `Cotización "${cotizacion.nombre}" autorizada con condición "${condicionComercial.nombre}" y método de pago "${metodoPago.metodo_pago}". ` +
                `Pago inicial de $${montoAPagar.toLocaleString('es-MX')} programado. ` +
                `Evento movido a etapa: ${etapaAutorizado.nombre}` +
                (archivadas.count > 0 ? `. ${archivadas.count} cotización(es) adicional(es) archivadas automáticamente.` : '') +
                '. Evento confirmado en agenda.';

            await tx.eventoBitacora.create({
                data: {
                    eventoId: evento.id,
                    comentario: comentarioBitacora,
                    importancia: '2',
                    status: 'active',
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });

            return {
                cotizacionId,
                eventoId: evento.id,
                etapaId: etapaAutorizado.id,
                etapaNombre: etapaAutorizado.nombre,
                cotizacionesArchivadas: archivadas.count,
                pagoCreado: true,
                montoAPagar
            };
        });

        // 5. Revalidar caches
        revalidatePath('/admin/dashboard/eventos');
        revalidatePath('/admin/dashboard/seguimiento');
        revalidatePath(`/admin/dashboard/eventos/${evento.id}`);
        revalidatePath(`/admin/dashboard/eventos/${evento.id}/cotizacion`);

        const mensaje = `Cotización autorizada exitosamente con condición "${condicionComercial.nombre}". ` +
            `Pago inicial de $${montoAPagar.toLocaleString('es-MX')} programado con ${metodoPago.metodo_pago}. ` +
            `El evento fue movido a la etapa: ${result.etapaNombre}` +
            (result.cotizacionesArchivadas > 0 ? `. ${result.cotizacionesArchivadas} cotización(es) adicional(es) fueron archivadas automáticamente.` : '') +
            '. Evento confirmado en agenda.';

        return {
            success: true,
            message: mensaje,
            cotizacionesArchivadas: result.cotizacionesArchivadas
        };

    } catch (error: unknown) {
        console.error('❌ Error al autorizar cotización con datos:', error);

        if (error instanceof Error) {
            return { error: `Error al autorizar cotización: ${error.message}` };
        }

        return { error: 'Error desconocido al autorizar cotización' };
    }
}

/**
 * Cancela una cotización aprobada o autorizada y revierte el evento a pendiente
 * Incluye cancelación de pagos, eliminación de agenda si existe, y reseteo del descuento
 */
export async function cancelarCotizacion(cotizacionId: string) {
    try {
        // console.log('🔄 Iniciando cancelación de cotización:', cotizacionId);

        // Obtener datos completos de la cotización
        const cotizacion = await prisma.cotizacion.findUnique({
            where: { id: cotizacionId },
            include: {
                Evento: {
                    include: {
                        Cliente: true,
                        EventoTipo: true
                    }
                },
                Pago: {
                    where: {
                        status: {
                            in: ['paid', 'completado', 'pending']
                        }
                    }
                }
            }
        });

        if (!cotizacion) {
            return { success: false, message: 'Cotización no encontrada' };
        }

        // Verificar que la cotización esté aprobada o autorizada
        if (![COTIZACION_STATUS.APROBADA, COTIZACION_STATUS.AUTORIZADO].includes(cotizacion.status as any)) {
            return {
                success: false,
                message: 'Solo se pueden cancelar cotizaciones aprobadas o autorizadas'
            };
        }

        const eventoId = cotizacion.Evento.id;
        let pagosAfectados = 0;
        let agendaEliminada = false;

        // Usar transacción para garantizar consistencia
        await prisma.$transaction(async (tx) => {
            // 1. Actualizar status de la cotización a pendiente y resetear descuento
            await tx.cotizacion.update({
                where: { id: cotizacionId },
                data: {
                    status: COTIZACION_STATUS.PENDIENTE,
                    descuento: null, // 🔄 Resetear descuento al cancelar
                    updatedAt: new Date()
                }
            });

            // 2. Actualizar status del evento a pendiente
            await tx.evento.update({
                where: { id: eventoId },
                data: {
                    status: 'pendiente',
                    updatedAt: new Date()
                }
            });

            // 3. Cancelar pagos realizados
            if (cotizacion.Pago.length > 0) {
                await tx.pago.updateMany({
                    where: {
                        cotizacionId: cotizacionId,
                        status: {
                            in: ['paid', 'completado', 'pending']
                        }
                    },
                    data: {
                        status: 'cancelado',
                        updatedAt: new Date()
                    }
                });
                pagosAfectados = cotizacion.Pago.length;
            }

            // 4. Eliminar de agenda si existe
            const agendaExistente = await tx.agenda.findFirst({
                where: { eventoId: eventoId }
            });

            if (agendaExistente) {
                await tx.agenda.delete({
                    where: { id: agendaExistente.id }
                });
                agendaEliminada = true;
            }
        });

        // Revalidar paths
        revalidatePath(`/admin/dashboard/eventos/${eventoId}`);
        revalidatePath(`/admin/dashboard/eventos/${eventoId}/cotizacion`);
        revalidatePath(`/admin/dashboard/seguimiento/${eventoId}`);
        revalidatePath('/admin/dashboard/agenda');

        console.log('✅ Cotización cancelada exitosamente:', {
            cotizacionId,
            eventoId,
            pagosAfectados,
            agendaEliminada,
            descuentoReseteado: true // 🔄 Indicar que el descuento fue reseteado
        });

        return {
            success: true,
            message: 'Cotización cancelada exitosamente',
            detalles: {
                cotizacionId,
                eventoId,
                pagosAfectados,
                agendaEliminada
            }
        };

    } catch (error) {
        console.error('❌ Error cancelando cotización:', error);
        return {
            success: false,
            message: 'Error interno al cancelar cotización',
            error: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
}

/**
 * Actualizar cotización completa con servicios
 * Migrada desde cotizacion.actions.ts eliminado
 */
export async function actualizarCotizacion(data: any) {
    try {
        //// console.log('Updating cotizacion with id:', data.id);
        await prisma.cotizacion.update({
            where: {
                id: data.id
            },
            data: {
                eventoTipoId: data.eventoTipoId,
                eventoId: data.eventoId,
                nombre: data.nombre,
                precio: data.precio,
                dias_minimos_contratacion: data.dias_minimos_contratacion,
                condicionesComercialesId: data.condicionesComercialesId || null,
                condicionesComercialesMetodoPagoId: data.condicionesComercialesMetodoPagoId || null,
                status: data.status,
            }
        });
        //// console.log('Cotizacion updated successfully');

        if (data.servicios) {
            //// console.log('Deleting existing cotizacionServicios for cotizacionId:', data.id);
            await prisma.cotizacionServicio.deleteMany({
                where: {
                    cotizacionId: data.id
                }
            });

            //// console.log('Creating new cotizacionServicios');
            for (const servicio of data.servicios) {
                try {
                    await prisma.cotizacionServicio.create({
                        data: {
                            cotizacionId: data.id ?? '',
                            servicioId: servicio.id ?? '',
                            cantidad: servicio.cantidad,
                            posicion: servicio.posicion,
                            servicioCategoriaId: servicio.servicioCategoriaId ?? '',
                            userId: servicio.userId || undefined
                        }
                    });
                    //// console.log('Created cotizacionServicio for servicioId:', servicio.id);
                } catch (error: unknown) {
                    if (error instanceof Error) {
                        console.error('Error creating cotizacionServicio for servicioId:', servicio.id, error.message);
                    } else {
                        console.error('Unknown error creating cotizacionServicio for servicioId:', servicio.id);
                    }
                }
            }
        }

        return { success: true };
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error updating cotizacion:', error.message);
            return { error: 'Error updating cotizacion ' + error.message };
        }
        console.error('Unknown error updating cotizacion');
        return { error: 'Error updating cotizacion' };
    }
}

