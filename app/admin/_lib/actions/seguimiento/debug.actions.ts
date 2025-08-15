'use server';

import prisma from '@/app/admin/_lib/prismaClient';

// Función temporal para debug - revisar datos
export async function debugEventosSeguimiento() {
    try {
        console.log('=== DEBUG: Revisando datos ===');

        // 1. Revisar etapas disponibles
        const todasLasEtapas = await prisma.eventoEtapa.findMany({
            orderBy: { posicion: 'asc' }
        });
        console.log('Etapas disponibles:', todasLasEtapas.map(e => ({ id: e.id, nombre: e.nombre, posicion: e.posicion })));

        // 2. Revisar las etapas específicas que buscamos
        const etapasBuscadas = await prisma.eventoEtapa.findMany({
            where: {
                nombre: {
                    in: ['Aprobado', 'En revisión por cliente', 'En garantía']
                }
            }
        });
        console.log('Etapas buscadas encontradas:', etapasBuscadas.map(e => ({ id: e.id, nombre: e.nombre })));

        // 3. Revisar eventos en esas etapas (SIN filtro de status del evento)
        const etapaIds = etapasBuscadas.map(etapa => etapa.id);
        const eventosEnEtapas = await prisma.evento.findMany({
            where: {
                eventoEtapaId: {
                    in: etapaIds
                }
            },
            include: {
                EventoEtapa: true,
                Cliente: true,
                Cotizacion: {
                    include: {
                        Pago: true
                    }
                }
            },
            take: 5
        });

        console.log('Eventos en etapas objetivo:', eventosEnEtapas.length);
        eventosEnEtapas.forEach(evento => {
            console.log({
                id: evento.id,
                nombre: evento.nombre,
                cliente: evento.Cliente.nombre,
                status: evento.status,
                etapa: evento.EventoEtapa?.nombre,
                cotizaciones: evento.Cotizacion.map(c => ({
                    id: c.id,
                    status: c.status,
                    pagos: c.Pago.map(p => ({ status: p.status, monto: p.monto }))
                }))
            });
        });

        // 4. Revisar específicamente con cotización aprobada
        const eventosConCotizacionAprobada = await prisma.evento.findMany({
            where: {
                eventoEtapaId: {
                    in: etapaIds
                },
                Cotizacion: {
                    some: {
                        status: 'aprobado'
                    }
                }
            },
            include: {
                EventoEtapa: true,
                Cliente: true,
                Cotizacion: {
                    where: { status: 'aprobado' },
                    include: {
                        Pago: { where: { status: 'paid' } }
                    }
                }
            },
            take: 5
        });

        console.log('Eventos con cotización aprobada:', eventosConCotizacionAprobada.length);

        return {
            etapas: todasLasEtapas,
            etapasBuscadas,
            eventosEnEtapas: eventosEnEtapas.slice(0, 2),
            eventosConCotizacionAprobada: eventosConCotizacionAprobada.slice(0, 2)
        };

    } catch (error) {
        console.error('Error en debug:', error);
        throw error;
    }
}
