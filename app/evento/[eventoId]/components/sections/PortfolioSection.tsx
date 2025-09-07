'use client'
import React from 'react'
import GalleryGrid from '@/app/components/shared/galleries/GalleryGrid'

interface PortfolioSectionProps {
    tipoEvento: 'boda' | 'xv' | 'xv años' | '15 años'
    titulo?: string
    descripcion?: string
    className?: string
}

export default function PortfolioSection({
    tipoEvento,
    titulo,
    descripcion,
    className = ""
}: PortfolioSectionProps) {

    // Determinar si es XV años o boda
    const isXV = tipoEvento === 'xv' ||
        tipoEvento === 'xv años' ||
        tipoEvento === '15 años' ||
        tipoEvento.toLowerCase().includes('xv') ||
        tipoEvento.toLowerCase().includes('15')

    // Arrays de imágenes definidos internamente
    const imagenesXV = [
        'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/porfatolio/1.jpg',
        'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/porfatolio/2.jpg',
        'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/porfatolio/3.jpg',
        'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/porfatolio/4.jpg',
        'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/porfatolio/5.jpg',
        'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/porfatolio/6.jpg',
        'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/porfatolio/7.jpg',
        'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/porfatolio/8.jpg',
        'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/porfatolio/9.jpg'
    ]

    const imagenesBoda = [
        'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/weddings/portafolio/1.jpg',
        'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/weddings/portafolio/2.jpg',
        'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/weddings/portafolio/3.jpg',
        'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/weddings/portafolio/4.jpg',
        'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/weddings/portafolio/5.jpg',
        'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/weddings/portafolio/6.jpg',
        'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/weddings/portafolio/7.jpg',
        'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/weddings/portafolio/8.jpg',
        'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/weddings/portafolio/9.jpg',
    ]

    return (
        <GalleryGrid
            tipoEvento={isXV ? 'xv' : 'boda'}
            imagenes={isXV ? imagenesXV : imagenesBoda}
            variant="fullwidth"
            titulo={titulo}
            descripcion={descripcion}
            columns={3}
            gap="md"
            showCTA={true}
            ctaText={isXV ? "Ver más XV Años" : "Ver más Bodas"}
            className={className}
        />
    )
}