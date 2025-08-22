'use server'
import { Cotizacion } from './types'
import { COTIZACION_STATUS } from './constants/status';
import prisma from './prismaClient';

// FUNCIÓN MIGRADA A: @/app/admin/_lib/actions/cotizacion/cotizacion.actions.ts
// export async function obtenerCotizacionesPorEvento(eventoId: string) {
//     const cotizaciones = await prisma.cotizacion.findMany({
//         where: {
//             eventoId,
//         },
//         orderBy: {
//             createdAt: 'asc'
//         }
//     });
// 
//     const cotizacionesWithVisitaCount = await Promise.all(cotizaciones.map(async (cotizacion) => {
//         const visitas = await prisma.cotizacionVisita.count({
//             where: {
//                 cotizacionId: cotizacion.id
//             }
//         });
//         return {
//             ...cotizacion,
//             visitas
//         };
//     }));
// 
//     return cotizacionesWithVisitaCount;
// }

export async function obtenerCotizacion(cotizacionId: string) {
    const cotizacion = await prisma.cotizacion.findUnique({
        where: {
            id: cotizacionId
        }
    });

    const evento = cotizacion?.eventoId
        ? await prisma.evento.findUnique({
            where: {
                id: cotizacion.eventoId
            },
            select: {
                status: true
            }
        })
        : null;

    const eventoTipo = cotizacion?.eventoTipoId
        ? await prisma.eventoTipo.findUnique({
            where: {
                id: cotizacion.eventoTipoId
            },
            select: {
                nombre: true
            }
        })
        : null;

    if (!cotizacion) {
        return null;
    }

    const visitas = await prisma.cotizacionVisita.count({
        where: {
            cotizacionId: cotizacion.id
        }
    });

    return {
        ...cotizacion,
        eventoTipo,
        eventoStatus: evento?.status,
        visitas
    };
}

export async function crearCotizacion(data: Cotizacion) {

    try {
        const response = await prisma.cotizacion.create({
            data: {
                eventoTipoId: data.eventoTipoId,
                eventoId: data.eventoId,
                nombre: data.nombre,
                precio: data.precio,
                condicionesComercialesId: data.condicionesComercialesId,
                condicionesComercialesMetodoPagoId: data.condicionesComercialesMetodoPagoId,
                status: COTIZACION_STATUS.PENDIENTE,
            }
        })

        if (response.id) {
            if (data.servicios) {
                for (const servicio of data.servicios) {
                    await prisma.cotizacionServicio.create({
                        data: {
                            cotizacionId: response.id!,
                            servicioId: servicio.id ?? '',
                            cantidad: servicio.cantidad,
                            posicion: servicio.posicion,
                            servicioCategoriaId: servicio.servicioCategoriaId ?? '',
                        }
                    })
                }
            }
        }

        return { success: true, cotizacionId: response.id };
    } catch {
        return { error: 'Error creating cotizacion' }
    }
}

export async function crearCotizacionAutorizada(data: Cotizacion) {

    try {
        const response = await prisma.cotizacion.create({
            data: {
                eventoTipoId: data.eventoTipoId,
                eventoId: data.eventoId,
                nombre: data.nombre,
                precio: data.precio,
                condicionesComercialesId: data.condicionesComercialesId,
                condicionesComercialesMetodoPagoId: data.condicionesComercialesMetodoPagoId,
                status: COTIZACION_STATUS.APROBADA,
            }
        })

        if (response.id) {
            if (data.servicios) {
                for (const servicio of data.servicios) {
                    await prisma.cotizacionServicio.create({
                        data: {
                            cotizacionId: response.id!,
                            servicioId: servicio.id ?? '',
                            cantidad: servicio.cantidad,
                            posicion: servicio.posicion,
                            servicioCategoriaId: servicio.servicioCategoriaId ?? '',
                        }
                    })
                }
            }
        }

        return { success: true, cotizacionId: response.id };
    } catch {
        return { error: 'Error creating cotizacion' }
    }
}

//! Actualizar cotización
export async function actualizarCotizacion(data: Cotizacion) {

    try {
        // console.log('Updating cotizacion with id:', data.id);
        await prisma.cotizacion.update({
            where: {
                id: data.id
            },
            data: {
                eventoTipoId: data.eventoTipoId,
                eventoId: data.eventoId,
                nombre: data.nombre,
                precio: data.precio,
                condicionesComercialesId: data.condicionesComercialesId || null,
                condicionesComercialesMetodoPagoId: data.condicionesComercialesMetodoPagoId || null,
                status: data.status,
            }
        });
        // console.log('Cotizacion updated successfully');

        if (data.servicios) {
            // console.log('Deleting existing cotizacionServicios for cotizacionId:', data.id);
            await prisma.cotizacionServicio.deleteMany({
                where: {
                    cotizacionId: data.id
                }
            });

            // console.log('Creating new cotizacionServicios');
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
                    // console.log('Created cotizacionServicio for servicioId:', servicio.id);
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

export async function actualizarCotizacionStatus(cotizacionId: string, status: string) {
    try {
        await prisma.cotizacion.update({
            where: {
                id: cotizacionId
            },
            data: {
                status
            }
        });
        return { success: true };
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error updating cotizacion status:', error.message);
            return { error: 'Error updating cotizacion status ' + error.message };
        }
        console.error('Unknown error updating cotizacion status');
        return { error: 'Error updating cotizacion status' };
    }
}

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
        console.error('❌ Error archivando cotización:', error);
        return { error: 'Error al archivar la cotización' };
    }
}

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
        console.error('❌ Error desarchivando cotización:', error);
        return { error: 'Error al desarchivar la cotización' };
    }
}

export async function eliminarCotizacion(cotizacionId: string) {
    try {
        // 1. Verificar que la cotización existe y obtener todas las dependencias
        const cotizacion = await prisma.cotizacion.findUnique({
            where: { id: cotizacionId },
            include: {
                Servicio: {
                    include: {
                        NominaServicio: {
                            include: {
                                Nomina: {
                                    select: {
                                        id: true,
                                        concepto: true,
                                        status: true,
                                        User: { select: { username: true } }
                                    }
                                }
                            }
                        }
                    }
                },
                CotizacionVisita: true,
                Pago: true,
                Costos: true,
                Evento: {
                    include: {
                        Agenda: {
                            select: {
                                id: true,
                                concepto: true,
                                status: true,
                                User: { select: { username: true } }
                            }
                        }
                    }
                }
            }
        });

        if (!cotizacion) {
            return { error: 'Cotización no encontrada' };
        }

        // 2. Verificar dependencias críticas
        const serviciosCount = cotizacion.Servicio.length;
        const visitasCount = cotizacion.CotizacionVisita.length;
        const pagosCount = cotizacion.Pago.length;
        const costosCount = cotizacion.Costos.length;
        const agendasCount = cotizacion.Evento.Agenda.length;

        // Contar nóminas asociadas
        let nominasCount = 0;
        const nominasActivas: Array<{
            id: string;
            concepto: string;
            status: string;
            responsable: string | null | undefined;
        }> = [];
        cotizacion.Servicio.forEach(servicio => {
            servicio.NominaServicio.forEach(nominaServ => {
                nominasCount++;
                if (nominaServ.Nomina.status !== 'cancelado') {
                    nominasActivas.push({
                        id: nominaServ.Nomina.id,
                        concepto: nominaServ.Nomina.concepto,
                        status: nominaServ.Nomina.status,
                        responsable: nominaServ.Nomina.User?.username
                    });
                }
            });
        });

        console.log(`🔍 Analizando dependencias para cotización ${cotizacionId}:`);
        console.log(`- Cotización: "${cotizacion.nombre}" ($${cotizacion.precio.toLocaleString('es-MX')}) - Status: ${cotizacion.status}`);
        console.log(`- ${serviciosCount} servicios`);
        console.log(`- ${visitasCount} visitas`);
        console.log(`- ${pagosCount} pagos`);
        console.log(`- ${costosCount} costos adicionales`);
        console.log(`- ${agendasCount} agendas en el evento`);
        console.log(`- ${nominasCount} nóminas asociadas (${nominasActivas.length} activas)`);

        // 3. Verificar si hay dependencias críticas que bloqueen eliminación

        // BLOQUEO: Cotización aprobada con nóminas activas
        if (cotizacion.status === COTIZACION_STATUS.APROBADA && nominasActivas.length > 0) {
            console.log('❌ Eliminación bloqueada: Cotización aprobada con nóminas activas');
            nominasActivas.forEach((nomina, index) => {
                console.log(`   ${index + 1}. ${nomina.concepto} (${nomina.status}) - ${nomina.responsable}`);
            });

            return {
                error: `No se puede eliminar una cotización aprobada con ${nominasActivas.length} nómina(s) activa(s). Considera archivarla en su lugar.`,
                dependencias: {
                    nominasActivas: nominasActivas.length,
                    status: cotizacion.status,
                    sugerencia: 'archivar'
                }
            };
        }

        // 4. Mostrar advertencias informativas (no bloquean eliminación)
        if (nominasActivas.length > 0) {
            console.log(`💼 Info: ${nominasActivas.length} nómina(s) activa(s) serán preservadas como registros independientes:`);
            nominasActivas.forEach((nomina, index) => {
                console.log(`   ${index + 1}. ${nomina.concepto} (${nomina.status}) - ${nomina.responsable}`);
            });
        }

        if (agendasCount > 0) {
            console.log(`⚠️  Advertencia: ${agendasCount} agenda(s) en el evento (no se eliminarán)`);
        }

        if (pagosCount > 0) {
            console.log(`💰 Info: ${pagosCount} pago(s) serán desvinculados (se preservan como registros)`);
        }

        // 5. Proceder con la eliminación
        console.log('✅ Verificaciones pasadas. Procediendo con eliminación...');

        // Actualizar pagos para desvincularlos (SetNull ya está configurado en esquema)
        if (pagosCount > 0) {
            console.log('🔄 Desvinculando pagos...');
            await prisma.pago.updateMany({
                where: { cotizacionId },
                data: { cotizacionId: null }
            });
        }

        // Eliminar la cotización (esto eliminará automáticamente por cascada):
        // - CotizacionServicio (las nóminas asociadas se preservan como registros huérfanos)
        // - CotizacionVisita  
        // - CotizacionCosto
        console.log('🗑️  Eliminando cotización principal...');
        await prisma.cotizacion.delete({
            where: { id: cotizacionId }
        });

        console.log('✅ Cotización eliminada exitosamente');
        return {
            success: true,
            eliminados: {
                servicios: serviciosCount,
                visitas: visitasCount,
                costos: costosCount
            },
            preservados: {
                nominas: nominasCount, // Se preservan como registros independientes
                pagos: pagosCount, // Desvinculados pero preservados
                agendas: agendasCount // Permanecen en el evento
            }
        };

    } catch (error) {
        console.error('❌ Error eliminando cotización:', error);
        return { error: 'Error al eliminar la cotización. Verifique las dependencias en la consola.' };
    }
}

export async function obtenerCotizacionServicios(cotizacionId: string) {
    return await prisma.cotizacionServicio.findMany({
        where: {
            cotizacionId
        },
        orderBy: {
            posicion: 'asc'
        }
    })
}

export async function obtenerCotizacionServicio(cotizacionServicioId: string) {
    return await prisma.cotizacionServicio.findUnique({
        where: {
            id: cotizacionServicioId
        }
    })
}

export async function asignarResponsableCotizacionServicio(userid: string, cotizacionServicioId: string, userId: string) {
    try {
        await prisma.cotizacionServicio.update({
            where: {
                id: cotizacionServicioId
            },
            data: {
                userId
            }
        })
        return { success: true }
    } catch {
        return { error: 'Error assigning responsable' }
    }
}

export async function cotizacionDetalle(id: string) {

    const cotizacion = await prisma.cotizacion.findUnique({
        where: { id },
        select: {
            eventoId: true,
            eventoTipoId: true,
            nombre: true,
            precio: true,
            condicionesComercialesId: true,
            condicionesComercialesMetodoPagoId: true,
            status: true,
            archivada: true,
            expiresAt: true,
        }
    });

    const evento = await prisma.evento.findUnique({
        where: { id: cotizacion?.eventoId },
        select: {
            id: true,
            clienteId: true,
            eventoTipoId: true,
            nombre: true,
            fecha_evento: true
        }
    });

    if (!evento) {
        return { error: 'Event not found' };
    }

    const eventoTipo = evento.eventoTipoId ? await prisma.eventoTipo.findUnique({
        where: { id: evento.eventoTipoId },
        select: { nombre: true }
    }) : null;

    const cliente = await prisma.cliente.findUnique({
        where: { id: evento.clienteId },
        select: { id: true, nombre: true, email: true, telefono: true }
    });

    const cotizacionServicio = await prisma.cotizacionServicio.findMany({
        where: { cotizacionId: id },
        select: {
            id: true,
            servicioId: true,
            cantidad: true,
            posicion: true,
            servicioCategoriaId: true,
        }
    });

    const ServicioCategoria = await prisma.servicioCategoria.findMany({
        orderBy: {
            posicion: 'asc'
        }
    });

    const servicios = await prisma.servicio.findMany({
        select: {
            id: true,
            nombre: true,
            precio_publico: true,
            servicioCategoriaId: true
        }
    });

    const configuracion = await prisma.configuracion.findFirst({
        where: {
            status: 'active'
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });

    const condicionesComerciales = await prisma.condicionesComerciales.findMany({
        where: {
            status: 'active'
        },
        orderBy: {
            orden: 'asc'
        }
    })

    return {
        cotizacion,
        evento,
        eventoTipo,
        cliente,
        servicios,
        ServicioCategoria,
        cotizacionServicio,
        configuracion,
        condicionesComerciales

    };
}

export async function clonarCotizacion(cotizacionId: string) {
    const cotizacion = await prisma.cotizacion.findUnique({
        where: { id: cotizacionId }
    });

    if (!cotizacion) {
        return { error: 'Cotizacion not found' };
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
            precio: cotizacion.precio,
            status: COTIZACION_STATUS.PENDIENTE,
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
            }
        });
    }

    return {
        success: true, cotizacionId: newCotizacion.id
    };
}

export async function actualizarVisibilidadCotizacion(cotizacionId: string, visible: boolean) {
    try {
        await prisma.cotizacion.update({
            where: {
                id: cotizacionId
            },
            data: {
                visible_cliente: visible
            }
        });
        return { success: true }
    } catch {
        return { error: 'Error updating visibility' }
    }
}

// export async function detallesListadoCotizacion(cotizacionId:string) {
// }