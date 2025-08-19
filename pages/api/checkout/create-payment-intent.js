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
    const { cotizacionId, metodoPago, montoConComision } = req.body;

    console.log("🚀 CREATE-PAYMENT-INTENT SIMPLIFICADO");
    console.log("� Datos recibidos:", {
      cotizacionId,
      metodoPago,
      montoConComision,
    });

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

    // 2. 🧮 Cálculo de montos
    let montoBase, montoFinalEnCentavos;

    if (montoConComision) {
      // Usar el monto con comisión ya calculado
      montoBase = Number(montoConComision);
      montoFinalEnCentavos = Math.round(montoBase * 100);
    } else {
      // Fallback al precio original de la cotización
      montoBase = Number(cotizacion.precio);
      montoFinalEnCentavos = Math.round(montoBase * 100);
    }

    console.log("💰 Detalles del pago:", {
      montoBase,
      montoConComision,
      centavos: montoFinalEnCentavos,
      metodoPago,
      cliente: cotizacion.Evento?.Cliente?.nombre,
    });

    // 3. 🎯 Configurar Payment Intent según método de pago
    let paymentIntentData = {
      amount: montoFinalEnCentavos,
      currency: "mxn",
      metadata: {
        cotizacionId: cotizacion.id,
        cliente_nombre: cotizacion.Evento?.Cliente?.nombre || "",
        evento_id: cotizacion.Evento?.id || "",
        evento_fecha: cotizacion.Evento?.fecha_evento || "",
        metodo_pago: metodoPago || "card",
      },
    };

    // 🔄 Configuración específica por método de pago
    if (metodoPago === "spei") {
      // Para SPEI necesitamos crear un customer primero
      const cliente = cotizacion.Evento?.Cliente;
      if (!cliente) {
        return res
          .status(400)
          .json({ error: "Cliente no encontrado para SPEI" });
      }

      const customer = await stripe.customers.create({
        name: cliente.nombre,
        email: cliente.email || "cliente@example.com",
        metadata: {
          cotizacion_id: cotizacion.id,
          evento_id: cotizacion.Evento?.id || "",
        },
      });

      paymentIntentData.customer = customer.id;
      paymentIntentData.payment_method_types = ["customer_balance"];
      paymentIntentData.payment_method_data = {
        type: "customer_balance",
      };
      paymentIntentData.payment_method_options = {
        customer_balance: {
          funding_type: "bank_transfer",
          bank_transfer: {
            type: "mx_bank_transfer",
          },
        },
      };
    } else {
      // Para tarjetas (con MSI)
      paymentIntentData.payment_method_types = ["card"];
      paymentIntentData.payment_method_options = {
        card: {
          installments: {
            enabled: true,
          },
        },
      };
    }

    // 4. 💎 Crear Payment Intent
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

    console.log(
      `✅ Payment Intent creado: ${paymentIntent.id} por $${montoBase.toFixed(2)} MXN (${metodoPago || "card"})`
    );

    // 5. 📤 Respuesta unificada
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      montoFinal: montoBase,
      metodoPago: metodoPago || "card",
      cotizacion: {
        id: cotizacion.id,
        nombre: cotizacion.nombre,
        cliente: cotizacion.Evento?.Cliente?.nombre || "",
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
