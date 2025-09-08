#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Función para encontrar todos los archivos TypeScript/JavaScript
function findFiles(dir, extensions = [".ts", ".tsx", ".js", ".jsx"]) {
  const files = [];

  function walk(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        // Evitar node_modules y .next
        if (!["node_modules", ".next", ".git"].includes(entry.name)) {
          walk(fullPath);
        }
      } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

// Función para actualizar imports en un archivo
function updateImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");

    // Patrón para encontrar imports de @/app/ui/main
    const oldPattern = /@\/app\/ui\/main/g;
    const newPath = "@/app/components/main";

    if (oldPattern.test(content)) {
      console.log(`📝 Actualizando: ${filePath}`);
      const updatedContent = content.replace(oldPattern, newPath);
      fs.writeFileSync(filePath, updatedContent, "utf8");
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return false;
  }
}

// Script principal
function main() {
  console.log(
    "🚀 Iniciando migración de imports @/app/ui/main → @/app/components/main"
  );
  console.log("");

  const projectRoot = path.resolve(__dirname, "..");
  const appDir = path.join(projectRoot, "app");

  // Encontrar todos los archivos
  console.log("🔍 Buscando archivos para actualizar...");
  const files = findFiles(appDir);
  console.log(`📁 Encontrados ${files.length} archivos`);
  console.log("");

  // Actualizar imports
  let updatedCount = 0;

  for (const filePath of files) {
    if (updateImports(filePath)) {
      updatedCount++;
    }
  }

  console.log("");
  console.log("✅ Migración completada!");
  console.log(`📊 Archivos actualizados: ${updatedCount}`);
  console.log(`📊 Total archivos revisados: ${files.length}`);

  // Verificar que no queden referencias antiguas
  console.log("");
  console.log("🔍 Verificando que no queden referencias antiguas...");

  let remainingRefs = 0;
  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      if (content.includes("@/app/ui/main")) {
        console.log(`⚠️  Referencia pendiente en: ${filePath}`);
        remainingRefs++;
      }
    } catch (error) {
      // Ignorar errores de lectura
    }
  }

  if (remainingRefs === 0) {
    console.log("✅ No se encontraron referencias antiguas");
  } else {
    console.log(`❌ Quedan ${remainingRefs} referencias por actualizar`);
  }

  console.log("");
  console.log("🎯 Migración de estructura completada");
  console.log("📁 Estructura nueva: app/components/main/");
  console.log("📦 Imports actualizados: @/app/components/main");
}

// Ejecutar script
main();
