'use client';
import React, { useState } from 'react';
import { Trash, Plus, Edit } from 'lucide-react';
import { ServicioGasto } from '@/app/admin/_lib/types';

interface ListaGastosProps {
    gastos: ServicioGasto[];
    onAgregarGasto: (gasto: ServicioGasto) => void;
    onEliminarGasto: (index: number) => void;
    onEditarGasto: (index: number, gasto: ServicioGasto) => void;
}

const ListaGastos = ({ gastos, onAgregarGasto, onEliminarGasto, onEditarGasto }: ListaGastosProps) => {
    const [nombre, setNombre] = useState('');
    const [costo, setCosto] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentGasto, setCurrentGasto] = useState<ServicioGasto | null>(null);
    const [editIndex, setEditIndex] = useState<number | null>(null);

    const handleAgregarGasto = () => {
        if (!nombre || isNaN(Number(costo))) {
            alert('Nombre y costo son requeridos y el costo debe ser un número');
            return;
        }
        onAgregarGasto({
            nombre: nombre.charAt(0).toUpperCase() + nombre.slice(1),
            costo: Number(costo)
        });
        setNombre('');
        setCosto('');
    };

    const handleEditarGasto = (index: number) => {
        const gasto = gastos[index];
        setCurrentGasto(gasto);
        setNombre(gasto.nombre);
        setCosto(gasto.costo.toString());
        setEditIndex(index);
        setIsModalVisible(true);
    };

    const handleUpdateGasto = () => {
        if (editIndex !== null && currentGasto) {
            onEditarGasto(editIndex, {
                ...currentGasto,
                nombre: nombre.charAt(0).toUpperCase() + nombre.slice(1),
                costo: Number(costo)
            });
            setIsModalVisible(false);
            setNombre('');
            setCosto('');
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setNombre('');
        setCosto('');
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleAgregarGasto();
            (e.target as HTMLInputElement).blur();
            document.getElementById('concepto')?.focus();
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center">
                <input
                    id='concepto'
                    type="text"
                    placeholder="Concepto"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="border p-2 mr-2 w-full rounded-md bg-zinc-900 border-zinc-800 text-zinc-300 onfocus:bg-zinc-800"
                />
                <input
                    type="text"
                    placeholder="Monto"
                    value={costo}
                    onChange={(e) => setCosto(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="border p-2 mr-2 w-1/4 rounded-md bg-zinc-900 border-zinc-800 text-zinc-300"
                />
                <button
                    className="bg-blue-500 text-white p-2 rounded "
                    onClick={handleAgregarGasto}
                >
                    <Plus />
                </button>
            </div>

            <ul className='space-y-2 mt-3'>
                {gastos.map((gasto, index) => (
                    <li key={index} className='flex justify-between p-2 bg-zinc-700 rounded-md mb-2 text-zinc-300'>
                        <p>
                            {gasto.nombre}: ${gasto.costo}
                        </p>
                        <div>
                            <button
                                className="text-yellow-500 mr-2"
                                onClick={() => handleEditarGasto(index)}
                            >
                                <Edit size={20} />
                            </button>
                            <button
                                className="text-red-500"
                                onClick={() => onEliminarGasto(index)}
                            >
                                <Trash size={20} />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            {isModalVisible && (
                <div className="fixed inset-0 flex items-center justify-center bg-zinc-700 bg-opacity-50">
                    <div className="bg-zinc-950 p-6 rounded shadow-lg">
                        <h2 className="text-xl mb-4 text-white">Editar Gasto</h2>
                        <input
                            type="text"
                            placeholder="Concepto"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="w-full p-2 mb-4 border rounded bg-zinc-900 border-zinc-800 text-zinc-300"
                        />
                        <input
                            type="number"
                            placeholder="Monto"
                            value={costo}
                            onChange={(e) => setCosto(e.target.value)}
                            className="w-full p-2 mb-4 border rounded bg-zinc-900 border-zinc-800 text-zinc-300"
                        />
                        <div className="flex justify-end">
                            <button className="bg-gray-500 text-white px-4 py-2 rounded mr-2" onClick={handleCancel}>Cancelar</button>
                            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleUpdateGasto}>Actualizar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListaGastos;