// Ruta: app/admin/_lib/actions/media/images.actions.ts
'use server';

import { createClient } from '@supabase/supabase-js';
import type { ImageUploadResult, ImageDeleteResult, MediaCategory } from './types';

// Configuración de Supabase para ProSocial
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('!!! FALTAN VARIABLES DE ENTORNO SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY !!!');
}

const supabaseAdmin = supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    })
    : null;

const BUCKET_NAME = 'ProSocial'; // Bucket específico para ProSocial

// --- Helper para extraer el path ---
function getPathFromUrl(url: string): string | null {
    if (!supabaseUrl) return null;
    try {
        const urlObject = new URL(url);
        const basePath = `/storage/v1/object/public/${BUCKET_NAME}/`;
        if (urlObject.pathname.startsWith(basePath)) {
            return decodeURIComponent(urlObject.pathname.substring(basePath.length));
        }
        console.warn("No se pudo extraer el path de la URL:", url);
        return null;
    } catch (error) {
        console.error("Error al parsear la URL de Supabase:", error);
        return null;
    }
}

// --- Helper para generar paths organizados ---
export async function generateImagePath(
    category: MediaCategory,
    subcategory?: string,
    filename?: string
): Promise<string> {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);

    let path = `images/${category}`;

    if (subcategory) {
        path += `/${subcategory}`;
    }

    if (filename) {
        // Limpiar el nombre del archivo
        const cleanFilename = filename
            .toLowerCase()
            .replace(/[^a-z0-9.]/g, '-')
            .replace(/-+/g, '-');

        const extension = cleanFilename.split('.').pop();
        const nameWithoutExt = cleanFilename.replace(`.${extension}`, '');

        path += `/${nameWithoutExt}-${timestamp}-${randomId}.${extension}`;
    } else {
        path += `/${timestamp}-${randomId}.jpg`;
    }

    return path;
}

/**
 * Sube un archivo de imagen a Supabase Storage.
 * Organiza automáticamente por categorías.
 */
export async function subirImagenStorage(
    file: File,
    category: MediaCategory,
    subcategory?: string,
    customPath?: string
): Promise<ImageUploadResult> {

    if (!supabaseAdmin) {
        return { success: false, error: "Cliente Supabase no inicializado." };
    }

    if (!file) {
        return { success: false, error: "No se proporcionó archivo." };
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
        return { success: false, error: "Tipo de archivo no permitido. Solo se permiten imágenes JPG, PNG, WebP y SVG." };
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        return { success: false, error: "El archivo es demasiado grande. Máximo 5MB permitido." };
    }

    try {
        const filePath = customPath || await generateImagePath(category, subcategory, file.name);

        console.log(`[ProSocial] Subiendo imagen: ${BUCKET_NAME}/${filePath}`);

        const { error: uploadError } = await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true,
                contentType: file.type
            });

        if (uploadError) {
            console.error(`Error al subir a ${filePath}:`, uploadError.message);
            throw new Error(`Error Supabase (subir): ${uploadError.message}`);
        }

        // Obtener la URL pública
        const { data: urlData } = supabaseAdmin.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath);

        if (!urlData?.publicUrl) {
            console.error(`Error obteniendo URL pública para: ${filePath}`);
            throw new Error(`Archivo subido pero no se pudo obtener URL.`);
        }

        const publicUrlWithTimestamp = `${urlData.publicUrl}?t=${Date.now()}`;
        console.log(`[ProSocial] Imagen subida exitosamente: ${publicUrlWithTimestamp}`);

        return { success: true, publicUrl: publicUrlWithTimestamp };

    } catch (error) {
        console.error(`Error en subirImagenStorage:`, error);
        return {
            success: false,
            error: `Error al subir imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`
        };
    }
}

/**
 * Elimina un archivo de imagen de Supabase Storage usando su URL pública.
 */
export async function eliminarImagenStorage(
    publicUrl: string | null | undefined
): Promise<ImageDeleteResult> {

    if (!supabaseAdmin) {
        return { success: false, error: "Cliente Supabase no inicializado." };
    }

    if (!publicUrl) {
        console.log("[ProSocial] No se proporcionó URL para eliminar.");
        return { success: true };
    }

    const filePath = getPathFromUrl(publicUrl);

    if (!filePath) {
        console.warn(`[ProSocial] No se pudo obtener ruta desde URL: ${publicUrl}`);
        return { success: false, error: "No se pudo determinar la ruta del archivo." };
    }

    try {
        console.log(`[ProSocial] Eliminando imagen: ${BUCKET_NAME}/${filePath}`);

        const { error: deleteError } = await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .remove([filePath]);

        if (deleteError) {
            if (deleteError.message === 'The resource was not found') {
                console.log(`[ProSocial] Archivo no encontrado (ya eliminado): ${filePath}`);
                return { success: true }; // Éxito si no existía
            }
            console.error(`Error al eliminar ${filePath}:`, deleteError.message);
            throw new Error(`Error Supabase (eliminar): ${deleteError.message}`);
        }

        console.log(`[ProSocial] Imagen eliminada exitosamente: ${filePath}`);
        return { success: true };

    } catch (error) {
        console.error(`Error en eliminarImagenStorage:`, error);
        return {
            success: false,
            error: `Error al eliminar imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`
        };
    }
}

/**
 * Actualiza una imagen reemplazando la anterior.
 * Elimina la imagen anterior y sube la nueva.
 */
export async function actualizarImagenStorage(
    file: File,
    oldImageUrl: string | null | undefined,
    category: MediaCategory,
    subcategory?: string
): Promise<ImageUploadResult> {

    try {
        // Eliminar imagen anterior si existe
        if (oldImageUrl) {
            const deleteResult = await eliminarImagenStorage(oldImageUrl);
            if (!deleteResult.success) {
                console.warn(`No se pudo eliminar la imagen anterior: ${deleteResult.error}`);
                // Continuar con la subida de la nueva imagen
            }
        }

        // Subir nueva imagen
        const uploadResult = await subirImagenStorage(file, category, subcategory);

        if (!uploadResult.success) {
            return uploadResult;
        }

        console.log(`[ProSocial] Imagen actualizada exitosamente`);
        return uploadResult;

    } catch (error) {
        console.error(`Error en actualizarImagenStorage:`, error);
        return {
            success: false,
            error: `Error al actualizar imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`
        };
    }
}

/**
 * Valida si una URL pertenece al bucket de ProSocial
 */
export async function esUrlProSocial(url: string): Promise<boolean> {
    if (!supabaseUrl) return false;
    try {
        const urlObject = new URL(url);
        const basePath = `/storage/v1/object/public/${BUCKET_NAME}/`;
        return urlObject.hostname.includes('supabase') && urlObject.pathname.startsWith(basePath);
    } catch {
        return false;
    }
}

/**
 * Obtiene información de una imagen desde su URL
 */
export async function obtenerInfoImagen(publicUrl: string): Promise<{
    exists: boolean;
    size?: number;
    lastModified?: Date;
    contentType?: string;
    error?: string;
}> {
    if (!supabaseAdmin) {
        return { exists: false, error: "Cliente Supabase no inicializado." };
    }

    const filePath = getPathFromUrl(publicUrl);
    if (!filePath) {
        return { exists: false, error: "No se pudo determinar la ruta del archivo." };
    }

    try {
        const { data, error } = await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .list(filePath.split('/').slice(0, -1).join('/'), {
                search: filePath.split('/').pop()
            });

        if (error) {
            return { exists: false, error: error.message };
        }

        const fileInfo = data?.find(file => file.name === filePath.split('/').pop());

        if (!fileInfo) {
            return { exists: false };
        }

        return {
            exists: true,
            size: fileInfo.metadata?.size,
            lastModified: fileInfo.updated_at ? new Date(fileInfo.updated_at) : undefined,
            contentType: fileInfo.metadata?.mimetype
        };

    } catch (error) {
        return {
            exists: false,
            error: `Error al obtener información: ${error instanceof Error ? error.message : 'Error desconocido'}`
        };
    }
}
