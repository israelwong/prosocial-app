'use server';
import { Evento } from "./types";
import { obtenerTipoEvento } from '@/app/admin/_lib/eventoTipo.actions'
import { obtenerBalancePagosEvento } from '@/app/admin/_lib/pago.actions'
import { obtenerCliente } from '@/app/admin/_lib/cliente.actions'
import { obtenerCotizacionServicios } from '@/app/admin/_lib/cotizacion.actions'

import prisma from './prismaClient';

export async function obtenerEventos() {
    return prisma.evento.findMany({
        orderBy: {
            fecha_evento: 'desc'
        }
    });
}

export async function obtenerEventoPorId(id: string) {
    return prisma.evento.findUnique({
        where: { id },
        include: {
            EventoTipo: {
                select: {
                    nombre: true,
                }
            },
            Cliente: {
                select: {
                    nombre: true,
                    telefono: true
                }
            },
            EventoEtapa: {
                select: {
                    nombre: true
                }
            }
        }
    });
}

export async function obtenerEventosPorCliente(clienteId: string) {
    return await prisma.evento.findMany({
        where: {
            clienteId
        },
        orderBy: {
            fecha_evento: 'desc'
        }
    });
}

export async function validarDisponibilidadFecha(fecha_evento: Date) {

    const fechaSinHora = new Date(fecha_evento).toISOString().split('T')[0];


    const eventos = await prisma.evento.findMany({
        where: {
            fecha_evento: {
                gte: new Date(fechaSinHora),
                lt: new Date(new Date(fechaSinHora).getTime() + 24 * 60 * 60 * 1000) // Menor que el día siguiente
            },
            status: 'aprobado'
        }
    });
    return eventos.length > 0;
}

export async function crearEvento(data: Evento) {
    try {
        const nuevoEvento = await prisma.evento.create({
            data: {
                clienteId: data.clienteId ?? '',
                eventoTipoId: data.eventoTipoId,
                nombre: data.nombre,
                fecha_evento: data.fecha_evento,
                status: 'active',
                userId: data.userId || null,
                eventoEtapaId: data.eventoEtapaId || null
            }
        });

        return { success: true, id: nuevoEvento.id };
    } catch (error) {
        console.error(error);
        return { error: 'Error creating event' };
    }
}

export async function actualizarEvento(evento: Evento) {

    try {
        await prisma.evento.update({
            where: {
                id: evento.id
            },
            data: {
                nombre: evento.nombre,
                fecha_evento: evento.fecha_evento,
                // status: evento.status
            }
        });
        return { success: true };
    } catch {
        return { error: 'Error updating event' };
    }
}

export async function eliminarEvento(id: string) {
    try {
        console.log('Buscando evento con id:', id);
        const evento = await prisma.evento.findUnique({
            where: { id }
        });

        if (!evento) {
            console.log('Evento no encontrado');
            return { success: false, message: 'Evento no encontrado' };
        }

        const cotizaciones = await prisma.cotizacion.findMany({
            where: { eventoId: evento.id }
        });

        for (const cotizacion of cotizaciones) {
            console.log('Eliminando pagos asociados a la cotización:', cotizacion.id);
            await prisma.pago.deleteMany({
                where: { cotizacionId: cotizacion.id }
            });

            console.log('Eliminando cotización:', cotizacion.id);
            await prisma.cotizacion.delete({
                where: { id: cotizacion.id }
            });
        }
        console.log('Eliminando agendas asociadas al evento:', evento.id);

        await prisma.agenda.deleteMany({
            where: { eventoId: evento.id }
        });

        console.log('Eliminando bitácoras asociadas al evento:', evento.id);
        await prisma.eventoBitacora.deleteMany({
            where: { eventoId: evento.id }
        });

        console.log('Eliminando evento con id:', id);
        await prisma.evento.delete({
            where: { id }
        });

        console.log('Evento eliminado exitosamente');
        return { success: true };
    } catch {
        return { success: false, message: 'No se puede eliminar el evento, tiene cotizaciones asociadas' };
    }
}

export async function obtenerEventosDetalle() {
    const eventos = await prisma.evento.findMany({
        include: {
            EventoTipo: {
                select: {
                    nombre: true
                }
            },
            Cliente: {
                select: {
                    nombre: true
                }
            }
        },
        orderBy: {
            fecha_evento: 'asc'
        }
    });

    const eventosDetalle = await Promise.all(eventos.map(async evento => {
        let user = null;
        if (evento.userId) {
            user = await prisma.user.findUnique({
                where: {
                    id: evento.userId
                }
            });
        }

        return {
            id: evento.id,
            evento: evento.nombre,
            cliente: evento.Cliente.nombre,
            tipoEvento: evento.EventoTipo?.nombre,
            user: user?.username,
            fecha_evento: evento.fecha_evento,
            creacion: evento.createdAt,
            fecha_actualizacion: evento.updatedAt,
            status: evento.status,
            eventoEtapaId: evento.eventoEtapaId
        };
    }));

    return eventosDetalle;
}

export async function asignarEventoUser(eventoId: string, userId: string, eventoEtapaId: string) {
    await prisma.evento.update({
        where: {
            id: eventoId
        },
        data: {
            userId,
            eventoEtapaId
        }
    });
}

export async function liberarEventoUser(eventoId: string) {
    try {
        await prisma.evento.update({
            where: {
                id: eventoId
            },
            data: {
                userId: null
            }
        });
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: 'Error releasing event user' };
    }
}

export async function actualizarEventoStatus(eventoId: string, status: string) {
    await prisma.evento.update({
        where: {
            id: eventoId
        },
        data: {
            status: status
        }
    });
}

export async function obtenerEventosAprobados() {
    return prisma.evento.findMany({
        where: {
            status: 'aprobado'
        },
        orderBy: {
            fecha_evento: 'asc'
        }
    });
}

export async function obtenerEventoSeguimiento(eventoId: string) {

    const evento = await prisma.evento.findUnique({
        where: {
            id: eventoId
        },
        include: {
            EventoTipo: {
                select: {
                    nombre: true
                }
            }
        }
    });

    if (!evento) {
        return { error: 'Evento no encontrado' };
    }

    const cliente = await prisma.cliente.findUnique({
        where: {
            id: evento.clienteId
        }
    });

    const cotizacion = await prisma.cotizacion.findFirst({
        where: {
            eventoId,
            status: 'aprobada'
        }
    });

    const cotizacionServicio = await obtenerCotizacionServicios(cotizacion?.id ?? '');

    const pago = await prisma.pago.findMany({
        where: {
            cotizacionId: cotizacion?.id
        }
    });

    const categorias = await prisma.servicioCategoria.findMany();

    const usuarios = await prisma.user.findMany();

    return {
        evento,
        tipoEvento: evento.EventoTipo?.nombre,
        cliente,
        cotizacion,
        cotizacionServicio,
        categorias,//
        usuarios,//
        pago,
    };

}

export async function obtenerEventoContrato(eventoId: string) {

    const evento = await prisma.evento.findUnique({
        where: {
            id: eventoId
        },
        include: {
            EventoTipo: {
                select: {
                    nombre: true
                }
            }
        }
    });

    const cotizacion = await prisma.cotizacion.findFirst({
        where: {
            eventoId,
            status: 'aprobada'
        }
    });


    const condicionesComerciales = await prisma.condicionesComerciales.findUnique({
        where: {
            id: cotizacion?.condicionesComercialesId ?? undefined
        },
        select: {
            nombre: true,
            descripcion: true,
            descuento: true,
        }
    });

    const cliente = await prisma.cliente.findUnique({
        where: {
            id: typeof evento?.clienteId === 'string' ? evento.clienteId : undefined
        }
    });

    return {
        evento,
        tipoEvento: evento?.EventoTipo?.nombre,
        cliente,
        cotizacion,
        condicionesComerciales
    };
}

export async function obtenerEventoCotizaciones(eventoId: string) {

    const evento = await prisma.evento.findUnique({
        where: {
            id: eventoId
        },
        include: {
            EventoTipo: {
                select: {
                    nombre: true
                }
            }
        }
    });

    if (!evento) {
        return { error: 'Evento no encontrado' };
    }

    const cliente = await prisma.cliente.findUnique({
        where: {
            id: evento.clienteId
        }
    });

    const cotizaciones = await prisma.cotizacion.findMany({
        where: {
            eventoId
        },
        orderBy: {
            createdAt: 'asc'
        }
    });

    return {
        evento,
        tipoEvento: evento.EventoTipo?.nombre,
        cliente,
        cotizaciones
    };
}

export async function obtenerEventosAprobadosV2() {

    const eventos = await prisma.evento.findMany({
        orderBy: {
            fecha_evento: 'asc'
        }
    });

    const eventosConTipoYBalance = await Promise.all(eventos.map(async (evento) => {
        const [eventoTipo, balancePagos, cliente] = await Promise.all([
            evento.eventoTipoId ? obtenerTipoEvento(evento.eventoTipoId) : { nombre: 'Tipo desconocido' },
            obtenerBalancePagosEvento(evento.id),
            obtenerCliente(evento.clienteId)
        ]);
        return {
            ...evento,
            clienteNombre: cliente ? cliente.nombre : 'Cliente desconocido',
            tipoEvento: eventoTipo?.nombre ?? 'Tipo desconocido',
            precio: balancePagos.precio,
            totalPagado: balancePagos.totalPagado,
            balance: balancePagos.balance ?? 0
        };
    }));
    return eventosConTipoYBalance;
};

export async function actualizarEtapa(eventoId: string, eventoEtapaId: string) {
    try {
        await prisma.evento.update({
            where: {
                id: eventoId
            },
            data: {
                eventoEtapaId
            }
        });
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: 'Error updating event stage' };
    }
}

export async function actualizarEventoEtapaStatus(eventoId: string, etapaId: string, status: string) {
    await prisma.evento.update({
        where: {
            id: eventoId
        },
        data: {
            eventoEtapaId: etapaId,
            status
        }
    });
}

//la usamos en el componente de cotizaciones
export async function obtenerEventoDetalleCompartirInformacion(eventoId: string) {
    const evento = await prisma.evento.findUnique({
        where: {
            id: eventoId
        },
        include: {
            EventoTipo: {
                select: {
                    nombre: true
                }
            },
            Cliente: {
                select: {
                    nombre: true,
                    telefono: true,
                    email: true
                }
            }
        }
    });
    return { evento };
}

export async function obtenerEventosPorEtapa(etapas: number[]) {

    const eventos = await prisma.evento.findMany({
        where: {
            EventoEtapa: {
                posicion: {
                    in: etapas
                }
            },
            // status: 'active'
        },
        include: {
            EventoTipo: {
                select: {
                    nombre: true
                }
            },
            Cliente: {
                select: {
                    nombre: true
                }
            },
            EventoEtapa: {
                select: {
                    nombre: true,
                    posicion: true
                }
            },
            Cotizacion: {
                where: {
                    status: 'aprobada',
                },
                select: {
                    id: true,
                    precio: true,
                    status: true,
                    Pago: {
                        select: {
                            id: true,
                            monto: true,
                            createdAt: true
                        }
                    }
                }
            },
            User: {
                select: {
                    username: true
                }
            }
        },
        orderBy: {
            fecha_evento: 'asc'
        }
    });

    const eventosConTotalPagado = eventos.map(evento => {
        const totalPagado = evento.Cotizacion.reduce((acc, cotizacion) => {
            const totalPagos = cotizacion.Pago.reduce((sum, pago) => sum + pago.monto, 0);
            return acc + totalPagos;
        }, 0);

        return {
            ...evento,
            total_pagado: totalPagado
        };
    });

    return eventosConTotalPagado;
}

export async function obtenerStatusEvento(eventoId: string) {
    const evento = await prisma.evento.findUnique({
        where: {
            id: eventoId
        },
        select: {
            status: true
        }
    });
    return evento?.status;
}