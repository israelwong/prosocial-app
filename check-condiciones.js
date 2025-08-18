const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkCondiciones() {
  try {
    const condiciones = await prisma.condicionesComerciales.findMany({
      orderBy: { orden: "asc" },
    });

    console.log("🏪 Condiciones comerciales en DB:");
    console.log("Total encontradas:", condiciones.length);

    condiciones.forEach((c, i) => {
      console.log(`${i + 1}. ${c.nombre} - Status: ${c.status} - ID: ${c.id}`);
    });

    if (condiciones.length === 0) {
      console.log("❌ No hay condiciones comerciales en la base de datos");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCondiciones();
