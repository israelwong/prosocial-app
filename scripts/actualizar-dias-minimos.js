const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function actualizarDiasMinimos() {
  try {
    console.log("🔄 Actualizando días mínimos de contratación a 30 días...");

    // Actualizar Paquetes
    const paquetesActualizados = await prisma.paquete.updateMany({
      where: {
        OR: [
          { dias_minimos_contratacion: null },
          { dias_minimos_contratacion: 5 }, // El valor por defecto anterior
        ],
      },
      data: {
        dias_minimos_contratacion: 30,
      },
    });

    console.log(`✅ Paquetes actualizados: ${paquetesActualizados.count}`);

    // Actualizar Cotizaciones
    const cotizacionesActualizadas = await prisma.cotizacion.updateMany({
      where: {
        OR: [
          { dias_minimos_contratacion: null },
          { dias_minimos_contratacion: 5 }, // El valor por defecto anterior
        ],
      },
      data: {
        dias_minimos_contratacion: 30,
      },
    });

    console.log(
      `✅ Cotizaciones actualizadas: ${cotizacionesActualizadas.count}`
    );

    // Verificar algunos registros
    const samplePaquetes = await prisma.paquete.findMany({
      select: {
        id: true,
        nombre: true,
        dias_minimos_contratacion: true,
      },
      take: 3,
    });

    const sampleCotizaciones = await prisma.cotizacion.findMany({
      select: {
        id: true,
        nombre: true,
        dias_minimos_contratacion: true,
      },
      take: 3,
    });

    console.log("\n📊 Muestra de paquetes actualizados:");
    samplePaquetes.forEach((p) => {
      console.log(`  - ${p.nombre}: ${p.dias_minimos_contratacion} días`);
    });

    console.log("\n📊 Muestra de cotizaciones actualizadas:");
    sampleCotizaciones.forEach((c) => {
      console.log(`  - ${c.nombre}: ${c.dias_minimos_contratacion} días`);
    });

    console.log("\n🎉 Actualización completada exitosamente!");
  } catch (error) {
    console.error("❌ Error al actualizar:", error);
  } finally {
    await prisma.$disconnect();
  }
}

actualizarDiasMinimos();
