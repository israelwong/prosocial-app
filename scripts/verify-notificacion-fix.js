#!/usr/bin/env node

/**
 * Script para verificar el estado de la tabla Notificacion después del fix RLS
 * Uso: node scripts/verify-notificacion-fix.js
 */

require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase URL or Anon Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verificarNotificacion() {
  console.log("🔍 Verificando tabla Notificacion después del fix RLS...\n");

  try {
    // Test 1: Verificar acceso básico a la tabla
    console.log("📋 Test 1: Acceso básico a la tabla");
    console.log("─".repeat(40));

    const { data, error, count } = await supabase
      .from("Notificacion")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.log(`❌ Error de acceso: ${error.message}`);
      console.log(`   Code: ${error.code}`);
      console.log(`   Details: ${error.details}`);
      return;
    } else {
      console.log(`✅ Acceso OK - ${count || 0} registros en la tabla`);
    }

    // Test 2: Test rápido de Realtime
    console.log("\n🔄 Test 2: Suscripción Realtime");
    console.log("─".repeat(40));

    let subscriptionSuccess = false;
    let subscriptionError = null;

    const testChannel = supabase
      .channel("test-notificacion-fix")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Notificacion" },
        (payload) => {
          console.log(`📡 Evento Realtime recibido:`, payload.eventType);
        }
      );

    // Crear promesa para la suscripción
    const subscriptionPromise = new Promise((resolve, reject) => {
      testChannel.subscribe((status, err) => {
        if (err) {
          subscriptionError = err;
          reject(err);
        } else {
          subscriptionSuccess = true;
          resolve(status);
        }
      });
    });

    // Timeout de 8 segundos
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Timeout")), 8000);
    });

    try {
      const status = await Promise.race([subscriptionPromise, timeoutPromise]);
      console.log(`✅ Suscripción Realtime exitosa - Status: ${status}`);
      console.log(`✅ Schema mismatch solucionado!`);
    } catch (err) {
      if (err.message === "Timeout") {
        console.log(
          `⚠️ Timeout en suscripción (puede ser normal si no hay tráfico)`
        );
        if (subscriptionSuccess) {
          console.log(`✅ Pero la suscripción se estableció correctamente`);
        }
      } else {
        console.log(`❌ Error en suscripción: ${err.message}`);
        if (
          err.message?.includes("mismatch between server and client bindings")
        ) {
          console.log(`🚨 PROBLEMA: Schema mismatch aún presente`);
          console.log(
            `💡 SOLUCIÓN: Verificar que Realtime esté habilitado en Supabase Dashboard`
          );
        }
      }
    }

    // Limpiar
    supabase.removeChannel(testChannel);

    // Resultado final
    console.log("\n📊 RESULTADO DEL DIAGNÓSTICO");
    console.log("═".repeat(50));

    if (!error && subscriptionSuccess) {
      console.log("🎉 ¡TODO CORRECTO!");
      console.log("✅ Tabla accesible");
      console.log("✅ Realtime funcionando");
      console.log("💡 Puedes reactivar ENABLE_NOTIFICACIONES_REALTIME = true");
    } else if (!error) {
      console.log("⚠️ PARCIALMENTE CORRECTO");
      console.log("✅ Tabla accesible");
      console.log("❌ Realtime con problemas");
      console.log(
        "💡 Verificar que Realtime esté habilitado en Supabase Dashboard"
      );
    } else {
      console.log("❌ PROBLEMAS DETECTADOS");
      console.log("❌ Políticas RLS aún tienen problemas");
      console.log("💡 Revisar políticas en Supabase Dashboard");
    }
  } catch (globalError) {
    console.log(`❌ Error global: ${globalError.message}`);
  }
}

// Ejecutar verificación
verificarNotificacion().catch((error) => {
  console.error("❌ Error en verificación:", error.message);
  process.exit(1);
});
