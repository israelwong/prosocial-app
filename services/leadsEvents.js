import { PrismaClient } from "@prisma/client";

export async function leadsHandle(lead, res) {
  const prisma = new PrismaClient();
  try {
    const { nombreLead, email, telefono, canalId, eventoTipoId, fecha_evento } =
      lead;

    const cliente = {
      nombre: nombreLead,
      email,
      telefono,
      status: "prospecto",
      canalId,
    };

    // Check if the client already exists
    let clienteId;
    let existingCliente = await prisma.cliente.findUnique({
      where: { telefono },
    });

    if (existingCliente) {
      clienteId = existingCliente.id;
    } else {
      // Create a new client if it doesn't exist
      const newCliente = await prisma.cliente.create({ data: cliente });
      clienteId = newCliente.id;
    }

    //✅ NUEVO: Obtener etapa "nuevo" por código inmutable
    const eventoEtapa = await prisma.eventoEtapa.findFirst({
      where: { codigo: "nuevo" },
      select: { id: true },
    });
    const eventoEtapaId = eventoEtapa ? eventoEtapa.id : null;

    const evento = {
      eventoTipoId,
      fecha_evento: new Date(fecha_evento),
      eventoEtapaId,
      clienteId: clienteId,
    };

    // Create a new event in the database
    await prisma.evento.create({
      data: {
        ...evento,
        createdAt: new Date().toISOString(), // Add the current date and time as fecha_creacion in ISO-8601 format
      },
    });
    // console.table({ cliente, newEvento });
    return res.status(200).send("Webhook recibido correctamente");
  } catch (error) {
    console.error("Error en leadsHandle:", error.message);
    res.status(500).send("Error en leadsHandle:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}
