// Shared Components - Main barrel export
export * from './ui';
export * from './galleries';
export * from './video';
export * from './faq';
export * from './guarantees';
export * from './announcements';

// Heroes - Export components explicitly to avoid type conflicts
export { HeroVideo, HeroImage, HeroText, ContactHero } from './heroes';
export type { TextAlignment } from './heroes';

// Legacy exports for backwards compatibility
export { GalleryGrid as PortfolioGallery } from './galleries';
export { MediaSlider } from './galleries';
