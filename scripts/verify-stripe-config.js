#!/usr/bin/env node

/**
 * 🔍 Script para verificar configuración de Stripe
 * Verifica variables de entorno y conectividad con Stripe
 */

console.log('🔍 Verificando configuración de Stripe...\n');

// Verificar variables de entorno
const requiredVars = [
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET'
];

let allVarsPresent = true;

console.log('📋 Variables de entorno:');
requiredVars.forEach(varName => {
    const value = process.env[varName];
    const isPresent = !!value;
    const displayValue = isPresent 
        ? `${value.substring(0, 10)}...${value.substring(value.length - 6)}`
        : '❌ NO DEFINIDA';
    
    console.log(`  ${isPresent ? '✅' : '❌'} ${varName}: ${displayValue}`);
    
    if (!isPresent) {
        allVarsPresent = false;
    }
});

console.log('\n🌍 Variables públicas en el navegador:');
console.log(`  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${typeof window !== 'undefined' ? 'Disponible' : 'Solo servidor'}`);

if (!allVarsPresent) {
    console.log('\n❌ FALTAN VARIABLES DE ENTORNO');
    console.log('Para configurar en Vercel:');
    console.log('1. Ve a tu dashboard de Vercel');
    console.log('2. Selecciona tu proyecto');
    console.log('3. Ve a Settings > Environment Variables');
    console.log('4. Agrega las variables faltantes');
    process.exit(1);
}

// Si estamos en servidor, verificar conectividad con Stripe
if (process.env.STRIPE_SECRET_KEY) {
    console.log('\n🔌 Verificando conectividad con Stripe...');
    
    try {
        const Stripe = require('stripe');
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2023-08-16',
        });
        
        // Test básico de conectividad
        stripe.customers.list({ limit: 1 })
            .then(() => {
                console.log('✅ Conexión con Stripe exitosa');
            })
            .catch((error) => {
                console.log('❌ Error de conexión con Stripe:', error.message);
            });
            
    } catch (error) {
        console.log('⚠️ No se pudo verificar conectividad:', error.message);
    }
}

console.log('\n✅ Verificación completada');
