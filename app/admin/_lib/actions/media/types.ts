/**
 * Tipos compartidos para funcionalidades de media
 */

// Tipos para resultados de operaciones con imágenes
export interface ImageUploadResult {
    success: boolean;
    publicUrl?: string;
    error?: string;
}

export interface ImageDeleteResult {
    success: boolean;
    error?: string;
}

// Tipos para resultados de operaciones con videos (futuro)
export interface VideoUploadResult {
    success: boolean;
    publicUrl?: string;
    thumbnailUrl?: string;
    duration?: number;
    error?: string;
}

export interface VideoDeleteResult {
    success: boolean;
    error?: string;
}

// Tipos para categorías de media
export type MediaCategory = 'negocio' | 'eventos' | 'servicios' | 'clientes' | 'perfil';

// Tipos para repositorios de media (futuro)
export interface RepositoryInfo {
    id: string;
    negocioId: string;
    name: string;
    description?: string;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface MediaFile {
    id: string;
    repositoryId: string;
    filename: string;
    originalName: string;
    fileType: 'image' | 'video';
    mimeType: string;
    size: number;
    publicUrl: string;
    category: MediaCategory;
    subcategory?: string;
    uploadedAt: Date;
}
