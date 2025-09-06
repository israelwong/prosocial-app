'use client';
import React from 'react';
import { CTASection } from '@/app/components/shared';

function CTA() {
    return (
        <CTASection
            title="¡Contacta hoy mismo!"
            subtitle="tenemos fechas limitadas."
            buttonText="Ver Paquetes XV Años"
            buttonHref="/contacto?ref=fifteens"
            buttonId="btn-contacto-desde-hero-fifteens"
            secondaryLinkText="Conoce más de nuestros servicios"
            secondaryLinkHref="/contacto?ref=fifteens"
            secondaryLinkTitle="Contacto - Servicios XV años"
        />
    );
}

export default CTA;
