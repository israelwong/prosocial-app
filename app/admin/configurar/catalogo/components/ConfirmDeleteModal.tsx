'use client';

import React from 'react';

interface ConfirmDeleteModalProps {
    item: any; // Cambia `any` por el tipo adecuado si lo tienes definido
    onClose: () => void;
    onConfirm: () => void;
}

export function ConfirmDeleteModal({ item, onClose, onConfirm }: ConfirmDeleteModalProps) {
    const handleConfirm = () => {
        // Lógica para confirmar la eliminación
        onConfirm();
        onClose();
    };

    if (!item) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-md shadow-lg w-96">
                <h2 className="text-lg font-bold mb-4">Confirmar Eliminación</h2>
                <p>¿Estás seguro de que deseas eliminar este elemento?</p>
                <div className="mt-4 flex justify-end gap-2">
                    <button onClick={handleConfirm} className="bg-red-600 text-white px-4 py-2 rounded-md">Eliminar</button>
                    <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded-md">Cancelar</button>
                </div>
            </div>
        </div>
    );
}