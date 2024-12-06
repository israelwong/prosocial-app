'use client'
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function FormCheckout() {

    const searchParams = useSearchParams();

    const [metodoPagoId, setMetodoPagoId] = useState('');
    const [cotizacionId, setCotizacionId] = useState('');
    const [condicionComercialId, setCondicionComercialId] = useState('');
    const [msi, setMSI] = useState('');
    const [total, setTotal] = useState('');
    const [pagoMensual, setPagoMensual] = useState('');

    useEffect(() => {
        const metodoPagoId = searchParams.get('metodoPagoId') || '';
        const cotizacionId = searchParams.get('cotizacionId') || '';
        const condicionComercialId = searchParams.get('condicionComercialId') || '';
        const msi = searchParams.get('msi') || '';
        const total = searchParams.get('total') || '';
        const pagoMensual = searchParams.get('pagoMensual') || '';
        setMetodoPagoId(metodoPagoId);
        setCotizacionId(cotizacionId);
        setCondicionComercialId(condicionComercialId);
        setMSI(msi);
        setTotal(total);
        setPagoMensual(pagoMensual);
    }, [searchParams]);

    const handlePayment = async () => {
        try {
            console.log('Enviando datos:', {
                quoteId: cotizacionId,
                conditionId: condicionComercialId,
                amount: parseFloat(total),
            });

            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    quoteId: cotizacionId,
                    conditionId: condicionComercialId,
                    amount: parseFloat(total),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                window.location.href = data.url;
            } else {
                console.error('Error:', data.error);
            }
        } catch (error) {
            console.error('Error al procesar el pago:', error);
        }
    };
    return (
        <div>
            <h1>FormCheckout</h1>
            <p>Metodo de Pago ID: {metodoPagoId}</p>
            <p>Cotizacion ID: {cotizacionId}</p>
            <p>Condicion Comercial ID: {condicionComercialId}</p>
            <p>MSI: {msi}</p>
            <p>Total: {total}</p>
            <p>Pago Mensual: {pagoMensual}</p>
            <button onClick={handlePayment}>Pagar</button>
        </div>
    )
}