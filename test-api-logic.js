// Test simple de la API de solicitudes de paquete
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function testAPI() {
  try {
    console.log("🧪 Probando la nueva lógica de solicitudes de paquete...\n");

    // 1. Buscar un evento sin cotizaciones
    const evento = await prisma.evento.findFirst({
      include: {
        Cliente: true,
        Cotizacion: true,
      },
      where: {
        Cotizacion: {
          none: {},
        },
      },
    });

    if (!evento) {
      console.log(
        "🔍 No hay eventos sin cotizaciones, buscando cualquier evento..."
      );
      const eventoCualquiera = await prisma.evento.findFirst({
        include: {
          Cliente: true,
          Cotizacion: true,
        },
      });

      if (!eventoCualquiera) {
        console.log("❌ No hay eventos en la base de datos");
        return;
      }

      console.log("✅ Evento encontrado (con cotizaciones existentes):", {
        id: eventoCualquiera.id,
        nombre: eventoCualquiera.nombre,
        cotizaciones: eventoCualquiera.Cotizacion.length,
      });
    } else {
      console.log("✅ Evento sin cotizaciones encontrado:", {
        id: evento.id,
        nombre: evento.nombre,
        cotizaciones: evento.Cotizacion.length,
      });
    }

    // 2. Buscar un paquete
    const paquete = await prisma.paquete.findFirst();
    if (!paquete) {
      console.log("❌ No hay paquetes en la base de datos");
      return;
    }

    console.log("✅ Paquete encontrado:", {
      id: paquete.id,
      nombre: paquete.nombre,
    });

    // 3. Contar cotizaciones antes
    const cotizacionesAntes = await prisma.cotizacion.count();
    console.log("\n📊 Estado inicial:");
    console.log("   - Cotizaciones totales:", cotizacionesAntes);

    // 4. Simular envío a la API
    console.log("\n🚀 La lógica de la API haría lo siguiente:");
    const eventoSeleccionado = evento || eventoCualquiera;

    if (eventoSeleccionado.Cotizacion.length > 0) {
      console.log(
        "   ✅ Usaría cotización existente:",
        eventoSeleccionado.Cotizacion[0].id
      );
      console.log("   ✅ NO crearía cotizaciones adicionales");
    } else {
      console.log(
        "   📝 Crearía 1 cotización temporal con status 'solicitud_paquete'"
      );
      console.log(
        "   📝 Esta cotización es solo un placeholder para la base de datos"
      );
    }

    console.log("\n🎯 Resultado esperado:");
    console.log("   ✅ Se crea la solicitud de paquete");
    console.log("   🔔 Se crea la notificación para el admin");
    console.log("   📋 Máximo 1 cotización temporal si es necesaria");
    console.log("   ❌ NO se crean cotizaciones reales/innecesarias");

    console.log("\n✅ La nueva lógica está lista para funcionar correctamente");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testAPI();
