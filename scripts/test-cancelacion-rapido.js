// 🧪 Test Manual Rápido - Cancelación Sin Errores
// Cotización ID: cmeqdh8dv0003gukz2kgep13a

const BASE_URL = "http://localhost:3000";
const COTIZACION_ID = "cmeqdh8dv0003gukz2kgep13a";

async function testCompleto() {
  console.log("🧪 === TEST RÁPIDO: CANCELACIÓN SIN ERRORES ===");

  // 1. Crear Payment Intent
  console.log("\n🔧 Paso 1: Crear Payment Intent");
  let paymentIntentId = null;

  try {
    const createResponse = await fetch(
      `${BASE_URL}/api/cotizacion/payments/create-payment-intent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cotizacionId: COTIZACION_ID,
          metodoPago: "card",
          montoBase: 2000.0,
          montoConComision: 2083.33, // 2000 + 4.16% comisión
        }),
      }
    );

    if (createResponse.ok) {
      const createData = await createResponse.json();
      paymentIntentId = createData.paymentIntentId;
      console.log("✅ Payment Intent creado:", paymentIntentId);
    } else {
      console.log("❌ Error creando Payment Intent");
      return;
    }
  } catch (error) {
    console.log("❌ Error en crear:", error.message);
    return;
  }

  // 2. Cancelar Payment Intent
  console.log("\n🗑️ Paso 2: Cancelar Payment Intent");

  try {
    const cancelResponse = await fetch(
      `${BASE_URL}/api/cotizacion/payments/cancel-payment-intent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId }),
      }
    );

    if (cancelResponse.ok) {
      const cancelData = await cancelResponse.json();
      console.log("✅ Cancelación exitosa:");
      console.log(
        "   📊 Registros eliminados:",
        cancelData.registrosEliminados
      );
      console.log("   💬 Mensaje:", cancelData.message);
    } else {
      console.log("❌ Error cancelando Payment Intent");
    }
  } catch (error) {
    console.log("❌ Error en cancelar:", error.message);
  }

  console.log("\n🎉 === TEST COMPLETADO ===");
  console.log(
    "💡 Observa los logs del servidor para verificar que no hay errores de validación"
  );
}

// Ejecutar test
testCompleto().catch(console.error);
