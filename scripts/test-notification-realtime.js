const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function crearNotificacionPrueba() {
  try {
    console.log("🔔 Creando notificación de prueba...");

    const nuevaNotificacion = await prisma.notificacion.create({
      data: {
        titulo: "🧪 Prueba de notificación en tiempo real",
        mensaje: `Esta es una notificación de prueba creada el ${new Date().toLocaleString("es-MX")}`,
        tipo: "general",
        metadata: {
          tipo: "prueba",
          timestamp: new Date().toISOString(),
          rutaDestino: "/admin/dashboard",
        },
        status: "active",
      },
    });

    console.log("✅ Notificación creada:", nuevaNotificacion.id);
    console.log("📊 Título:", nuevaNotificacion.titulo);
    console.log("💬 Mensaje:", nuevaNotificacion.mensaje);
  } catch (error) {
    console.error("❌ Error creando notificación:", error);
  } finally {
    await prisma.$disconnect();
  }
}

crearNotificacionPrueba();
