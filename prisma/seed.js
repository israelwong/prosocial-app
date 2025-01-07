const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function seed() {
  try {
    
    // Cargar datos desde los archivos JSON
    // canal_backup.json
    // cliente_backup.json
    // condicionesComerciales_backup.json
    // condicionesComercialesMetodoPago_backup.json
    // configuracion_backup.json
    // servicio_backup.json
    // metodoPago_backup.json
    // servicioCategoria_backup.json
    // servicioGasto_backup.json
    // eventoTipo_backup.json
    // paquete_backup.json
    // paqueteServicio_backup.json
    // user_backup.json
    // evento_backup.json
    // cotizacion_backup.json
    // cotizacionServicio_backup.json
    // pago_backup.json
    // eventoBitacora_backup.json
    
    const table = JSON.parse(fs.readFileSync('prisma/backup.json/eventoBitacora_backup.json', 'utf-8'));
    await prisma.eventoBitacora.createMany({ data: table });
    console.log('Datos de tabla1 insertados correctamente.');


  } catch (error) {
    console.error('Error al insertar datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
