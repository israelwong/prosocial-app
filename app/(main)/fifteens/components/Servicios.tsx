'use client'
import React from 'react'
import {
    ServiceSection,
    GallerySlider,
    VideoSingle,
    PortfolioGallery,
    GalleryGrid,
    GalleryMasonry
} from '@/app/components/shared'
import QuoteSection from '@/app/components/main/QuoteSection'

// Configuración de imágenes para cada tipo de sesión
const imagenesConfig = {
    vestido: [
        "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/vestido/1.jpg",
        "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/vestido/2.jpg",
        "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/vestido/3.jpg",
        "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/vestido/4.jpg",
        "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/vestido/8.jpg",
        "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/vestido/5.jpg",
        "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/vestido/6.jpg",
        "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/vestido/7.jpg"
    ],
    casual: [
        "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/casual/1.jpg",
        "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/casual/2.jpg",
        "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/casual/3.jpg",
        "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/casual/4.jpg",
        "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/casual/5.jpg",
        "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/casual/6.jpg",
        "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/casual/7.jpg",
        "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/casual/8.jpg",
        "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/casual/9.jpg",
        // "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/casual/10.jpg",
    ],
    evento: [
        "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/evento/1.jpg",
        "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/evento/2.jpg",
        "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/evento/3.jpg",
        "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/evento/4.jpg",
        "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/evento/5.jpg",
        "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/evento/6.jpg",
        "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/evento/7.jpg",
        "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/evento/8.jpg",
        // "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/evento/9.jpg",
        "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/evento/10.jpg",
    ]
}

function ServiciosRefactorizado() {
    return (
        <div>

            {/* Sesión fotográfica de vestido */}
            <ServiceSection
                titulo="Sesión fotográfica de vestido"
                descripcion="Capturamos los mejores momentos de tu sesión de vestido en locaciones increíbles"
                titleGradient="from-pink-500 to-violet-500"
            >
                <GallerySlider
                    imagenes={imagenesConfig.vestido}
                    variant="multiple"
                    autoplay={3000}
                    alt="Sesión de vestido"

                />
            </ServiceSection>

            {/* Sesión fotográfica casual */}
            <ServiceSection
                titulo="Sesión fotográfica casual"
                descripcion="Tu esencia y personalidad en fotografías casuales en locaciones urbanas y naturales - Click para ver en lightbox"
                titleGradient="from-pink-400 via-fuchsia-500 to-red-500"
            >
                <GalleryGrid
                    imagenes={imagenesConfig.casual}
                    variant='grid'
                    noPadding={true}
                    enableLightbox={true}
                />
            </ServiceSection>

            {/* Impresión de cuadros */}
            <ServiceSection
                titulo="Impresión de cuadros"
                descripcion='Puedes imprimir una de las fotografías de sesión en un cuadro de acrílico de 24x36"'
                titleGradient="from-purple-500 to-pink-500"
            >
                <VideoSingle
                    src="https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/video/cuadro-acrilico.mp4"
                    autoPlay={true}
                    loop={true}
                />
            </ServiceSection>

            {/* Sesión video cinemático */}
            <ServiceSection
                titulo="Sesión de video cinemático"
                descripcion="Toda la esencia en una sesión cinemática con dinámicas y tomas creativas"
                titleGradient="from-indigo-500 to-purple-500"
                showSeparator={false} // No mostrar separador antes del Hook
            >
                {/* Video comentado en el original, podemos agregarlo después */}
                <VideoSingle
                    src="https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/video/reels/fifteens/reel_sesiones_2019.mp4"
                    autoPlay={true}
                    loop={true}
                />
            </ServiceSection>

            {/* QuoteSection/CTA intermedio */}
            <QuoteSection
                message="Vive al máximo tu evento, nosotros nos encargamos de inmortalizarlo."
            />

            {/* Fotografía para evento */}
            <ServiceSection
                titulo="Fotografía para evento"
                descripcion="Nosotros nos encargamos de capturar los mejores momentos de tu evento"
                titleGradient="from-yellow-500 to-orange-500"
            >
                <GalleryGrid
                    imagenes={imagenesConfig.evento}
                    variant='grid'
                    noPadding={true}
                    enableLightbox={true}
                />
            </ServiceSection>

            {/* Video de evento */}
            <ServiceSection
                titulo="Cinematografía para evento"
                descripcion="Grabamos tu evento con 1 o 2 cámaras en piso, dron para tomas aéreas y grúa con cabezal robótico para tomas elevadas"
                titleGradient="from-red-500 to-pink-500"
            >
                <VideoSingle
                    src="https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/video/reels/fifteens/reel_evento_2019.mp4?t=2024-09-29T01%3A58%3A00.130Z"
                    autoPlay={true}
                    loop={true}
                />
            </ServiceSection>

        </div>
    )
}

export default ServiciosRefactorizado
