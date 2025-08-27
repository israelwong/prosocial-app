const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function consultarCondicionesComerciales() {
  try {
    console.log("🔍 === CONSULTANDO CONDICIONES COMERCIALES ===\n");

    const condiciones = await prisma.condicionesComerciales.findMany({
      include: {
        CondicionesComercialesMetodoPago: {
          include: {
            MetodoPago: true,
          },
        },
      },
    });

    condiciones.forEach((condicion, index) => {
      console.log(`📋 CONDICIÓN ${index + 1}:`);
      console.log(`   ID: ${condicion.id}`);
      console.log(`   Nombre: ${condicion.nombre}`);
      console.log(`   Descripción: ${condicion.descripcion || "N/A"}`);
      console.log(`   📊 Descuento: ${condicion.descuento || 0}%`);
      console.log(
        `   💰 Porcentaje anticipo: ${condicion.porcentaje_anticipo || 0}%`
      );
      console.log(`   Status: ${condicion.status}`);

      if (condicion.CondicionesComercialesMetodoPago.length > 0) {
        console.log(`   💳 MÉTODOS DE PAGO ASOCIADOS:`);
        condicion.CondicionesComercialesMetodoPago.forEach((metodo, idx) => {
          console.log(
            `      ${idx + 1}. ${metodo.MetodoPago?.metodo_pago || "N/A"}`
          );
          console.log(
            `         - Payment Method: ${metodo.MetodoPago?.payment_method || "N/A"}`
          );
          console.log(
            `         - Comisión Base: ${metodo.MetodoPago?.comision_porcentaje_base || 0}%`
          );
          console.log(`         - MSI: ${metodo.MetodoPago?.num_msi || 0}`);
        });
      }
      console.log("---\n");
    });

    // Buscar específicamente condiciones con descuento
    const condicionesConDescuento = condiciones.filter((c) => c.descuento > 0);

    if (condicionesConDescuento.length > 0) {
      console.log("⚠️  === CONDICIONES CON DESCUENTO ===\n");
      condicionesConDescuento.forEach((condicion) => {
        console.log(
          `🎯 ${condicion.nombre}: ${condicion.descuento}% de descuento`
        );
        console.log(`   Status: ${condicion.status}`);
        console.log(
          `   Métodos asociados: ${condicion.CondicionesComercialesMetodoPago.map((m) => m.MetodoPago?.metodo_pago).join(", ")}\n`
        );
      });
    }

    console.log("✅ Consulta completada");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

consultarCondicionesComerciales();
