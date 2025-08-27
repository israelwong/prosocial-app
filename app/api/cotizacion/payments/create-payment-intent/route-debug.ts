import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
})

export async function POST(request: NextRequest) {
    try {
        const {
            cotizacionId,
            metodoPago,
            montoBase,
            montoConComision,
            condicionId, // 🆕 ID de condiciones comerciales (viene como condicionId del frontend)
            metodoPagoId,
            descuento, // 🆕 Descuento viene del frontend solo si es > 0
            numMsi
        } = await request.json()

        console.log('🚨 === MODO DEBUG API - ANÁLISIS DE DATOS ===')
        console.log('🚀 CREATE-PAYMENT-INTENT COTIZACIONES (App Router)')
        console.log('📊 Datos recibidos del frontend:', {
            cotizacionId,
            metodoPago,
            montoBase, // 🆕 Monto que se abona al cliente
            montoConComision, // 🆕 Monto que se cobra en Stripe
            condicionId, // 🆕 ID de condiciones comerciales
            metodoPagoId, // 🆕 ID del método de pago
            descuento: descuento || 'No enviado', // 🆕 Solo viene si es > 0
            numMsi: numMsi || 0
        })

        // 🔍 VALIDACIÓN BÁSICA
        if (!cotizacionId) {
            console.log('❌ cotizacionId faltante')
            return NextResponse.json({
                error: 'cotizacionId es requerido.'
            }, { status: 400 })
        }

        // 🔍 VERIFICAR SI LA COTIZACIÓN EXISTE
        const cotizacion = await prisma.cotizacion.findUnique({
            where: { id: cotizacionId },
            include: {
                Evento: {
                    include: {
                        Cliente: true,
                    },
                },
                CondicionesComerciales: true,
            },
        })

        if (!cotizacion) {
            console.log('❌ Cotización no encontrada en BD')
            return NextResponse.json({
                error: 'Cotización no encontrada'
            }, { status: 404 })
        }

        console.log('✅ Cotización encontrada en BD:', {
            id: cotizacion.id,
            nombre: cotizacion.nombre,
            precio: cotizacion.precio,
            status: cotizacion.status,
            cliente: cotizacion.Evento?.Cliente?.nombre,
            fecha_evento: cotizacion.Evento?.fecha_evento,
            condiciones_comerciales: cotizacion.CondicionesComerciales ? {
                id: cotizacion.CondicionesComerciales.id,
                nombre: cotizacion.CondicionesComerciales.nombre,
                descuento: cotizacion.CondicionesComerciales.descuento,
                porcentaje_anticipo: cotizacion.CondicionesComerciales.porcentaje_anticipo
            } : null
        })

        // 🔍 ANÁLISIS DE DESCUENTO
        let descuentoAnalisis = {
            frontend: descuento || null,
            baseDatos: cotizacion.CondicionesComerciales?.descuento || null,
            aplicado: descuento || cotizacion.CondicionesComerciales?.descuento || 0,
            fuente: descuento && descuento > 0 ? 'FRONTEND' : 'BASE_DATOS'
        }

        console.log('🔍 ANÁLISIS DE DESCUENTO:', descuentoAnalisis)

        // 🔍 ANÁLISIS DE CONDICIÓN COMERCIAL
        if (condicionId) {
            const condicionComercial = await prisma.condicionesComerciales.findUnique({
                where: { id: condicionId }
            })

            console.log('🔍 CONDICIÓN COMERCIAL:', condicionComercial ? {
                id: condicionComercial.id,
                nombre: condicionComercial.nombre,
                descuento: condicionComercial.descuento,
                porcentaje_anticipo: condicionComercial.porcentaje_anticipo,
                status: condicionComercial.status
            } : 'NO ENCONTRADA')
        }

        // 🔍 ANÁLISIS DE MÉTODO DE PAGO
        if (metodoPagoId) {
            const metodoPagoBD = await prisma.metodoPago.findUnique({
                where: { id: metodoPagoId }
            })

            console.log('🔍 MÉTODO DE PAGO BD:', metodoPagoBD ? {
                id: metodoPagoBD.id,
                metodo_pago: metodoPagoBD.metodo_pago,
                payment_method: metodoPagoBD.payment_method,
                comision_porcentaje_base: metodoPagoBD.comision_porcentaje_base,
                comision_fija_monto: metodoPagoBD.comision_fija_monto,
                comision_msi_porcentaje: metodoPagoBD.comision_msi_porcentaje,
                num_msi: metodoPagoBD.num_msi
            } : 'NO ENCONTRADO')
        }

        // 🚨 MODO DEBUG: RETORNAR DATOS SIN PROCESAR
        console.log('🛑 MODO DEBUG ACTIVADO - NO se creará Payment Intent')
        console.log('🛑 MODO DEBUG ACTIVADO - NO se guardará en BD')
        console.log('🚨 === FIN DEBUG API ===')

        return NextResponse.json({
            debug: true,
            message: 'MODO DEBUG: Datos recibidos pero no procesados',
            datosRecibidos: {
                cotizacionId,
                metodoPago,
                montoBase,
                montoConComision,
                condicionId,
                metodoPagoId,
                descuento: descuento || null,
                numMsi: numMsi || 0
            },
            cotizacionBD: {
                id: cotizacion.id,
                nombre: cotizacion.nombre,
                precio: cotizacion.precio,
                status: cotizacion.status,
                descuento_actual: cotizacion.descuento
            },
            descuentoAnalisis,
            clientSecret: 'DEBUG_MODE_NO_CLIENT_SECRET'
        }, { status: 200 })

    } catch (error) {
        console.error('❌ Error en MODO DEBUG:', error)
        return NextResponse.json({
            error: 'Error interno del servidor en modo debug',
            details: error instanceof Error ? error.message : 'Error desconocido',
        }, { status: 500 })
    }
}
