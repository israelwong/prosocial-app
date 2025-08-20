// Script para probar el portal de clientes
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testClientePortal() {
  try {
    console.log("🔍 Verificando clientes existentes...");

    // Buscar clientes con eventos y cotizaciones aprobadas
    const clientes = await prisma.cliente.findMany({
      include: {
        Evento: {
          include: {
            Cotizacion: {
              where: {
                status: "aprobada",
              },
            },
          },
        },
      },
    });

    console.log(`📊 Total clientes: ${clientes.length}`);

    // Filtrar clientes que tengan eventos con cotizaciones aprobadas
    const clientesConAcceso = clientes.filter((cliente) =>
      cliente.Evento.some((evento) => evento.Cotizacion.length > 0)
    );

    console.log(
      `✅ Clientes con acceso al portal: ${clientesConAcceso.length}`
    );

    if (clientesConAcceso.length > 0) {
      console.log("\n📋 Clientes que pueden acceder:");
      clientesConAcceso.forEach((cliente, index) => {
        const eventosConCotizacion = cliente.Evento.filter(
          (e) => e.Cotizacion.length > 0
        );
        console.log(`${index + 1}. ${cliente.nombre}`);
        console.log(`   Email: ${cliente.email || "No tiene"}`);
        console.log(`   Teléfono: ${cliente.telefono || "No tiene"}`);
        console.log(
          `   Eventos con cotización aprobada: ${eventosConCotizacion.length}`
        );
        console.log(
          `   Tiene contraseña: ${cliente.passwordHash ? "Sí" : "No"}`
        );
        console.log("---");
      });
    } else {
      console.log("❌ No hay clientes con acceso al portal");
      console.log(
        "💡 Necesitas crear un cliente con evento y cotización aprobada"
      );
    }

    // Si no hay clientes de prueba, crear uno
    if (clientesConAcceso.length === 0) {
      console.log("\n🛠️ Creando cliente de prueba...");

      const clientePrueba = await prisma.cliente.create({
        data: {
          nombre: "Cliente Prueba Portal",
          email: "prueba@portal.com",
          telefono: "5551234567",
          direccion: "Dirección de prueba",
        },
      });

      console.log(`✅ Cliente creado: ${clientePrueba.nombre}`);

      // Crear evento de prueba
      const eventoPrueba = await prisma.evento.create({
        data: {
          clienteId: clientePrueba.id,
          nombre: "Boda de Prueba Portal",
          fecha_evento: new Date("2025-12-25"),
          sede: "Jardín de eventos",
          direccion: "Calle Principal 123",
        },
      });

      console.log(`✅ Evento creado: ${eventoPrueba.nombre}`);

      // Crear tipo de evento si no existe
      let tipoEvento = await prisma.eventoTipo.findFirst({
        where: { nombre: "Boda" },
      });

      if (!tipoEvento) {
        tipoEvento = await prisma.eventoTipo.create({
          data: {
            nombre: "Boda",
            descripcion: "Ceremonia de boda",
          },
        });
      }

      // Crear cotización aprobada
      const cotizacionPrueba = await prisma.cotizacion.create({
        data: {
          eventoTipoId: tipoEvento.id,
          eventoId: eventoPrueba.id,
          nombre: "Cotización Boda Portal",
          precio: 50000,
          descripcion: "Paquete completo para boda",
          status: "aprobada",
        },
      });

      console.log(`✅ Cotización aprobada creada: ${cotizacionPrueba.nombre}`);
      console.log("\n🎉 ¡Cliente de prueba listo!");
      console.log(`📧 Email: ${clientePrueba.email}`);
      console.log(`📱 Teléfono: ${clientePrueba.telefono}`);
      console.log(
        `💰 Total cotización: $${cotizacionPrueba.precio.toLocaleString()}`
      );
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testClientePortal();
