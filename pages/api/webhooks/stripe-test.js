// Webhook de prueba simplificado - SIN verificación de signature para testing
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("🎯 WEBHOOK STRIPE TEST - Evento recibido");
  console.log("📨 Body:", JSON.stringify(req.body, null, 2));

  try {
    const event = req.body;

    console.log(`🔔 Procesando evento: ${event.type}`);

    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      default:
        console.log(`🔔 Unhandled event type: ${event.type}`);
    }

    res.status(200).json({
      received: true,
      type: event.type,
      message: "Webhook procesado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    res.status(500).json({
      error: "Webhook processing failed",
      details: error.message,
    });
  }
}

async function handlePaymentIntentSucceeded(paymentIntent) {
  console.log("✅ Payment Intent succeeded:", paymentIntent.id);
  console.log("📊 Metadata:", paymentIntent.metadata);

  const { cotizacionId } = paymentIntent.metadata;

  // 🔍 Detectar método de pago automáticamente
  let metodoPago = "tarjeta_credito";
  let mesesSinIntereses = null;

  // Revisar charges para detectar MSI
  if (paymentIntent.charges && paymentIntent.charges.data.length > 0) {
    const charge = paymentIntent.charges.data[0];
    const installments = charge.payment_method_details?.card?.installments;

    if (installments && installments.plan && installments.plan.count > 1) {
      metodoPago = "msi";
      mesesSinIntereses = installments.plan.count;
      console.log(`💳 MSI DETECTADO: ${mesesSinIntereses} meses sin intereses`);
    } else {
      console.log(`💳 PAGO ÚNICO DETECTADO`);
    }
  }

  console.log("💾 SIMULANDO guardado en BD:", {
    cotizacion_id: cotizacionId,
    stripe_payment_id: paymentIntent.id,
    monto: paymentIntent.amount / 100,
    metodo_pago: metodoPago,
    meses_sin_intereses: mesesSinIntereses,
  });

  // Para testing, solo logeamos sin guardar realmente
  console.log("✅ Pago procesado exitosamente (MODO TEST)");
}
