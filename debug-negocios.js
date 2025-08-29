// Script para verificar todos los negocios en la base de datos
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function debugNegocios() {
  try {
    console.log("🔍 Verificando todos los negocios en la base de datos...\n");

    const negocios = await prisma.negocio.findMany({
      include: {
        NegocioRRSS: true,
        NegocioHorarios: true,
      },
    });

    console.log(`📊 Total de negocios encontrados: ${negocios.length}`);

    if (negocios.length === 0) {
      console.log("❌ No hay negocios configurados en la base de datos");
      console.log(
        "\n💡 Solución: Necesitas crear un negocio activo desde el admin panel"
      );
    } else {
      negocios.forEach((negocio, index) => {
        console.log(`\n${index + 1}. Negocio:`, {
          id: negocio.id,
          nombre: negocio.nombre,
          status: negocio.status,
          redesSociales: negocio.NegocioRRSS.length,
          horarios: negocio.NegocioHorarios.length,
        });
      });
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debugNegocios();
