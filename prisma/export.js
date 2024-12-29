const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function exportData() {
    try {
        // Exporta los datos de las tablas importantes
        const user = await prisma.user.findMany(); // Cambia 'tabla1' por el nombre real de tu tabla

        // const cliente = await prisma.cliente.findMany(); // Si tienes más tablas, añádelas aquí
        // const evento = await prisma.evento.findMany(); // Si tienes más tablas, añádelas aquí
        // const cotizacion = await prisma.cotizacion.findMany(); // Si tienes más tablas, añádelas aquí
        // const cotizacionServicio = await prisma.cotizacionServicio.findMany(); // Si tienes más tablas, añádelas aquí
        // const eventoTipo = await prisma.eventoTipo.findMany(); // Si tienes más tablas, añádelas aquí
        // const eventoStatus = await prisma.eventoStatus.findMany(); // Si tienes más tablas, añádelas aquí
        // const Servicio = await prisma.servicio.findMany(); // Si tienes más tablas, añádelas aquí
        // const ServicioGasto = await prisma.servicioGasto.findMany(); // Si tienes más tablas, añádelas aquí
        // const ServicioCategoria = await prisma.servicioCategoria.findMany(); // Si tienes más tablas, añádelas aquí
        // const paquete = await prisma.paquete.findMany(); // Si tienes más tablas, añádelas aquí
        // const paqueteServicio = await prisma.paqueteServicio.findMany(); // Si tienes más tablas, añádelas aquí
        // const configuracion = await prisma.configuracion.findMany(); // Si tienes más tablas, añádelas aquí
        // const metodoPago = await prisma.metodoPago.findMany(); // Si tienes más tablas, añádelas aquí
        // const condicionesComerciales = await prisma.condicionesComerciales.findMany(); // Si tienes más tablas, añádelas aquí
        // const CondicionesComercialesMetodoPago = await prisma.condicionesComercialesMetodoPago.findMany(); // Si tienes más tablas, añádelas aquí
        const canal = await prisma.canal.findMany(); // Si tienes más tablas, añádelas aquí


        // Guarda los datos en archivos JSON
        // fs.writeFileSync('prisma/backup.json/user_backup.json', JSON.stringify(user, null, 2));
        // fs.writeFileSync('prisma/backup.json/eventoTipo_backup.json', JSON.stringify(eventoTipo, null, 2));
        // fs.writeFileSync('prisma/backup.json/eventoStatus_backup.json', JSON.stringify(eventoStatus, null, 2));
        // fs.writeFileSync('prisma/backup.json/Servicio_backup.json', JSON.stringify(Servicio, null, 2));
        // fs.writeFileSync('prisma/backup.json/ServicioGasto_backup.json', JSON.stringify(ServicioGasto, null, 2));
        // fs.writeFileSync('prisma/backup.json/ServicioCategoria_backup.json', JSON.stringify(ServicioCategoria, null, 2));
        // fs.writeFileSync('prisma/backup.json/paquete_backup.json', JSON.stringify(paquete, null, 2));
        // fs.writeFileSync('prisma/backup.json/paqueteServicio_backup.json', JSON.stringify(paqueteServicio, null, 2));
        // fs.writeFileSync('prisma/backup.json/configuracion_backup.json', JSON.stringify(configuracion, null, 2));
        // fs.writeFileSync('prisma/backup.json/metodoPago_backup.json', JSON.stringify(metodoPago, null, 2));
        // fs.writeFileSync('prisma/backup.json/condicionesComerciales_backup.json', JSON.stringify(condicionesComerciales, null, 2));
        // fs.writeFileSync('prisma/backup.json/CondicionesComercialesMetodoPago_backup.json', JSON.stringify(CondicionesComercialesMetodoPago, null, 2));
        // fs.writeFileSync('prisma/backup.json/cliente_backup.json', JSON.stringify(cliente, null, 2));
        // fs.writeFileSync('prisma/backup.json/evento_backup.json', JSON.stringify(evento, null, 2));
        // fs.writeFileSync('prisma/backup.json/cotizacion_backup.json', JSON.stringify(cotizacion, null, 2));
        // fs.writeFileSync('prisma/backup.json/cotizacionServicio_backup.json', JSON.stringify(cotizacionServicio, null, 2));
        fs.writeFileSync('prisma/backup.json/canal_backup.json', JSON.stringify(canal, null, 2));

        console.log('Datos exportados correctamente.');
    } catch (error) {
        console.error('Error exportando los datos:', error);
    } finally {
        await prisma.$disconnect();
    }
}

exportData();
