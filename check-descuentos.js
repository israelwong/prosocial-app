const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkDescuentos() {
  try {
    const condiciones = await prisma.condicionesComerciales.findMany({
      orderBy: { orden: "asc" },
    });

    console.log("🏷️ Verificando descuentos en condiciones comerciales:");

    condiciones.forEach((c, i) => {
      console.log(`${i + 1}. "${c.nombre}"`);
      console.log(`   - Status: ${c.status}`);
      console.log(
        `   - Descuento: ${c.descuento} (tipo: ${typeof c.descuento})`
      );
      console.log(
        `   - ¿Mostrará badge?: ${c.descuento && c.descuento > 0 ? "SÍ" : "NO"}`
      );
      console.log("");
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDescuentos();
