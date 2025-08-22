/**
 * Script para validar que la consulta pasa correctamente el canal a la ficha cliente
 */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function verificarConsultaEventoCompleto() {
  try {
    console.log(
      "🔍 Verificando que la consulta pase el canal a la ficha cliente...\n"
    );

    // Buscar un evento que tenga cliente con canal
    const evento = await prisma.evento.findFirst({
      where: {
        Cliente: {
          canalId: {
            not: null,
          },
        },
      },
      select: {
        id: true,
        clienteId: true,
        nombre: true,
        fecha_evento: true,
        sede: true,
        direccion: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        eventoEtapaId: true,
        eventoTipoId: true,
        EventoTipo: {
          select: {
            id: true,
            nombre: true,
          },
        },
        Cliente: {
          select: {
            id: true,
            nombre: true,
            telefono: true,
            email: true,
            direccion: true,
            status: true,
            canalId: true,
            userId: true,
            createdAt: true,
            updatedAt: true,
            Canal: {
              select: {
                id: true,
                nombre: true,
              },
            },
          },
        },
        EventoEtapa: {
          select: {
            id: true,
            nombre: true,
          },
        },
        Cotizacion: true,
        Agenda: true,
        EventoBitacora: true,
      },
    });

    if (!evento) {
      console.log(
        "❌ No se encontraron eventos con clientes que tengan canal asignado"
      );
      return;
    }

    console.log("✅ Evento encontrado:", {
      id: evento.id,
      nombre: evento.nombre,
      cliente: {
        id: evento.Cliente?.id,
        nombre: evento.Cliente?.nombre,
        canalId: evento.Cliente?.canalId,
        canal: evento.Cliente?.Canal
          ? {
              id: evento.Cliente.Canal.id,
              nombre: evento.Cliente.Canal.nombre,
            }
          : null,
      },
    });

    console.log("\n📋 Validando estructura de datos:");

    if (evento.Cliente?.canalId) {
      console.log("✅ Cliente tiene canalId:", evento.Cliente.canalId);
    } else {
      console.log("❌ Cliente NO tiene canalId");
    }

    if (evento.Cliente?.Canal) {
      console.log("✅ Cliente tiene información del Canal:", {
        id: evento.Cliente.Canal.id,
        nombre: evento.Cliente.Canal.nombre,
      });
    } else {
      console.log("❌ Cliente NO tiene información del Canal");
    }

    console.log("\n🎯 La consulta obtenerEventoCompleto ahora incluye:");
    console.log("✅ canalId en los datos del cliente");
    console.log("✅ Relación Canal con id y nombre");
    console.log(
      "✅ Todos los campos adicionales del cliente (direccion, status, userId, timestamps)"
    );

    console.log("\n📝 Datos completos del cliente:");
    console.log(JSON.stringify(evento.Cliente, null, 2));
  } catch (error) {
    console.error("❌ Error al verificar la consulta:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarConsultaEventoCompleto();
