#!/usr/bin/env node

/**
 * Test específico para probar la función actualizarCliente
 */

const path = require("path");

// Configurar el entorno para que funcione como en Next.js
process.env.NODE_ENV = "development";

// Importar dinámicamente para usar ES modules
async function testActualizarCliente() {
  try {
    console.log("🧪 Probando función actualizarCliente...\n");

    // Simular importación de ES module (esto es un poco hacky pero funcional)
    const { execSync } = require("child_process");

    // En su lugar, vamos a crear un test simple usando el esquema directamente
    const { z } = require("zod");

    // Recrear el schema con la lógica actualizada
    const ActualizarClienteSchema = z.object({
      id: z.string().min(1, "ID es requerido"),
      nombre: z.string().min(1, "Nombre es requerido"),
      telefono: z.string().nullable(),
      email: z.string().email("Email inválido").or(z.literal("")).nullable(),
      direccion: z.string().nullable(),
      status: z.string(),
      canalId: z
        .string()
        .nullable()
        .transform((val) => {
          // Convertir cadenas vacías, espacios en blanco, o valores inválidos a null
          if (
            !val ||
            val.trim() === "" ||
            val === "null" ||
            val === "undefined"
          ) {
            return null;
          }
          return val.trim();
        }),
    });

    // Test cases que podrían estar causando el problema
    const testCases = [
      {
        name: "Test 1: Cadena vacía en canalId",
        data: {
          id: "test-id",
          nombre: "Test User",
          telefono: "1234567890",
          email: "test@example.com",
          direccion: "Test Address",
          status: "activo",
          canalId: "",
        },
      },
      {
        name: "Test 2: null en canalId",
        data: {
          id: "test-id",
          nombre: "Test User",
          telefono: "1234567890",
          email: "test@example.com",
          direccion: "Test Address",
          status: "activo",
          canalId: null,
        },
      },
      {
        name: "Test 3: undefined en canalId",
        data: {
          id: "test-id",
          nombre: "Test User",
          telefono: "1234567890",
          email: "test@example.com",
          direccion: "Test Address",
          status: "activo",
          canalId: undefined,
        },
      },
      {
        name: "Test 4: ID válido en canalId",
        data: {
          id: "test-id",
          nombre: "Test User",
          telefono: "1234567890",
          email: "test@example.com",
          direccion: "Test Address",
          status: "activo",
          canalId: "cm3xmlumv000anoqpt82ene90",
        },
      },
      {
        name: "Test 5: Espacio en blanco en canalId",
        data: {
          id: "test-id",
          nombre: "Test User",
          telefono: "1234567890",
          email: "test@example.com",
          direccion: "Test Address",
          status: "activo",
          canalId: " ",
        },
      },
    ];

    for (const testCase of testCases) {
      console.log(`${testCase.name}:`);
      console.log(
        `  Input canalId: ${JSON.stringify(testCase.data.canalId)} (type: ${typeof testCase.data.canalId})`
      );

      try {
        const result = ActualizarClienteSchema.parse(testCase.data);
        console.log(
          `  Output canalId: ${JSON.stringify(result.canalId)} (type: ${typeof result.canalId})`
        );
        console.log(`  Is null: ${result.canalId === null}`);
        console.log(`  Is empty string: ${result.canalId === ""}`);
        console.log("  ✅ PASSED\n");
      } catch (error) {
        console.log(`  ❌ FAILED: ${error.message}\n`);
      }
    }

    console.log("🔍 Ahora probando casos problemáticos específicos...\n");

    // Casos que podrían estar enviándose desde el frontend
    const problematicCases = [
      { canalId: "0" },
      { canalId: "null" },
      { canalId: "undefined" },
      { canalId: false },
      { canalId: 0 },
    ];

    for (const problematicCase of problematicCases) {
      console.log(
        `Testing problematic case: ${JSON.stringify(problematicCase.canalId)}`
      );
      try {
        const testData = {
          id: "test-id",
          nombre: "Test User",
          telefono: "1234567890",
          email: "test@example.com",
          direccion: "Test Address",
          status: "activo",
          ...problematicCase,
        };

        const result = ActualizarClienteSchema.parse(testData);
        console.log(
          `  Result: ${JSON.stringify(result.canalId)} (${typeof result.canalId})`
        );
        console.log("  ✅ PASSED\n");
      } catch (error) {
        console.log(`  ❌ FAILED: ${error.message}\n`);
      }
    }
  } catch (error) {
    console.error("❌ Error en el test:", error.message);
  }
}

testActualizarCliente();
