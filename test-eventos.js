const { PrismaClient } = require("@prisma/client");

async function probarFuncionActualizada() {
  const prisma = new PrismaClient();

  try {
    console.log("🔍 Probando función actualizada...");

    // Simular la función getEventosPendientesPorEtapa con los nuevos filtros
    const whereConditions = {
      EventoEtapa: {
        posicion: {
          in: [1, 2, 3], // Nuevo, Seguimiento, Promesa
        },
      },
      status: {
        in: [
          "pendiente",
          "aprobado",
          "active", // Legacy status
        ],
      },
    };

    const eventos = await prisma.evento.findMany({
      where: whereConditions,
      include: {
        EventoTipo: {
          select: { nombre: true },
        },
        Cliente: {
          select: { nombre: true, telefono: true },
        },
        EventoEtapa: {
          select: { id: true, nombre: true, posicion: true },
        },
      },
      orderBy: [{ EventoEtapa: { posicion: "asc" } }, { fecha_evento: "asc" }],
    });

    console.log(`\n📋 Eventos encontrados: ${eventos.length}`);

    // Agrupar por etapa
    const eventosPorEtapa = {};
    eventos.forEach((evento) => {
      const etapa = evento.EventoEtapa.nombre;
      if (!eventosPorEtapa[etapa]) {
        eventosPorEtapa[etapa] = [];
      }
      eventosPorEtapa[etapa].push(evento);
    });

    console.log("\n📊 Eventos por etapa:");
    Object.entries(eventosPorEtapa).forEach(([etapa, eventosEtapa]) => {
      console.log(`\n${etapa}: ${eventosEtapa.length} eventos`);
      eventosEtapa.slice(0, 3).forEach((evento) => {
        console.log(
          `  - ${evento.Cliente.nombre} | ${evento.nombre || "Sin nombre"} | Status: ${evento.status}`
        );
      });
      if (eventosEtapa.length > 3) {
        console.log(`  ... y ${eventosEtapa.length - 3} más`);
      }
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

probarFuncionActualizada();
