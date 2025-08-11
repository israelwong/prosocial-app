'use client'
import React, { useState } from 'react'
import { crearTipoEvento } from '@/app/admin/_lib/eventoTipo.actions'
import { X } from 'lucide-react'

interface FormCrearTipoEventoProps {
    onSubmit: (nombreTipoEvento: string) => void
    onCancel: () => void
}

function FormCrearTipoEvento({ onSubmit, onCancel }: FormCrearTipoEventoProps) {
    const [nombreTipoEvento, setNombreTipoEvento] = useState('');
    const [errors, setErrors] = useState<{ nombreTipoEvento?: string }>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formErrors: { nombreTipoEvento?: string } = {};

        if (!nombreTipoEvento) {
            formErrors.nombreTipoEvento = 'El nombre del tipo de evento es obligatorio';
        }

        if (Object.keys(formErrors).length === 0) {
            crearTipoEvento({ nombre: nombreTipoEvento })
                .then(() => {
                    setNombreTipoEvento('');
                    setErrors({});
                    onSubmit(nombreTipoEvento);
                })
                .catch((error) => {
                    console.error('Error creando tipo de evento:', error);
                });

        } else {
            setErrors(formErrors);
        }
    };

    return (
        <div className="max-w-full">
            <form onSubmit={handleSubmit} className="flex items-center gap-1">
                <div className="flex-1">
                    <input
                        id="nombreTipoEvento"
                        type="text"
                        placeholder="Nombre del tipo de evento"
                        value={nombreTipoEvento}
                        onChange={(e) => setNombreTipoEvento(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Agregar
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    <X />
                </button>
            </form>
            {errors.nombreTipoEvento && (
                <p className="pt-3 text-red-500 text-xs italic">{errors.nombreTipoEvento}</p>
            )}
        </div>
    )
}

export default FormCrearTipoEvento