#!/usr/bin/env node

// Script para probar las notificaciones realtime
const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Faltan variables de entorno de Supabase');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    }
});

const prisma = new PrismaClient();

async function probarNotificacionesRealtime() {
    console.log('🔔 Iniciando test de notificaciones realtime...\n');
    
    // 1. Configurar suscripción
    console.log('📡 Configurando canal realtime...');
    
    const channel = supabase
        .channel('test-notificaciones', {
            config: {
                presence: { key: 'test' },
                broadcast: { self: false }
            }
        })
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'Notificacion'
            },
            (payload) => {
                console.log('🎉 ¡EVENTO REALTIME RECIBIDO!', {
                    eventType: payload.eventType,
                    timestamp: new Date().toISOString(),
                    data: payload.new || payload.old
                });
            }
        )
        .subscribe((status, err) => {
            if (err) {
                console.error('❌ Error en suscripción:', err);
            } else {
                console.log('✅ Estado de suscripción:', status);
            }
        });

    // Esperar 3 segundos para que se establezca la conexión
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 2. Crear notificación de prueba
    console.log('\n🧪 Creando notificación de prueba...');
    
    try {
        const notificacion = await prisma.notificacion.create({
            data: {
                titulo: '🔔 TEST REALTIME',
                mensaje: `Notificación de prueba realtime - ${new Date().toLocaleString('es-MX')}`,
                tipo: 'general',
                metadata: {
                    test: true,
                    timestamp: new Date().toISOString()
                },
                status: 'active'
            }
        });
        
        console.log('✅ Notificación creada:', {
            id: notificacion.id,
            titulo: notificacion.titulo,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error creando notificación:', error);
    }
    
    // 3. Esperar eventos
    console.log('\n⏳ Esperando eventos realtime (10 segundos)...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // 4. Cleanup
    console.log('\n🧹 Limpiando recursos...');
    supabase.removeChannel(channel);
    await prisma.$disconnect();
    
    console.log('✅ Test completado');
}

// Manejo de señales para cleanup
process.on('SIGINT', async () => {
    console.log('\n🛑 Interrumpido por usuario');
    await prisma.$disconnect();
    process.exit(0);
});

probarNotificacionesRealtime();
