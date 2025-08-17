'use client';

import React, { useState } from 'react';
import { User, UserPlus, XCircle, CheckCircle } from 'lucide-react';
import AsignarUsuarioModal from './AsignarUsuarioModal';
import { asignarUsuarioAServicio, removerUsuarioDeServicio } from '@/app/admin/_lib/actions/seguimiento/servicios.actions';

// Tipos para los datos
interface UserData {
    id: string;
    username: string | null;
    email: string | null;
    role: string;
}

interface ServicioData {
    id: string;
    cantidad: number;
    userId: string | null;
    User: UserData | null;
    seccion_nombre_snapshot: string | null;
    categoria_nombre_snapshot: string | null;
    nombre_snapshot: string;
    costo_snapshot: number;
}

interface CotizacionData {
    Servicio: ServicioData[];
}

interface EventoData {
    id: string;
    Cotizacion?: CotizacionData[];
}

interface Props {
    evento: any; // Usando any para mayor flexibilidad con los tipos del servidor
    usuarios: UserData[];
}

// Tipo para servicios agrupados
interface ServiciosAgrupados {
    [seccion: string]: {
        [categoria: string]: any[];
    };
}

export default function ServiciosAsociados({ evento, usuarios }: Props) {
    const [modalAbierto, setModalAbierto] = useState(false);
    const [servicioSeleccionado, setServicioSeleccionado] = useState<any | null>(null);

    // Obtener la cotización aprobada y sus servicios
    const cotizacionAprobada = evento?.Cotizacion?.[0];
    const servicios = cotizacionAprobada?.Servicio || [];

    // Calcular total a pagar
    const totalAPagar = servicios.reduce((total: number, servicio: any) => {
        const costo = servicio.costo_snapshot || servicio.costo || 0;
        const cantidad = servicio.cantidad || 1;
        return total + (costo * cantidad);
    }, 0);

    // Agrupar servicios por sección y categoría
    const serviciosAgrupados: ServiciosAgrupados = servicios.reduce((acc: ServiciosAgrupados, servicio: any) => {
        const seccion = servicio.seccion_nombre_snapshot || servicio.seccion_nombre || 'Sin Sección';
        const categoria = servicio.categoria_nombre_snapshot || servicio.categoria_nombre || 'Sin Categoría';

        if (!acc[seccion]) {
            acc[seccion] = {};
        }
        if (!acc[seccion][categoria]) {
            acc[seccion][categoria] = [];
        }
        acc[seccion][categoria].push(servicio);

        return acc;
    }, {} as ServiciosAgrupados);

    const handleAsignar = (servicio: any) => {
        setServicioSeleccionado(servicio);
        setModalAbierto(true);
    };

    const handleRemover = async (servicio: any) => {
        try {
            await removerUsuarioDeServicio(servicio.id, evento.id);
        } catch (error) {
            console.error('Error al remover usuario:', error);
        }
    };

    const handleAutorizarPago = () => {
        alert('Función de autorización de pago pendiente por implementar');
    };

    const handleConfirmarAsignacion = async (usuarioId: string) => {
        if (servicioSeleccionado) {
            try {
                await asignarUsuarioAServicio(servicioSeleccionado.id, usuarioId, evento.id);
                setModalAbierto(false);
                setServicioSeleccionado(null);
            } catch (error) {
                console.error('Error al asignar usuario:', error);
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Cabecera con Total a Pagar */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-zinc-200">Servicios Asociados</h2>
                    <div className="text-right">
                        <span className="text-sm text-zinc-400 block">Total a Pagar</span>
                        <span className="text-2xl font-bold text-green-400">
                            ${totalAPagar.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Servicios Agrupados */}
            {Object.entries(serviciosAgrupados).map(([seccion, categorias]) => (
                <div key={seccion} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-zinc-200 mb-4">{seccion}</h3>

                    {Object.entries(categorias).map(([categoria, serviciosCategoria]) => (
                        <div key={categoria} className="mb-6 last:mb-0">
                            <h4 className="text-md font-medium text-zinc-300 mb-3 border-b border-zinc-700 pb-2">
                                {categoria}
                            </h4>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-xs text-zinc-400 border-b border-zinc-700">
                                            <th className="text-left py-2 px-3">Servicio</th>
                                            <th className="text-right py-2 px-3">Costo</th>
                                            <th className="text-center py-2 px-3">Cantidad</th>
                                            <th className="text-right py-2 px-3">Total</th>
                                            <th className="text-center py-2 px-3">Asignado a</th>
                                            <th className="text-center py-2 px-3">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {serviciosCategoria.map((servicio: any) => {
                                            const costo = servicio.costo_snapshot || servicio.costo || 0;
                                            const cantidad = servicio.cantidad || 1;
                                            const total = costo * cantidad;

                                            return (
                                                <tr key={servicio.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                                                    <td className="py-3 px-3 text-zinc-200">
                                                        {servicio.nombre_snapshot || servicio.nombre || 'Servicio sin nombre'}
                                                    </td>
                                                    <td className="py-3 px-3 text-right text-zinc-300">
                                                        ${costo.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="py-3 px-3 text-center text-zinc-300">
                                                        {cantidad}
                                                    </td>
                                                    <td className="py-3 px-3 text-right font-medium text-zinc-200">
                                                        ${total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="py-3 px-3 text-center">
                                                        {servicio.User ? (
                                                            <div className="flex items-center justify-center gap-1">
                                                                <User className="w-4 h-4 text-blue-400" />
                                                                <span className="text-sm text-blue-400">
                                                                    {servicio.User.username || servicio.User.email}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-zinc-500">Sin asignar</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-3">
                                                        <div className="flex items-center justify-center gap-2">
                                                            {servicio.User ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleRemover(servicio)}
                                                                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                                                                        title="Remover asignación"
                                                                    >
                                                                        <XCircle className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={handleAutorizarPago}
                                                                        className="p-1 text-green-400 hover:text-green-300 hover:bg-green-900/20 rounded transition-colors"
                                                                        title="Autorizar pago"
                                                                    >
                                                                        <CheckCircle className="w-4 h-4" />
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleAsignar(servicio)}
                                                                    className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                                                                >
                                                                    <UserPlus className="w-3 h-3" />
                                                                    Asignar
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            ))}

            {/* Modal de Asignación */}
            <AsignarUsuarioModal
                isOpen={modalAbierto}
                onClose={() => {
                    setModalAbierto(false);
                    setServicioSeleccionado(null);
                }}
                usuarios={usuarios}
                onConfirmar={handleConfirmarAsignacion}
                servicio={servicioSeleccionado}
            />
        </div>
    );
}
