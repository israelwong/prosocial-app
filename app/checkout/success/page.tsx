'use client'
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/app/components/ui/Header';
import Footer from '@/app/components/ui/Footer';
import PagoExitoso from '../components/PagoExitoso';

export default function Page() {
    const [isClient, setIsClient] = useState(false);
    const searchParams = useSearchParams();
    const pagoId = searchParams ? searchParams.get('pagoId') : null;
    const cotizacionId = searchParams ? searchParams.get('cotizacion') : null;
    const paymentIntentId = searchParams ? searchParams.get('payment_intent') : null;

    useEffect(() => {
        setIsClient(true);
    }, []);

    return (
        <div>
            {/* HEADER */}
            <Header asunto='Pago Confirmado' />

            {/* BODY */}
            <div className='max-w-screen-sm mx-auto'>
                <PagoExitoso
                    pagoId={pagoId}
                    cotizacionId={cotizacionId}
                    paymentIntentId={paymentIntentId}
                />
            </div>

            {/* FOOTER */}
            {isClient && <Footer telefono='55 4454 6582' asunto='Hola, mi pago fue procesado exitosamente...' />}
        </div>
    );
}