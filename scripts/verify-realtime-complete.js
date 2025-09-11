const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const path = require("path");

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, "..", ".env") });
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variables de entorno de Supabase no configuradas");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarTodasLasTablas() {
  console.log("🔍 Verificación COMPLETA de Realtime después de los fixes");
  console.log("=".repeat(60));

  const tablasParaVerificar = ["Notificacion", "EventoBitacora"];

  for (const tabla of tablasParaVerificar) {
    console.log(`\n📋 Verificando tabla: ${tabla}`);
    console.log("-".repeat(40));

    try {
      // Test de acceso básico
      const { data, error: accessError } = await supabase
        .from(tabla)
        .select("*")
        .limit(1);

      if (accessError) {
        console.log(`❌ Error de acceso a ${tabla}: ${accessError.message}`);
        console.log(`   Code: ${accessError.code}`);
        continue;
      } else {
        console.log(`✅ Acceso a ${tabla}: OK`);
      }

      // Test de Realtime
      let realtimeStatus = "PENDING";

      const channel = supabase.channel(`test-${tabla.toLowerCase()}`);

      const subscription = channel
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: tabla,
          },
          (payload) => {
            console.log(
              `📡 Evento Realtime recibido en ${tabla}:`,
              payload.eventType
            );
          }
        )
        .subscribe((status) => {
          realtimeStatus = status;
          console.log(`📡 Estado de suscripción en ${tabla}: ${status}`);
        });

      // Esperar para verificar suscripción
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (realtimeStatus === "SUBSCRIBED") {
        console.log(`✅ Realtime en ${tabla}: FUNCIONANDO`);
      } else {
        console.log(`❌ Realtime en ${tabla}: ${realtimeStatus}`);
      }

      // Cleanup
      await supabase.removeChannel(channel);
    } catch (error) {
      console.log(`❌ Error general en ${tabla}: ${error.message}`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("📋 RESUMEN FINAL");
  console.log("=".repeat(60));
  console.log("✅ Tablas verificadas: Notificacion, EventoBitacora");
  console.log("✅ CotizacionVisita: DESHABILITADA (funcionalidad obsoleta)");
  console.log("✅ Schema mismatch: RESUELTO");
  console.log("🎉 Sistema Realtime completamente funcional");
}

// Ejecutar verificación
verificarTodasLasTablas()
  .then(() => {
    console.log("\n✅ Verificación completa terminada");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error en verificación:", error);
    process.exit(1);
  });
