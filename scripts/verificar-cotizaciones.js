// Script para verificar cotizaciones disponibles
// Ejecutar: node scripts/verificar-cotizaciones.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function verificarCotizaciones() {
  try {
    console.log("🔍 Verificando cotizaciones disponibles...\n");

    // Obtener todas las cotizaciones con información básica
    const cotizaciones = await prisma.cotizacion.findMany({
      include: {
        Evento: {
          include: {
            Cliente: {
              select: {
                nombre: true,
                email: true,
              },
            },
            EventoTipo: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10, // Solo las 10 más recientes
    });

    if (cotizaciones.length === 0) {
      console.log("❌ No se encontraron cotizaciones en la base de datos");
      return;
    }

    console.log(`✅ Se encontraron ${cotizaciones.length} cotizaciones:\n`);

    cotizaciones.forEach((cotizacion, index) => {
      console.log(`${index + 1}. 📋 Cotización: ${cotizacion.nombre}`);
      console.log(`   🆔 ID: ${cotizacion.id}`);
      console.log(
        `   👤 Cliente: ${cotizacion.Evento?.Cliente?.nombre || "N/A"}`
      );
      console.log(`   📧 Email: ${cotizacion.Evento?.Cliente?.email || "N/A"}`);
      console.log(
        `   🎉 Evento: ${cotizacion.Evento?.EventoTipo?.nombre || "N/A"}`
      );
      console.log(
        `   💰 Precio: $${cotizacion.precio?.toLocaleString("es-MX") || "0"}`
      );
      console.log(
        `   📅 Creada: ${cotizacion.createdAt?.toLocaleDateString("es-MX") || "N/A"}`
      );
      console.log(
        `   🌐 URL: /evento/${cotizacion.Evento?.id}/cotizacion/${cotizacion.id}`
      );
      console.log("   " + "─".repeat(60));
    });

    // Buscar específicamente el ID problemático
    const dummyId = "cmern84ht0001gu7dummy3znp";
    console.log(`\n🔍 Verificando ID específico: ${dummyId}`);

    const cotizacionDummy = await prisma.cotizacion.findUnique({
      where: { id: dummyId },
    });

    if (cotizacionDummy) {
      console.log("✅ El ID dummy existe en la base de datos");
    } else {
      console.log("❌ El ID dummy NO existe en la base de datos");
      console.log("💡 Esto confirma que es un ID de prueba inexistente");
    }
  } catch (error) {
    console.error("❌ Error al verificar cotizaciones:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarCotizaciones();
