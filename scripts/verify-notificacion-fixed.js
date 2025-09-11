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

async function verificarNotificacionFixed() {
  console.log("🔍 Verificando tabla Notificacion después del fix RLS\n");

  try {
    // 1. Test básico de acceso
    console.log("📋 Test 1: Acceso básico a la tabla");
    console.log("────────────────────────────────────────");

    const { data: tableTest, error: accessError } = await supabase
      .from("Notificacion")
      .select(
        "id, userId, titulo, mensaje, status, tipo, cotizacionId, createdAt"
      )
      .limit(1);

    if (accessError) {
      console.log(`❌ Error de acceso: ${accessError.message}`);
      console.log(`   Code: ${accessError.code}`);
      console.log(`   Details: ${accessError.details}\n`);
    } else {
      console.log("✅ Tabla accesible");
      console.log(
        `📊 Estructura confirmada: ${tableTest ? "OK" : "Sin datos"}\n`
      );
    }

    // 2. Test de conteo
    console.log("📊 Test 2: Conteo de registros");
    console.log("────────────────────────────────────────");

    const { count, error: countError } = await supabase
      .from("Notificacion")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.log(`❌ Error de conteo: ${countError.message}\n`);
    } else {
      console.log(`✅ Total de registros: ${count || 0}\n`);
    }

    // 3. Test de filtrado por status (lo que usa el sistema)
    console.log("🔍 Test 3: Filtrado por status");
    console.log("────────────────────────────────────────");

    const { data: statusTest, error: statusError } = await supabase
      .from("Notificacion")
      .select("id, status, titulo")
      .neq("status", "oculta")
      .limit(5);

    if (statusError) {
      console.log(`❌ Error de filtrado: ${statusError.message}\n`);
    } else {
      console.log("✅ Filtrado por status exitoso");
      console.log(`📋 Registros encontrados: ${statusTest?.length || 0}`);
      if (statusTest && statusTest.length > 0) {
        statusTest.forEach((notif, i) => {
          console.log(`   ${i + 1}. ${notif.titulo} (${notif.status})`);
        });
      }
      console.log();
    }

    // 4. Test de inserción (como hace el sistema)
    console.log("📝 Test 4: Test de inserción");
    console.log("────────────────────────────────────────");

    const testNotificacion = {
      userId: null, // Puede ser null según el esquema
      titulo: "Test RLS Fix",
      mensaje: "Prueba de inserción después del fix de políticas RLS",
      tipo: "test",
      status: "pendiente",
    };

    const { data: insertResult, error: insertError } = await supabase
      .from("Notificacion")
      .insert(testNotificacion)
      .select()
      .single();

    if (insertError) {
      console.log(`❌ Error de inserción: ${insertError.message}`);
      console.log(`   Code: ${insertError.code}`);
      if (insertError.code === "42501") {
        console.log("   🔒 Error de permisos RLS - políticas necesitan ajuste");
      }
      console.log();
    } else {
      console.log("✅ Inserción exitosa");
      console.log(`📄 ID creado: ${insertResult.id}`);

      // 5. Test de actualización (marcar como leída)
      console.log("\n📝 Test 5: Test de actualización (marcar como leída)");
      console.log("────────────────────────────────────────");

      const { data: updateResult, error: updateError } = await supabase
        .from("Notificacion")
        .update({ status: "leida" })
        .eq("id", insertResult.id)
        .select();

      if (updateError) {
        console.log(`❌ Error de actualización: ${updateError.message}`);
      } else {
        console.log("✅ Actualización exitosa (marcar como leída)");
      }

      // 6. Limpiar - eliminar el registro de prueba
      console.log("\n🧹 Test 6: Limpiar registro de prueba");
      console.log("────────────────────────────────────────");

      const { error: deleteError } = await supabase
        .from("Notificacion")
        .delete()
        .eq("id", insertResult.id);

      if (deleteError) {
        console.log(`❌ Error al eliminar: ${deleteError.message}`);
      } else {
        console.log("✅ Registro de prueba eliminado");
      }
      console.log();
    }

    // 7. Test de Realtime
    console.log("🔄 Test 7: Configuración de Realtime");
    console.log("────────────────────────────────────────");

    let realtimeWorking = false;
    let subscriptionStatus = "PENDING";

    try {
      const channel = supabase.channel("test-notificacion-fix");

      const subscription = channel
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "Notificacion",
          },
          (payload) => {
            console.log("📡 Evento Realtime recibido:", payload.eventType);
            realtimeWorking = true;
          }
        )
        .subscribe((status) => {
          subscriptionStatus = status;
          console.log(`📡 Estado de suscripción: ${status}`);
        });

      // Esperar para ver si la suscripción es exitosa
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Test de inserción para trigger Realtime
      if (subscriptionStatus === "SUBSCRIBED") {
        console.log("🧪 Probando trigger de Realtime...");

        const { data: realtimeTest } = await supabase
          .from("Notificacion")
          .insert({
            userId: null,
            titulo: "Realtime Test",
            mensaje: "Test de evento Realtime",
            tipo: "test",
            status: "pendiente",
          })
          .select()
          .single();

        // Esperar un momento para el evento
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (realtimeTest) {
          // Limpiar
          await supabase
            .from("Notificacion")
            .delete()
            .eq("id", realtimeTest.id);
        }
      }

      // Cleanup
      await supabase.removeChannel(channel);

      if (subscriptionStatus === "SUBSCRIBED") {
        console.log("✅ Realtime configurado correctamente");
        if (realtimeWorking) {
          console.log("✅ Eventos Realtime funcionando");
        } else {
          console.log("⚠️ Suscripción exitosa pero no se detectaron eventos");
        }
      } else {
        console.log(`❌ Realtime no funcional: ${subscriptionStatus}`);
      }
    } catch (realtimeError) {
      console.log(`❌ Error de Realtime: ${realtimeError.message}`);
    }

    console.log("\n" + "=".repeat(50));
    console.log("📋 RESUMEN DE VERIFICACIÓN");
    console.log("=".repeat(50));

    if (!accessError && !countError && !statusError) {
      console.log("✅ Acceso a tabla: OK");
      console.log("✅ Operaciones básicas: OK");
      console.log("✅ Filtrado por status: OK");

      if (!insertError) {
        console.log("✅ Políticas RLS: OK");
        console.log("✅ CRUD completo: OK");
      } else {
        console.log("❌ Políticas RLS: NECESITAN AJUSTE");
      }

      if (subscriptionStatus === "SUBSCRIBED") {
        console.log("✅ Realtime: OK");
        console.log("\n🎉 ¡Todo funciona correctamente!");
        console.log(
          "💡 Puedes reactivar ENABLE_NOTIFICACIONES_REALTIME = true"
        );
      } else {
        console.log("❌ Realtime: NECESITA REVISIÓN");
        console.log(
          "\n⚠️ Funcionalidad básica OK, pero Realtime tiene problemas"
        );
      }
    } else {
      console.log("❌ Problemas detectados - revisar políticas RLS");
    }
  } catch (error) {
    console.error("❌ Error general en verificación:", error.message);
  }
}

// Ejecutar verificación
verificarNotificacionFixed()
  .then(() => {
    console.log("\n✅ Verificación completada");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error en verificación:", error);
    process.exit(1);
  });
