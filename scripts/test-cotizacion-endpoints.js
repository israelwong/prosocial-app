// 🧪 Test de los nuevos endpoints de cotizaciones
// Cotización ID: cmeqdh8dv0003gukz2kgep13a

const BASE_URL = "http://localhost:3000";
const COTIZACION_ID = "cmeqdh8dv0003gukz2kgep13a";

console.log("🧪 === INICIO DE PRUEBAS ENDPOINTS COTIZACIONES ===");
console.log(`📋 Cotización ID: ${COTIZACION_ID}`);
console.log(`🌐 Base URL: ${BASE_URL}`);

// Test 1: Crear Payment Intent
async function testCreatePaymentIntent() {
  console.log("\n🔧 TEST 1: Crear Payment Intent");
  console.log("==========================================");

  try {
    const response = await fetch(
      `${BASE_URL}/api/cotizacion/payments/create-payment-intent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cotizacionId: COTIZACION_ID,
          metodoPago: "card",
          montoBase: 3000.0,
          montoConComision: 3125.0, // 3000 + 4.16% comisión aprox
        }),
      }
    );

    console.log(`📊 Status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Payment Intent creado exitosamente:");
      console.log(`   💳 Payment Intent ID: ${data.paymentIntentId}`);
      console.log(`   💰 Monto Base: $${data.montoBase}`);
      console.log(`   💰 Monto Final: $${data.montoFinal}`);
      console.log(`   💰 Comisión: $${data.comisionStripe}`);
      console.log(
        `   🔑 Client Secret: ${data.clientSecret ? "PRESENTE" : "AUSENTE"}`
      );

      return data.paymentIntentId; // Retornar para el test de cancelación
    } else {
      const error = await response.json();
      console.log("❌ Error al crear Payment Intent:");
      console.log(`   Error: ${error.error}`);
      console.log(`   Details: ${error.details || "N/A"}`);
      return null;
    }
  } catch (error) {
    console.log("💥 Error de conexión:");
    console.log(`   ${error.message}`);
    return null;
  }
}

// Test 2: Cancelar Payment Intent
async function testCancelPaymentIntent(paymentIntentId) {
  if (!paymentIntentId) {
    console.log("\n⚠️ SALTANDO TEST 2: No hay Payment Intent para cancelar");
    return;
  }

  console.log("\n🗑️ TEST 2: Cancelar Payment Intent");
  console.log("==========================================");

  try {
    const response = await fetch(
      `${BASE_URL}/api/cotizacion/payments/cancel-payment-intent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentIntentId: paymentIntentId,
        }),
      }
    );

    console.log(`📊 Status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Payment Intent cancelado exitosamente:");
      console.log(`   🗑️ Payment Intent: ${data.paymentIntentId}`);
      console.log(`   📊 Registros eliminados: ${data.registrosEliminados}`);
      console.log(`   💬 Mensaje: ${data.message}`);
    } else {
      const error = await response.json();
      console.log("❌ Error al cancelar Payment Intent:");
      console.log(`   Error: ${error.error}`);
      console.log(`   Details: ${error.details || "N/A"}`);
    }
  } catch (error) {
    console.log("💥 Error de conexión:");
    console.log(`   ${error.message}`);
  }
}

// Test 3: Verificar estructura de endpoints
async function testEndpointStructure() {
  console.log("\n🏗️ TEST 3: Verificar Estructura de Endpoints");
  console.log("==========================================");

  const endpoints = [
    "/api/cotizacion/payments/create-payment-intent",
    "/api/cotizacion/payments/cancel-payment-intent",
    "/api/cliente/create-payment-intent",
    "/api/cliente/cancel-payment-intent",
  ];

  for (const endpoint of endpoints) {
    try {
      // Test con método GET para verificar que el endpoint existe
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "GET",
      });

      // Un 405 (Method Not Allowed) significa que el endpoint existe pero no acepta GET
      if (response.status === 405) {
        console.log(`✅ ${endpoint} - Endpoint existe`);
      } else if (response.status === 404) {
        console.log(`❌ ${endpoint} - Endpoint NO existe`);
      } else {
        console.log(`⚠️ ${endpoint} - Status inesperado: ${response.status}`);
      }
    } catch (error) {
      console.log(`💥 ${endpoint} - Error de conexión`);
    }
  }
}

// Ejecutar todas las pruebas
async function runAllTests() {
  console.log("\n⏰ Iniciando batería de pruebas...\n");

  // Test 1: Crear Payment Intent
  const paymentIntentId = await testCreatePaymentIntent();

  // Esperar un poco antes del siguiente test
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Test 2: Cancelar Payment Intent (solo si se creó exitosamente)
  await testCancelPaymentIntent(paymentIntentId);

  // Esperar un poco antes del siguiente test
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Test 3: Verificar estructura
  await testEndpointStructure();

  console.log("\n🎉 === PRUEBAS COMPLETADAS ===");
  console.log(
    "💡 Revisa los resultados arriba para verificar que todo funciona correctamente."
  );
}

// Ejecutar pruebas
runAllTests().catch(console.error);
