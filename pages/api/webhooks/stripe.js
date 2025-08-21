import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";
import { WEBHOOK_SUCCESS_FLOW } from "../../app/admin/_lib/constants/status.js";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false, // ⚠️ CRÍTICO: Deshabilitar body parsing para recibir raw body
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("🎯 WEBHOOK STRIPE - Evento recibido");
  console.log("🔑 Endpoint Secret disponible:", !!endpointSecret);
  console.log("🔑 Endpoint Secret length:", endpointSecret?.length || 0);

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // 🔧 Método correcto para leer raw body en Next.js
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    const rawBody = await new Promise((resolve) => {
      req.on("end", () => {
        resolve(body);
      });
    });

    console.log("📦 Raw body recibido:", {
      length: rawBody.length,
      hasSignature: !!sig,
      bodyStart: rawBody.substring(0, 100) + "...",
    });

    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    console.log("✅ Webhook verified:", event.type);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    console.log(`🔔 Procesando evento: ${event.type}`);
    console.log(
      "📋 Datos del evento:",
      JSON.stringify(event.data.object, null, 2)
    );

    switch (event.type) {
      // 🎯 PAYMENT INTENT EVENTS
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object);
        break;

      case "payment_intent.canceled":
        await handlePaymentIntentCanceled(event.data.object);
        break;

      case "payment_intent.processing":
        await handlePaymentIntentProcessing(event.data.object);
        break;

      // 💳 CHARGE EVENTS
      case "charge.succeeded":
        await handleChargeSucceeded(event.data.object);
        break;

      case "charge.failed":
        await handleChargeFailed(event.data.object);
        break;

      case "charge.dispute.created":
        await handleChargeDispute(event.data.object);
        break;

      // 🏦 CUSTOMER BALANCE EVENTS (SPEI)
      case "customer_cash_balance_transaction.created":
        await handleCustomerBalanceTransaction(event.data.object);
        break;

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object);
        break;

      default:
        console.log(`🔔 Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true, type: event.type });
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    res
      .status(500)
      .json({ error: "Webhook processing failed", details: error.message });
  }
}

// 🔧 HELPER FUNCTIONS

async function obtenerEtapaContratado() {
  try {
    const etapaContratado = await prisma.eventoEtapa.findFirst({
      where: {
        OR: [
          { nombre: { contains: "Contratado", mode: "insensitive" } },
          { nombre: { contains: "Aprobado", mode: "insensitive" } },
          { posicion: 4 }, // Asumiendo que posición 4 es "Contratado"
        ],
      },
      orderBy: { posicion: "asc" },
    });

    return etapaContratado?.id || null;
  } catch (error) {
    console.error("❌ Error al obtener etapa contratado:", error);
    return null;
  }
}

// 🎯 PAYMENT INTENT HANDLERS

async function handlePaymentIntentSucceeded(paymentIntent) {
  console.log("✅ Payment Intent succeeded:", paymentIntent.id);
  console.log("📊 Metadata:", paymentIntent.metadata);

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
    }
  }

  try {
    // 1. Buscar el pago existente por Payment Intent ID
    const pagoExistente = await prisma.pago.findFirst({
      where: { stripe_payment_id: paymentIntent.id },
      include: {
        Cotizacion: {
          include: {
            Evento: {
              include: {
                Cliente: true,
                EventoTipo: true,
              },
            },
          },
        },
      },
    });

    if (!pagoExistente) {
      console.log(
        `❌ No se encontró el pago correspondiente para Payment Intent: ${paymentIntent.id}`
      );
      return;
    }

    // 2. Actualizar el pago existente usando constantes de flujo
    const pagoActualizado = await prisma.pago.update({
      where: { id: pagoExistente.id },
      data: {
        status: WEBHOOK_SUCCESS_FLOW.PAGO, // "paid"
        metodo_pago: metodoPago,
        stripe_payment_id: paymentIntent.id,
        updatedAt: new Date(),
      },
    });

    console.log("✅ Pago actualizado:", {
      pagoId: pagoActualizado.id,
      cotizacionId: pagoExistente.cotizacionId,
      monto: pagoActualizado.monto,
      metodoPago: metodoPago,
      msi: mesesSinIntereses,
    });

    // 3. Actualizar estado de cotización usando constantes de flujo
    await prisma.cotizacion.update({
      where: { id: pagoExistente.cotizacionId },
      data: {
        status: WEBHOOK_SUCCESS_FLOW.COTIZACION, // "aprobada"
      },
    });

    console.log(
      "✅ Cotización actualizada:",
      pagoExistente.cotizacionId,
      "->",
      WEBHOOK_SUCCESS_FLOW.COTIZACION
    );

    // 4. Actualizar estado del evento y crear agenda
    if (pagoExistente.Cotizacion?.Evento) {
      const evento = pagoExistente.Cotizacion.Evento;

      // Obtener ID de etapa "Contratado" dinámicamente
      const etapaContratadoId = await obtenerEtapaContratado();

      // Actualizar estado del evento usando constantes de flujo
      const updateData = {
        status: WEBHOOK_SUCCESS_FLOW.EVENTO, // "aprobado"
      };

      // Solo actualizar etapa si encontramos una válida
      if (etapaContratadoId) {
        updateData.eventoEtapaId = etapaContratadoId;
      }

      await prisma.evento.update({
        where: { id: evento.id },
        data: updateData,
      });

      console.log("✅ Evento actualizado:", {
        eventoId: evento.id,
        nuevoStatus: WEBHOOK_SUCCESS_FLOW.EVENTO,
        etapaActualizada: !!etapaContratadoId,
      });

      // 5. Crear entrada en agenda
      try {
        // Verificar si ya existe entrada en agenda para este evento
        const agendaExistente = await prisma.agenda.findFirst({
          where: {
            eventoId: evento.id,
            status: { not: "cancelado" },
          },
        });

        if (!agendaExistente) {
          const nuevaAgenda = await prisma.agenda.create({
            data: {
              eventoId: evento.id,
              fecha: evento.fecha_evento,
              status: WEBHOOK_SUCCESS_FLOW.AGENDA, // "confirmado"
              descripcion: `Evento confirmado automáticamente - Pago procesado: ${pagoActualizado.monto.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}`,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });

          console.log("📅 Agenda creada exitosamente:", {
            agendaId: nuevaAgenda.id,
            eventoId: evento.id,
            fecha: evento.fecha_evento,
          });
        } else {
          // Si ya existe, actualizar su status
          await prisma.agenda.update({
            where: { id: agendaExistente.id },
            data: {
              status: WEBHOOK_SUCCESS_FLOW.AGENDA, // "confirmado"
              descripcion: `${agendaExistente.descripcion || ""} - Pago confirmado: ${pagoActualizado.monto.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}`,
              updatedAt: new Date(),
            },
          });

          console.log("📅 Agenda actualizada exitosamente:", {
            agendaId: agendaExistente.id,
            nuevoStatus: WEBHOOK_SUCCESS_FLOW.AGENDA,
          });
        }
      } catch (agendaError) {
        console.error("❌ Error al crear/actualizar agenda:", agendaError);
        // No fallo el webhook por error de agenda, solo lo registramos
      }

      // 6. Crear notificación para el equipo
      try {
        await prisma.notificacion.create({
          data: {
            cotizacionId: pagoExistente.cotizacionId,
            titulo: `💰 Pago confirmado - ${evento.Cliente?.nombre}`,
            mensaje: `Se ha confirmado el pago de ${pagoActualizado.monto.toLocaleString("es-MX", { style: "currency", currency: "MXN" })} para la cotización "${pagoExistente.Cotizacion.nombre}". El evento ha sido automáticamente contratado y agregado a la agenda.`,
            status: "active",
            createdAt: new Date(),
          },
        });

        console.log("🔔 Notificación creada para el equipo");
      } catch (notifError) {
        console.error("❌ Error al crear notificación:", notifError);
      }
    }

    console.log("✅ Pago procesado exitosamente:", {
      pagoId: pagoActualizado.id,
      cotizacionId: pagoExistente.cotizacionId,
      monto: pagoActualizado.monto,
      metodo: pagoActualizado.metodo_pago,
      msi: mesesSinIntereses,
    });
  } catch (error) {
    console.error("❌ Error al procesar pago exitoso:", error);
    throw error;
  }
}

async function handlePaymentIntentFailed(paymentIntent) {
  console.log("❌ Payment Intent failed:", paymentIntent.id);

  const { cotizacionId } = paymentIntent.metadata;

  try {
    await prisma.pago.create({
      data: {
        cotizacion_id: cotizacionId,
        stripe_payment_id: paymentIntent.id,
        monto: paymentIntent.amount / 100,
        status: "fallido",
        metodo_pago: "tarjeta_credito",
        fecha_pago: new Date(),
        metadata: JSON.stringify({
          error: paymentIntent.last_payment_error || "Error desconocido",
        }),
      },
    });

    console.log("📝 Pago fallido registrado para cotización:", cotizacionId);
  } catch (error) {
    console.error("❌ Error al registrar pago fallido:", error);
  }
}

async function handlePaymentIntentCanceled(paymentIntent) {
  console.log("🚫 Payment Intent canceled:", paymentIntent.id);

  const { cotizacionId } = paymentIntent.metadata;
  console.log("📝 Pago cancelado para cotización:", cotizacionId);
}

async function handlePaymentIntentProcessing(paymentIntent) {
  console.log("⏳ Payment Intent processing:", paymentIntent.id);

  const { cotizacionId } = paymentIntent.metadata;
  console.log("⏳ Pago en proceso para cotización:", cotizacionId);
}

// 💳 CHARGE HANDLERS

async function handleChargeSucceeded(charge) {
  console.log("✅ Charge succeeded:", charge.id);
  console.log("💳 Payment method details:", charge.payment_method_details);

  // Detectar MSI en el charge
  const installments = charge.payment_method_details?.card?.installments;
  if (installments && installments.plan) {
    console.log(`💳 CHARGE MSI INFO:`, {
      count: installments.plan.count,
      interval: installments.plan.interval,
      type: installments.plan.type,
    });
  }

  // Actualizar información adicional del cargo si está vinculado a un payment intent
  if (charge.payment_intent) {
    console.log(
      `ℹ️ Charge ${charge.id} vinculado a Payment Intent ${charge.payment_intent}`
    );
    // Información adicional del charge ya está disponible en los logs
  }
}

async function handleChargeFailed(charge) {
  console.log("❌ Charge failed:", charge.id);
  console.log("💥 Failure code:", charge.failure_code);
  console.log("📝 Failure message:", charge.failure_message);
}

async function handleChargeDispute(dispute) {
  console.log("⚠️ Charge dispute created:", dispute.id);
  console.log("⚠️ Disputa para charge:", dispute.charge);
}

// 🏦 CUSTOMER BALANCE HANDLERS (SPEI)

async function handleCustomerBalanceTransaction(transaction) {
  console.log("🏦 Customer balance transaction:", transaction.id);
  console.log("🏦 Transacción SPEI:", {
    customer: transaction.customer,
    amount: transaction.net_amount,
    currency: transaction.currency,
    type: transaction.type,
  });
}

async function handleInvoicePaymentSucceeded(invoice) {
  console.log("✅ Invoice payment succeeded:", invoice.id);
  console.log("✅ Pago SPEI exitoso para invoice:", invoice.id);
}

async function handleInvoicePaymentFailed(invoice) {
  console.log("❌ Invoice payment failed:", invoice.id);
  console.log("❌ Pago SPEI fallido para invoice:", invoice.id);
}
