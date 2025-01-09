
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  try {
    // Orden correcto de inyección basado en las dependencias entre tablas
    const files = [
      'user_backup.json',
      'configuracion_backup.json',
      'canal_backup.json',
      'metodoPago_backup.json',
      'condicionesComerciales_backup.json',
      'condicionesComercialesMetodoPago_backup.json',
      'servicioCategoria_backup.json',
      'servicio_backup.json',
      'servicioGasto_backup.json',
      'paquete_backup.json',
      'paqueteServicio_backup.json',
      'eventoTipo_backup.json',
      'cliente_backup.json',
      'evento_backup.json',
      'eventoBitacora_backup.json',
      'cotizacion_backup.json',
      'cotizacionServicio_backup.json',
      'pago_backup.json'
    ];

    for (const file of files) {
      const tableName = file.split('_')[0]; // Asume que el nombre del archivo sigue la convención tabla_backup.json
      const data = JSON.parse(fs.readFileSync(`prisma/backup.json/${file}`, 'utf-8')); // Ajusta el path según corresponda
      
      console.log(`Insertando datos en ${tableName}...`);
      
      // Inyección con manejo de duplicados
      await prisma[tableName].createMany({
        data,
        skipDuplicates: true, // Evita errores si un registro ya existe
      });

      console.log(`Datos de ${tableName} insertados correctamente.`);
    }

    console.log('Todos los datos han sido insertados correctamente.');
  } catch (error) {
    console.error('Error al insertar datos:', error);
  } finally {
    await prisma.$disconnect(); // Cierra la conexión al cliente de Prisma
  }
}

seed();