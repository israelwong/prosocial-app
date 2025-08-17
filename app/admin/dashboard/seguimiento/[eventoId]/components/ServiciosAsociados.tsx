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
        posicion: number;
        categorias: {
            [categoria: string]: {
                posicion: number;
                servicios: any[];
            };
        };
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

    // Agrupar servicios por sección y categoría con ordenamiento
    const serviciosAgrupados: ServiciosAgrupados = servicios.reduce((acc: ServiciosAgrupados, servicio: any) => {
        const seccion = servicio.seccion_nombre_snapshot || servicio.seccion_nombre || 'Sin Sección';
        const categoria = servicio.categoria_nombre_snapshot || servicio.categoria_nombre || 'Sin Categoría';

        if (!acc[seccion]) {
            acc[seccion] = {
                // Intentar obtener la posición de la sección desde diferentes fuentes
                posicion: servicio.ServicioCategoria?.seccionCategoria?.Seccion?.posicion ||
                    servicio.Servicio?.ServicioCategoria?.seccionCategoria?.Seccion?.posicion ||
                    0,
                categorias: {}
            };
        }
        if (!acc[seccion].categorias[categoria]) {
            acc[seccion].categorias[categoria] = {
                // Intentar obtener la posición de la categoría desde diferentes fuentes
                posicion: servicio.ServicioCategoria?.posicion ||
                    servicio.Servicio?.ServicioCategoria?.posicion ||
                    0,
                servicios: []
            };
        }
        acc[seccion].categorias[categoria].servicios.push(servicio);

        return acc;
    }, {} as ServiciosAgrupados);

    // Ordenar secciones por posición, luego por nombre
    const seccionesOrdenadas = Object.entries(serviciosAgrupados).sort(([nombreA, a], [nombreB, b]) => {
        if (a.posicion !== b.posicion) {
            return a.posicion - b.posicion;
        }
        return nombreA.localeCompare(nombreB);
    });

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
        console.log('🔄 Iniciando asignación:', {
            servicioId: servicioSeleccionado?.id,
            usuarioId,
            eventoId: evento.id
        });

        if (servicioSeleccionado) {
            try {
                const resultado = await asignarUsuarioAServicio(servicioSeleccionado.id, usuarioId, evento.id);
                console.log('✅ Asignación exitosa:', resultado);

                setModalAbierto(false);
                setServicioSeleccionado(null);

                console.log('🔄 Modal cerrado, esperando recarga...');
            } catch (error) {
                console.error('❌ Error al asignar usuario:', error);
                alert('Error al asignar usuario: ' + (error as Error).message);
            }
        } else {
            console.warn('⚠️ No hay servicio seleccionado');
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
            {seccionesOrdenadas.map(([seccion, seccionData]) => {
                // Ordenar categorías por posición, luego por nombre
                const categoriasOrdenadas = Object.entries(seccionData.categorias).sort(([nombreA, a], [nombreB, b]) => {
                    if (a.posicion !== b.posicion) {
                        return a.posicion - b.posicion;
                    }
                    return nombreA.localeCompare(nombreB);
                });

                return (
                    <div key={seccion} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                        {/* Nombre de la Sección */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                {seccion}
                            </h3>
                        </div>

                        {/* Categorías */}
                        <div className="ml-6 space-y-6">
                            {categoriasOrdenadas.map(([categoria, categoriaData]) => (
                                <div key={categoria} className="border-l-2 border-zinc-700 pl-4">
                                    {/* Nombre de la Categoría */}
                                    <h4 className="text-md font-medium text-zinc-200 mb-4 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full"></span>
                                        {categoria}
                                    </h4>

                                    {/* Servicios */}
                                    <div className="ml-6 space-y-4">
                                        {categoriaData.servicios.map((servicio: any) => {
                                            const costo = servicio.costo_snapshot || servicio.costo || 0;
                                            const cantidad = servicio.cantidad || 1;
                                            const total = costo * cantidad;

                                            return (
                                                <div key={servicio.id} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:bg-zinc-800 transition-colors">
                                                    {/* Línea 1: Nombre del servicio */}
                                                    <h5 className="text-zinc-100 font-medium mb-2">
                                                        {servicio.nombre_snapshot || servicio.nombre || 'Servicio sin nombre'}
                                                    </h5>

                                                    {/* Línea 2: Costo y cantidad */}
                                                    <div className="flex items-center gap-4 mb-3 text-sm text-zinc-300">
                                                        <span>
                                                            <strong className="text-zinc-200">Costo:</strong> ${costo.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </span>
                                                        <span>
                                                            <strong className="text-zinc-200">Cantidad:</strong> {cantidad}
                                                        </span>
                                                        <span className="font-medium text-green-400">
                                                            <strong>Total:</strong> ${total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </span>
                                                    </div>

                                                    {/* Línea 3: Personal, Asignar, Autorizar pago */}
                                                    <div className="flex items-center justify-between">
                                                        {/* Personal asignado */}
                                                        <div className="flex items-center gap-2">
                                                            {servicio.User ? (
                                                                <div className="flex items-center gap-2 px-3 py-1 bg-blue-900/30 border border-blue-700 rounded-full">
                                                                    <User className="w-4 h-4 text-blue-400" />
                                                                    <span className="text-sm text-blue-300">
                                                                        {servicio.User.username || servicio.User.email}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-zinc-500 px-3 py-1 bg-zinc-700/50 rounded-full">
                                                                    Sin personal asignado
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Acciones */}
                                                        <div className="flex items-center gap-2">
                                                            {servicio.User ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleRemover(servicio)}
                                                                        className="flex items-center gap-1 px-3 py-1 text-xs bg-red-600/80 hover:bg-red-600 text-white rounded transition-colors"
                                                                        title="Remover asignación"
                                                                    >
                                                                        <XCircle className="w-3 h-3" />
                                                                        Remover
                                                                    </button>
                                                                    <button
                                                                        onClick={handleAutorizarPago}
                                                                        className="flex items-center gap-1 px-3 py-1 text-xs bg-green-600/80 hover:bg-green-600 text-white rounded transition-colors"
                                                                        title="Autorizar pago"
                                                                    >
                                                                        <CheckCircle className="w-3 h-3" />
                                                                        Autorizar Pago
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleAsignar(servicio)}
                                                                    className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                                                                >
                                                                    <UserPlus className="w-3 h-3" />
                                                                    Asignar Personal
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

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
