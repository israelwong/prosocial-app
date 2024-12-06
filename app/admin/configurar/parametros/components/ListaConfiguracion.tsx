'use client'
import { useEffect, useState } from 'react';
import { obtenerConfiguraciones } from '@/app/admin/_lib/configuracion.actions';
import { Configuracion } from '@/app/admin/_lib/types';

import FormCrearConfiguracion from './FormCrearConfiguracion';
import FormEditarConfiguracion from './FormEditarConfiguracion';

function ListaConfiguracion() {
    const [configuraciones, setConfiguraciones] = useState<Configuracion[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedConfiguracionId, setSelectedConfiguracionId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            const data = await obtenerConfiguraciones();
            setConfiguraciones(data);
        }
        fetchData();
    }, []);

    // function handleCreate() {
    //     setIsModalOpen(true);
    // }

    function handleCloseModal() {
        setIsModalOpen(false);
    }

    function handleEdit(configuracionId: string) {
        setSelectedConfiguracionId(configuracionId);
        setIsEditModalOpen(true);
    }

    function handleCloseEditModal() {
        setIsEditModalOpen(false);
        setSelectedConfiguracionId(null);
    }

    async function handleSubmit() {
        const data = await obtenerConfiguraciones();
        setConfiguraciones(data);
        setIsModalOpen(false);
        setIsEditModalOpen(false);
    }

    return (
        <div className="container mx-auto p-4 w-full">
            <div className='flex justify-between items-center mb-5'>
                <h1 className="text-2xl font-bold mb-4">Lista de configuraciones</h1>
                {/* 
                <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
                    onClick={handleCreate}
                >
                    Crear nueva configuración
                </button> */}
            </div>

            <div className='grid grid-cols-3 '>


                <div className='text-sm text-gray-400 mb-4 space-y-3'>
                    <ul>
                        <li>La utilidad en servicios se aplica a los servicios que se venden en el sistema.</li>
                        <li>La utilidad en productos se aplica a los productos que se venden en el sistema.</li>
                        <li>La comisión para ventas se aplica a las ventas realizadas por los vendedores</li>
                        <li>El sobreprecio en promociones se aplica a los servicios</li>
                    </ul>
                    <p>Las configuraciones se aplicarán en todo el sistema y solo afectará el precio calculado por el sistema pero no del almacenado por servicio</p>
                    <p>Si deseas actualiar el precio de los productos será necesario hacerlo manualmente</p>
                </div>

                <table className="min-w-full bg-zinc-900 border border-zinc-600 rounded-md col-span-2">
                    <thead>
                        <tr className='text-white border-b border-b-zinc-500 text-sm'>
                            <th className="py-2 px-4">Nombre</th>
                            <th className="py-2 px-4">Utilidad servicios</th>
                            <th className="py-2 px-4">Utilidad productos</th>
                            <th className="py-2 px-4">Comisión ventas</th>
                            <th className="py-2 px-4">Sobreprecio</th>
                            <th className="py-2 px-4">Creado</th>
                            <th className="py-2 px-4">Estatus</th>
                            <th className="py-2 px-4">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {configuraciones.map((configuracion, index) => (
                            <tr key={index} className="hover:bg-zinc-800 text-zinc-300 border-b border-zinc-500">
                                <td className="py-2 px-4">{configuracion.nombre}</td>
                                <td className="py-2 px-4 text-center">{configuracion.utilidad_servicio}%</td>
                                <td className="py-2 px-4 text-center">{configuracion.utilidad_producto}%</td>
                                <td className="py-2 px-4 text-center">{configuracion.comision_venta}%</td>
                                <td className="py-2 px-4 text-center">{configuracion.sobreprecio}%</td>
                                <td className="py-2 px-4 text-center">{configuracion.createdAt ? new Date(configuracion.createdAt).toLocaleDateString() : 'N/A'}</td>
                                <td className="py-2 px-4 text-center">{configuracion.status}</td>
                                <td className="py-2 px-4 text-center">
                                    <button
                                        className="text-sm bg-zinc-500 hover:bg-zinc-700 text-white font-bold py-1 px-2 rounded mr-2"
                                        onClick={() => configuracion.id && handleEdit(configuracion.id)}
                                    >
                                        Editar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-8 rounded shadow-lg relative w-1/4">
                        <FormCrearConfiguracion
                            onClose={handleCloseModal}
                            onSubmit={handleSubmit}
                        />
                    </div>
                </div>
            )}

            {isEditModalOpen && selectedConfiguracionId && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-8 rounded shadow-lg relative w-1/4">
                        <FormEditarConfiguracion
                            configuracionId={selectedConfiguracionId}
                            onClose={handleCloseEditModal}
                            onSubmit={handleSubmit}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default ListaConfiguracion;