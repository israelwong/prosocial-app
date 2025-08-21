const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function auditarStatusExistentes() {
  console.log("=== AUDITORÍA DE STATUS EXISTENTES ===\n");

  try {
    // Auditar status de Evento
    const eventosStatus = await prisma.evento.findMany({
      select: { status: true },
      distinct: ["status"],
    });
    console.log("📅 EVENTO STATUS encontrados:");
    eventosStatus.forEach((e) => console.log(`   - "${e.status}"`));

    // Auditar status de Cotización
    const cotizacionesStatus = await prisma.cotizacion.findMany({
      select: { status: true },
      distinct: ["status"],
    });
    console.log("\n💰 COTIZACION STATUS encontrados:");
    cotizacionesStatus.forEach((c) => console.log(`   - "${c.status}"`));

    // Auditar status de Pago
    const pagosStatus = await prisma.pago.findMany({
      select: { status: true },
      distinct: ["status"],
    });
    console.log("\n💳 PAGO STATUS encontrados:");
    pagosStatus.forEach((p) => console.log(`   - "${p.status}"`));

    // Auditar status de Agenda
    const agendasStatus = await prisma.agenda.findMany({
      select: { status: true },
      distinct: ["status"],
    });
    console.log("\n📋 AGENDA STATUS encontrados:");
    agendasStatus.forEach((a) => console.log(`   - "${a.status}"`));

    // Contar registros por status
    console.log("\n=== CONTEO DE REGISTROS ===\n");

    console.log("📅 EVENTOS por status:");
    for (const evento of eventosStatus) {
      const count = await prisma.evento.count({
        where: { status: evento.status },
      });
      console.log(`   - "${evento.status}": ${count} registros`);
    }

    console.log("\n💰 COTIZACIONES por status:");
    for (const cotizacion of cotizacionesStatus) {
      const count = await prisma.cotizacion.count({
        where: { status: cotizacion.status },
      });
      console.log(`   - "${cotizacion.status}": ${count} registros`);
    }

    console.log("\n💳 PAGOS por status:");
    for (const pago of pagosStatus) {
      const count = await prisma.pago.count({
        where: { status: pago.status },
      });
      console.log(`   - "${pago.status}": ${count} registros`);
    }

    console.log("\n📋 AGENDA por status:");
    for (const agenda of agendasStatus) {
      const count = await prisma.agenda.count({
        where: { status: agenda.status },
      });
      console.log(`   - "${agenda.status}": ${count} registros`);
    }
  } catch (error) {
    console.error("Error en auditoría:", error);
  } finally {
    await prisma.$disconnect();
  }
}

auditarStatusExistentes();
