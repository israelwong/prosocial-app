const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function crearRelacionesFaltantes() {
  try {
    console.log("🔧 Iniciando creación de relaciones faltantes...");

    // Métodos de pago principales que deben estar disponibles para autorización
    const metodosBasicos = [
      "cm5fznj2z000ggu700dvpkw1p", // Transferencia directa
      "cm5povit50002guopj9jphrna", // Depósito bancario
      "cm41r1whx0000j1l1k6hpbdwb", // Efectivo
    ];

    // Obtener todas las condiciones comerciales activas
    const condiciones = await prisma.condicionesComerciales.findMany({
      where: { status: "active" },
    });

    console.log(
      `📋 Encontradas ${condiciones.length} condiciones comerciales activas`
    );

    let relacionesCreadas = 0;
    let relacionesExistentes = 0;

    for (const condicion of condiciones) {
      console.log(`\n🔄 Procesando: ${condicion.nombre}`);

      for (const metodoPagoId of metodosBasicos) {
        // Verificar si ya existe la relación
        const relacionExistente =
          await prisma.condicionesComercialesMetodoPago.findFirst({
            where: {
              condicionesComercialesId: condicion.id,
              metodoPagoId: metodoPagoId,
            },
          });

        if (relacionExistente) {
          console.log(`  ✅ Relación existente con método ${metodoPagoId}`);
          relacionesExistentes++;
        } else {
          // Crear la relación faltante
          await prisma.condicionesComercialesMetodoPago.create({
            data: {
              condicionesComercialesId: condicion.id,
              metodoPagoId: metodoPagoId,
              orden: metodosBasicos.indexOf(metodoPagoId),
              status: "active",
            },
          });
          console.log(`  🆕 Relación creada con método ${metodoPagoId}`);
          relacionesCreadas++;
        }
      }
    }

    console.log(`\n✅ Proceso completado:`);
    console.log(`   - Relaciones existentes: ${relacionesExistentes}`);
    console.log(`   - Relaciones creadas: ${relacionesCreadas}`);
    console.log(
      `   - Total relaciones: ${relacionesExistentes + relacionesCreadas}`
    );

    // Verificar la relación específica que estaba fallando
    const relacionEspecifica =
      await prisma.condicionesComercialesMetodoPago.findFirst({
        where: {
          condicionesComercialesId: "cm6igsgii000tguakrozqox6j",
          metodoPagoId: "cm5fznj2z000ggu700dvpkw1p",
        },
        include: {
          CondicionesComerciales: { select: { nombre: true } },
          MetodoPago: { select: { metodo_pago: true } },
        },
      });

    if (relacionEspecifica) {
      console.log(`\n🎯 Relación específica verificada:`);
      console.log(
        `   - Condición: ${relacionEspecifica.CondicionesComerciales.nombre}`
      );
      console.log(`   - Método: ${relacionEspecifica.MetodoPago.metodo_pago}`);
      console.log(`   - ID Relación: ${relacionEspecifica.id}`);
    } else {
      console.log(`\n❌ La relación específica aún no existe`);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

crearRelacionesFaltantes();
