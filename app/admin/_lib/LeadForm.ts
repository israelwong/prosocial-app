'use server';
import { LeadForm } from './types';
import { crearCliente } from './cliente.actions';
import { crearEvento } from './evento.actions';
import prisma from './prismaClient';

export async function registrarLead(lead: LeadForm) {

    try {

        const clienteExistente = await prisma.cliente.findFirst({
            where: {
                OR: [
                    { telefono: lead.telefono },
                    { email: lead.email }
                ]
            }
        });

        if (clienteExistente) {
            if (clienteExistente.telefono === lead.telefono && clienteExistente.email === lead.email) {
                console.log('Cliente already exists:', clienteExistente);
                return { success: false, message: 'El cliente ya existe', cliente: clienteExistente.id };
            } else {
                const message = clienteExistente.telefono === lead.telefono ? 'El teléfono ya existe' : 'El email ya existe';
                return { success: false, message, cliente: clienteExistente.id };
            }
        } else {
            const cliente = await crearCliente({
                nombre: lead.nombre,
                telefono: lead.telefono,
                email: lead.email ?? null,
                status: 'Prospecto',
                canalId: 'cm3xmmmcc000cnoqpfs80lwgc',
            });

            if (cliente.success) {
                console.log('Cliente created successfully:', cliente);
                console.log('Creating evento...');
                await crearEvento({
                    clienteId: cliente.clienteId!,
                    eventoTipoId: lead.eventoTipoId,
                    nombre: lead.nombreEvento,
                    fecha_evento: lead.fecha_evento,
                    status: 'nuevo'
                });
                console.log('Evento created successfully');
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