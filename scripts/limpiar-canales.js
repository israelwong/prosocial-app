#!/usr/bin/env node

/**
 * Script para limpiar datos corruptos relacionados con canales
 * Uso: node scripts/limpiar-canales.js
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function limpiarDatos() {
  try {
    console.log("🧹 Iniciando limpieza de datos de canales...\n");

    // 1. Encontrar clientes con canalId que no corresponde a ningún canal existente
    console.log("1. 🔍 Buscando clientes con canales inválidos...");

    const clientesProblematicos = await prisma.cliente.findMany({
      where: {
        canalId: {
          not: null,
        },
        Canal: null,
      },
      select: {
        id: true,
        nombre: true,
        canalId: true,
      },
    });

    if (clientesProblematicos.length > 0) {
      console.log(
        `   ⚠️  Encontrados ${clientesProblematicos.length} clientes con canales inválidos:`
      );
      clientesProblematicos.forEach((cliente, index) => {
        console.log(
          `   ${index + 1}. ${cliente.nombre} (ID: ${cliente.id}, canalId: ${cliente.canalId})`
        );
      });

      // Preguntar confirmación para limpieza automática
      console.log("\n2. 🔧 Aplicando corrección automática...");

      const resultado = await prisma.cliente.updateMany({
        where: {
          id: {
            in: clientesProblematicos.map((c) => c.id),
          },
        },
        data: {
          canalId: null,
        },
      });

      console.log(
        `   ✅ Se corrigieron ${resultado.count} registros de clientes.`
      );
    } else {
      console.log("   ✅ No se encontraron clientes con canales inválidos.");
    }

    // 2. Verificar integridad después de la limpieza
    console.log("\n3. 🔍 Verificando integridad después de la limpieza...");

    const verificacion = await prisma.cliente.findMany({
      where: {
        AND: [{ canalId: { not: null } }, { Canal: null }],
      },
    });

    if (verificacion.length === 0) {
      console.log("   ✅ Todos los datos están limpios ahora.");
    } else {
      console.log(
        `   ❌ Aún hay ${verificacion.length} registros problemáticos.`
      );
    }

    // 3. Mostrar estadísticas
    console.log("\n4. 📊 Estadísticas finales:");

    const totalClientes = await prisma.cliente.count();
    const clientesConCanal = await prisma.cliente.count({
      where: { canalId: { not: null } },
    });
    const clientesSinCanal = totalClientes - clientesConCanal;

    console.log(`   Total de clientes: ${totalClientes}`);
    console.log(`   Con canal: ${clientesConCanal}`);
    console.log(`   Sin canal: ${clientesSinCanal}`);

    console.log("\n🎉 Limpieza completada exitosamente!");
  } catch (error) {
    console.error("❌ Error durante la limpieza:", error.message);
    console.error("Stack trace:", error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Función para mostrar canales disponibles
async function mostrarCanalesDisponibles() {
  try {
    console.log("📋 Canales disponibles en el sistema:\n");

    const canales = await prisma.canal.findMany({
      orderBy: { nombre: "asc" },
    });

    if (canales.length === 0) {
      console.log("❌ No hay canales en el sistema.");
    } else {
      canales.forEach((canal, index) => {
        console.log(`${index + 1}. ${canal.nombre} (ID: ${canal.id})`);
      });
    }
  } catch (error) {
    console.error("❌ Error al obtener canales:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Verificar argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.includes("--canales")) {
  mostrarCanalesDisponibles();
} else {
  limpiarDatos();
}
