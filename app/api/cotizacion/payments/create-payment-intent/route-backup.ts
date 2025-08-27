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
            descuento // 🆕 Descuento viene del frontend solo si es > 0
        } = await request.json()

        console.log('� === MODO DEBUG API - ANÁLISIS DE DATOS ===')
        console.log('�🚀 CREATE-PAYMENT-INTENT COTIZACIONES (App Router)')
        console.log('📊 Datos recibidos del frontend:', {
            cotizacionId,
            metodoPago,
            montoBase, // 🆕 Monto que se abona al cliente
            montoConComision, // 🆕 Monto que se cobra en Stripe
            condicionId, // 🆕 ID de condiciones comerciales
            metodoPagoId, // 🆕 ID del método de pago
            descuento: descuento || 'No enviado' // 🆕 Solo viene si es > 0
        })
        
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
                descuento: descuento || null
            },
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

        if (!cotizacionId) {
            return NextResponse.json({
                error: 'cotizacionId es requerido.'
            }, { status: 400 })
        }

        // 1. 🔍 Obtener cotización y evento
        const cotizacion = await prisma.cotizacion.findUnique({
            where: { id: cotizacionId },
            include: {
                Evento: {
                    include: {
                        Cliente: true,
                    },
                },
                CondicionesComerciales: true, // 🆕 Incluir condiciones comerciales
            },
        })

        if (!cotizacion) {
            console.error('❌ Cotización no encontrada:', { cotizacionId })
            return NextResponse.json({
                error: 'Cotización no encontrada.'
            }, { status: 404 })
        }

        // 🆕 1.5 Obtener descuento - PRIORITARIO desde frontend
        let descuentoPorcentaje = 0

        if (descuento && descuento > 0) {
            // ✅ PRIORITARIO: Si viene descuento del frontend (solo cuando es > 0)
            descuentoPorcentaje = descuento
            console.log('✅ Usando descuento del frontend:', descuento + '%')
        } else if (condicionId) {
            // 🔄 FALLBACK: Si viene condicionId pero no descuento, consultar BD
            const condicionesElegidas = await prisma.condicionesComerciales.findUnique({
                where: { id: condicionId }
            })
            descuentoPorcentaje = condicionesElegidas?.descuento || 0
            console.log('🔄 Descuento desde BD por condicionId:', descuentoPorcentaje + '%')
        } else if (cotizacion.CondicionesComerciales) {
            // 🔄 FALLBACK: Si no viene nada, usar las condiciones de la cotización
            descuentoPorcentaje = cotizacion.CondicionesComerciales.descuento || 0
            console.log('🔄 Descuento desde cotización existente:', descuentoPorcentaje + '%')
        }

        console.log('🎯 Descuento final aplicado:', {
            fuente: descuento && descuento > 0 ? 'FRONTEND' : 'BASE_DATOS',
            condicionId,
            descuentoPorcentaje,
            precioOriginal: cotizacion.precio,
            montoDescuento: cotizacion.precio * (descuentoPorcentaje / 100)
        })

        // 2. 🧮 Cálculo de montos con separación de comisiones
        let montoAbonoCliente, montoCobroStripe, comisionCalculada

        if (montoBase && montoConComision) {
            // 🎯 NUEVO: Usar montos separados
            montoAbonoCliente = Number(montoBase)
            montoCobroStripe = Number(montoConComision)
            comisionCalculada = metodoPago === 'spei' ? 0 : (montoCobroStripe - montoAbonoCliente)
        } else if (montoConComision) {
            // Fallback: Solo se proporcionó monto con comisión (comportamiento anterior)
            montoCobroStripe = Number(montoConComision)
            montoAbonoCliente = montoCobroStripe // Asumir sin comisión
            comisionCalculada = 0
        } else {
            // Fallback: Usar precio original de la cotización
            montoAbonoCliente = Number(cotizacion.precio)
            montoCobroStripe = montoAbonoCliente
            comisionCalculada = 0
        }

        const montoFinalEnCentavos = Math.round(montoCobroStripe * 100)

        console.log('💰 Detalles del pago cotizaciones:', {
            montoAbonoCliente, // 🆕 Lo que se abona al cliente
            montoCobroStripe, // 🆕 Lo que cobra Stripe
            comisionCalculada, // 🆕 Comisión calculada
            centavos: montoFinalEnCentavos,
            metodoPago,
            cliente: cotizacion.Evento?.Cliente?.nombre,
        })

        // 🚨 VALIDACIÓN: Verificar que los cálculos sean coherentes
        if (metodoPago !== 'spei' && montoBase && montoConComision &&
            Math.abs((montoAbonoCliente + comisionCalculada) - montoCobroStripe) > 0.01) {
            console.error('❌ ERROR: Inconsistencia en cálculos de comisión cotizaciones', {
                montoAbonoCliente,
                comisionCalculada,
                suma: montoAbonoCliente + comisionCalculada,
                montoCobroStripe
            })
            return NextResponse.json({
                error: 'Error en cálculo de comisiones'
            }, { status: 400 })
        }

        // 3. 🎯 Configurar Payment Intent según método de pago
        let paymentIntentData: any = {
            amount: montoFinalEnCentavos,
            currency: 'mxn',
            metadata: {
                cotizacionId: cotizacion.id,
                cliente_nombre: cotizacion.Evento?.Cliente?.nombre || '',
                evento_id: cotizacion.Evento?.id || '',
                evento_fecha: cotizacion.Evento?.fecha_evento ?
                    Math.floor(new Date(cotizacion.Evento.fecha_evento).getTime() / 1000).toString() : '',
                metodo_pago: metodoPago || 'card',
                source: 'cotizacion', // 🎯 Identificador para el webhook
                monto_abono_cliente: montoAbonoCliente.toString(), // 🆕 Monto que se abona al cliente
                monto_cobro_stripe: montoCobroStripe.toString(), // 🆕 Monto que se cobra en Stripe
                comision_stripe: comisionCalculada.toString(), // 🆕 Comisión calculada para webhook
                condiciones_comerciales_id: condicionId || '', // 🆕 ID de condiciones comerciales
                metodo_pago_id: metodoPagoId || '', // 🆕 ID del método de pago
            },
        }

        // 🔄 Configuración específica por método de pago
        if (metodoPago === 'spei') {
            // Para SPEI necesitamos crear un customer primero
            const cliente = cotizacion.Evento?.Cliente
            if (!cliente) {
                return NextResponse.json({
                    error: 'Cliente no encontrado para SPEI'
                }, { status: 400 })
            }

            const customer = await stripe.customers.create({
                name: cliente.nombre,
                email: cliente.email || 'cliente@example.com',
                metadata: {
                    cotizacion_id: cotizacion.id,
                    evento_id: cotizacion.Evento?.id || '',
                },
            })

            paymentIntentData.customer = customer.id
            paymentIntentData.payment_method_types = ['customer_balance']
            paymentIntentData.payment_method_data = {
                type: 'customer_balance',
            }
            paymentIntentData.payment_method_options = {
                customer_balance: {
                    funding_type: 'bank_transfer',
                    bank_transfer: {
                        type: 'mx_bank_transfer',
                    },
                },
            }
        } else {
            // Para tarjetas (con MSI)
            paymentIntentData.payment_method_types = ['card']
            paymentIntentData.payment_method_options = {
                card: {
                    installments: {
                        enabled: true,
                    },
                },
            }
        }

        // 4. 💎 Crear Payment Intent
        const paymentIntent = await stripe.paymentIntents.create(paymentIntentData)

        console.log(
            `✅ Payment Intent cotizaciones creado: ${paymentIntent.id} por $${montoCobroStripe.toFixed(2)} MXN (Stripe) / $${montoAbonoCliente.toFixed(2)} MXN (Abono) - ${metodoPago || 'card'}`
        )

        // 5. 📝 Crear registro de pago en base de datos
        // 🚨 IMPORTANTE: Registramos el monto de ABONO, no el de Stripe
        const pagoData = {
            cotizacionId: cotizacion.id,
            clienteId: cotizacion.Evento?.Cliente?.id, // 🆕 Agregar clienteId para mostrar datos en finanzas
            monto: parseFloat(montoAbonoCliente.toFixed(2)), // 🎯 Monto que se abona al cliente (2 decimales)
            comisionStripe: parseFloat(comisionCalculada.toFixed(2)), // 🆕 Comisión de Stripe (2 decimales)
            status: 'pending', // El webhook lo cambiará a 'paid'
            metodo_pago: metodoPago || 'card',
            concepto: `Pago cotización - ${cotizacion.nombre}`,
            descripcion: `Abono: $${montoAbonoCliente.toFixed(2)} | Comisión: $${comisionCalculada.toFixed(2)}`, // 🎯 Descripción limpia
            stripe_payment_id: paymentIntent.id,
            // 🆕 Nuevos campos para almacenar condiciones comerciales y método de pago
            condicionesComercialesId: condicionId || null,
            metodoPagoId: metodoPagoId || null,
        }

        const nuevoPago = await prisma.pago.create({
            data: pagoData
        })

        console.log(`📝 Registro de pago cotizaciones creado en BD para Payment Intent: ${paymentIntent.id}`)

        // 🆕 5.5 Actualizar cotización con descuento congelado
        if (descuentoPorcentaje > 0 && !cotizacion.descuento) {
            // Solo actualizar si hay descuento y la cotización no tiene descuento ya guardado
            await prisma.cotizacion.update({
                where: { id: cotizacion.id },
                data: {
                    descuento: descuentoPorcentaje,
                    updatedAt: new Date()
                }
            })

            console.log(`🎯 Descuento ${descuentoPorcentaje}% congelado en cotización ${cotizacion.id}`)
        }

        // 6. 📤 Respuesta unificada
        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            pagoId: nuevoPago.id, // 🎯 ID del pago para redirección
            montoFinal: montoAbonoCliente, // 🎯 Retornar el monto de abono, no el total de Stripe
            montoBase: montoAbonoCliente, // 🆕 Para el frontend
            comisionStripe: comisionCalculada, // 🆕 Para el frontend
            metodoPago: metodoPago || 'card',
            cotizacion: {
                id: cotizacion.id,
                nombre: cotizacion.nombre,
                cliente: cotizacion.Evento?.Cliente?.nombre || '',
            },
            // 🎯 URLs de respuesta para cotizaciones
            redirectUrls: {
                success: `/checkout/success?cotizacion=${cotizacionId}&payment_intent=${paymentIntent.id}`,
                error: `/evento/${cotizacion.Evento?.id}/cotizacion/${cotizacionId}?error=payment_failed`,
                pending: `/checkout/pending?cotizacion=${cotizacionId}&payment_intent=${paymentIntent.id}`
            }
        })

    } catch (error) {
        console.error('❌ Error al crear Payment Intent cotizaciones:', error)
        return NextResponse.json({
            error: 'Error interno del servidor',
            details: error instanceof Error ? error.message : 'Error desconocido',
        }, { status: 500 })
    }
}
