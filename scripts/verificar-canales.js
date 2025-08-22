#!/usr/bin/env node

/**
 * Script para verificar los canales existentes en la base de datos
 * Uso: node scripts/verificar-canales.js
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function verificarCanales() {
  try {
    console.log("🔍 Verificando canales en la base de datos...\n");

    const canales = await prisma.canal.findMany({
      orderBy: {
        nombre: "asc",
      },
    });

    if (canales.length === 0) {
      console.log("❌ No se encontraron canales en la base de datos.");
      console.log("💡 Considere crear algunos canales básicos:");
      console.log("   - Redes sociales");
      console.log("   - Referencia");
      console.log("   - Sitio web");
      console.log("   - Email marketing");
    } else {
      console.log(`✅ Se encontraron ${canales.length} canales:\n`);
      canales.forEach((canal, index) => {
        console.log(`${index + 1}. ${canal.nombre} (ID: ${canal.id})`);
      });
    }

    // Verificar clientes con canalId inválido
    console.log("\n🔍 Verificando clientes con canales inválidos...\n");

    const clientesConCanalInvalido = await prisma.cliente.findMany({
      where: {
        AND: [{ canalId: { not: null } }, { Canal: null }],
      },
      select: {
        id: true,
        nombre: true,
        canalId: true,
      },
    });

    if (clientesConCanalInvalido.length > 0) {
      console.log(
        `❌ Se encontraron ${clientesConCanalInvalido.length} clientes con canales inválidos:`
      );
      clientesConCanalInvalido.forEach((cliente, index) => {
        console.log(
          `${index + 1}. ${cliente.nombre} (ID: ${cliente.id}, canalId: ${cliente.canalId})`
        );
      });
      console.log("\n💡 Considere limpiar estos datos usando:");
      console.log(
        '   UPDATE "Cliente" SET "canalId" = NULL WHERE "canalId" NOT IN (SELECT id FROM "Canal");'
      );
    } else {
      console.log("✅ Todos los clientes tienen canales válidos.");
    }
  } catch (error) {
    console.error("❌ Error al verificar canales:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Función para crear canales básicos
async function crearCanalesBasicos() {
  try {
    console.log("🚀 Creando canales básicos...\n");

    const canalesBasicos = [
      { nombre: "Redes sociales", posicion: 1 },
      { nombre: "Referencia", posicion: 2 },
      { nombre: "Sitio web", posicion: 3 },
      { nombre: "Email marketing", posicion: 4 },
      { nombre: "Teléfono directo", posicion: 5 },
    ];

    for (const canal of canalesBasicos) {
      const canalExistente = await prisma.canal.findFirst({
        where: { nombre: canal.nombre },
      });

      if (!canalExistente) {
        await prisma.canal.create({
          data: canal,
        });
        console.log(`✅ Canal creado: ${canal.nombre}`);
      } else {
        console.log(`ℹ️  Canal ya existe: ${canal.nombre}`);
      }
    }

    console.log("\n🎉 Proceso completado!");
  } catch (error) {
    console.error("❌ Error al crear canales:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Verificar argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.includes("--crear")) {
  crearCanalesBasicos();
} else {
  verificarCanales();
}
