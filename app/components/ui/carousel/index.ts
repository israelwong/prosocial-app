// Exportaciones principales del sistema de carrusel
export { default as ImageCarousel } from './ImageCarousel'
export { XVCarousel, BodaCarousel, EventCarousel } from './EventCarousels'

// Tipos para facilitar el uso
export interface CarouselConfig {
    autoplay?: number
    perView?: number
    gap?: number
    animationDuration?: number
    breakpoints?: {
        [key: number]: {
            perView?: number
            gap?: number
        }
    }
}

export interface EventCarouselProps {
    tipoEvento: 'boda' | 'xv' | 'xv años' | '15 años'
    className?: string
    config?: CarouselConfig
}
