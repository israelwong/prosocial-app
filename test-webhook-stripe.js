// Test del webhook de Stripe con eventos simulados
// Usando fetch nativo - no necesita instalar nada

// URL del webhook (ajusta según tu ngrok)
const WEBHOOK_URL = "https://4f4c936db3e5.ngrok-free.app/api/webhooks/stripe";

// Evento simulado de Payment Intent exitoso con MSI
const mockPaymentIntentSucceededMSI = {
  id: "evt_test_webhook",
  type: "payment_intent.succeeded",
  data: {
    object: {
      id: "pi_test_123456789",
      amount: 6723895, // $67,238.95 MXN
      currency: "mxn",
      status: "succeeded",
      metadata: {
        cotizacionId: "cmehube0k0024gu7pj7fjjsmp",
        cliente_nombre: "Israel Wong",
        evento_id: "cmehua7dd0022gu7pdl07u0kg",
      },
      charges: {
        data: [
          {
            id: "ch_test_charge_msi",
            payment_method_details: {
              card: {
                installments: {
                  plan: {
                    count: 6, // 6 MSI
                    interval: "month",
                    type: "fixed_count",
                  },
                },
                brand: "visa",
                last4: "4242",
              },
            },
          },
        ],
      },
    },
  },
};

// Evento simulado de Payment Intent exitoso SIN MSI (pago único)
const mockPaymentIntentSucceededSingle = {
  id: "evt_test_webhook_single",
  type: "payment_intent.succeeded",
  data: {
    object: {
      id: "pi_test_single_123",
      amount: 6723895,
      currency: "mxn",
      status: "succeeded",
      metadata: {
        cotizacionId: "cmehube0k0024gu7pj7fjjsmp",
        cliente_nombre: "Israel Wong",
        evento_id: "cmehua7dd0022gu7pdl07u0kg",
      },
      charges: {
        data: [
          {
            id: "ch_test_charge_single",
            payment_method_details: {
              card: {
                brand: "visa",
                last4: "4242",
                // Sin installments = pago único
              },
            },
          },
        ],
      },
    },
  },
};

// Evento de Charge exitoso con información de MSI
const mockChargeSucceeded = {
  id: "evt_charge_test",
  type: "charge.succeeded",
  data: {
    object: {
      id: "ch_test_charge_info",
      payment_intent: "pi_test_123456789",
      payment_method_details: {
        card: {
          installments: {
            plan: {
              count: 9, // 9 MSI
              interval: "month",
              type: "fixed_count",
            },
          },
          brand: "mastercard",
          last4: "5555",
        },
      },
    },
  },
};

async function testWebhook(eventData, testName) {
  console.log(`\n🧪 TESTING: ${testName}`);
  console.log("===============================================");

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": "test_signature", // Para testing, usaremos mock
      },
      body: JSON.stringify(eventData),
    });

    const data = await response.json();
    console.log("✅ Webhook Response:", response.status, data);
  } catch (error) {
    console.log("❌ Network Error:", error.message);
  }
}

async function runAllTests() {
  console.log("🚀 INICIANDO TESTS DEL WEBHOOK STRIPE");
  console.log("📡 URL:", WEBHOOK_URL);
  console.log("");

  // Test 1: Payment Intent con MSI
  await testWebhook(
    mockPaymentIntentSucceededMSI,
    "Payment Intent Exitoso con 6 MSI"
  );

  await new Promise((resolve) => setTimeout(resolve, 2000)); // Esperar 2s

  // Test 2: Payment Intent sin MSI
  await testWebhook(
    mockPaymentIntentSucceededSingle,
    "Payment Intent Exitoso - Pago Único"
  );

  await new Promise((resolve) => setTimeout(resolve, 2000)); // Esperar 2s

  // Test 3: Charge con información adicional
  await testWebhook(mockChargeSucceeded, "Charge Exitoso con 9 MSI");

  console.log("\n🎯 TESTS COMPLETADOS");
}

// Función para test directo del endpoint
async function testWebhookDirect() {
  console.log("🔥 TEST DIRECTO - Sin verificación de signature");

  try {
    const response = await fetch("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mockPaymentIntentSucceededMSI),
    });

    const data = await response.json();
    console.log("✅ Response:", data);
  } catch (error) {
    console.log("❌ Error:", error.message);
  }
}

// Ejecutar tests
if (require.main === module) {
  console.log("Selecciona el tipo de test:");
  console.log("1. Test con ngrok (con signature)");
  console.log("2. Test directo localhost (sin signature)");

  const testType = process.argv[2] || "2";

  if (testType === "1") {
    runAllTests();
  } else {
    testWebhookDirect();
  }
}

module.exports = {
  testWebhook,
  mockPaymentIntentSucceededMSI,
  mockPaymentIntentSucceededSingle,
  mockChargeSucceeded,
};
