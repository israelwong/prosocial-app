/*
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const prisma = new PrismaClient();

async function main() {
  const csvFilePath = './CSV/CotizacionServicio.csv'; // Ruta al archivo CSV
  const results = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      for (const row of results) {
        // Convertir timestamps a fechas válidas si existen y no son nulos
        if (row.createdAt && row.createdAt !== 'null') {
          row.createdAt = new Date(parseInt(row.createdAt, 10));
          if (isNaN(row.createdAt.getTime())) {
            console.error(`Fecha inválida en la fila: ${JSON.stringify(row)}`);
            continue;
          }
        } else {
          row.createdAt = null;
        }

        if (row.updatedAt && row.updatedAt !== 'null') {
          row.updatedAt = new Date(parseInt(row.updatedAt, 10));
          if (isNaN(row.updatedAt.getTime())) {
            console.error(`Fecha inválida en la fila: ${JSON.stringify(row)}`);
            continue;
          }
        } else {
          row.updatedAt = null;
        }

        // Convertir valores numéricos a enteros o flotantes
        if (row.cantidad) row.cantidad = parseFloat(row.cantidad);
        if (row.posicion) row.posicion = parseInt(row.posicion, 10);

        try {
          // Verificar si el registro ya existe
          const existingRecord = await prisma.cotizacionServicio.findUnique({
            where: { id: row.id },
          });

          if (existingRecord) {
            // Actualizar el registro si ya existe
            await prisma.cotizacionServicio.update({
              where: { id: row.id },
              data: {
                cotizacionId: row.cotizacionId,
                servicioId: row.servicioId,
                servicioCategoriaId: row.servicioCategoriaId,
                cantidad: row.cantidad,
                posicion: row.posicion,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
              },
            });
          } else {
            // Crear un nuevo registro si no existe
            await prisma.cotizacionServicio.create({
              data: {
                id: row.id,
                cotizacionId: row.cotizacionId,
                servicioId: row.servicioId,
                servicioCategoriaId: row.servicioCategoriaId,
                cantidad: row.cantidad,
                posicion: row.posicion,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
              },
            });
          }
        } catch (error) {
          console.error(`Error insertando fila: ${JSON.stringify(row)}`, error);
        }
      }
      console.log('Datos insertados correctamente');
      await prisma.$disconnect();
    });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
*/