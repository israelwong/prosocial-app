'use client'
import React, { useState } from 'react';
import { crearConfiguracion } from '@/app/admin/_lib/configuracion.actions';
import { Configuracion } from '@/app/admin/_lib/types';

interface Props {
    onClose: () => void;
    onSubmit: () => void;
}

export default function FormCrearConfiguracion({ onClose, onSubmit }: Props) {
    const [formData, setFormData] = useState<Configuracion>({
        nombre: '',
        utilidad_servicio: 0,
        utilidad_producto: 0,
        comision_venta: 0,
        sobreprecio: 0,
    });

    const [errors, setErrors] = useState({
        nombre: '',
        utilidad_servicio: '',
        utilidad_producto: '',
        comision_venta: '',
        sobreprecio: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const validate = () => {
        let valid = true;
        const newErrors = { nombre: '', utilidad_servicio: '', utilidad_producto: '', comision_venta: '', sobreprecio: '' };

        if (!formData.nombre) {
            newErrors.nombre = 'El nombre es requerido';
            valid = false;
        }
        if (formData.utilidad_servicio <= 0) {
            newErrors.utilidad_servicio = 'La utilidad para servicios requerida';
            valid = false;
        }

        if (formData.comision_venta <= 0) {
            newErrors.comision_venta = 'La comisión para ventas es requerida';
            valid = false;
        }
        if (formData.sobreprecio <= 0) {
            newErrors.sobreprecio = 'El sobreprecio es requerido';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            await crearConfiguracion(formData);
            onSubmit();
        }
    };

    return (
        <div>
            <h1 className="text-xl font-bold mb-4 text-black">Crear configuración</h1>
            <form onSubmit={handleSubmit} className='text-black'>
                <div className="mb-4">
                    <label className="block text-gray-700">Nombre</label>
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                    {errors.nombre && <p className="text-red-500 text-sm">{errors.nombre}</p>}
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Utilidad para servicios</label>
                    <input
                        type="number"
                        name="utilidad_servicio"
                        value={formData.utilidad_servicio}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                    {errors.utilidad_servicio && <p className="text-red-500 text-sm">{errors.utilidad_servicio}</p>}
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Utilidad para productos</label>
                    <input
                        type="number"
                        name="utilidad_producto"
                        value={formData.utilidad_producto}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                    {errors.utilidad_producto && <p className="text-red-500 text-sm">{errors.utilidad_producto}</p>}
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Comisión para ventas</label>
                    <input
                        type="number"
                        name="comision_venta"
                        value={formData.comision_venta}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                    {errors.comision_venta && <p className="text-red-500 text-sm">{errors.comision_venta}</p>}
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Sobreprecio para promociones</label>
                    <input
                        type="number"
                        name="sobreprecio"
                        value={formData.sobreprecio}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                    {errors.sobreprecio && <p className="text-red-500 text-sm">{errors.sobreprecio}</p>}
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
                >
                    Crear
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded w-full mt-4"
                >
                    Cancelar
                </button>
            </form>
        </div>
    );
}