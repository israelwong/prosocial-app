/**
 * Test rápido para validar que una cotización/evento pueden recibir pagos
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function testRealPaymentFlow() {
  console.log("🔍 BUSCANDO COTIZACIÓN PENDIENTE PARA PRUEBA DE PAGO");

  try {
    // Buscar una cotización pendiente que tenga evento asociado
    const cotizacionPendiente = await prisma.cotizacion.findFirst({
      where: {
        status: "pending",
      },
      include: {
        Evento: {
          include: {
            Cliente: true,
            EventoTipo: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!cotizacionPendiente || !cotizacionPendiente.Evento) {
      console.log(
        "❌ No se encontró ninguna cotización pendiente con evento asociado"
      );
      console.log(
        "💡 Sugerencia: Crear una cotización con evento para probar el flujo de pagos"
      );
      return;
    }

    console.log("✅ Cotización encontrada para prueba:");
    console.log({
      cotizacionId: cotizacionPendiente.id,
      nombre: cotizacionPendiente.nombre,
      precio: cotizacionPendiente.precio.toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
      }),
      status: cotizacionPendiente.status,
      cliente: cotizacionPendiente.Evento?.Cliente?.nombre,
      evento: cotizacionPendiente.Evento?.nombre,
      fechaEvento: cotizacionPendiente.Evento?.fecha_evento,
    });

    // Verificar si ya tiene pagos
    const pagosExistentes = await prisma.pago.findMany({
      where: {
        cotizacionId: cotizacionPendiente.id,
      },
    });

    console.log("\n📊 ESTADO DE PAGOS:");
    if (pagosExistentes.length === 0) {
      console.log("✅ No hay pagos previos - Lista para recibir nuevo pago");
    } else {
      console.log(`🔍 Encontrados ${pagosExistentes.length} pagos existentes:`);
      pagosExistentes.forEach((pago, index) => {
        console.log(
          `  ${index + 1}. Status: ${pago.status}, Monto: ${pago.monto.toLocaleString(
            "es-MX",
            {
              style: "currency",
              currency: "MXN",
            }
          )}, Stripe ID: ${pago.stripe_payment_id || "No definido"}`
        );
      });
    }

    // Verificar estado del evento
    console.log("\n🎭 ESTADO DEL EVENTO:");
    console.log({
      eventoId: cotizacionPendiente.Evento.id,
      status: cotizacionPendiente.Evento.status,
      etapaId: cotizacionPendiente.Evento.eventoEtapaId || "No asignada",
    });

    // Verificar agenda
    const agendaExistente = await prisma.agenda.findFirst({
      where: {
        eventoId: cotizacionPendiente.Evento.id,
        status: { not: "cancelado" },
      },
    });

    console.log("\n📅 ESTADO DE LA AGENDA:");
    if (agendaExistente) {
      console.log({
        agendaId: agendaExistente.id,
        status: agendaExistente.status,
        fecha: agendaExistente.fecha,
        descripcion: agendaExistente.descripcion || "Sin descripción",
      });
    } else {
      console.log(
        "✅ No hay agenda - Se creará automáticamente al confirmar pago"
      );
    }

    console.log("\n🎯 SIGUIENTE PASO:");
    console.log("Para probar el webhook, crear un pago con:");
    console.log(`- cotizacionId: "${cotizacionPendiente.id}"`);
    console.log(`- clienteId: "${cotizacionPendiente.Evento.clienteId}"`);
    console.log(`- monto: ${cotizacionPendiente.precio}`);
    console.log("- Usar el sistema universal de pagos del portal del cliente");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testRealPaymentFlow();
