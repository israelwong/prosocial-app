// Ruta: app/admin/_lib/hooks/useImageUpload.ts
'use client';

import { useState, useCallback } from 'react';
import { subirImagenStorage, eliminarImagenStorage, actualizarImagenStorage } from '../actions/media/images.actions';
import type { ImageUploadResult, ImageDeleteResult, MediaCategory } from '../actions/media/types';

interface UseImageUploadOptions {
    category: MediaCategory;
    subcategory?: string;
    maxSize?: number; // en MB
    onSuccess?: (url: string) => void;
    onError?: (error: string) => void;
}

interface UseImageUploadReturn {
    uploading: boolean;
    progress: number;
    error: string | null;
    uploadImage: (file: File) => Promise<ImageUploadResult>;
    deleteImage: (url: string) => Promise<ImageDeleteResult>;
    updateImage: (file: File, oldUrl?: string) => Promise<ImageUploadResult>;
    resetError: () => void;
}

export function useImageUpload(options: UseImageUploadOptions): UseImageUploadReturn {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const { category, subcategory, maxSize = 5, onSuccess, onError } = options;

    const resetError = useCallback(() => {
        setError(null);
    }, []);

    const validateFile = useCallback((file: File): boolean => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];

        if (!allowedTypes.includes(file.type)) {
            setError('Tipo de archivo no permitido. Solo se permiten imágenes JPG, PNG, WebP y SVG.');
            return false;
        }

        const maxSizeBytes = maxSize * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            setError(`El archivo es demasiado grande. Máximo ${maxSize}MB permitido.`);
            return false;
        }

        return true;
    }, [maxSize]);

    const uploadImage = useCallback(async (file: File): Promise<ImageUploadResult> => {
        setUploading(true);
        setProgress(0);
        setError(null);

        if (!validateFile(file)) {
            setUploading(false);
            return { success: false, error: error || 'Error de validación' };
        }

        try {
            // Simular progreso
            setProgress(25);

            const result = await subirImagenStorage(file, category, subcategory);

            setProgress(75);

            if (result.success && result.publicUrl) {
                setProgress(100);
                onSuccess?.(result.publicUrl);
            } else {
                const errorMessage = result.error || 'Error desconocido al subir imagen';
                setError(errorMessage);
                onError?.(errorMessage);
            }

            return result;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error inesperado';
            setError(errorMessage);
            onError?.(errorMessage);

            return { success: false, error: errorMessage };
        } finally {
            setUploading(false);
            // Resetear progreso después de un momento
            setTimeout(() => setProgress(0), 1000);
        }
    }, [category, subcategory, validateFile, onSuccess, onError, error]);

    const deleteImage = useCallback(async (url: string): Promise<ImageDeleteResult> => {
        setError(null);

        try {
            const result = await eliminarImagenStorage(url);

            if (!result.success && result.error) {
                setError(result.error);
                onError?.(result.error);
            }

            return result;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error inesperado';
            setError(errorMessage);
            onError?.(errorMessage);

            return { success: false, error: errorMessage };
        }
    }, [onError]);

    const updateImage = useCallback(async (file: File, oldUrl?: string): Promise<ImageUploadResult> => {
        setUploading(true);
        setProgress(0);
        setError(null);

        if (!validateFile(file)) {
            setUploading(false);
            return { success: false, error: error || 'Error de validación' };
        }

        try {
            setProgress(25);

            const result = await actualizarImagenStorage(file, oldUrl, category, subcategory);

            setProgress(75);

            if (result.success && result.publicUrl) {
                setProgress(100);
                onSuccess?.(result.publicUrl);
            } else {
                const errorMessage = result.error || 'Error desconocido al actualizar imagen';
                setError(errorMessage);
                onError?.(errorMessage);
            }

            return result;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error inesperado';
            setError(errorMessage);
            onError?.(errorMessage);

            return { success: false, error: errorMessage };
        } finally {
            setUploading(false);
            setTimeout(() => setProgress(0), 1000);
        }
    }, [category, subcategory, validateFile, onSuccess, onError, error]);

    return {
        uploading,
        progress,
        error,
        uploadImage,
        deleteImage,
        updateImage,
        resetError
    };
}
