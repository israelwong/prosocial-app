// Gallery Data - Centralized image URLs for different event types
// Este archivo centraliza las URLs de imágenes para diferentes tipos de eventos

export const GALLERY_IMAGES = {
    boda: [
        '/images/galeria/boda-1.jpg',
        '/images/galeria/boda-2.jpg',
        '/images/galeria/boda-3.jpg',
        '/images/galeria/boda-4.jpg',
        '/images/galeria/boda-5.jpg',
        '/images/galeria/boda-6.jpg',
        '/images/galeria/boda-7.jpg',
        '/images/galeria/boda-8.jpg',
        '/images/galeria/boda-9.jpg',
        '/images/galeria/boda-10.jpg',
        '/images/galeria/boda-11.jpg',
        '/images/galeria/boda-12.jpg',
    ],
    xv: [
        '/images/galeria/xv-1.jpg',
        '/images/galeria/xv-2.jpg',
        '/images/galeria/xv-3.jpg',
        '/images/galeria/xv-4.jpg',
        '/images/galeria/xv-5.jpg',
        '/images/galeria/xv-6.jpg',
        '/images/galeria/xv-7.jpg',
        '/images/galeria/xv-8.jpg',
        '/images/galeria/xv-9.jpg',
        '/images/galeria/xv-10.jpg',
        '/images/galeria/xv-11.jpg',
        '/images/galeria/xv-12.jpg',
    ],
    corporativo: [
        '/images/galeria/corporativo-1.jpg',
        '/images/galeria/corporativo-2.jpg',
        '/images/galeria/corporativo-3.jpg',
        '/images/galeria/corporativo-4.jpg',
        '/images/galeria/corporativo-5.jpg',
        '/images/galeria/corporativo-6.jpg',
        '/images/galeria/corporativo-7.jpg',
        '/images/galeria/corporativo-8.jpg',
        '/images/galeria/corporativo-9.jpg',
    ]
} as const

// Función helper para obtener imágenes por tipo de evento
export const getImagesByEventType = (eventType: keyof typeof GALLERY_IMAGES): string[] => {
    return [...(GALLERY_IMAGES[eventType] || GALLERY_IMAGES.boda)]
}

// Función helper para obtener un subconjunto de imágenes
export const getImageSubset = (
    eventType: keyof typeof GALLERY_IMAGES,
    count: number = 6
): string[] => {
    const images = getImagesByEventType(eventType)
    return images.slice(0, count)
}

// Función para obtener imágenes aleatorias
export const getRandomImages = (
    eventType: keyof typeof GALLERY_IMAGES,
    count: number = 6
): string[] => {
    const images = getImagesByEventType(eventType)
    const shuffled = [...images].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
}

export type EventType = keyof typeof GALLERY_IMAGES
