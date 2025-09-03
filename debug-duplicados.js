const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function debugDuplicados() {
  try {
    console.log("🔍 Verificando registros duplicados...");

    // 1. Verificar eventos duplicados por fecha
    console.log("\n📅 1. Eventos por fecha (pueden compartir fecha):");
    const eventosPorFecha = await prisma.$queryRaw`
            SELECT DATE(fecha_evento) as fecha, COUNT(*) as total, 
                   STRING_AGG(id, ', ') as eventos_ids,
                   STRING_AGG(nombre, ' | ') as nombres
            FROM Evento 
            WHERE status != 'archived'
            GROUP BY DATE(fecha_evento)
            HAVING COUNT(*) > 1
            ORDER BY fecha DESC
            LIMIT 10;
        `;
    console.log("Fechas con múltiples eventos:", eventosPorFecha);

    // 2. Verificar registros específicos de Agenda para fechas duplicadas
    console.log("\n🗓️ 2. Agenda con múltiples eventos en la misma fecha:");
    const agendaDuplicada = await prisma.$queryRaw`
            SELECT DATE(fecha) as fecha, COUNT(*) as total_agendas,
                   STRING_AGG(DISTINCT "eventoId", ', ') as eventos_ids,
                   STRING_AGG("eventoId", ', ') as todos_evento_ids
            FROM Agenda 
            WHERE status != 'cancelado'
            GROUP BY DATE(fecha), "eventoId"
            HAVING COUNT(*) > 1
            LIMIT 10;
        `;
    console.log("Agendas duplicadas por evento/fecha:", agendaDuplicada);

    // 3. Verificar eventos duplicados por ID (esto no debería pasar)
    console.log("\n🚨 3. Verificando IDs duplicados de eventos:");
    const eventosDuplicadosId = await prisma.$queryRaw`
            SELECT id, COUNT(*) as repeticiones
            FROM Evento 
            GROUP BY id 
            HAVING COUNT(*) > 1;
        `;
    console.log("Eventos con IDs duplicados:", eventosDuplicadosId);

    // 4. Verificar el ID específico del error
    const idProblematico = "cm7ut3qa00005jl031vr2skmp";
    console.log(`\n🎯 4. Verificando ID específico: ${idProblematico}`);

    const eventosEspecifico = await prisma.evento.findMany({
      where: { id: idProblematico },
      select: {
        id: true,
        nombre: true,
        fecha_evento: true,
        status: true,
        Cliente: { select: { nombre: true } },
        EventoTipo: { select: { nombre: true } },
      },
    });
    console.log("Eventos encontrados con ID específico:", eventosEspecifico);

    const agendasEspecifico = await prisma.agenda.findMany({
      where: { eventoId: idProblematico },
      select: {
        id: true,
        eventoId: true,
        fecha: true,
        status: true,
      },
    });
    console.log("Agendas encontradas para ID específico:", agendasEspecifico);

    // 5. Verificar cotizaciones para ese evento
    const cotizacionesEspecifico = await prisma.cotizacion.findMany({
      where: { eventoId: idProblematico },
      select: {
        id: true,
        eventoId: true,
        nombre: true,
        archivada: true,
      },
    });
    console.log(
      "Cotizaciones encontradas para ID específico:",
      cotizacionesEspecifico
    );

    // 6. Verificar servicios de cotizaciones que podrían estar duplicados
    if (cotizacionesEspecifico.length > 0) {
      const serviciosCotizacion = await prisma.cotizacionServicio.findMany({
        where: {
          cotizacionId: {
            in: cotizacionesEspecifico.map((c) => c.id),
          },
        },
        select: {
          id: true,
          cotizacionId: true,
          servicioId: true,
          nombre: true,
        },
      });
      console.log("Servicios de cotizaciones:", serviciosCotizacion);
    }

    console.log("\n✅ Análisis completado");
  } catch (error) {
    console.error("❌ Error en debug:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debugDuplicados();
