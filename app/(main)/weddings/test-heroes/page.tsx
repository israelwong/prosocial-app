'use client'
import React from 'react'
import { HeroVideo, HeroImage, HeroText } from '@/app/components/shared'

export default function HeroTestPage() {
    return (
        <div className="space-y-0">
            {/* Test 1: Hero Video */}
            <section id="hero-video">
                <HeroVideo
                    videoSrc="https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/video/reels/weddings/reel_boda_2019.mp4"
                    title="Hero Video Test"
                    subtitle="Probando Video Background"
                    description="Este es un test del componente HeroVideo con todas sus funcionalidades"
                    buttons={[
                        {
                            text: "Botón Primary",
                            href: "#hero-image",
                            variant: "primary",
                            size: "lg"
                        },
                        {
                            text: "Botón Outline",
                            href: "#hero-image",
                            variant: "outline",
                            size: "lg",
                            withBorder: true
                        }
                    ]}
                    overlay={true}
                    overlayOpacity={50}
                    textAlignment="center"
                    minHeight="min-h-screen"
                />
            </section>

            {/* Test 2: Hero Image */}
            <section id="hero-image">
                <HeroImage
                    imageSrc="https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/boda/1.jpg"
                    imageAlt="Test image"
                    title="Hero Image Test"
                    subtitle="Probando Image Background"
                    description="Este es un test del componente HeroImage con optimización Next.js"
                    buttons={[
                        {
                            text: "Botón Secondary",
                            href: "#hero-text",
                            variant: "secondary",
                            size: "xl"
                        },
                        {
                            text: "Botón Ghost",
                            href: "#hero-text",
                            variant: "ghost",
                            size: "lg",
                            withBorder: true
                        }
                    ]}
                    overlay={true}
                    overlayOpacity={40}
                    textAlignment="left"
                    imagePosition="center"
                    minHeight="min-h-screen"
                />
            </section>

            {/* Test 3: Hero Text con Gradient */}
            <section id="hero-text">
                <HeroText
                    title="Hero Text Test"
                    subtitle="Probando Solo Texto"
                    description="Este es un test del componente HeroText con gradientes y patrones"
                    buttons={[
                        {
                            text: "Botón Gradient",
                            href: "#hero-text-pattern",
                            variant: "gradient",
                            size: "lg"
                        },
                        {
                            text: "Botón Full Width",
                            href: "#hero-text-pattern",
                            variant: "primary",
                            size: "md",
                            fullWidth: true
                        }
                    ]}
                    backgroundVariant="gradient"
                    backgroundGradient="from-purple-900 via-blue-900 to-indigo-900"
                    textAlignment="center"
                    pattern="none"
                    minHeight="min-h-screen"
                />
            </section>

            {/* Test 4: Hero Text con Pattern */}
            <section id="hero-text-pattern">
                <HeroText
                    title="Pattern Test"
                    subtitle="Probando Patrones SVG"
                    description="Dots, Grid y Waves patterns con diferentes opacidades"
                    buttons={[
                        {
                            text: "Dots Pattern",
                            onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
                            variant: "outline",
                            size: "lg"
                        }
                    ]}
                    backgroundVariant="pattern"
                    backgroundColor="bg-gradient-to-br from-zinc-900 to-zinc-800"
                    textAlignment="center"
                    pattern="dots"
                    patternOpacity={10}
                    minHeight="min-h-screen"
                />
            </section>
        </div>
    )
}
