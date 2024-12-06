'use client'
import React, { useState, useEffect } from 'react'
import { obtenerCategories, actualizarCategoria, eliminarCategoria, actualizarPosicionesCategorias } from '@/app/admin/_lib/categorias.actions'
import FormCrearCategoria from './FormCrearCategoria'
import { ServicioCategoria } from '@/app/admin/_lib/types'
import { GripHorizontal } from 'lucide-react'
import { useDragAndDrop } from '@/app/admin/_lib/dragAndDrop'

function ListaCategorias() {

    const [categories, setCategories] = useState([] as ServicioCategoria[]);
    const [loading, setLoading] = useState(true);
    const [mostrarFormCrearCategoria, setMostrarFormCrearCategoria] = useState(false);
    const [error, setError] = useState<string | null>('');

    async function fetchCategories() {
        try {
            const response = await obtenerCategories();
            setCategories(response.map(category => ({
                ...category,
                posicion: category.posicion
            })));
        } catch (error) {
            console.error('Error fetching categories:', error);
            setError('Error al cargar las categorías');
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmitCrearCategoria() {
        try {
            fetchCategories();
            setMostrarFormCrearCategoria(false);
        } catch (error) {
            console.error('Error creando categoría:', error);
            setError('Error al crear la categoría');
        }
    }

    function handleCancelCrearCategoria() {
        setMostrarFormCrearCategoria(false);
    }

    async function handleDeleteCategory(id: string) {
        if (confirm('¿Estás seguro de eliminar esta categoría?')) {
            try {
                await eliminarCategoria(id);
                await fetchCategories();
            } catch (error) {
                console.error('Error eliminando categoría:', error);
                setError('Error al eliminar la categoría');
            }
        }
    }

    async function handleUpdateCategory(id: string, nombreAnterior: string, nombreNuevo: string) {
        try {
            const response = await actualizarCategoria(id, nombreNuevo);
            if (response.status === 'success') {
                fetchCategories();
            } else {
                setError('Nombre duplicado');
                setTimeout(() => {
                    setError(null);
                    fetchCategories();
                }, 1000);
            }
        } catch (error) {
            console.error('Error actualizando categoría:', error);
            setError('Error al actualizar la categoría');
        }
    }

    useEffect(() => {
        fetchCategories();
    }, []);

    //! Drag and drop begin
    const { items, handleDragStart, handleDrop, handleDragOver } = useDragAndDrop(categories);
    useEffect(() => {
        setCategories(items);
    }, [items]);

    useEffect(() => {
        const newCategories = categories.map((category, index) => ({
            ...category,
            posicion: index + 1
        }));
        // console.log('newCategories', newCategories);
        actualizarPosicionesCategorias(newCategories);
    }, [categories]);
    //! Drag and drop end

    return (
        <div className='mx-auto max-w-lg p-5 bg-zinc-800/20 rounded-md border border-zinc-800'>
            <div className='flex justify-between items-center mb-5'>
                <h1 className='text-2xl'>Categorias</h1>
                <button
                    className='border border-zinc-700 text-zinc-400 font-bold py-2 px-4 rounded text-sm'
                    onClick={() => setMostrarFormCrearCategoria(true)} >
                    Crear nueva categoria
                </button>
            </div>

            {mostrarFormCrearCategoria &&
                <div className='mb-5'>
                    <FormCrearCategoria onSubmit={handleSubmitCrearCategoria} onCancel={handleCancelCrearCategoria} />
                </div>
            }

            {error && (
                <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-5' role='alert'>
                    <span className='block sm:inline'>{error}</span>
                </div>
            )}

            {loading && <p>Cargando...</p>}

            {(categories.length > 0) ? (
                <ul className='space-y-4'>
                    {categories.map((category, index) => (
                        category && (
                            <li key={category.id} className='flex rounded cursor-move items-center'
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDrop(index)}
                            >
                                <span className='text-white cursor-move pr-4'>
                                    <GripHorizontal />
                                </span>
                                <div className='flex flex-auto justify-between items-center gap-2'>
                                    <input
                                        type="text"
                                        value={category.nombre}
                                        onChange={(e) => {
                                            const newNombre = e.target.value;
                                            setCategories(prevCategories =>
                                                prevCategories.map(cat =>
                                                    cat.id === category.id ? { ...cat, nombre: newNombre } : cat
                                                )
                                            );
                                        }}
                                        onBlur={(e) => {
                                            const newNombre = e.currentTarget.value;
                                            if (category.id) {
                                                handleUpdateCategory(category.id, category.nombre, newNombre);
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                const newNombre = e.currentTarget.value;
                                                if (category.id) {
                                                    handleUpdateCategory(category.id, category.nombre, newNombre);
                                                }
                                            }
                                        }}
                                        className="bg-zinc-900 border border-zinc-800 rounded w-full py-2 px-3 text-zinc-400 leading-tight "
                                    />
                                    <div>
                                        <button className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm'
                                            onClick={() => { if (category.id) { handleDeleteCategory(category.id) } }}>
                                            Eliminar</button>
                                    </div>
                                </div>
                            </li>
                        )
                    ))}
                </ul>
            ) : (
                <p className='my-5 text-zinc-500'>No hay categorías</p>
            )}
        </div>
    )
}

export default ListaCategorias;