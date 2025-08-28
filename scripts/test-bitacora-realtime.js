#!/usr/bin/env node

/**
 * Script para probar el sistema realtime de EventoBitacora
 * Simula la inserción de nuevas entradas de bitácora para verificar 
 * que el componente FichaBitacoraUnificada se actualice automáticamente
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testBitacoraRealtime() {
    try {
        console.log('🧪 INICIANDO TEST DE REALTIME PARA EVENTO BITÁCORA')
        console.log('=' .repeat(60))

        // Obtener el primer evento disponible para testing
        const evento = await prisma.evento.findFirst({
            select: {
                id: true,
                nombre: true,
                status: true
            }
        })

        if (!evento) {
            console.error('❌ No se encontró ningún evento para testing')
            return
        }

        console.log('📋 Evento seleccionado para testing:')
        console.log(`   ID: ${evento.id}`)
        console.log(`   Nombre: ${evento.nombre}`)
        console.log(`   Status: ${evento.status}`)
        console.log('')

        // Crear nueva entrada de bitácora
        console.log('➕ Creando nueva entrada de bitácora...')
        const nuevaBitacora = await prisma.eventoBitacora.create({
            data: {
                eventoId: evento.id,
                comentario: `Prueba realtime - ${new Date().toLocaleString('es-ES')}`,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        })

        console.log('✅ Entrada de bitácora creada:')
        console.log(`   ID: ${nuevaBitacora.id}`)
        console.log(`   Comentario: ${nuevaBitacora.comentario}`)
        console.log(`   Fecha: ${nuevaBitacora.createdAt}`)
        console.log('')

        // Esperar un momento
        console.log('⏳ Esperando 3 segundos...')
        await new Promise(resolve => setTimeout(resolve, 3000))

        // Actualizar la entrada
        console.log('✏️ Actualizando entrada de bitácora...')
        const bitacoraActualizada = await prisma.eventoBitacora.update({
            where: { id: nuevaBitacora.id },
            data: {
                comentario: `Actualización realtime - ${new Date().toLocaleString('es-ES')}`,
                updatedAt: new Date()
            }
        })

        console.log('✅ Entrada actualizada:')
        console.log(`   ID: ${bitacoraActualizada.id}`)
        console.log(`   Nuevo comentario: ${bitacoraActualizada.comentario}`)
        console.log(`   Fecha actualización: ${bitacoraActualizada.updatedAt}`)
        console.log('')

        // Esperar otro momento
        console.log('⏳ Esperando 3 segundos más...')
        await new Promise(resolve => setTimeout(resolve, 3000))

        // Eliminar la entrada de prueba
        console.log('🗑️ Eliminando entrada de prueba...')
        await prisma.eventoBitacora.delete({
            where: { id: nuevaBitacora.id }
        })

        console.log('✅ Entrada eliminada exitosamente')
        console.log('')
        console.log('🎉 TEST REALTIME COMPLETADO')
        console.log('=' .repeat(60))
        console.log('📊 Resumen:')
        console.log('   ✅ INSERT - Debería aparecer nueva entrada automáticamente')
        console.log('   ✅ UPDATE - Debería actualizarse el comentario automáticamente')
        console.log('   ✅ DELETE - Debería desaparecer la entrada automáticamente')
        console.log('')
        console.log('🔍 Verifica en la interfaz que los cambios aparezcan sin refrescar la página')

    } catch (error) {
        console.error('❌ Error en el test:', error)
    } finally {
        await prisma.$disconnect()
    }
}

// Ejecutar el test
testBitacoraRealtime()
