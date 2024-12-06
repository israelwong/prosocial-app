'use client'
import React, { useState } from 'react'
import { crearTipoEvento } from '@/app/admin/_lib/eventoTipo.actions'


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
        <div className="">
            <form onSubmit={handleSubmit} className="items-center gap-1">
                <p className='mb-5 text-xl text-zinc-500'>Registrar nuevo tipo de evento</p>
                <div className="flex-1">
                    <input
                        id="nombreTipoEvento"
                        type="text"
                        placeholder="Nombre del tipo de evento"
                        value={nombreTipoEvento}
                        onChange={(e) => setNombreTipoEvento(e.target.value)}
                        className="
                        bg-zinc-900 border border-zinc-800 
                        rounded w-full 
                        text-zinc-200
                        text-lg
                        p-2 mb-2"
                    />
                </div>
                {errors.nombreTipoEvento && (
                    <p className="py-3 text-red-500 text-xs italic text-center">{errors.nombreTipoEvento}</p>
                )}
                <button
                    type="submit"
                    className="bg-zinc-800 py-2 px-4 rounded w-full mb-2"
                >
                    Agregar
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="border border-zinc-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                >
                    Cancelar
                </button>
            </form>

        </div>
    )
}

export default FormCrearTipoEvento