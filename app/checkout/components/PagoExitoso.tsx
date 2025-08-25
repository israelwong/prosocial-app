'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { obtenerPagoCompleto } from '@/app/admin/_lib/actions/pagos'
import Skeleton from '@/app/components/ui/Skeleton'

interface Props {
    pagoId?: string | null
    cotizacionId?: string | null
    paymentIntentId?: string | null
}

export default function PagoExitoso({ pagoId, cotizacionId, paymentIntentId }: Props) {
    const router = useRouter()
    const [pago, setPago] = useState<any>(null)
    const [evento, setEvento] = useState<any>(null)
    const [cliente, setCliente] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const obtenerDatosPago = async () => {
            try {
                let pagoCompleto = null;

                // Intentar obtener pago por pagoId
                if (pagoId) {
                    console.log('🔍 Obteniendo pago por pagoId:', pagoId);
                    pagoCompleto = await obtenerPagoCompleto(pagoId);
                }

                // Si no hay pagoId, intentar por paymentIntentId
                if (!pagoCompleto && paymentIntentId) {
                    console.log('🔍 Buscando pago por paymentIntentId:', paymentIntentId);
                    // Aquí necesitaríamos una función para buscar por payment_intent_id
                    // Por ahora, buscaremos por cotizacionId
                }

                // Si no hay pagoCompleto pero hay cotizacionId, obtener el pago más reciente de esa cotización
                if (!pagoCompleto && cotizacionId) {
                    console.log('🔍 Buscando pago más reciente por cotizacionId:', cotizacionId);
                    // Aquí necesitaríamos buscar el pago más reciente de la cotización
                    const response = await fetch(`/api/pago/buscar-por-cotizacion?cotizacionId=${cotizacionId}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.pago) {
                            pagoCompleto = await obtenerPagoCompleto(data.pago.id);
                        }
                    }
                }

                if (pagoCompleto) {
                    setPago(pagoCompleto);
                    setEvento(pagoCompleto?.Cotizacion?.Evento || null);
                    setCliente(pagoCompleto?.Cotizacion?.Evento?.Cliente || null);
                } else {
                    console.error('❌ No se pudo obtener información del pago');
                }
            } catch (error) {
                console.error('❌ Error obteniendo datos del pago:', error);
            } finally {
                setLoading(false);
            }
        };

        if (pagoId || cotizacionId || paymentIntentId) {
            obtenerDatosPago();
        } else {
            setLoading(false);
        }
    }, [pagoId, cotizacionId, paymentIntentId]);

    const handleIniciarSesion = () => {
        // Verificar si el evento está aprobado para redirigir al panel del cliente
        if (evento?.status === 'aprobado' && evento?.id) {
            // Si el evento está aprobado, redirigir al panel del cliente
            if (cliente?.email) {
                window.location.href = `/cliente/auth/login?email=${encodeURIComponent(cliente.email)}&redirect=/cliente/dashboard`;
            } else {
                window.location.href = '/cliente/auth/login?redirect=/cliente/dashboard';
            }
        } else if (cliente?.email && evento?.id) {
            // Si el evento no está aprobado, redirigir al evento público
            window.location.href = `/cliente/auth/login?email=${encodeURIComponent(cliente.email)}&redirect=/evento/${evento.id}`;
        } else {
            // Redirigir al login general si no tenemos datos completos
            window.location.href = '/cliente/auth/login';
        }
    };

    if (loading) {
        return <Skeleton footer='Cargando información del pago...' />
    }

    if (!pago) {
        return (
            <div className="mt-10 mb-16 md:p-0 p-5">
                <p className='font-Bebas-Neue text-2xl text-left mb-10 text-red-700'>
                    Error al cargar información
                </p>
                <p>No se pudo obtener la información del pago.</p>
            </div>
        )
    }

    return (
        <div className="mt-10 mb-16 md:p-0  p-5">

            <p className='font-Bebas-Neue text-2xl text-left mb-10 text-green-700'>
                ¡Pago exitoso!
            </p>

            <p className='mb-5 text-2xl'>
                Hola {cliente?.nombre}!,
            </p>

            <p className='mb-5 leading-6'>
                Tu pago ha sido procesado exitosamente.
            </p>

            {/* 💰 DESGLOSE TRANSPARENTE DEL PAGO */}
            <div className='p-5 bg-zinc-900 rounded-md mb-5 border border-zinc-800'>
                <h3 className='text-white font-semibold mb-4 text-lg'>💳 Desglose de tu pago</h3>

                <div className='space-y-3 text-sm'>
                    {/* Total pagado en la transacción */}
                    <div className='flex justify-between items-center py-2'>
                        <span className='text-zinc-300'>Total pagado en la transacción:</span>
                        <span className='text-white font-semibold text-base'>
                            {((pago?.monto || 0) + (pago?.comisionStripe || 0)).toLocaleString('es-MX', {
                                style: 'currency',
                                currency: 'MXN'
                            })}
                        </span>
                    </div>

                    {/* Comisión de procesamiento (solo si existe) */}
                    {pago?.comisionStripe && pago.comisionStripe > 0 && (
                        <div className='flex justify-between items-center py-2 border-t border-zinc-700'>
                            <span className='text-zinc-400'>- Comisión de procesamiento Stripe:</span>
                            <span className='text-zinc-400'>
                                -{pago.comisionStripe.toLocaleString('es-MX', {
                                    style: 'currency',
                                    currency: 'MXN'
                                })}
                            </span>
                        </div>
                    )}

                    {/* Total abonado a la cuenta */}
                    <div className='flex justify-between items-center py-3 border-t border-zinc-600 bg-zinc-800 rounded px-3'>
                        <span className='text-green-300 font-semibold'>✅ Total abonado a tu cuenta:</span>
                        <span className='text-green-300 font-bold text-lg'>
                            {(pago?.monto || 0).toLocaleString('es-MX', {
                                style: 'currency',
                                currency: 'MXN'
                            })}
                        </span>
                    </div>
                </div>
            </div>

            {/* 📋 DETALLES DEL SERVICIO */}
            <div className='p-5 bg-zinc-900 rounded-md mb-5 text-sm text-zinc-500 border border-zinc-800'>
                <h3 className='text-zinc-300 font-semibold mb-3'>📋 Detalles del servicio</h3>
                <p className='mb-3'>
                    <u>Concepto:</u> {pago?.concepto}
                </p>
                <p className='mb-3'>
                    <u>Evento:</u> {evento?.nombre} - {evento?.EventoTipo?.nombre}
                </p>
                <p className='mb-3'>
                    <u>Fecha del evento:</u> {evento?.fecha_evento ? new Date(evento.fecha_evento).toLocaleDateString('es-MX', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }) : 'Por definir'}
                </p>
            </div>

            <p className='mb-5 leading-6 text-zinc-300'>
                📧 <strong>Comprobante de pago:</strong> Stripe te enviará un correo electrónico con el comprobante oficial de tu transacción.
            </p>

            <p className='mb-10'>
                Para conocer todos los detalles de tu servicio y dar seguimiento a tu evento, por favor crea tu cuenta en nuestra plataforma.
            </p>

            <button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors mb-5"
                onClick={handleIniciarSesion}>
                Crear mi cuenta / Iniciar sesión
            </button>

            <p className='text-zinc-400 text-sm text-center'>
                ¡Nos comunicaremos contigo muy pronto para confirmar todos los detalles!
            </p>
        </div>
    )
}
