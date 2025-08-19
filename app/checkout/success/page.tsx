'use client'
import React, { useEffect, useState } from 'react';
import Header from '@/app/components/ui/Header';
import Footer from '@/app/components/ui/Footer';
import PagoExitoso from '../components/PagoExitoso';

export default function Page() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return (
        <div>
            {/* HEADER */}
            <Header asunto='Cotización' />

            {/* BODY */}
            <div className='max-w-screen-sm mx-auto'>
                <PagoExitoso />
            </div>

            {/* FOOTER */}
            {isClient && <Footer telefono='55 4454 6582' asunto='Hola, estoy en al pagina de cotización...' />}
        </div>
    );
}