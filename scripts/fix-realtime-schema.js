#!/usr/bin/env node

/**
 * Script para solucionar problemas de schema mismatch en Supabase Realtime
 * Uso: node scripts/fix-realtime-schema.js
 */

require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase URL or Anon Key in environment variables");
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL:",
    supabaseUrl ? "✅ Set" : "❌ Missing"
  );
  console.error(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY:",
    supabaseAnonKey ? "✅ Set" : "❌ Missing"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixRealtimeSchema() {
  console.log(
    "🔧 Arreglando problemas de schema mismatch en Supabase Realtime...\n"
  );

  try {
    // 1. Limpiar todas las conexiones existentes
    console.log("🧹 Limpiando conexiones Realtime existentes...");
    const channels = supabase.realtime.channels;
    console.log(`📊 Encontradas ${channels.length} conexiones activas`);

    channels.forEach((channel, index) => {
      console.log(`  - Cerrando canal ${index + 1}: ${channel.topic}`);
      supabase.removeChannel(channel);
    });

    // 2. Desconectar el cliente realtime
    console.log("\n🔌 Desconectando cliente Realtime...");
    await supabase.realtime.disconnect();

    // 3. Esperar un momento para la limpieza
    console.log("⏳ Esperando 3 segundos para la limpieza...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // 4. Reconectar el cliente
    console.log("🔄 Reconectando cliente Realtime...");
    await supabase.realtime.connect();

    // 5. Verificar el estado final
    console.log("\n✅ Verificación final:");
    const finalChannels = supabase.realtime.channels;
    const isConnected = supabase.realtime.isConnected();

    console.log(
      `📡 Estado de conexión: ${isConnected ? "✅ Conectado" : "❌ Desconectado"}`
    );
    console.log(`📊 Canales activos: ${finalChannels.length}`);

    if (isConnected && finalChannels.length === 0) {
      console.log(
        "\n🎉 ¡Schema mismatch solucionado! El cliente Realtime está limpio y conectado."
      );
    } else {
      console.log(
        "\n⚠️ Puede que aún haya problemas. Revisa las conexiones manualmente."
      );
    }
  } catch (error) {
    console.error("❌ Error al arreglar schema mismatch:", error.message);
    process.exit(1);
  }
}

// Ejecutar el fix
fixRealtimeSchema().catch((error) => {
  console.error("❌ Error fatal:", error.message);
  process.exit(1);
});
