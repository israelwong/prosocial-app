/**
 * Script para insertar métodos de pago con comisiones
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seedMetodosPago() {
  try {
    console.log("🌱 Seeding métodos de pago...");

    // Eliminar métodos existentes (opcional)
    // await prisma.metodoPago.deleteMany()

    // Insertar métodos de pago
    const metodosParaInsertar = [
      {
        metodo_pago: "Tarjeta de Crédito/Débito",
        comision_porcentaje_base: 3.6, // 3.6%
        comision_fija_monto: 0,
        num_msi: null,
        comision_msi_porcentaje: null,
        orden: 1,
        payment_method: "card",
        status: "active",
      },
      {
        metodo_pago: "Transferencia SPEI",
        comision_porcentaje_base: 0, // Sin comisión
        comision_fija_monto: 0,
        num_msi: null,
        comision_msi_porcentaje: null,
        orden: 2,
        payment_method: "customer_balance",
        status: "active",
      },
    ];

    for (const metodo of metodosParaInsertar) {
      // Verificar si ya existe
      const existente = await prisma.metodoPago.findFirst({
        where: {
          metodo_pago: metodo.metodo_pago,
        },
      });

      if (!existente) {
        const resultado = await prisma.metodoPago.create({
          data: metodo,
        });
        console.log(
          `✅ Creado: ${resultado.metodo_pago} (${resultado.comision_porcentaje_base}%)`
        );
      } else {
        // Actualizar comisiones si ya existe
        const actualizado = await prisma.metodoPago.update({
          where: { id: existente.id },
          data: {
            comision_porcentaje_base: metodo.comision_porcentaje_base,
            comision_fija_monto: metodo.comision_fija_monto,
            payment_method: metodo.payment_method,
          },
        });
        console.log(
          `🔄 Actualizado: ${actualizado.metodo_pago} (${actualizado.comision_porcentaje_base}%)`
        );
      }
    }

    // Mostrar todos los métodos existentes
    const metodos = await prisma.metodoPago.findMany({
      where: { status: "active" },
      orderBy: { orden: "asc" },
    });

    console.log("\n📋 Métodos de pago en BD:");
    metodos.forEach((metodo) => {
      console.log(
        `  - ${metodo.metodo_pago}: ${metodo.comision_porcentaje_base}% + $${metodo.comision_fija_monto} (${metodo.payment_method})`
      );
    });

    console.log("\n✅ Seed completado exitosamente!");
  } catch (error) {
    console.error("❌ Error en seed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedMetodosPago();
