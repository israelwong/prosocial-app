'use client'
import React, { useState } from 'react'
import { crearCategoria } from '../../../_lib/categorias.actions'
import { X } from 'lucide-react'

interface FormCrearCategoriaProps {
    onSubmit: () => void
    onCancel: () => void
}

function FormCrearCategoria({ onSubmit, onCancel }: FormCrearCategoriaProps) {
    const [nombreCategoria, setNombreCategoria] = useState('');
    const [errors, setErrors] = useState<{ nombreCategoria?: string, nombreDuplicado?: string }>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formErrors: { nombreCategoria?: string, nombreDuplicado?: string } = {};

        if (!nombreCategoria) {
            formErrors.nombreCategoria = 'El nombre de la categoría es obligatorio';
        }

        if (Object.keys(formErrors).length === 0) {

            const result = async () => {
                try {
                    await crearCategoria(nombreCategoria);
                    onSubmit();
                } catch (error) {
                    formErrors.nombreDuplicado = `${error}`;
                    setErrors(formErrors);
                }
            }
            result();
        } else {
            setErrors(formErrors);
        }
    };

    return (
        <div className="max-w-full">
            <form onSubmit={handleSubmit} className="flex items-center gap-1">
                <div className="flex-1">
                    <input
                        placeholder='Nombre de la categoría...'
                        id="nombreCategoria"
                        type="text"
                        value={nombreCategoria}
                        onChange={(e) => setNombreCategoria(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded w-full py-2 px-3 text-zinc-100 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-zinc-900 border border-zinc-700 text-white font-bold py-2 px-4 rounded text-sm"
                >
                    Agregar
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                    <X />
                </button>
            </form>
            {errors.nombreCategoria && (
                <p className="text-red-500 italic pt-5">{errors.nombreCategoria}</p>
            )}
            {errors.nombreDuplicado && (
                <p className="text-red-500 italic pt-5">{errors.nombreDuplicado}</p>
            )}
        </div>
    );
}

export default FormCrearCategoria;