const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function desactivarPagoContado() {
  try {
    console.log('⚠️  Desactivando condición "Pago de contado"...\n');

    const resultado = await prisma.condicionesComerciales.update({
      where: {
        id: "cm6igsgii000tguakrozqox6j", // ID de "Pago de contado"
      },
      data: {
        status: "inactive",
      },
    });

    console.log("✅ Condición desactivada:", resultado.nombre);
    console.log("   Status:", resultado.status);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

desactivarPagoContado();
