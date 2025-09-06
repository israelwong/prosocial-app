'use client';
import React from 'react';
import { CTASection } from '@/app/components/shared';

function CTA() {
    return (
        <CTASection
            title="¡Contacta hoy mismo!"
            subtitle="tenemos fechas limitadas."
            buttonText="Solicitar cotización"
            buttonHref="/contacto"
            buttonId="btn-contacto-desde-hero"
            secondaryLinkText="Conoce más de nuestros servicios"
            secondaryLinkHref="/contacto"
            secondaryLinkTitle="Contacto - Servicios XV años"
        />
    );
}

export default CTA;
