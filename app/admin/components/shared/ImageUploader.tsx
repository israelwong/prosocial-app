// Ruta: app/admin/components/shared/ImageUploader.tsx
'use client';

import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle, Check } from 'lucide-react';
import { useImageUpload } from '../../_lib/hooks/useImageUpload';

interface ImageUploaderProps {
    category: 'negocio' | 'eventos' | 'servicios' | 'clientes' | 'perfil';
    subcategory?: string;
    currentImageUrl?: string;
    onImageChange?: (url: string | null) => void;
    maxSize?: number; // en MB
    aspectRatio?: 'square' | 'landscape' | 'portrait' | 'auto';
    placeholder?: string;
    className?: string;
    showPreview?: boolean;
    allowDelete?: boolean;
}

const ASPECT_RATIOS = {
    square: 'aspect-square',
    landscape: 'aspect-video',
    portrait: 'aspect-[3/4]',
    auto: ''
};

export default function ImageUploader({
    category,
    subcategory,
    currentImageUrl,
    onImageChange,
    maxSize = 5,
    aspectRatio = 'auto',
    placeholder = 'Subir imagen',
    className = '',
    showPreview = true,
    allowDelete = true
}: ImageUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);

    const {
        uploading,
        progress,
        error,
        uploadImage,
        deleteImage,
        updateImage,
        resetError
    } = useImageUpload({
        category,
        subcategory,
        maxSize,
        onSuccess: (url) => {
            setPreviewUrl(url);
            onImageChange?.(url);
        },
        onError: (errorMessage) => {
            console.error('Error al subir imagen:', errorMessage);
        }
    });

    const handleFileSelect = async (file: File) => {
        resetError();

        if (currentImageUrl) {
            // Actualizar imagen existente
            await updateImage(file, currentImageUrl);
        } else {
            // Subir nueva imagen
            await uploadImage(file);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        const imageFile = files.find(file => file.type.startsWith('image/'));

        if (imageFile) {
            handleFileSelect(imageFile);
        }
    };

    const handleDelete = async () => {
        if (previewUrl) {
            const result = await deleteImage(previewUrl);
            if (result.success) {
                setPreviewUrl(null);
                onImageChange?.(null);
            }
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const aspectRatioClass = ASPECT_RATIOS[aspectRatio];

    return (
        <div className={`relative ${className}`}>
            {/* Input oculto */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
            />

            {/* Área de subida */}
            <div
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                    relative border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200
                    ${aspectRatioClass}
                    ${isDragging
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500'
                    }
                    ${uploading ? 'cursor-not-allowed' : 'cursor-pointer'}
                    bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700
                `}
            >
                {/* Contenido del área de subida */}
                {previewUrl && showPreview ? (
                    // Vista previa de imagen
                    <div className="relative w-full h-full">
                        <img
                            src={previewUrl}
                            alt="Vista previa"
                            className="w-full h-full object-cover rounded-lg"
                        />

                        {/* Overlay con acciones */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <div className="opacity-0 hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleClick();
                                    }}
                                    className="p-2 bg-white rounded-full shadow-lg hover:bg-zinc-100 transition-colors"
                                    title="Cambiar imagen"
                                    disabled={uploading}
                                >
                                    <Upload className="w-4 h-4 text-zinc-700" />
                                </button>

                                {allowDelete && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete();
                                        }}
                                        className="p-2 bg-red-500 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                                        title="Eliminar imagen"
                                        disabled={uploading}
                                    >
                                        <X className="w-4 h-4 text-white" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    // Estado vacío o de carga
                    <div className="flex flex-col items-center justify-center h-full min-h-32 p-6 text-center">
                        {uploading ? (
                            <>
                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                                    Subiendo imagen...
                                </p>
                                {progress > 0 && (
                                    <div className="w-full max-w-48 bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <ImageIcon className="w-12 h-12 text-zinc-400 mb-3" />
                                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                    {placeholder}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    Arrastra y suelta o haz clic para seleccionar
                                </p>
                                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                                    JPG, PNG, WebP, SVG (máx. {maxSize}MB)
                                </p>
                            </>
                        )}
                    </div>
                )}

                {/* Indicador de arrastre */}
                {isDragging && (
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-20 border-blue-500 rounded-lg flex items-center justify-center">
                        <div className="text-blue-600 dark:text-blue-400 text-center">
                            <Upload className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm font-medium">Suelta la imagen aquí</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Mensaje de error */}
            {error && (
                <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded flex items-center space-x-2 text-red-700 dark:text-red-400">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs">{error}</span>
                </div>
            )}

            {/* Mensaje de éxito */}
            {previewUrl && !error && !uploading && (
                <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded flex items-center space-x-2 text-green-700 dark:text-green-400">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs">Imagen subida correctamente</span>
                </div>
            )}
        </div>
    );
}
