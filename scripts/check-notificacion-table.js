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

async function checkNotificacionTable() {
  console.log("🔍 Verificando estado de la tabla Notificacion\n");

  try {
    // 1. Verificar si la tabla existe y es accesible
    console.log("📋 Test 1: Estructura de la tabla");
    console.log("────────────────────────────────────────");

    const { data: tableInfo, error: structureError } = await supabase
      .from("Notificacion")
      .select("*")
      .limit(1);

    if (structureError) {
      console.log(`❌ Error de estructura: ${structureError.message}`);
      console.log(`   Code: ${structureError.code}`);
      console.log(`   Details: ${structureError.details}`);
      console.log(`   Hint: ${structureError.hint}\n`);
    } else {
      console.log("✅ Tabla accesible\n");
    }

    // 2. Contar registros totales
    console.log("📊 Test 2: Conteo de registros");
    console.log("────────────────────────────────────────");

    const { count, error: countError } = await supabase
      .from("Notificacion")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.log(`❌ Error de conteo: ${countError.message}\n`);
    } else {
      console.log(`✅ Total de registros: ${count}\n`);
    }

    // 3. Verificar políticas RLS
    console.log("🔒 Test 3: Verificación de políticas RLS");
    console.log("────────────────────────────────────────");

    // Intentar insertar un registro de prueba (sin guardarlo)
    const testNotificacion = {
      usuarioId: "test-user-id",
      tipo: "test",
      titulo: "Test de políticas",
      mensaje: "Test message",
      leido: false,
    };

    const { data: insertTest, error: insertError } = await supabase
      .from("Notificacion")
      .insert(testNotificacion)
      .select()
      .single();

    if (insertError) {
      console.log(
        `❌ Error de inserción (esperado si RLS está activo): ${insertError.message}`
      );
      console.log(`   Code: ${insertError.code}\n`);
    } else {
      console.log("⚠️ Inserción exitosa - verificar políticas RLS\n");

      // Limpiar el registro de prueba
      await supabase.from("Notificacion").delete().eq("id", insertTest.id);
    }

    // 4. Verificar configuración de Realtime
    console.log("🔄 Test 4: Configuración de Realtime");
    console.log("────────────────────────────────────────");

    // Verificar si la tabla está habilitada para Realtime
    try {
      const channel = supabase.channel("test-channel");

      const subscription = channel
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "Notificacion",
          },
          (payload) => {
            console.log("📡 Evento Realtime recibido:", payload);
          }
        )
        .subscribe((status) => {
          console.log(`📡 Estado de suscripción: ${status}`);
        });

      // Esperar un momento para ver si la suscripción es exitosa
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Cleanup
      await supabase.removeChannel(channel);
      console.log("✅ Test de Realtime completado\n");
    } catch (realtimeError) {
      console.log(`❌ Error de Realtime: ${realtimeError.message}\n`);
    }
  } catch (error) {
    console.error("❌ Error general:", error.message);
  }
}

// Ejecutar verificación
checkNotificacionTable()
  .then(() => {
    console.log("✅ Verificación completada");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error en verificación:", error);
    process.exit(1);
  });
