// Shared Components - Main barrel export
export * from './ui';
export * from './galleries';
export * from './video';
export * from './heroes';
export * from './faq';
export * from './guarantees';

// Direct exports for standalone components
export { default as AyudaEleccionCotizaciones } from './AyudaEleccionCotizaciones';

// Legacy exports for backwards compatibility
export { GalleryGrid as PortfolioGallery } from './galleries';
export { MediaSlider } from './galleries';
