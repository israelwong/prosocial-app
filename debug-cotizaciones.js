const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function debugCotizaciones(eventoId) {
  try {
    console.log(`🔍 Diagnosticando cotizaciones para evento: ${eventoId}`);
    console.log("=".repeat(60));

    // 1. Verificar que el evento existe
    const evento = await prisma.evento.findUnique({
      where: { id: eventoId },
      include: {
        EventoTipo: true,
        EventoEtapa: true,
      },
    });

    if (!evento) {
      console.log("❌ Evento no encontrado");
      return;
    }

    console.log("✅ Evento encontrado:");
    console.log(`   - Nombre: ${evento.nombre}`);
    console.log(`   - Fecha: ${evento.fecha_evento}`);
    console.log(`   - Tipo: ${evento.EventoTipo?.nombre || "No definido"}`);
    console.log(
      `   - Etapa: ${evento.EventoEtapa?.nombre || "No definida"} (posición: ${evento.EventoEtapa?.posicion || 0})`
    );
    console.log("");

    // 2. Verificar todas las cotizaciones del evento
    const todasLasCotizaciones = await prisma.cotizacion.findMany({
      where: { eventoId },
      select: {
        id: true,
        nombre: true,
        precio: true,
        status: true,
        visible_cliente: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(
      `📋 Total de cotizaciones en el evento: ${todasLasCotizaciones.length}`
    );
    if (todasLasCotizaciones.length > 0) {
      console.log("");
      todasLasCotizaciones.forEach((cot, index) => {
        console.log(`   ${index + 1}. ${cot.nombre}`);
        console.log(`      - ID: ${cot.id}`);
        console.log(`      - Status: ${cot.status}`);
        console.log(
          `      - Visible cliente: ${cot.visible_cliente ? "✅" : "❌"}`
        );
        console.log(
          `      - Precio: $${cot.precio?.toLocaleString("es-MX") || "No definido"}`
        );
        console.log(
          `      - Creada: ${cot.createdAt.toLocaleDateString("es-MX")}`
        );
        console.log("");
      });
    }

    // 3. Filtrar cotizaciones visibles al cliente
    const cotizacionesVisibles = todasLasCotizaciones.filter(
      (cot) =>
        cot.visible_cliente &&
        ["pending", "pendiente", "aprobada", "approved"].includes(cot.status)
    );

    console.log(
      `👁️  Cotizaciones visibles al cliente: ${cotizacionesVisibles.length}`
    );
    if (cotizacionesVisibles.length > 0) {
      cotizacionesVisibles.forEach((cot, index) => {
        console.log(`   ${index + 1}. ${cot.nombre} (${cot.status})`);
      });
    }
    console.log("");

    // 4. Verificar paquetes disponibles
    if (evento.eventoTipoId) {
      const paquetes = await prisma.paquete.findMany({
        where: {
          eventoTipoId: evento.eventoTipoId,
          status: "active",
        },
        select: {
          id: true,
          nombre: true,
          precio: true,
        },
      });

      console.log(`📦 Paquetes disponibles: ${paquetes.length}`);
      if (paquetes.length > 0) {
        paquetes.forEach((paq, index) => {
          console.log(
            `   ${index + 1}. ${paq.nombre} - $${paq.precio?.toLocaleString("es-MX")}`
          );
        });
      }
    }

    // 5. Simular lógica de la función
    console.log("");
    console.log("🎯 Acción que se tomaría:");
    if (cotizacionesVisibles.length === 0) {
      console.log("   → sin_cotizaciones (mostrar paquetes o mensaje)");
    } else if (cotizacionesVisibles.length === 1) {
      console.log(
        `   → redireccion_automatica a /evento/${eventoId}/cotizacion/${cotizacionesVisibles[0].id}`
      );
    } else {
      console.log(
        `   → mostrar_lista con ${cotizacionesVisibles.length} cotizaciones`
      );
    }
  } catch (error) {
    console.error("❌ Error en diagnóstico:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Uso: node debug-cotizaciones.js EVENTO_ID
const eventoId = process.argv[2];
if (!eventoId) {
  console.log("❌ Proporciona un evento ID");
  console.log("Uso: node debug-cotizaciones.js EVENTO_ID");
  process.exit(1);
}

debugCotizaciones(eventoId);
