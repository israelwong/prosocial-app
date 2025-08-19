"use server";
// import prisma from './prismaClient';
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
});

export default async function handler(req, res) {
  try {
    // Obtener parámetros de la query string (GET) o del body (POST)
    const isGET = req.method === "GET";
    const data = isGET ? req.query : req.body;

    const monto = parseFloat(data.montoFinal || data.monto);
    const concepto = data.concepto || `Cotización ${data.cotizacionId}`;
    const descripcion =
      data.descripcion || `Pago para evento - Cotización ${data.cotizacionId}`;
    let metodoPago = data.paymentMethod; // Puede venir del frontend
    let num_msi = parseInt(data.num_msi, 10) || 0;
    const cotizacionId = data.cotizacionId;

    const condicionesComercialesId =
      data.condicionesComercialesId || data.condicionId;
    const metodoPagoId = data.metodoPagoId;

    const clienteId = data.clienteId;
    const nombreCliente = data.nombreCliente;
    const emailCliente = data.emailCliente;
    const telefonoCliente = data.telefonoCliente;

    const precioFinal = parseFloat(data.precioFinal || data.montoFinal);

    // 🔍 Si no tenemos metodoPago del frontend, obtenerlo de la base de datos
    if (!metodoPago && metodoPagoId) {
      console.log("🔍 Obteniendo información del método de pago desde BD...", {
        metodoPagoId,
      });

      try {
        const metodoPagoInfo =
          await prisma.condicionesComercialesMetodoPago.findUnique({
            where: { id: metodoPagoId },
            include: {
              MetodoPago: true,
            },
          });

        console.log("🔍 Resultado de la consulta BD:", metodoPagoInfo);

        if (metodoPagoInfo?.MetodoPago) {
          metodoPago = metodoPagoInfo.MetodoPago.metodo_pago_clave; // spei, card, etc.
          const numMsiFromDB = metodoPagoInfo.num_msi || 0;

          console.log("✅ Información del método de pago obtenida:", {
            metodoPago,
            num_msi: numMsiFromDB,
            nombre: metodoPagoInfo.MetodoPago.nombre,
          });

          // Actualizar num_msi si viene de la BD
          if (numMsiFromDB > 0) {
            num_msi = numMsiFromDB;
          }
        } else {
          console.log("❌ No se encontró información del método de pago en BD");
          // 🚨 TEMPORAL: Usar método por defecto cuando no se encuentra
          console.log("🔧 Usando método de pago por defecto: card con MSI");
          metodoPago = "card";
          num_msi = 6; // MSI por defecto para pruebas
        }
      } catch (error) {
        console.error("❌ Error consultando método de pago:", error);
      }
    }

    // Debug: Información del pago FINAL
    console.log("💳 CREATE-SESSION API - Datos procesados:", {
      metodo: req.method,
      metodoPago,
      num_msi,
      monto,
      precioFinal,
      cotizacionId,
      metodoPagoId,
    });

    // 🔍 DEBUG: Verificar headers para URLs
    console.log("🔍 HEADERS DEBUG:", {
      origin: req.headers.origin,
      host: req.headers.host,
      "x-forwarded-proto": req.headers["x-forwarded-proto"],
      "x-forwarded-host": req.headers["x-forwarded-host"],
    });

    // Configurar URLs base con soporte para ngrok
    let baseUrl = "";
    if (req.headers["x-forwarded-host"]) {
      // Estamos en ngrok o detrás de un proxy
      const protocol = req.headers["x-forwarded-proto"] || "https";
      baseUrl = `${protocol}://${req.headers["x-forwarded-host"]}`;
    } else if (req.headers.origin) {
      // URL origin normal
      baseUrl = req.headers.origin;
    } else {
      // Fallback para desarrollo local
      baseUrl = `http://${req.headers.host || "localhost:3000"}`;
    }

    console.log("🌐 BASE URL construida:", baseUrl);

    //! Crear objeto sesión de pago
    let sessionParams = {
      payment_method_types: [],
      line_items: [
        {
          price_data: {
            currency: "mxn",
            product_data: {
              name: concepto,
              description: descripcion,
            },
            unit_amount: Math.round(monto * 100), // Monto en centavos
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        cotizacionId: cotizacionId.toString(),
        metodoPago,
        metodoPagoId: metodoPagoId || "",
      },
      //redirección solo si paga con tarjeta
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cotizacion/${cotizacionId}`,
    };

    //! Configurar el método de pago
    if (metodoPago === "spei") {
      const customer = await stripe.customers.create({
        name: nombreCliente,
        email: emailCliente,
        phone: telefonoCliente,
        metadata: {
          clienteId,
          cotizacionId,
          concepto,
        },
      });

      sessionParams.customer = customer.id;
      sessionParams.payment_method_types = ["customer_balance"];
      sessionParams.payment_method_options = {
        customer_balance: {
          funding_type: "bank_transfer",
          bank_transfer: {
            type: "mx_bank_transfer",
          },
        },
      };

      // } else if (metodoPago === 'oxxo') {
      //     sessionParams.payment_method_types = ['oxxo'];
    } else if (metodoPago === "card") {
      sessionParams.payment_method_types = ["card"];
      
      // 🚫 MSI DESHABILITADO - Solo pagos únicos para control total
      console.log("🔧 Configurando pago con tarjeta - pago único (MSI omitido)");
      sessionParams.metadata = {
        ...sessionParams.metadata,
        is_installment: "false",
        payment_type: "single",
      };
        if ([3, 6, 9, 12].includes(num_msi)) {
          console.log(
            `🔧 Configurando pago con tarjeta a ${num_msi} MSI específicos`
          );

          // ✅ CONFIGURACIÓN OFICIAL MSI según documentación de Stripe
          sessionParams.payment_method_options = {
            card: {
              installments: {
                enabled: true,
              },
            },
          };

          // También agregar información en metadata para estadísticas
          sessionParams.metadata = {
            ...sessionParams.metadata,
            msi_months: num_msi.toString(),
            is_installment: "true",
          };

          console.log(`� Configuración MSI enviada a Stripe:`, {
            enabled: true,
            plan: {
              count: num_msi,
              interval: "month",
              type: "fixed_count",
            },
          });
        } else {
          throw new Error("Número de MSI no soportado. Debe ser 3, 6, 9 o 12.");
        }
      } else {
        // Tarjeta sin MSI - solo pago único
        console.log("🔧 Configurando pago con tarjeta sin MSI");
        sessionParams.metadata = {
          ...sessionParams.metadata,
          is_installment: "false",
        };
      }
    } else {
      throw new Error("Método de pago no soportado.");
    }

    // Debug: Mostrar configuración final antes de enviar a Stripe
    console.log("🔧 STRIPE CONFIG - Configuración final de sessionParams:", {
      payment_method_types: sessionParams.payment_method_types,
      payment_method_options: sessionParams.payment_method_options,
      monto: Math.round(monto * 100), // Monto en centavos
      mode: sessionParams.mode,
      metadata: sessionParams.metadata,
    });

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log("✅ STRIPE SESSION - Sesión creada exitosamente:", {
      sessionId: session.id,
      url: session.url,
      payment_intent: session.payment_intent,
    });

    //! TEMPORAL: Comentar inserción en BD hasta resolver foreign keys
    /*
    await prisma.pago.create({
      data: {
        clienteId,
        cotizacionId,
        condicionesComercialesId,
        condicionesComercialesMetodoPagoId: metodoPagoId,
        metodo_pago: metodoPago,
        monto,
        concepto,
        descripcion,
        stripe_session_id: session.id,
        stripe_payment_id: session.payment_intent
          ? session.payment_intent
          : null,
        status: "pending",
      },
    });

    //! Actualizar la cotización con las nuevas condiciones comerciales
    await prisma.cotizacion.update({
      where: { id: cotizacionId },
      data: {
        precio: precioFinal,
        condicionesComercialesId,
        condicionesComercialesMetodoPagoId: metodoPagoId,
      },
    });
    */

    console.log("🔧 TEMPORAL: Inserción en BD comentada para pruebas de MSI");

    // Redirigir si es GET, o retornar JSON si es POST
    if (isGET) {
      res.redirect(303, session.url);
    } else {
      res.status(200).json({ url: session.url });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return res
      .status(400)
      .json({ error: "Invalid request", details: error.message });
  }
}
