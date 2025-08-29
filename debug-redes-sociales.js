// Script para verificar las redes sociales en la base de datos
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function debugRedesSociales() {
  try {
    console.log("🔍 Verificando configuración de redes sociales...\n");

    // Verificar si existe el negocio
    const negocio = await prisma.negocio.findFirst({
      where: { status: "active" },
      include: {
        NegocioRRSS: true,
      },
    });

    if (!negocio) {
      console.log("❌ No se encontró negocio activo");
      return;
    }

    console.log("✅ Negocio encontrado:", {
      id: negocio.id,
      nombre: negocio.nombre,
    });

    console.log("📱 Redes sociales configuradas:");
    if (negocio.NegocioRRSS.length === 0) {
      console.log("   - No hay redes sociales configuradas");
    } else {
      negocio.NegocioRRSS.forEach((red, index) => {
        console.log(`   ${index + 1}. ${red.plataforma}:`, {
          url: red.url,
          username: red.username,
          activo: red.activo,
          orden: red.orden,
        });
      });
    }

    // Verificar solo redes activas
    const redesActivas = negocio.NegocioRRSS.filter((red) => red.activo);
    console.log(`\n✅ Redes sociales activas: ${redesActivas.length}`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debugRedesSociales();
