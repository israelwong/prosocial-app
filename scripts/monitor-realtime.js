#!/usr/bin/env node

/**
 * Script para monitorear y limpiar conexiones Realtime de Supabase
 * Uso: node scripts/monitor-realtime.js
 */

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase URL or Anon Key in environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function monitorRealtime() {
  console.log("🔍 Verificando estado de conexiones Realtime...\n");

  const isConnected = supabase.realtime.isConnected();
  const channelCount = supabase.realtime.channels.length;

  console.log(
    `📡 Estado de conexión: ${isConnected ? "✅ Conectado" : "❌ Desconectado"}`
  );
  console.log(`📊 Número de canales activos: ${channelCount}`);

  if (channelCount > 0) {
    console.log("\n📋 Canales activos:");
    supabase.realtime.channels.forEach((channel, index) => {
      console.log(
        `  ${index + 1}. ${channel.topic} (Estado: ${channel.state})`
      );
    });
  }

  if (channelCount > 5) {
    console.log("\n⚠️  ADVERTENCIA: Demasiadas conexiones activas");
    console.log("💡 Considera limpiar conexiones huérfanas");

    if (process.argv.includes("--clean")) {
      console.log("\n🧹 Limpiando conexiones...");
      let cleaned = 0;
      supabase.realtime.channels.forEach((channel) => {
        supabase.removeChannel(channel);
        cleaned++;
      });
      console.log(`✅ Se limpiaron ${cleaned} conexiones`);
    } else {
      console.log(
        "\n💡 Para limpiar automáticamente, ejecuta: node scripts/monitor-realtime.js --clean"
      );
    }
  } else {
    console.log("\n✅ Estado de conexiones saludable");
  }

  process.exit(0);
}

// Ejecutar monitoreo
monitorRealtime().catch((error) => {
  console.error("❌ Error al monitorear Realtime:", error.message);
  process.exit(1);
});
