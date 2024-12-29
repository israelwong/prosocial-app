const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function seed() {
  try {
    // Cargar datos desde los archivos JSON
    const table = JSON.parse(fs.readFileSync('prisma/backup.json/canal_backup.json', 'utf-8'));

    // Inserción de datos en las tablas
    await prisma.canal.createMany({ data: table });
    console.log('Datos de tabla1 insertados correctamente.');
  } catch (error) {
    console.error('Error al insertar datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
