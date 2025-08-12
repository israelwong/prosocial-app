// Test para verificar valores de configuración
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const config = await prisma.configuracion.findFirst({
    where: { status: "active" },
  });

  console.log("Configuración activa:", config);

  if (config) {
    console.log("\nValores como están en BD:");
    console.log("utilidad_servicio:", config.utilidad_servicio);
    console.log("comision_venta:", config.comision_venta);
    console.log("sobreprecio:", config.sobreprecio);

    console.log("\nValores como porcentajes:");
    console.log("utilidad_servicio:", config.utilidad_servicio * 100 + "%");
    console.log("comision_venta:", config.comision_venta * 100 + "%");
    console.log("sobreprecio:", config.sobreprecio * 100 + "%");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
