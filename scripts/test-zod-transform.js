#!/usr/bin/env node

/**
 * Test para verificar que la transformación de Zod funciona correctamente
 */

const { z } = require("zod");

// Schema idéntico al que estamos usando
const TestSchema = z.object({
  nombre: z.string(),
  canalId: z
    .string()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
});

console.log("🧪 Probando transformación de Zod...\n");

// Test 1: Con cadena vacía
try {
  const result1 = TestSchema.parse({
    nombre: "Test",
    canalId: "",
  });
  console.log("✅ Test 1 (cadena vacía):");
  console.log('  Input: canalId = ""');
  console.log("  Output:", result1.canalId);
  console.log("  Type:", typeof result1.canalId);
  console.log("  Is null:", result1.canalId === null);
} catch (error) {
  console.error("❌ Test 1 failed:", error.message);
}

console.log();

// Test 2: Con null
try {
  const result2 = TestSchema.parse({
    nombre: "Test",
    canalId: null,
  });
  console.log("✅ Test 2 (null):");
  console.log("  Input: canalId = null");
  console.log("  Output:", result2.canalId);
  console.log("  Type:", typeof result2.canalId);
  console.log("  Is null:", result2.canalId === null);
} catch (error) {
  console.error("❌ Test 2 failed:", error.message);
}

console.log();

// Test 3: Con ID válido
try {
  const result3 = TestSchema.parse({
    nombre: "Test",
    canalId: "cm3xmlumv000anoqpt82ene90",
  });
  console.log("✅ Test 3 (ID válido):");
  console.log('  Input: canalId = "cm3xmlumv000anoqpt82ene90"');
  console.log("  Output:", result3.canalId);
  console.log("  Type:", typeof result3.canalId);
  console.log("  Is null:", result3.canalId === null);
} catch (error) {
  console.error("❌ Test 3 failed:", error.message);
}
