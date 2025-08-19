const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function verificarMetodosPago() {
  console.log("🔍 Verificando métodos de pago disponibles...\n");

  try {
    // Verificar condiciones comerciales
    const condiciones = await prisma.condicionesComerciales.findMany({
      include: {
        CondicionesComercialesMetodoPago: {
          include: {
            MetodoPago: true,
          },
        },
      },
    });

    console.log("📋 Condiciones comerciales encontradas:");
    condiciones.forEach((condicion) => {
      console.log(`\n- ${condicion.nombre} (ID: ${condicion.id})`);

      if (condicion.CondicionesComercialesMetodoPago.length > 0) {
        console.log("  Métodos de pago:");
        condicion.CondicionesComercialesMetodoPago.forEach((metodo) => {
          console.log(`    • ${metodo.MetodoPago.nombre} (ID: ${metodo.id})`);
          console.log(`      Clave: ${metodo.MetodoPago.metodo_pago_clave}`);
          console.log(`      MSI: ${metodo.num_msi || 0}`);
        });
      } else {
        console.log("  No hay métodos de pago configurados");
      }
    });

    // Verificar específicamente el ID problemático
    console.log("\n🔍 Verificando ID específico: cm41rf0t60003j1l1gxkw2dxq");
    const metodoProblematicoResult =
      await prisma.condicionesComercialesMetodoPago.findUnique({
        where: { id: "cm41rf0t60003j1l1gxkw2dxq" },
        include: {
          MetodoPago: true,
        },
      });

    if (metodoProblematicoResult) {
      console.log("✅ ID encontrado:", metodoProblematicoResult);
    } else {
      console.log("❌ ID no encontrado en la base de datos");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarMetodosPago();
