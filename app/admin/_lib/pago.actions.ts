'use server';
import { Pago } from "@/app/admin/_lib/types";
import prisma from './prismaClient';
import { Agenda } from './types';
import { crearAgendaEvento } from "./agenda.actions";
// import { enviarCorreoBienvenida, enviarCorreoPagoExitoso } from "./correo.actions";

export async function obtenerPagos() {
    const pagos = await prisma.pago.findMany();
    return pagos;
}

export async function obtenerPago(id: string) {
    const pago = await prisma.pago.findUnique({
        where: {
            id: id
        }
    });
    return pago;
}

export async function obtenerPagoCompleto(pagoId: string) {
    const pago = await prisma.pago.findUnique({
        where: {
            id: pagoId
        },
        include: {
            Cotizacion: {
                include: {
                    Evento: {
                        include: {
                            Cliente: true,
                            EventoTipo: true
                        }
                    }
                }
            }
        }
    });
    return pago;
}

export async function obtenerPagosCotizacion(cotizacionId: string) {
    const pagos = await prisma.pago.findMany({
        where: {
            cotizacionId: cotizacionId
        },
        orderBy: {
            createdAt: 'asc'
        }
    });
    return pagos;
}

export async function crearPago(data: Pago) {

    try {
        const pago = await prisma.pago.create({
            data: {
                cotizacionId: data.cotizacionId,
                clienteId: data.clienteId,
                condicionesComercialesId: data.condicionesComercialesId ?? null,
                condicionesComercialesMetodoPagoId: data.condicionesComercialesMetodoPagoId ?? null,
                metodoPagoId: data.metodoPagoId ?? undefined,
                metodo_pago: data.metodo_pago,
                monto: data.monto ?? 0,
                concepto: data.concepto,
                descripcion: data.descripcion ?? undefined,
                stripe_payment_id: data.stripe_payment_id ?? undefined,
                status: data.status ?? 'pending',
            }
        });
        return { id: pago.id, success: true, pago };
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error(error);
        }
        return { success: false, error: (error as Error).message };
    }
}

export async function eliminarPago(id: string) {
    try {
        await prisma.pago.delete({
            where: {
                id: id
            }
        });
        return { success: true };
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error(error);
        }
        return { success: false, error: (error as Error).message };
    }
}

export async function actualizarPago(data: Pago) {
    try {
        const pago = await prisma.pago.update({
            where: {
                id: data.id
            },
            data: {
                metodoPagoId: data.metodoPagoId ?? undefined,
                condicionesComercialesMetodoPagoId: data.condicionesComercialesMetodoPagoId ?? null,
                metodo_pago: data.metodo_pago,
                monto: data.monto ?? 0,
                concepto: data.concepto,
                stripe_payment_id: data.stripe_payment_id ?? undefined,
                status: data.status ?? 'pending',
            }
        });
        return { success: true, pago };
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error(error);
        }
        return { success: false, error: (error as Error).message };
    }
}

export async function obtenerPagoSesionStripe(stripe_session_id: string) {
    const pago = await prisma.pago.findUnique({
        where: {
            stripe_session_id
        }
    });

    // Solo buscar cliente si clienteId existe
    const cliente = pago?.clienteId ? await prisma.cliente.findUnique({
        where: {
            id: pago.clienteId
        }
    }) : null;

    return { pago, cliente };
}

export async function obtenerDetallesPago(pagoId: string) {
    const pago = await prisma.pago.findUnique({
        where: {
            id: pagoId
        }
    });

    if (!pago) {
        throw new Error(`Pago con ID ${pagoId} no encontrado`);
    }

    const pagosCotizacion = pago.cotizacionId ? await prisma.pago.findMany({
        where: {
            cotizacionId: pago.cotizacionId,
            status: 'paid'
        }
    }) : [];

    // Solo buscar cliente si clienteId existe
    const cliente = pago.clienteId ? await prisma.cliente.findUnique({
        where: {
            id: pago.clienteId
        }
    }) : null;

    // Solo buscar cotización si cotizacionId no es null
    const cotizacion = pago.cotizacionId ? await prisma.cotizacion.findUnique({
        where: {
            id: pago.cotizacionId
        }
    }) : null;

    // Solo buscar evento si hay cotización y eventoId
    const evento = (cotizacion && cotizacion.eventoId) ? await prisma.evento.findUnique({
        where: {
            id: cotizacion.eventoId
        }
    }) : null;

    const detallesPago = { pago, pagosCotizacion, cotizacion, evento, cliente };
    return detallesPago;
}

export async function obtenerBalancePagosEvento(eventoId: string) {

    const evento = await prisma.evento.findUnique({
        where: {
            id: eventoId,
            status: 'aprobado'
        }
    })

    const cotizacion = await prisma.cotizacion.findFirst({
        where: {
            eventoId,
            status: 'aprobada'
        }
    });

    const pagos = await prisma.pago.findMany({
        where: {
            cotizacionId: cotizacion?.id
        }
    });

    const totalPagado = pagos.reduce((acc, pago) => {
        return acc + pago.monto;
    }, 0);

    const precio = cotizacion?.precio ?? 0;

    const balance = cotizacion && precio !== undefined ? precio - totalPagado : undefined;

    return { precio, evento, totalPagado, balance };

}

export async function ontenerDetallesPago(pagoId: string) {

    const pago = await prisma.pago.findUnique({
        where: {
            id: pagoId
        }
    });

    // Solo buscar cliente si clienteId existe
    const cliente = pago?.clienteId ? await prisma.cliente.findUnique({
        where: {
            id: pago.clienteId
        }
    }) : null;

    // Solo buscar cotización si cotizacionId existe
    const cotizacion = pago?.cotizacionId ? await prisma.cotizacion.findUnique({
        where: {
            id: pago.cotizacionId
        }
    }) : null;

    // Solo buscar evento si cotización y eventoId existen
    const evento = (cotizacion && cotizacion.eventoId) ? await prisma.evento.findUnique({
        where: {
            id: cotizacion.eventoId
        }
    }) : null;
    
    // Solo buscar tipo de evento si evento y eventoTipoId existen
    const tipoEvento = (evento && evento.eventoTipoId) ? await prisma.eventoTipo.findUnique({
        where: {
            id: evento.eventoTipoId
        },
        select: {
            nombre: true
        }
    }) : null;

    const eventoConTipo = {
        ...evento,
        tipoEvento
    }

    const detallesPago = {
        pago,
        cliente,
        cotizacion,
        eventoConTipo
    };
    return detallesPago;
}

export async function validarPagoStripe(pagoId: string) {

    console.log('Procesando pago:', pagoId);

    try {

        const {
            pago,
            cliente,
            cotizacion,
            evento,
        } = await obtenerDetallesPago(pagoId);

        // console.log('Detalles del pago:', pago);
        // console.log('Detalles del cliente:', cliente);
        // console.log('Detalles del cotizacion:', cotizacion);
        // console.log('Detalles del evento:', evento);

        // const params = {
        //     nombre_cliente: cliente?.nombre ?? '',
        //     fecha_evento: evento?.fecha_evento?.toISOString() ?? '',
        //     nombre_evento: evento?.nombre ?? '',
        //     email: cliente?.email ?? '',
        //     asunto: '¡Gracias por tu pago!',
        //     monto: pago?.monto ?? 0,
        // }

        //pago cliente nuevo
        if (pago?.status === 'paid' && evento?.eventoEtapaId == 'cm6498zw00001gu1a67s88y5h') {

            // console.log('pago nuevo cliente');

            // Solo proceder si tenemos evento y cotización válidos
            if (!evento || !cotizacion) {
                console.log('Pago procesado pero sin cotización/evento asociado (posiblemente eliminado)');
                return { success: true, message: 'Pago procesado sin actualizaciones adicionales' };
            }

            try {
                // console.log('Actualizando evento:', evento?.id);
                await prisma.evento.update({
                    where: { id: evento.id },
                    data: { eventoEtapaId: 'cm6499aqs0002gu1ae4k1a7ls' }
                });
                // console.log('Evento actualizado:', evento?.id);
            } catch (error) {
                console.error('Error actualizando evento:', error);
            }

            try {
                // console.log('Actualizando cliente:', cliente?.id);
                if (cliente?.id) {
                    await prisma.cliente.update({
                        where: { id: cliente.id },
                        data: { status: 'cliente' }
                    });
                }
                // console.log('Cliente actualizado:', cliente?.id);
            } catch (error) {
                console.error('Error actualizando cliente:', error);
            }

            try {
                // console.log('Actualizando cotización:', cotizacion?.id);
                await prisma.cotizacion.update({
                    where: { id: cotizacion.id },
                    data: { status: 'aprobada' }
                });
                // console.log('Cotización actualizada:', cotizacion?.id);
            } catch (error) {
                console.error('Error actualizando cotización:', error);
            }
            try {
                // console.log('Creando agenda para el evento:', evento?.id);
                const agenda = {
                    concepto: evento.nombre,
                    descripcion: '',
                    googleMapsUrl: '',
                    direccion: '',
                    fecha: evento.fecha_evento,
                    hora: '',
                    eventoId: evento.id ?? '',
                    userId: evento.userId,
                    agendaTipo: 'evento',
                }
                await crearAgendaEvento(agenda as Agenda);
                // console.log('Agenda creada para el evento:', evento?.id);
            } catch (error) {
                console.error('Error creando agenda:', error);
            }

            // try {
            //     await enviarCorreoBienvenida(params);
            //     await enviarCorreoPagoExitoso(params);
            // } catch (error) {
            //     console.error('Error enviando correo de confirmación:', error);
            // }
        } else {
            //pago cliente existente
            // await enviarCorreoPagoExitoso(params);
            // console.log('pago cliente existente');
        }
    } catch (error) {
        console.error('Error obteniendo detalles del pago:', error);
    }

}

export async function promesPagoSPEI() {

}