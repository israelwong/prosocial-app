'use client'
import React from 'react'
import { HeroMarketing } from '@/app/components/shared'

function HeroRefactorizado() {
    return (
        <div>
            {/* Título decorado "Fifteens" */}
            <div className="relative bg-gradient-to-b from-violet-950 to-violet-950/10">
                <div className="md:max-w-screen-md mx-auto pt-10 pb-4">
                    <h1 className="px-8 font-Smooch md:text-8xl text-6xl text-violet-200 text-center mb-5">
                        Fifteens
                    </h1>
                </div>
            </div>

            {/* Hero principal usando HeroMarketing */}
            <HeroMarketing
                variant="landing"
                titulo="Capturamos momentos para toda la vida"
                subtitulo="Cuidamos cada detalle en fotografía y video con la máxima calidad y cuidado para entregarte los mejores resultados."
                videoSrc="https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/video/hero-30fps.webm?t=2024-09-28T23%3A53%3A21.149Z"
                showScrollIndicator={true}
                className="bg-gradient-to-b from-violet-950/10 to-violet-950/10"
                minHeight="min-h-[60vh]"
            />
        </div>
    )
}

export default HeroRefactorizado
