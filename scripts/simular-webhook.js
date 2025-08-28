#!/usr/bin/env node

// Script simple para crear notificaciones como lo hace el webhook de Stripe
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function simularWebhookStripe() {
  console.log('🎯 Simulando webhook de Stripe - creando notificación...')
  
  try {
    const notificacion = await prisma.notificacion.create({
      data: {
        titulo: `💰 Pago confirmado - Test Cliente`,
        mensaje: `Se ha confirmado el pago de $5,000.00 MXN para la cotización "Test Boda". El evento ha sido automáticamente contratado y agregado a la agenda.`,
        tipo: "pago_confirmado",
        metadata: {
          eventoId: "test-evento-123",
          pagoId: "test-pago-456",
          monto: 5000,
          metodoPago: "stripe_test",
          clienteId: "test-cliente-789",
          clienteNombre: "Test Cliente",
          rutaDestino: `/admin/dashboard/seguimiento/test-evento-123`,
          accionBitacora: {
            habilitada: true,
            mensaje: `Pago confirmado: $5,000.00 MXN - Stripe Test`,
          },
        },
        status: "active"
      },
    })

    console.log("✅ Notificación creada exitosamente:")
    console.log(`   - ID: ${notificacion.id}`)
    console.log(`   - Título: ${notificacion.titulo}`)
    console.log(`   - Tipo: ${notificacion.tipo}`)
    console.log(`   - Status: ${notificacion.status}`)
    console.log(`   - Hora: ${notificacion.createdAt}`)
    
    console.log('\n🔔 La notificación debería aparecer en tiempo real en el admin.')
    console.log('   Si no aparece inmediatamente, es un problema de realtime.')
    
  } catch (error) {
    console.error('❌ Error creando notificación:', error)
  } finally {
    await prisma.$disconnect()
  }
}

simularWebhookStripe()
