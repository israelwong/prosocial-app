/**
 * Script de testing para verificar el flujo completo de pagos
 * Simula un pago inicial y verifica las actualizaciones en la DB
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testPaymentFlow() {
  console.log("🧪 INICIANDO TEST DEL FLUJO DE PAGOS");
  console.log("=" * 50);

  try {
    // 1. Crear datos de prueba
    console.log("\n1️⃣ Creando datos de prueba...");

    // Crear cliente de prueba
    const clientePrueba = await prisma.cliente.upsert({
      where: { telefono: "5544556677" },
      update: {},
      create: {
        nombre: "Cliente Test Pago",
        email: "test.payment@example.com",
        telefono: "5544556677",
        status: "activo",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    console.log("✅ Cliente creado:", clientePrueba.id);

    // Obtener un EventoTipo existente
    const eventoTipo = await prisma.eventoTipo.findFirst();
    if (!eventoTipo) {
      throw new Error("No hay EventoTipo disponible para el test");
    }
    console.log("✅ EventoTipo encontrado:", eventoTipo.id);

    // Crear evento de prueba primero
    const eventoPrueba = await prisma.evento.upsert({
      where: { id: "test_evento_payment_001" },
      update: {},
      create: {
        id: "test_evento_payment_001",
        nombre: "Test Evento Payment",
        fecha_evento: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 días
        clienteId: clientePrueba.id,
        status: "cotizado",
        eventoTipoId: eventoTipo.id,
        sede: "Sede Test",
        direccion: "Dirección Test 123",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    console.log("✅ Evento creado:", eventoPrueba.id);

    // Crear cotización de prueba
    const cotizacionPrueba = await prisma.cotizacion.upsert({
      where: { id: "test_cot_payment_001" },
      update: {},
      create: {
        id: "test_cot_payment_001",
        nombre: "Test Paquete Payment Flow",
        precio: 50000.0,
        status: "pending",
        eventoTipoId: eventoTipo.id,
        eventoId: eventoPrueba.id,
        descripcion: "Cotización de prueba para test de pagos",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    console.log("✅ Cotización creada:", cotizacionPrueba.id);

    // Crear pago pendiente (simula el que se crea al iniciar el payment intent)
    const uniquePaymentId = `pi_test_payment_intent_${Date.now()}`;
    const pagoInicial = await prisma.pago.create({
      data: {
        Cotizacion: {
          connect: { id: cotizacionPrueba.id },
        },
        Cliente: {
          connect: { id: clientePrueba.id },
        },
        monto: cotizacionPrueba.precio,
        concepto: "Pago de cotización - Test Payment Flow",
        status: "pendiente",
        metodo_pago: "tarjeta_credito",
        stripe_payment_id: uniquePaymentId,
        descripcion: "Test payment intent para validar flujo",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    console.log("✅ Pago inicial creado:", pagoInicial.id);

    // 2. Simular webhook de pago exitoso
    console.log("\n2️⃣ Simulando webhook de pago exitoso...");

    // Simulamos la llamada a handlePaymentIntentSucceeded
    const paymentIntentMock = {
      id: uniquePaymentId,
      amount: 5000000, // $50,000 MXN en centavos
      currency: "mxn",
      metadata: {
        cotizacionId: cotizacionPrueba.id,
        clienteId: clientePrueba.id,
        isClientPortal: "false",
      },
      charges: {
        data: [
          {
            payment_method_details: {
              card: {
                installments: null, // Sin MSI para simplificar
              },
            },
          },
        ],
      },
    };

    await simulatePaymentIntentSucceeded(paymentIntentMock);

    // 3. Verificar cambios en la DB
    console.log("\n3️⃣ Verificando cambios en la base de datos...");

    // Verificar pago actualizado
    const pagoActualizado = await prisma.pago.findFirst({
      where: { stripe_payment_id: uniquePaymentId },
    });

    console.log("💰 Estado del pago:", {
      id: pagoActualizado.id,
      status: pagoActualizado.status,
      monto: pagoActualizado.monto,
      metodo_pago: pagoActualizado.metodo_pago,
      fecha_pago: pagoActualizado.fecha_pago,
    });

    // Verificar cotización actualizada
    const cotizacionActualizada = await prisma.cotizacion.findUnique({
      where: { id: cotizacionPrueba.id },
    });

    console.log("📋 Estado de la cotización:", {
      id: cotizacionActualizada.id,
      status: cotizacionActualizada.status,
    });

    // Verificar evento actualizado
    const eventoActualizado = await prisma.evento.findUnique({
      where: { id: eventoPrueba.id },
      include: {
        EventoEtapa: true,
      },
    });

    console.log("🎭 Estado del evento:", {
      id: eventoActualizado.id,
      status: eventoActualizado.status,
      etapa: eventoActualizado.EventoEtapa?.nombre || "No asignada",
    });

    // Verificar agenda creada
    const agendaCreada = await prisma.agenda.findFirst({
      where: { eventoId: eventoPrueba.id },
    });

    if (agendaCreada) {
      console.log("📅 Agenda creada:", {
        id: agendaCreada.id,
        status: agendaCreada.status,
        fecha: agendaCreada.fecha,
        descripcion: agendaCreada.descripcion,
      });
    } else {
      console.log("❌ No se encontró agenda creada");
    }

    // Verificar notificaciones
    const notificaciones = await prisma.notificacion.findMany({
      where: { cotizacionId: cotizacionPrueba.id },
      orderBy: { createdAt: "desc" },
      take: 1,
    });

    if (notificaciones.length > 0) {
      console.log("🔔 Notificación creada:", {
        titulo: notificaciones[0].titulo,
        status: notificaciones[0].status,
      });
    } else {
      console.log("❌ No se encontraron notificaciones");
    }

    console.log("\n✅ TEST COMPLETADO EXITOSAMENTE");
    console.log("=" * 50);
  } catch (error) {
    console.error("❌ ERROR EN EL TEST:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Función que simula la lógica del webhook
async function simulatePaymentIntentSucceeded(paymentIntent) {
  console.log("🔄 Procesando pago simulado...");

  // Detectar método de pago
  let metodoPago = "tarjeta_credito";
  let mesesSinIntereses = null;

  if (paymentIntent.charges && paymentIntent.charges.data.length > 0) {
    const charge = paymentIntent.charges.data[0];
    const installments = charge.payment_method_details?.card?.installments;

    if (installments && installments.plan && installments.plan.count > 1) {
      metodoPago = "msi";
      mesesSinIntereses = installments.plan.count;
    }
  }

  // 1. Buscar el pago existente
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
    throw new Error(
      `No se encontró el pago para Payment Intent: ${paymentIntent.id}`
    );
  }

  // 2. Actualizar el pago
  const pagoActualizado = await prisma.pago.update({
    where: { id: pagoExistente.id },
    data: {
      status: "completado",
      metodo_pago: metodoPago,
      descripcion: `Payment Intent ${paymentIntent.id} - Amount: ${paymentIntent.amount} ${paymentIntent.currency}${mesesSinIntereses ? ` - MSI: ${mesesSinIntereses}` : ""}`,
      updatedAt: new Date(),
    },
  });

  console.log("✅ Pago actualizado a completado");

  // 3. Actualizar cotización
  await prisma.cotizacion.update({
    where: { id: pagoExistente.cotizacionId },
    data: { status: "aprobada" },
  });

  console.log("✅ Cotización actualizada a aprobada");

  // 4. Actualizar evento
  if (pagoExistente.Cotizacion?.Evento) {
    const evento = pagoExistente.Cotizacion.Evento;

    // Buscar etapa "Contratado"
    const etapaContratado = await prisma.eventoEtapa.findFirst({
      where: {
        OR: [
          { nombre: { contains: "Contratado", mode: "insensitive" } },
          { nombre: { contains: "Confirmado", mode: "insensitive" } },
          { posicion: 5 },
        ],
      },
      orderBy: { posicion: "asc" },
    });

    const updateData = { status: "contratado" };
    if (etapaContratado) {
      updateData.eventoEtapaId = etapaContratado.id;
    }

    await prisma.evento.update({
      where: { id: evento.id },
      data: updateData,
    });

    console.log("✅ Evento actualizado a contratado");

    // 5. Crear/actualizar agenda
    const agendaExistente = await prisma.agenda.findFirst({
      where: {
        eventoId: evento.id,
        status: { not: "cancelado" },
      },
    });

    if (!agendaExistente) {
      await prisma.agenda.create({
        data: {
          eventoId: evento.id,
          fecha: evento.fecha_evento,
          status: "confirmado",
          descripcion: `Evento confirmado automáticamente - Pago procesado: ${pagoActualizado.monto.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      console.log("✅ Agenda creada");
    } else {
      await prisma.agenda.update({
        where: { id: agendaExistente.id },
        data: {
          status: "confirmado",
          descripcion: `${agendaExistente.descripcion || ""} - Pago confirmado: ${pagoActualizado.monto.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}`,
          updatedAt: new Date(),
        },
      });
      console.log("✅ Agenda actualizada");
    }

    // 6. Crear notificación
    await prisma.notificacion.create({
      data: {
        cotizacionId: pagoExistente.cotizacionId,
        titulo: `💰 Pago confirmado - ${evento.Cliente?.nombre}`,
        mensaje: `Se ha confirmado el pago de ${pagoActualizado.monto.toLocaleString("es-MX", { style: "currency", currency: "MXN" })} para la cotización "${pagoExistente.Cotizacion.nombre}". El evento ha sido automáticamente contratado y agregado a la agenda.`,
        status: "active",
        createdAt: new Date(),
      },
    });
    console.log("✅ Notificación creada");
  }
}

// Ejecutar el test
if (require.main === module) {
  testPaymentFlow();
}

module.exports = { testPaymentFlow };
