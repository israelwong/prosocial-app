import { PrismaClient } from "@prisma/client";
// import  prisma from "@/app/admin/PrismaClient";

export async function leadsHandle(lead, res) {
    const prisma = new PrismaClient();
        try {
        const { 
            nombreLead, 
            email, 
            telefono, 
            canalId,
            nombreEvento,
            eventoTipoId,
            fecha_evento,
        } = lead;
        
        const cliente = {
            nombre: nombreLead,
            email,
            telefono,
            status: 'nuevo',
            canalId
        };
        
        // Check if the client already exists
        let clienteId;
        let existingCliente = await prisma.cliente.findUnique({
            where: { telefono }
        });

        if (existingCliente) {
            clienteId = existingCliente.id;
        } else {
            // Create a new client if it doesn't exist
            const newCliente = await prisma.cliente.create({ data: cliente });
            clienteId = newCliente.id;
        }

        const evento = {
            nombre: nombreEvento,
            eventoTipoId,
            fecha_evento: new Date(fecha_evento),
            status: 'nuevo',
            clienteId: clienteId
        };

        // Create a new event in the database
        const newEvento = await prisma.evento.create({ 
            data: evento
        });
        
        console.table({ cliente, newEvento });
        return res.status(200).send('Webhook recibido correctamente');
    } catch (error) {
        console.error('Error en leadsHandle:', error.message);
        res.status(500).send('Error en leadsHandle:', error.message);
    }finally {
        await prisma.$disconnect();
    }
}