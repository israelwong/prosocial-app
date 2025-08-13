'use server';

import prisma from '@/app/admin/_lib/prismaClient';
import { obtenerEventoCompleto } from '@/app/admin/_lib/actions/evento/evento/evento.actions';
import { obtenerTiposEvento } from '@/app/admin/_lib/actions/eventoTipo/eventoTipo.actions';
import { obtenerCatalogoCompleto } from '@/app/admin/_lib/actions/catalogo/catalogo.actions';
import { getGlobalConfiguracion } from '@/app/admin/_lib/actions/configuracion/configuracion.actions';
import { obtenerMetodosPago } from '@/app/admin/_lib/actions/metodoPago/metodoPago.actions';
import { obtenerPaquete } from '@/app/admin/_lib/actions/paquetes/paquetes.actions';

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
 */
export async function crearCotizacionNueva(data: {
    eventoId: string;
    eventoTipoId: string;
    nombre: string;
    precio: number;
    servicios: Array<{
        servicioId: string;
        servicioCategoriaId: string;
        cantidad: number;
        precioUnitario: number;
        costo: number;
        nombre: string;
        posicion: number;
    }>;
    condicionesComercialesId?: string;
}) {
    try {
        const nuevaCotizacion = await prisma.cotizacion.create({
            data: {
                eventoId: data.eventoId,
                eventoTipoId: data.eventoTipoId,
                nombre: data.nombre,
                precio: data.precio,
                condicionesComercialesId: data.condicionesComercialesId,
                status: 'pending',
                visible_cliente: true,
                Servicio: {
                    create: data.servicios.map(servicio => ({
                        servicioId: servicio.servicioId,
                        servicioCategoriaId: servicio.servicioCategoriaId,
                        cantidad: servicio.cantidad,
                        precioUnitario: servicio.precioUnitario,
                        subtotal: servicio.precioUnitario * servicio.cantidad,
                        costo: servicio.costo,
                        nombre: servicio.nombre,
                        posicion: servicio.posicion,
                        status: 'pendiente'
                    }))
                }
            },
            include: {
                Servicio: true
            }
        });

        return nuevaCotizacion;

    } catch (error: any) {
        console.error('Error al crear cotización:', error);
        throw new Error(`Error al crear cotización: ${error?.message || 'Error desconocido'}`);
    }
}
