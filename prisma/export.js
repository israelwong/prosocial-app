const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function exportData() {
    try {
        // Exporta los datos de las tablas importantes
        const tables = [
            { name: 'user', data: await prisma.user.findMany() },
            { name: 'cliente', data: await prisma.cliente.findMany() },
            { name: 'evento', data: await prisma.evento.findMany() },
            { name: 'eventoBitacora', data: await prisma.eventoBitacora.findMany() },
            { name: 'eventoTipo', data: await prisma.eventoTipo.findMany() },
            { name: 'canal', data: await prisma.canal.findMany() },
            { name: 'pago', data: await prisma.pago.findMany() },
            { name: 'cotizacion', data: await prisma.cotizacion.findMany() },
            { name: 'cotizacionServicio', data: await prisma.cotizacionServicio.findMany() },
            { name: 'servicio', data: await prisma.servicio.findMany() },
            { name: 'servicioGasto', data: await prisma.servicioGasto.findMany() },
            { name: 'paquete', data: await prisma.paquete.findMany() },
            { name: 'paqueteServicio', data: await prisma.paqueteServicio.findMany() },
            { name: 'configuracion', data: await prisma.configuracion.findMany() },
            { name: 'metodoPago', data: await prisma.metodoPago.findMany() },
            { name: 'condicionesComerciales', data: await prisma.condicionesComerciales.findMany() },
            { name: 'servicioCategoria', data: await prisma.servicioCategoria.findMany() },
            { name: 'condicionesComercialesMetodoPago', data: await prisma.condicionesComercialesMetodoPago.findMany() }
        ];

        tables.forEach(table => {
            const filePath = `prisma/backup.json/${table.name}_backup.json`;
            if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify(table.data, null, 2));
            }
        });


        console.log('Datos exportados correctamente.');
    } catch (error) {
        console.error('Error exportando los datos:', error);
    } finally {
        await prisma.$disconnect();
    }
}

exportData();
