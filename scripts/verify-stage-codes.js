// Script de verificación para el sistema de códigos de etapas
// Ruta: scripts/verify-stage-codes.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function verifyStageCodesSystem() {
  try {
    console.log("🔍 Verificando sistema de códigos de etapas...\n");

    // 1. Verificar que todas las etapas tienen códigos
    const etapasSinCodigo = await prisma.eventoEtapa.findMany({
      where: { codigo: null },
    });

    if (etapasSinCodigo.length > 0) {
      console.log("❌ Etapas sin código encontradas:");
      etapasSinCodigo.forEach((etapa) => {
        console.log(`- ${etapa.nombre} (ID: ${etapa.id})`);
      });
      return;
    }

    console.log("✅ Todas las etapas tienen códigos asignados");

    // 2. Verificar códigos únicos
    const codigosAgrupados = await prisma.eventoEtapa.groupBy({
      by: ["codigo"],
      _count: { codigo: true },
    });

    const codigosDuplicados = codigosAgrupados.filter(
      (group) => group._count.codigo > 1
    );

    if (codigosDuplicados.length > 0) {
      console.log("❌ Códigos duplicados encontrados:");
      codigosDuplicados.forEach((grupo) => {
        console.log(
          `- Código "${grupo.codigo}" aparece ${grupo._count.codigo} veces`
        );
      });
      return;
    }

    console.log("✅ Todos los códigos son únicos");

    // 3. Verificar que podemos buscar etapas por código
    const etapasEsperadas = [
      "nuevo",
      "promesa",
      "aprobado",
      "edicion",
      "revision",
      "garantia",
      "entregado",
    ];

    console.log("\n📋 Verificando búsqueda por código:");

    for (const codigo of etapasEsperadas) {
      const etapa = await prisma.eventoEtapa.findFirst({
        where: { codigo },
      });

      if (etapa) {
        console.log(
          `✅ ${codigo} → "${etapa.nombre}" (posición: ${etapa.posicion})`
        );
      } else {
        console.log(`❌ Código "${codigo}" no encontrado`);
      }
    }

    // 4. Verificar consulta de etapas de seguimiento
    console.log("\n🎯 Verificando query de seguimiento:");

    const etapasSeguimiento = await prisma.eventoEtapa.findMany({
      where: {
        codigo: {
          in: ["aprobado", "edicion", "revision", "garantia"],
        },
      },
      orderBy: { posicion: "asc" },
    });

    console.log(
      `✅ Query de seguimiento devuelve ${etapasSeguimiento.length} etapas:`
    );
    etapasSeguimiento.forEach((etapa) => {
      console.log(`   - ${etapa.nombre} (código: ${etapa.codigo})`);
    });

    // 5. Contar eventos por etapa
    console.log("\n📊 Distribución de eventos por etapa:");

    const eventosStats = await prisma.evento.groupBy({
      by: ["eventoEtapaId"],
      _count: { id: true },
    });

    for (const stat of eventosStats) {
      if (stat.eventoEtapaId) {
        const etapa = await prisma.eventoEtapa.findUnique({
          where: { id: stat.eventoEtapaId },
        });

        if (etapa) {
          console.log(
            `   - ${etapa.nombre} (${etapa.codigo}): ${stat._count.id} eventos`
          );
        }
      } else {
        console.log(`   - Sin etapa: ${stat._count.id} eventos`);
      }
    }

    console.log("\n🎉 Sistema de códigos de etapas verificado exitosamente!");
  } catch (error) {
    console.error("❌ Error en verificación:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  verifyStageCodesSystem();
}

module.exports = { verifyStageCodesSystem };
