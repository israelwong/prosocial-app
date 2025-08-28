#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function probarSistemaRealtime() {
  console.log(
    "🔔 Iniciando prueba del sistema realtime de notificaciones...\n"
  );

  try {
    // 1. Crear notificación de tipo general
    console.log("1️⃣ Creando notificación general...");
    const notifGeneral = await prisma.notificacion.create({
      data: {
        titulo: "🧪 Prueba - Notificación General",
        mensaje: `Notificación de prueba creada el ${new Date().toLocaleString("es-MX")}`,
        tipo: "general",
        metadata: {
          tipo: "prueba",
          timestamp: new Date().toISOString(),
          rutaDestino: "/admin/dashboard",
        },
        status: "active",
      },
    });
    console.log("✅ Notificación general creada:", notifGeneral.id);

    // Esperar 2 segundos
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 2. Crear notificación de solicitud de paquete
    console.log("\n2️⃣ Creando notificación de solicitud de paquete...");
    const notifSolicitud = await prisma.notificacion.create({
      data: {
        titulo: "📦 Nueva solicitud de paquete",
        mensaje:
          "El cliente Juan Pérez ha solicitado información sobre el paquete Premium",
        tipo: "solicitud_paquete",
        metadata: {
          eventoId: "evento-123",
          clienteId: "cliente-456",
          clienteNombre: "Juan Pérez",
          paquete: "Premium",
          rutaDestino: "/admin/dashboard/eventos/evento-123",
          accionBitacora: {
            habilitada: true,
            mensaje: "Solicitud de paquete Premium recibida",
          },
        },
        status: "active",
      },
    });
    console.log("✅ Notificación de solicitud creada:", notifSolicitud.id);

    // Esperar 2 segundos
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 3. Crear notificación de pago confirmado
    console.log("\n3️⃣ Creando notificación de pago confirmado...");
    const notifPago = await prisma.notificacion.create({
      data: {
        titulo: "💰 Pago confirmado - María González",
        mensaje:
          'Se ha confirmado el pago de $15,000.00 MXN para la cotización "Boda Premium"',
        tipo: "pago_confirmado",
        metadata: {
          eventoId: "evento-789",
          pagoId: "pago-101",
          monto: 15000,
          metodoPago: "stripe",
          clienteId: "cliente-999",
          clienteNombre: "María González",
          rutaDestino: "/admin/dashboard/seguimiento/evento-789",
          accionBitacora: {
            habilitada: true,
            mensaje: "Pago confirmado: $15,000.00 MXN - Stripe",
          },
        },
        status: "active",
      },
    });
    console.log("✅ Notificación de pago creada:", notifPago.id);

    console.log(
      "\n🎉 Prueba completada! Se han creado 3 notificaciones de diferentes tipos."
    );
    console.log(
      "📺 Revisa el dropdown de notificaciones en el admin para ver si aparecen en tiempo real."
    );
    console.log("\n🔍 IDs de notificaciones creadas:");
    console.log(`   - General: ${notifGeneral.id}`);
    console.log(`   - Solicitud: ${notifSolicitud.id}`);
    console.log(`   - Pago: ${notifPago.id}`);
  } catch (error) {
    console.error("❌ Error en la prueba:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  probarSistemaRealtime();
}

module.exports = { probarSistemaRealtime };
