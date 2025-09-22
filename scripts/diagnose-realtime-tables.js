#!/usr/bin/env node

/**
 * Script para diagnosticar problemas de Realtime en todas las tablas
 * Uso: node scripts/diagnose-realtime-tables.js
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

// Lista de tablas que se usan con Realtime en la app
const TABLAS_REALTIME = [
  "Notificacion",
  "EventoBitacora",
  "Cotizacion",
  "CotizacionServicio",
  "CotizacionCosto",
];

async function diagnosticarTablas() {
  console.log("🔍 Diagnosticando tablas con Realtime...\n");

  for (const tabla of TABLAS_REALTIME) {
    console.log(`📋 Tabla: ${tabla}`);
    console.log("─".repeat(50));

    try {
      // Test 1: Verificar acceso básico
      const { data, error, count } = await supabase
        .from(tabla)
        .select("*", { count: "exact", head: true });

      if (error) {
        console.log(`❌ Error de acceso: ${error.message}`);
        console.log(`   Code: ${error.code}`);
        console.log(`   Details: ${error.details}`);
        console.log(`   Hint: ${error.hint}`);
      } else {
        console.log(`✅ Acceso OK - ${count} registros`);
      }

      // Test 2: Test de suscripción básica
      console.log("🔄 Probando suscripción Realtime...");

      const testChannel = supabase
        .channel(`test-${tabla.toLowerCase()}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: tabla },
          (payload) => {
            console.log(`📡 Evento recibido en ${tabla}:`, payload);
          }
        );

      // Intentar suscribirse
      const subscriptionPromise = new Promise((resolve, reject) => {
        testChannel.subscribe((status, err) => {
          if (err) {
            reject(err);
          } else {
            resolve(status);
          }
        });
      });

      // Timeout después de 5 segundos
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Timeout de suscripción")), 5000);
      });

      try {
        const status = await Promise.race([
          subscriptionPromise,
          timeoutPromise,
        ]);
        console.log(`✅ Suscripción exitosa - Status: ${status}`);
      } catch (subscriptionError) {
        console.log(`❌ Error de suscripción: ${subscriptionError.message}`);

        // Detectar tipos específicos de error
        if (
          subscriptionError.message?.includes(
            "mismatch between server and client bindings"
          )
        ) {
          console.log(
            `🚨 PROBLEMA: Schema mismatch detectado en tabla ${tabla}`
          );
          console.log(
            `💡 SOLUCIÓN: Verificar políticas RLS y estructura de tabla`
          );
        }
      }

      // Limpiar el canal de test
      supabase.removeChannel(testChannel);
    } catch (globalError) {
      console.log(`❌ Error global en tabla ${tabla}: ${globalError.message}`);
    }

    console.log(); // Línea en blanco
  }

  // Resumen final
  console.log("📊 RESUMEN DE DIAGNÓSTICO");
  console.log("═".repeat(50));
  console.log("📋 Recomendaciones:");
  console.log(
    "1. Verificar políticas RLS con scripts/fix-notificacion-rls.sql"
  );
  console.log(
    "2. Confirmar que Realtime está habilitado en Supabase Dashboard"
  );
  console.log("3. Verificar estructura de tablas vs. bindings de cliente");
  console.log("4. Considerar usar polling como fallback temporal");
}

// Ejecutar diagnóstico
diagnosticarTablas().catch((error) => {
  console.error("❌ Error en diagnóstico:", error.message);
  process.exit(1);
});
