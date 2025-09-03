'use server';
import { LeadForm } from './types';
import { crearCliente } from './actions/cliente/cliente.actions';
import { crearEvento } from './evento.actions';
import { obtenerEtapa1 } from './actions/EventoEtapa/EventoEtapa.actions';
import prisma from './prismaClient';


export async function registrarLead(lead: LeadForm) {

    try {
        const clienteExistente = await prisma.cliente.findFirst({
            where: {
                telefono: lead.telefono
            }
        });

        if (clienteExistente) {
            console.log('Cliente already exists:', clienteExistente);
            return { success: false, message: 'Teléfono existente' };
        } else {

            //crear cliente
            const cliente = await crearCliente({
                nombre: lead.nombre,
                telefono: lead.telefono,
                email: lead.email ?? null,
                status: 'Prospecto',
                canalId: 'cm3xmmmcc000cnoqpfs80lwgc',// Canal de ventas leadform
            });

            if (cliente.success) {
                // console.log('Cliente created successfully:', cliente);

                //obtener etapa 1
                const etapaId = await obtenerEtapa1();


                // console.log('Creating evento...');
                await crearEvento({
                    clienteId: cliente.clienteId!,
                    eventoTipoId: lead.eventoTipoId,
                    nombre: '',
                    fecha_evento: lead.fecha_evento,
                    eventoEtapaId: etapaId,
                });

                // console.log('Evento created successfully');
                return { success: true, message: 'Lead form created successfully' };
            } else {
                console.log('Failed to create cliente');
                console.error('Error details:', cliente.message);
                return { success: false, message: 'Failed to create cliente', error: cliente.message };
            }
        }
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }

}