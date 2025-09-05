// Script para asignar códigos a las etapas existentes
// Ruta: scripts/assign-stage-codes.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function assignStageCodes() {
  try {
    console.log("🚀 Iniciando asignación de códigos a etapas existentes...\n");

    // Mapeo de nombres actuales a códigos - PIPELINE COMPLETO
    const etapaMapping = {
      Nuevo: "nuevo",
      Promesa: "promesa",
      Aprobado: "aprobado",
      "En edición": "edicion",
      "En revisión por cliente": "revision",
      "En garantía": "garantia",
      Entregado: "entregado",
    };

    // Obtener todas las etapas existentes
    const etapasExistentes = await prisma.eventoEtapa.findMany({
      orderBy: { posicion: "asc" },
    });

    console.log("📋 Etapas encontradas:");
    etapasExistentes.forEach((etapa) => {
      console.log(
        `- ${etapa.nombre} (posición: ${etapa.posicion}, codigo: ${etapa.codigo || "NULL"})`
      );
    });

    // Asignar códigos a etapas que ya tienen nombres conocidos
    for (const etapa of etapasExistentes) {
      const codigo = etapaMapping[etapa.nombre];

      if (codigo && !etapa.codigo) {
        console.log(
          `\n🔄 Asignando código "${codigo}" a etapa "${etapa.nombre}"`
        );

        await prisma.eventoEtapa.update({
          where: { id: etapa.id },
          data: { codigo },
        });

        console.log(`✅ Código asignado exitosamente`);
      } else if (etapa.codigo) {
        console.log(
          `\n⚠️  Etapa "${etapa.nombre}" ya tiene código: "${etapa.codigo}"`
        );
      } else {
        console.log(
          `\n❓ Etapa "${etapa.nombre}" no está en el mapeo conocido`
        );
      }
    }

    console.log("\n🎯 Proceso completado. Verificando resultados...\n");

    // Verificar resultados
    const etapasActualizadas = await prisma.eventoEtapa.findMany({
      orderBy: { posicion: "asc" },
    });

    console.log("📊 Estado final de las etapas:");
    etapasActualizadas.forEach((etapa) => {
      const status = etapa.codigo ? "✅" : "❌";
      console.log(
        `${status} ${etapa.nombre} → codigo: "${etapa.codigo || "NULL"}"`
      );
    });
  } catch (error) {
    console.error("❌ Error al asignar códigos:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  assignStageCodes();
}

module.exports = { assignStageCodes };
