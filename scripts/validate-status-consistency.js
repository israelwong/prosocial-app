const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Importar nuestras constantes (simuladas aquí para el script)
const STATUS_CONSTANTS = {
    EVENTO_STATUS: {
        PENDIENTE: 'pendiente',
        APROBADO: 'aprobado', 
        CANCELADO: 'cancelado',
        COMPLETADO: 'completado',
        ARCHIVADO: 'archivado',
        // Legacy values
        ACTIVE: 'active',
        CANCELLED: 'cancelled', 
        COMPLETED: 'completed',
        ARCHIVED: 'archived',
        INACTIVE: 'inactive'
    },
    COTIZACION_STATUS: {
        PENDIENTE: 'pendiente',
        APROBADA: 'aprobada',
        RECHAZADA: 'rechazada', 
        EXPIRADA: 'expirada',
        ARCHIVADA: 'archivada',
        // Legacy values
        APROBADO: 'aprobado',
        PENDING: 'pending',
        APPROVED: 'approved',
        REJECTED: 'rejected',
        EXPIRED: 'expired'
    },
    PAGO_STATUS: {
        PENDING: 'pending',
        PAID: 'paid',
        FAILED: 'failed',
        CANCELLED: 'cancelled',
        REFUNDED: 'refunded',
        // Legacy values
        SUCCEEDED: 'succeeded',
        PROCESSING: 'processing',
        PENDIENTE: 'pendiente'    // Valor que encontramos en BD, válido también
    },
    AGENDA_STATUS: {
        PENDIENTE: 'pendiente',
        CONFIRMADO: 'confirmado',
        CANCELADO: 'cancelado', 
        COMPLETADO: 'completado',
        REAGENDADO: 'reagendado',
        // Legacy values
        CONFIRMED: 'confirmed',
        CANCELED: 'canceled'
    },
    CLIENTE_STATUS: {
        PROSPECTO: 'prospecto',
        ACTIVO: 'activo',
        CLIENTE: 'cliente',
        INACTIVO: 'inactivo', 
        ARCHIVADO: 'archivado'
    },
    NOMINA_STATUS: {
        PENDIENTE: 'pendiente',
        AUTORIZADA: 'autorizada',
        PAGADA: 'pagada',
        CANCELADA: 'cancelada'
    }
};

async function validateStatusConsistency() {
    console.log('🔍 VALIDANDO CONSISTENCIA DE STATUS EN BASE DE DATOS\n');
    
    const validacionResults = {
        eventos: { validos: 0, invalidos: 0, detalles: [] },
        cotizaciones: { validos: 0, invalidos: 0, detalles: [] },
        pagos: { validos: 0, invalidos: 0, detalles: [] },
        agenda: { validos: 0, invalidos: 0, detalles: [] },
        clientes: { validos: 0, invalidos: 0, detalles: [] },
        nominas: { validos: 0, invalidos: 0, detalles: [] }
    };

    // 1. Validar EVENTOS
    console.log('📋 Validando status de EVENTOS...');
    const eventos = await prisma.evento.findMany({
        select: { id: true, nombre: true, status: true }
    });
    
    const validEventoStatus = Object.values(STATUS_CONSTANTS.EVENTO_STATUS);
    eventos.forEach(evento => {
        if (validEventoStatus.includes(evento.status)) {
            validacionResults.eventos.validos++;
        } else {
            validacionResults.eventos.invalidos++;
            validacionResults.eventos.detalles.push({
                id: evento.id,
                nombre: evento.nombre,
                status: evento.status
            });
        }
    });

    // 2. Validar COTIZACIONES 
    console.log('📋 Validando status de COTIZACIONES...');
    const cotizaciones = await prisma.cotizacion.findMany({
        select: { id: true, nombre: true, status: true }
    });
    
    const validCotizacionStatus = Object.values(STATUS_CONSTANTS.COTIZACION_STATUS);
    cotizaciones.forEach(cotizacion => {
        if (validCotizacionStatus.includes(cotizacion.status)) {
            validacionResults.cotizaciones.validos++;
        } else {
            validacionResults.cotizaciones.invalidos++;
            validacionResults.cotizaciones.detalles.push({
                id: cotizacion.id,
                nombre: cotizacion.nombre,
                status: cotizacion.status
            });
        }
    });

    // 3. Validar PAGOS
    console.log('📋 Validando status de PAGOS...');
    const pagos = await prisma.pago.findMany({
        select: { id: true, concepto: true, status: true }
    });
    
    const validPagoStatus = Object.values(STATUS_CONSTANTS.PAGO_STATUS);
    pagos.forEach(pago => {
        if (validPagoStatus.includes(pago.status)) {
            validacionResults.pagos.validos++;
        } else {
            validacionResults.pagos.invalidos++;
            validacionResults.pagos.detalles.push({
                id: pago.id,
                concepto: pago.concepto,
                status: pago.status
            });
        }
    });

    // 4. Validar AGENDA
    console.log('📋 Validando status de AGENDA...');
    const agenda = await prisma.agenda.findMany({
        select: { id: true, concepto: true, status: true }
    });
    
    const validAgendaStatus = Object.values(STATUS_CONSTANTS.AGENDA_STATUS);
    agenda.forEach(item => {
        if (validAgendaStatus.includes(item.status)) {
            validacionResults.agenda.validos++;
        } else {
            validacionResults.agenda.invalidos++;
            validacionResults.agenda.detalles.push({
                id: item.id,
                concepto: item.concepto,
                status: item.status
            });
        }
    });

    // 5. Validar CLIENTES
    console.log('📋 Validando status de CLIENTES...');
    const clientes = await prisma.cliente.findMany({
        select: { id: true, nombre: true, status: true }
    });
    
    const validClienteStatus = Object.values(STATUS_CONSTANTS.CLIENTE_STATUS);
    clientes.forEach(cliente => {
        if (validClienteStatus.includes(cliente.status)) {
            validacionResults.clientes.validos++;
        } else {
            validacionResults.clientes.invalidos++;
            validacionResults.clientes.detalles.push({
                id: cliente.id,
                nombre: cliente.nombre,
                status: cliente.status
            });
        }
    });

    // 6. Validar NOMINAS (si existe la tabla)
    try {
        console.log('📋 Validando status de NOMINAS...');
        const nominas = await prisma.nomina.findMany({
            select: { id: true, concepto: true, status: true }
        });
        
        const validNominaStatus = Object.values(STATUS_CONSTANTS.NOMINA_STATUS);
        nominas.forEach(nomina => {
            if (validNominaStatus.includes(nomina.status)) {
                validacionResults.nominas.validos++;
            } else {
                validacionResults.nominas.invalidos++;
                validacionResults.nominas.detalles.push({
                    id: nomina.id,
                    concepto: nomina.concepto,
                    status: nomina.status
                });
            }
        });
    } catch (error) {
        console.log('⚠️ Tabla nomina no encontrada o sin campo status');
    }

    // RESUMEN
    console.log('\n' + '='.repeat(80));
    console.log('📊 RESUMEN DE VALIDACIÓN DE STATUS');
    console.log('='.repeat(80));
    
    Object.entries(validacionResults).forEach(([tabla, result]) => {
        const total = result.validos + result.invalidos;
        const porcentaje = total > 0 ? (result.validos / total * 100).toFixed(1) : '0.0';
        
        console.log(`\n${tabla.toUpperCase()}:`);
        console.log(`  ✅ Válidos: ${result.validos}/${total} (${porcentaje}%)`);
        console.log(`  ❌ Inválidos: ${result.invalidos}`);
        
        if (result.invalidos > 0) {
            console.log(`  🔍 Registros con status inválidos:`);
            result.detalles.slice(0, 5).forEach(detalle => {
                console.log(`    - ID: ${detalle.id} | Nombre: ${detalle.nombre || detalle.concepto} | Status: "${detalle.status}"`);
            });
            if (result.detalles.length > 5) {
                console.log(`    ... y ${result.detalles.length - 5} más`);
            }
        }
    });

    const totalValidos = Object.values(validacionResults).reduce((sum, r) => sum + r.validos, 0);
    const totalInvalidos = Object.values(validacionResults).reduce((sum, r) => sum + r.invalidos, 0);
    const total = totalValidos + totalInvalidos;
    const porcentajeGeneral = total > 0 ? (totalValidos / total * 100).toFixed(1) : '0.0';

    console.log('\n' + '='.repeat(80));
    console.log(`🎯 RESULTADO GENERAL: ${totalValidos}/${total} registros válidos (${porcentajeGeneral}%)`);
    
    if (totalInvalidos > 0) {
        console.log(`\n⚠️ Se encontraron ${totalInvalidos} registros con status inválidos que necesitan migración.`);
        console.log('💡 Ejecuta el script de migración para homologar estos valores.');
    } else {
        console.log('\n🎉 ¡Todos los status están validados y son consistentes!');
    }
    
    await prisma.$disconnect();
}

validateStatusConsistency().catch(console.error);
