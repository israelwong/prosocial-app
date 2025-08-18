const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkAllFields() {
  try {
    const condiciones = await prisma.condicionesComerciales.findMany({
      orderBy: { orden: "asc" },
    });

    console.log("🔍 Verificando TODOS los campos de condiciones comerciales:");

    condiciones.forEach((c, i) => {
      console.log(`\n${i + 1}. "${c.nombre}"`);
      console.log(`   - ID: ${c.id}`);
      console.log(`   - Status: ${c.status}`);
      console.log(
        `   - Descuento: ${c.descuento} (tipo: ${typeof c.descuento})`
      );
      console.log(`   - Descripción completa: "${c.descripcion}"`);
      console.log(`   - Descripción JSON: ${JSON.stringify(c.descripcion)}`);
      console.log(
        `   - Primer carácter de descripción: "${c.descripcion ? c.descripcion[0] : "N/A"}"`
      );
      console.log(
        `   - Longitud descripción: ${c.descripcion ? c.descripcion.length : 0}`
      );
      console.log(`   - Porcentaje anticipo: ${c.porcentaje_anticipo}`);
      console.log(`   - Orden: ${c.orden}`);
      console.log(`   - Created at: ${c.createdAt}`);
      console.log(`   - Updated at: ${c.updatedAt}`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllFields();
