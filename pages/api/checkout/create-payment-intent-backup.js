import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { cotizacionId, msiSeleccionado } = req.body; // Agregar MSI seleccionado

    console.log("🚀 CREATE-PAYMENT-INTENT SIMPLE - Cotización:", cotizacionId);
    console.log("💳 MSI Seleccionado:", msiSeleccionado);

    if (!cotizacionId) {
      return res.status(400).json({ error: "cotizacionId es requerido." });
    }

    // 1. 🔍 Obtener solo la cotización y cliente
    const cotizacion = await prisma.cotizacion.findUnique({
      where: { id: cotizacionId },
      include: {
        Evento: {
          include: {
            Cliente: true,
          },
        },
      },
    });

    if (!cotizacion) {
      console.error("❌ Cotización no encontrada:", { cotizacionId });
      return res.status(404).json({ error: "Cotización no encontrada." });
    }

    // 2. 🧮 Precio simple - directo de la cotización
    const montoBase = Number(cotizacion.precio);
    const montoFinalEnCentavos = Math.round(montoBase * 100);

    console.log("💰 Pago simple:", {
      monto: montoBase,
      centavos: montoFinalEnCentavos,
      cliente: cotizacion.Evento?.Cliente?.nombre,
    });

    // 3. 💎 Payment Intent CON MSI HABILITADO (sin plan específico)
    const paymentIntentConfig = {
      amount: montoFinalEnCentavos,
      currency: "mxn",
      payment_method_types: ["card"],
      metadata: {
        cotizacionId: cotizacion.id,
        cliente_nombre: cotizacion.Evento?.Cliente?.nombre || "",
        evento_id: cotizacion.Evento?.id || "",
        evento_fecha: cotizacion.Evento?.fecha_evento || "",
        msi_solicitado: msiSeleccionado ? msiSeleccionado.toString() : "0", // Solo para referencia
      },
      // 🇲🇽 MSI habilitado - Stripe Elements manejará la selección específica
      payment_method_options: {
        card: {
          installments: {
            enabled: true, // Solo habilitamos MSI, el plan se especifica en confirmPayment
          },
        },
      },
    };

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentConfig);

    console.log(
      `✅ Payment Intent creado: ${paymentIntent.id} por $${montoBase.toFixed(2)} MXN`
    );
    
    if (msiSeleccionado) {
      console.log(`🎯 MSI solicitado: ${msiSeleccionado} meses (se aplicará en confirmPayment)`);
    } else {
      console.log(`🇲🇽 MSI automático habilitado`);
    }

    // � Configurar MSI específico si fue seleccionado
    if (msiSeleccionado && msiSeleccionado > 0) {
      paymentIntentConfig.payment_method_options = {
        card: {
          installments: {
            enabled: true,
            plan: {
              count: msiSeleccionado,
              interval: "month",
              type: "fixed_count",
            },
          },
        },
      };
      console.log(`🎯 MSI ESPECÍFICO configurado: ${msiSeleccionado} meses`);
    } else {
      // MSI automático para que Stripe muestre opciones disponibles
      paymentIntentConfig.payment_method_options = {
        card: {
          installments: {
            enabled: true,
          },
        },
      };
      console.log(`🇲🇽 MSI automático habilitado`);
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentConfig);

    console.log(
      `✅ Payment Intent creado: ${paymentIntent.id} por $${montoBase.toFixed(2)} MXN`
    );
    
    if (msiSeleccionado) {
      console.log(`� Con MSI específico: ${msiSeleccionado} meses`);
    }

    // 4. 📤 Respuesta con información de MSI
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      montoFinal: montoBase,
      cotizacion: {
        id: cotizacion.id,
        nombre: cotizacion.nombre,
        cliente: cotizacion.Evento?.Cliente?.nombre || "",
      },
      msi: {
        habilitado: true,
        solicitado: msiSeleccionado || null,
        mensaje: msiSeleccionado 
          ? `Cliente solicitó ${msiSeleccionado} MSI - se aplicará si está disponible`
          : "MSI disponible automáticamente para tarjetas mexicanas compatibles",
      },
    });
  } catch (error) {
    console.error("❌ Error al crear Payment Intent:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      details: error.message,
    });
  }
}
