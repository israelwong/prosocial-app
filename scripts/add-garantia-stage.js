const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function addGarantiaStage() {
  try {
    // Verificar si ya existe la etapa "En garantía"
    const existingStage = await prisma.eventoEtapa.findFirst({
      where: {
        nombre: "En garantía",
      },
    });

    if (existingStage) {
      console.log('✅ La etapa "En garantía" ya existe:', existingStage);
      return;
    }

    // Obtener la posición más alta actual para agregar la nueva etapa al final
    const maxPosition = await prisma.eventoEtapa.findFirst({
      orderBy: {
        posicion: "desc",
      },
    });

    const nextPosition = maxPosition ? maxPosition.posicion + 1 : 1;

    // Crear la nueva etapa "En garantía"
    const newStage = await prisma.eventoEtapa.create({
      data: {
        nombre: "En garantía",
        posicion: nextPosition,
        color: "#10b981", // Verde esmeralda
      },
    });

    console.log('✅ Etapa "En garantía" creada exitosamente:', newStage);

    // Mostrar todas las etapas para verificar
    const allStages = await prisma.eventoEtapa.findMany({
      orderBy: {
        posicion: "asc",
      },
    });

    console.log("\n📋 Todas las etapas disponibles:");
    allStages.forEach((stage) => {
      console.log(`- ${stage.nombre} (pos: ${stage.posicion})`);
    });
  } catch (error) {
    console.error("❌ Error al agregar etapa:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addGarantiaStage();
