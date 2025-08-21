const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Definir las constantes localmente para el test
const EVENTO_STATUS = {
  PENDIENTE: 'pendiente',
  APROBADO: 'aprobado', 
  CANCELADO: 'cancelado',
  COMPLETADO: 'completado',
  ARCHIVADO: 'archivado'
};

const COTIZACION_STATUS = {
  PENDIENTE: 'pendiente',
  APROBADA: 'aprobada'
};

const PAGO_STATUS = {
  PENDING: 'pending',
  PAID: 'paid'
};

// Mapeos de migración
const EVENTO_STATUS_MIGRATION_MAP = {
  'active': EVENTO_STATUS.PENDIENTE,
  'aprobado': EVENTO_STATUS.APROBADO,
  'cancelled': EVENTO_STATUS.CANCELADO,
  'completed': EVENTO_STATUS.COMPLETADO,
  'archived': EVENTO_STATUS.ARCHIVADO,
  'inactive': EVENTO_STATUS.ARCHIVADO,
};

const COTIZACION_STATUS_MIGRATION_MAP = {
  'pending': COTIZACION_STATUS.PENDIENTE,
  'pendiente': COTIZACION_STATUS.PENDIENTE,
  'aprobada': COTIZACION_STATUS.APROBADA,
};

const PAGO_STATUS_MIGRATION_MAP = {
  'pending': PAGO_STATUS.PENDING,
  'pendiente': PAGO_STATUS.PENDING,
  'paid': PAGO_STATUS.PAID,
  'completado': PAGO_STATUS.PAID,
  'succeeded': PAGO_STATUS.PAID,
};

function migrarEventoStatus(legacyStatus) {
  return EVENTO_STATUS_MIGRATION_MAP[legacyStatus.toLowerCase()] || EVENTO_STATUS.PENDIENTE;
}

function migrarCotizacionStatus(legacyStatus) {
  return COTIZACION_STATUS_MIGRATION_MAP[legacyStatus.toLowerCase()] || COTIZACION_STATUS.PENDIENTE;
}

function migrarPagoStatus(legacyStatus) {
  return PAGO_STATUS_MIGRATION_MAP[legacyStatus.toLowerCase()] || PAGO_STATUS.PENDING;
}

async function testMigration() {
  console.log('🔄 TESTING STATUS MIGRATION FUNCTIONS');
  console.log('=====================================\n');

  try {
    // Test Eventos
    const eventos = await prisma.evento.findMany({
      select: { status: true },
      distinct: ['status']
    });
    
    console.log('📋 EVENTO STATUS MIGRATION:');
    eventos.forEach(e => {
      const migrated = migrarEventoStatus(e.status);
      console.log(`  "${e.status}" -> "${migrated}"`);
    });

    // Test Cotizaciones
    const cotizaciones = await prisma.cotizacion.findMany({
      select: { status: true },
      distinct: ['status']
    });
    
    console.log('\n💼 COTIZACION STATUS MIGRATION:');
    cotizaciones.forEach(c => {
      const migrated = migrarCotizacionStatus(c.status);
      console.log(`  "${c.status}" -> "${migrated}"`);
    });

    // Test Pagos
    const pagos = await prisma.pago.findMany({
      select: { status: true },
      distinct: ['status']
    });
    
    console.log('\n💳 PAGO STATUS MIGRATION:');
    pagos.forEach(p => {
      const migrated = migrarPagoStatus(p.status);
      console.log(`  "${p.status}" -> "${migrated}"`);
    });

    // Test Agenda
    const agenda = await prisma.agenda.findMany({
      select: { status: true },
      distinct: ['status']
    });
    
    console.log('\n📅 AGENDA STATUS (ya homologados):');
    agenda.forEach(a => {
      console.log(`  "${a.status}" (mantener)`);
    });

    console.log('\n✅ Migration test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMigration();
