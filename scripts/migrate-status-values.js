const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Mapas de migración (basados en nuestras constantes)
const MIGRATION_MAPS = {
    EVENTO_STATUS: {
        // Legacy -> Target
        'active': 'pendiente',
        'cancelled': 'cancelado', 
        'completed': 'completado',
        'archived': 'archivado',
        'inactive': 'archivado'
        // Los valores correctos se mantienen igual
    },
    COTIZACION_STATUS: {
        // Legacy -> Target
        'aprobado': 'aprobada',  // Corrección de género
        'pending': 'pendiente',
        'approved': 'aprobada',
        'rejected': 'rechazada',
        'expired': 'expirada'
        // Los valores correctos se mantienen igual
    },
    PAGO_STATUS: {
        // Legacy -> Target  
        'succeeded': 'paid',
        'processing': 'pending',
        'completado': 'paid'       // completado -> paid
        // 'pendiente' ya está bien, los pagos usan inglés
        // Los valores correctos se mantienen igual
    },
    AGENDA_STATUS: {
        // Legacy -> Target
        'confirmed': 'confirmado',
        'canceled': 'cancelado'
        // Los valores correctos se mantienen igual
    },
    CLIENTE_STATUS: {
        // Legacy -> Target
        'Prospecto': 'prospecto'   // Mayúscula -> minúscula
        // Los valores correctos se mantienen igual
    }
};

async function migrateStatusValues(dryRun = true) {
    console.log('🔄 MIGRACIÓN DE STATUS A VALORES HOMOLOGADOS\n');
    
    if (dryRun) {
        console.log('🔍 MODO DRY RUN - Solo mostrar cambios, no ejecutar\n');
    } else {
        console.log('⚠️ MODO EJECUCIÓN - Se aplicarán los cambios en la base de datos\n');
    }

    const migrationResults = {
        eventos: { migrados: 0, errores: 0 },
        cotizaciones: { migrados: 0, errores: 0 },
        pagos: { migrados: 0, errores: 0 },
        agenda: { migrados: 0, errores: 0 },
        clientes: { migrados: 0, errores: 0 }
    };

    // 1. Migrar EVENTOS
    console.log('📋 Migrando status de EVENTOS...');
    const eventosParaMigrar = await prisma.evento.findMany({
        where: {
            status: {
                in: Object.keys(MIGRATION_MAPS.EVENTO_STATUS)
            }
        },
        select: { id: true, nombre: true, status: true }
    });

    for (const evento of eventosParaMigrar) {
        const nuevoStatus = MIGRATION_MAPS.EVENTO_STATUS[evento.status];
        console.log(`  📌 Evento "${evento.nombre}" | ${evento.status} -> ${nuevoStatus}`);
        
        if (!dryRun) {
            try {
                await prisma.evento.update({
                    where: { id: evento.id },
                    data: { status: nuevoStatus }
                });
                migrationResults.eventos.migrados++;
            } catch (error) {
                console.error(`    ❌ Error migrando evento ${evento.id}:`, error.message);
                migrationResults.eventos.errores++;
            }
        } else {
            migrationResults.eventos.migrados++;
        }
    }

    // 2. Migrar COTIZACIONES
    console.log('\n📋 Migrando status de COTIZACIONES...');
    const cotizacionesParaMigrar = await prisma.cotizacion.findMany({
        where: {
            status: {
                in: Object.keys(MIGRATION_MAPS.COTIZACION_STATUS)
            }
        },
        select: { id: true, nombre: true, status: true }
    });

    for (const cotizacion of cotizacionesParaMigrar) {
        const nuevoStatus = MIGRATION_MAPS.COTIZACION_STATUS[cotizacion.status];
        console.log(`  📌 Cotización "${cotizacion.nombre}" | ${cotizacion.status} -> ${nuevoStatus}`);
        
        if (!dryRun) {
            try {
                await prisma.cotizacion.update({
                    where: { id: cotizacion.id },
                    data: { status: nuevoStatus }
                });
                migrationResults.cotizaciones.migrados++;
            } catch (error) {
                console.error(`    ❌ Error migrando cotización ${cotizacion.id}:`, error.message);
                migrationResults.cotizaciones.errores++;
            }
        } else {
            migrationResults.cotizaciones.migrados++;
        }
    }

    // 3. Migrar PAGOS
    console.log('\n📋 Migrando status de PAGOS...');
    const pagosParaMigrar = await prisma.pago.findMany({
        where: {
            status: {
                in: Object.keys(MIGRATION_MAPS.PAGO_STATUS)
            }
        },
        select: { id: true, concepto: true, status: true }
    });

    for (const pago of pagosParaMigrar) {
        const nuevoStatus = MIGRATION_MAPS.PAGO_STATUS[pago.status];
        console.log(`  📌 Pago "${pago.concepto}" | ${pago.status} -> ${nuevoStatus}`);
        
        if (!dryRun) {
            try {
                await prisma.pago.update({
                    where: { id: pago.id },
                    data: { status: nuevoStatus }
                });
                migrationResults.pagos.migrados++;
            } catch (error) {
                console.error(`    ❌ Error migrando pago ${pago.id}:`, error.message);
                migrationResults.pagos.errores++;
            }
        } else {
            migrationResults.pagos.migrados++;
        }
    }

    // 4. Migrar AGENDA
    console.log('\n📋 Migrando status de AGENDA...');
    const agendaParaMigrar = await prisma.agenda.findMany({
        where: {
            status: {
                in: Object.keys(MIGRATION_MAPS.AGENDA_STATUS)
            }
        },
        select: { id: true, concepto: true, status: true }
    });

    for (const item of agendaParaMigrar) {
        const nuevoStatus = MIGRATION_MAPS.AGENDA_STATUS[item.status];
        console.log(`  📌 Agenda "${item.concepto}" | ${item.status} -> ${nuevoStatus}`);
        
        if (!dryRun) {
            try {
                await prisma.agenda.update({
                    where: { id: item.id },
                    data: { status: nuevoStatus }
                });
                migrationResults.agenda.migrados++;
            } catch (error) {
                console.error(`    ❌ Error migrando agenda ${item.id}:`, error.message);
                migrationResults.agenda.errores++;
            }
        } else {
            migrationResults.agenda.migrados++;
        }
    }

    // 5. Migrar CLIENTES
    console.log('\n📋 Migrando status de CLIENTES...');
    const clientesParaMigrar = await prisma.cliente.findMany({
        where: {
            status: {
                in: Object.keys(MIGRATION_MAPS.CLIENTE_STATUS)
            }
        },
        select: { id: true, nombre: true, status: true }
    });

    for (const cliente of clientesParaMigrar) {
        const nuevoStatus = MIGRATION_MAPS.CLIENTE_STATUS[cliente.status];
        console.log(`  📌 Cliente "${cliente.nombre}" | ${cliente.status} -> ${nuevoStatus}`);
        
        if (!dryRun) {
            try {
                await prisma.cliente.update({
                    where: { id: cliente.id },
                    data: { status: nuevoStatus }
                });
                migrationResults.clientes.migrados++;
            } catch (error) {
                console.error(`    ❌ Error migrando cliente ${cliente.id}:`, error.message);
                migrationResults.clientes.errores++;
            }
        } else {
            migrationResults.clientes.migrados++;
        }
    }

    // RESUMEN
    console.log('\n' + '='.repeat(80));
    console.log('📊 RESUMEN DE MIGRACIÓN');
    console.log('='.repeat(80));
    
    Object.entries(migrationResults).forEach(([tabla, result]) => {
        console.log(`\n${tabla.toUpperCase()}:`);
        console.log(`  ✅ Migrados: ${result.migrados}`);
        if (result.errores > 0) {
            console.log(`  ❌ Errores: ${result.errores}`);
        }
    });

    const totalMigrados = Object.values(migrationResults).reduce((sum, r) => sum + r.migrados, 0);
    const totalErrores = Object.values(migrationResults).reduce((sum, r) => sum + r.errores, 0);

    console.log('\n' + '='.repeat(80));
    console.log(`🎯 RESULTADO: ${totalMigrados} registros procesados`);
    if (totalErrores > 0) {
        console.log(`⚠️ ${totalErrores} errores encontrados`);
    }
    
    if (dryRun) {
        console.log('\n💡 Para aplicar los cambios, ejecuta el script con: node scripts/migrate-status-values.js --execute');
    } else {
        console.log('\n🎉 ¡Migración completada!');
        console.log('💡 Ejecuta el script de validación para verificar los resultados.');
    }
    
    await prisma.$disconnect();
}

// Obtener argumentos de línea de comandos
const args = process.argv.slice(2);
const executeMode = args.includes('--execute') || args.includes('-e');

migrateStatusValues(!executeMode).catch(console.error);
