'use client';

import React from 'react';

interface SeccionEditModalProps {
    seccion: any; // Cambia `any` por el tipo adecuado si lo tienes definido
    onClose: () => void;
    onSave: (data: any) => void; // Cambia `any` por el tipo adecuado si lo tienes definido
}

export function SeccionEditModal({ seccion, onClose, onSave }: SeccionEditModalProps) {
    const handleSave = () => {
        // Lógica para guardar la sección
        onSave(seccion);
        onClose();
    };

    if (!seccion) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-md shadow-lg w-96">
                <h2 className="text-lg font-bold mb-4">Editar Sección</h2>
                {/* Agrega aquí los campos del formulario */}
                <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-md">Guardar</button>
                <button onClick={onClose} className="ml-2 bg-gray-300 px-4 py-2 rounded-md">Cancelar</button>
            </div>
        </div>
    );
}