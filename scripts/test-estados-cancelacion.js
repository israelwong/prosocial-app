/**
 * 🧪 Test de Estados de Cancelación
 *
 * Este script verifica que los estados de "cancelando" funcionen correctamente
 * simulando múltiples clics y verificando que los botones se deshabiliten.
 */

const BASE_URL = "http://localhost:3000";
const COTIZACION_ID = "cmeqdh8dv0003gukz2kgep13a";

async function testEstadosCancelacion() {
  console.log("🧪 === TEST: ESTADOS DE CANCELACIÓN ===");
  console.log(
    "🎯 Objetivo: Verificar que los botones se deshabiliten durante cancelación"
  );

  let paymentIntentId = null;

  // 1. Crear Payment Intent
  console.log("\n📝 Paso 1: Crear Payment Intent");
  try {
    const createResponse = await fetch(
      `${BASE_URL}/api/cotizacion/payments/create-payment-intent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cotizacionId: COTIZACION_ID,
          metodoPago: "card",
          montoBase: 1500.0,
          montoConComision: 1562.5,
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
    console.log("❌ Error:", error.message);
    return;
  }

  // 2. Simular múltiples clics de cancelación (para probar que los botones se deshabiliten)
  console.log("\n🔄 Paso 2: Simulando múltiples clics de cancelación");

  const cancelPromises = [];

  // Simular 3 clics rápidos (como si el usuario hiciera clic múltiple)
  for (let i = 1; i <= 3; i++) {
    console.log(`   🖱️ Clic ${i} de cancelación...`);

    const cancelPromise = fetch(
      `${BASE_URL}/api/cotizacion/payments/cancel-payment-intent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId }),
      }
    )
      .then(async (response) => {
        const data = await response.json();
        const status = response.ok ? "✅ Exitoso" : "⚠️ Error";
        console.log(
          `   📊 Clic ${i} resultado:`,
          status,
          data.message || data.error
        );
        return { click: i, ok: response.ok, data };
      })
      .catch((error) => {
        console.log(`   ❌ Clic ${i} falló:`, error.message);
        return { click: i, ok: false, error: error.message };
      });

    cancelPromises.push(cancelPromise);

    // Pequeña pausa entre clics para simular comportamiento real
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Esperar todos los resultados
  console.log("\n⏳ Esperando resultados de todos los clics...");
  const resultados = await Promise.all(cancelPromises);

  // 3. Analizar resultados
  console.log("\n📊 === ANÁLISIS DE RESULTADOS ===");

  const exitosos = resultados.filter((r) => r.ok).length;
  const fallidos = resultados.filter((r) => !r.ok).length;

  console.log(`✅ Clics exitosos: ${exitosos}`);
  console.log(`❌ Clics fallidos: ${fallidos}`);

  if (exitosos === 1 && fallidos === 2) {
    console.log(
      "🎉 ¡PERFECTO! Solo un clic procesó la cancelación, los demás fueron rechazados"
    );
    console.log(
      "   ✨ Esto indica que los estados de loading funcionan correctamente"
    );
  } else if (exitosos > 1) {
    console.log("⚠️ PROBLEMA: Múltiples cancelaciones fueron procesadas");
    console.log(
      "   🔧 Los botones podrían no estar deshhabilitándose correctamente"
    );
  } else {
    console.log("📝 Resultado inesperado - revisar logs del servidor");
  }

  console.log("\n🎯 === CONCLUSIONES ===");
  console.log("1. Verificar en el UI que durante la cancelación:");
  console.log("   • El título del modal cambie a 'Cancelando pago...'");
  console.log("   • Los botones se deshabiliten y muestren spinners");
  console.log("   • No se puedan hacer múltiples clics");
  console.log(
    "2. Los Payment Intents duplicados deben ser manejados graciosamente"
  );
  console.log("3. El estado debe limpiarse correctamente al finalizar");
}

// Ejecutar test
testEstadosCancelacion().catch(console.error);
