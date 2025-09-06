import React from 'react'
import { TestimonialsCarousel } from '@/app/components/shared/marketing'

interface TestimoniosSectionProps {
    className?: string
}

export default function TestimoniosSection({ className = "" }: TestimoniosSectionProps) {
    return (
        <TestimonialsCarousel
            className={className}
            variant="default"
            showTitle={true}
            title="Lo que dicen nuestros clientes"
            subtitle="Testimonios reales de familias que confiaron en nosotros para sus momentos más especiales"
            autoplay={4000}
            showGradients={true}
        />
    )
}
