#!/usr/bin/env node

/**
 * 🔍 Script para verificar compatibilidad de keys de Stripe
 * Valida que secret key y publishable key pertenezcan a la misma cuenta
 */

const Stripe = require("stripe");
const axios = require("axios");

async function verificarKeysStripe() {
  console.log("🔍 Verificando compatibilidad de keys de Stripe...\n");

  // Variables de entorno (cárgalas desde .env.local para testing local)
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  console.log("📋 Keys encontradas:");
  console.log(
    `  Secret Key: ${secretKey ? secretKey.substring(0, 15) + "..." : "❌ NO DEFINIDA"}`
  );
  console.log(
    `  Publishable Key: ${publishableKey ? publishableKey.substring(0, 15) + "..." : "❌ NO DEFINIDA"}`
  );
  console.log(
    `  Webhook Secret: ${webhookSecret ? webhookSecret.substring(0, 15) + "..." : "❌ NO DEFINIDA"}\n`
  );

  if (!secretKey || !publishableKey) {
    console.log("❌ Faltan keys de Stripe");
    process.exit(1);
  }

  try {
    // Inicializar Stripe con secret key
    const stripe = new Stripe(secretKey, {
      apiVersion: "2023-08-16",
    });

    console.log("🔌 Verificando conectividad con secret key...");

    // Obtener información de la cuenta usando secret key
    const account = await stripe.accounts.retrieve();

    console.log("✅ Secret Key - Información de cuenta:");
    console.log(`  Account ID: ${account.id}`);
    console.log(`  Tipo: ${account.type}`);
    console.log(`  País: ${account.country}`);
    console.log(`  Email: ${account.email || "No disponible"}\n`);

    // Crear un PaymentIntent de prueba
    console.log("🧪 Creando PaymentIntent de prueba...");
    const testPaymentIntent = await stripe.paymentIntents.create({
      amount: 1000, // $10.00 MXN
      currency: "mxn",
      metadata: {
        test: "key-compatibility-check",
      },
    });

    console.log("✅ PaymentIntent creado:");
    console.log(`  ID: ${testPaymentIntent.id}`);
    console.log(
      `  Client Secret: ${testPaymentIntent.client_secret?.substring(0, 20)}...`
    );
    console.log(`  Status: ${testPaymentIntent.status}\n`);

    // Verificar compatibilidad simulando llamada del frontend
    console.log("🔄 Verificando compatibilidad con publishable key...");

    // Simular llamada que haría Stripe Elements
    const elementsSessionUrl = `https://api.stripe.com/v1/elements/sessions`;

    try {
      const elementsResponse = await axios.post(
        elementsSessionUrl,
        new URLSearchParams({
          client_secret: testPaymentIntent.client_secret,
          type: "payment_intent",
        }),
        {
          headers: {
            Authorization: `Bearer ${publishableKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      console.log(
        "✅ COMPATIBILIDAD EXITOSA: Las keys pertenecen a la misma cuenta"
      );
      console.log("🎉 El PaymentIntent puede ser usado por Stripe Elements\n");
    } catch (elementsError) {
      if (elementsError.response?.status === 400) {
        console.log("❌ INCOMPATIBILIDAD DETECTADA:");
        console.log(
          "   Secret Key y Publishable Key pertenecen a CUENTAS DIFERENTES"
        );
        console.log(
          "   El PaymentIntent creado con secret key NO puede ser usado"
        );
        console.log("   por Stripe Elements con la publishable key actual\n");

        console.log("🔧 SOLUCIÓN:");
        console.log(
          "   1. Verificar que ambas keys sean de la misma cuenta de Stripe"
        );
        console.log("   2. Actualizar las variables de entorno en Vercel");
        console.log(
          "   3. Asegurarse de usar keys del mismo entorno (test/live)\n"
        );
      } else {
        console.log(
          "⚠️ Error verificando compatibilidad:",
          elementsError.message
        );
      }
    }

    // Limpiar: cancelar el PaymentIntent de prueba
    await stripe.paymentIntents.cancel(testPaymentIntent.id);
    console.log("🧹 PaymentIntent de prueba cancelado");
  } catch (error) {
    console.error("❌ Error verificando keys:", error.message);
    process.exit(1);
  }
}

verificarKeysStripe();
