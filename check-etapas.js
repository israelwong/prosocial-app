require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variables de entorno de Supabase no encontradas");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getEventoEtapas() {
  console.log("🔍 Obteniendo etapas de eventos...\n");

  const { data: etapas, error } = await supabase
    .from("EventoEtapa")
    .select("*")
    .order("createdAt");

  if (error) {
    console.error("❌ Error al obtener etapas:", error);
    return;
  }

  console.log("📊 Etapas de eventos disponibles:");
  etapas.forEach((etapa) => {
    console.log(`   ${etapa.nombre} (ID: ${etapa.id})`);
  });

  console.log("\n✅ Consulta completada");
}

getEventoEtapas().catch(console.error);
