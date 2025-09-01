'use client';

import React, { useState } from 'react';
import { User, UserPlus, XCircle, CheckCircle, Eye, EyeOff, DollarSign, FileText, ChevronDown } from 'lucide-react';
import AsignarUsuarioModal from './AsignarUsuarioModal';
import CrearNominaModal from './CrearNominaModal';
import { asignarUsuarioAServicio, removerUsuarioDeServicio } from '@/app/admin/_lib/actions/seguimiento/servicios.actions';
import { crearNominaIndividual, cancelarPago } from '@/app/admin/_lib/actions/seguimiento/nomina.actions';
import { NOMINA_STATUS } from '@/app/admin/_lib/constants/status';
import { toast } from 'react-hot-toast';

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
    NominaServicio?: Array<{
        Nomina: {
            id: string;
            status: string;
            monto_neto: number;
            fecha_pago: string | null;
            fecha_autorizacion: string | null;
        };
    }>;
}

interface CotizacionData {
    Servicio: ServicioData[];
}

interface EventoData {
    id: string;
    Cotizacion?: CotizacionData[];
}

interface Props {
    evento: any;
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

export default function ServiciosAsociadosCompacto({ evento, usuarios }: Props) {
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modalNominaAbierto, setModalNominaAbierto] = useState(false);
    const [servicioSeleccionado, setServicioSeleccionado] = useState<any | null>(null);
    const [mostrarInformacionFinanciera, setMostrarInformacionFinanciera] = useState(false);

    // Obtener la cotización aprobada y sus servicios
    const cotizacionAprobada = evento?.Cotizacion?.[0];
    const servicios = cotizacionAprobada?.Servicio || [];

    // Lógica de agrupamiento (igual que el original)
    const serviciosAgrupados: ServiciosAgrupados = {};

    servicios.forEach((cotizacionServicio: any, index: number) => {
        const nombreServicio = cotizacionServicio.nombre_snapshot && cotizacionServicio.nombre_snapshot !== 'Servicio migrado'
            ? cotizacionServicio.nombre_snapshot
            : cotizacionServicio.Servicio?.nombre || 'Servicio sin nombre';

        const categoriaNombre = cotizacionServicio.categoria_nombre_snapshot ||
            cotizacionServicio.Servicio?.ServicioCategoria?.nombre ||
            cotizacionServicio.ServicioCategoria?.nombre ||
            'Sin categoría';

        const seccionNombre = cotizacionServicio.seccion_nombre_snapshot ||
            cotizacionServicio.Servicio?.ServicioCategoria?.seccionCategoria?.Seccion?.nombre ||
            cotizacionServicio.ServicioCategoria?.seccionCategoria?.Seccion?.nombre ||
            'Servicios Generales';

        const seccionPosicion = cotizacionServicio.Servicio?.ServicioCategoria?.seccionCategoria?.Seccion?.posicion ||
            cotizacionServicio.ServicioCategoria?.seccionCategoria?.Seccion?.posicion || 0;

        const categoriaPosicion = cotizacionServicio.Servicio?.ServicioCategoria?.posicion ||
            cotizacionServicio.ServicioCategoria?.posicion || 0;

        if (!serviciosAgrupados[seccionNombre]) {
            serviciosAgrupados[seccionNombre] = {
                posicion: seccionPosicion,
                categorias: {}
            };
        }

        if (!serviciosAgrupados[seccionNombre].categorias[categoriaNombre]) {
            serviciosAgrupados[seccionNombre].categorias[categoriaNombre] = {
                posicion: categoriaPosicion,
                servicios: []
            };
        }

        serviciosAgrupados[seccionNombre].categorias[categoriaNombre].servicios.push({
            ...cotizacionServicio,
            posicion: cotizacionServicio.posicion || index
        });
    });

    const seccionesOrdenadas = Object.entries(serviciosAgrupados)
        .sort(([, a], [, b]) => (a.posicion || 0) - (b.posicion || 0));

    // Handlers (iguales que el original)
    const handleAsignar = (servicio: any) => {
        setServicioSeleccionado(servicio);
        setModalAbierto(true);
    };

    const handleRemover = async (servicio: any) => {
        const infoNomina = obtenerInfoNomina(servicio);

        if (infoNomina && infoNomina.status === NOMINA_STATUS.PENDIENTE) {
            const confirmar = confirm(
                'Este usuario tiene un pago pendiente programado.\n\n' +
                '¿Deseas cancelar el pago y remover al usuario del servicio?'
            );

            if (confirmar) {
                try {
                    await cancelarPago(infoNomina.id, evento.id);
                    await removerUsuarioDeServicio(servicio.id, evento.id);
                } catch (error) {
                    console.error('Error al cancelar pago y remover usuario:', error);
                    alert('Error: ' + (error as Error).message);
                }
            }
        } else {
            const confirmar = confirm('¿Estás seguro de que deseas remover a este usuario del servicio?');

            if (confirmar) {
                try {
                    await removerUsuarioDeServicio(servicio.id, evento.id);
                    toast.success('Usuario removido exitosamente');
                } catch (error) {
                    console.error('Error al remover usuario:', error);
                    toast.error('Error al remover usuario: ' + (error as Error).message);
                }
            }
        }
    };

    const handleAutorizarPago = (servicio: any) => {
        setServicioSeleccionado(servicio);
        setModalNominaAbierto(true);
    };

    const handleConfirmarNomina = async (datosNomina: {
        concepto: string;
        descripcion?: string;
        monto_bruto: number;
        deducciones: number;
        monto_neto: number;
        metodo_pago: string;
    }) => {
        if (!servicioSeleccionado) return;

        try {
            await crearNominaIndividual(servicioSeleccionado.id, evento.id, datosNomina);
        } catch (error) {
            console.error('Error al crear nómina:', error);
            alert('Error al crear nómina: ' + (error as Error).message);
        }
    };

    const handleCancelarPago = async (servicio: any) => {
        const infoNomina = obtenerInfoNomina(servicio);
        if (!infoNomina) return;

        if (confirm('¿Estás seguro de que deseas cancelar este pago?')) {
            try {
                await cancelarPago(infoNomina.id, evento.id);
            } catch (error) {
                console.error('Error al cancelar pago:', error);
                alert('Error al cancelar pago: ' + (error as Error).message);
            }
        }
    };

    const obtenerInfoNomina = (servicio: any) => {
        const nominaServicio = servicio.NominaServicio?.[0];
        if (!nominaServicio) return null;

        const nomina = nominaServicio.Nomina;
        return {
            id: nomina.id,
            status: nomina.status,
            monto_neto: nomina.monto_neto,
            fecha_pago: nomina.fecha_pago,
            fecha_autorizacion: nomina.fecha_autorizacion
        };
    };

    const obtenerBadgeNomina = (infoNomina: any) => {
        if (!infoNomina) return null;

        const statusConfig = {
            pendiente: {
                bg: 'bg-yellow-900/30',
                border: 'border-yellow-700',
                text: 'text-yellow-300',
                label: 'Programado'
            },
            autorizado: {
                bg: 'bg-blue-900/30',
                border: 'border-blue-700',
                text: 'text-blue-300',
                label: 'Autorizado'
            },
            pagado: {
                bg: 'bg-green-900/30',
                border: 'border-green-700',
                text: 'text-green-300',
                label: 'Pagado'
            },
            cancelado: {
                bg: 'bg-red-900/30',
                border: 'border-red-700',
                text: 'text-red-300',
                label: 'Cancelado'
            }
        };

        const config = statusConfig[infoNomina.status as keyof typeof statusConfig] || statusConfig.pendiente;

        return (
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs ${config.bg} ${config.border} ${config.text} border`}>
                <span className="font-medium">
                    {config.label}
                </span>
            </div>
        );
    };

    const handleConfirmarAsignacion = async (usuarioId: string) => {
        if (servicioSeleccionado) {
            try {
                const resultado = await asignarUsuarioAServicio(servicioSeleccionado.id, usuarioId, evento.id);
                setModalAbierto(false);
                setServicioSeleccionado(null);
            } catch (error) {
                console.error('❌ Error al asignar usuario:', error);
                alert('Error al asignar usuario: ' + (error as Error).message);
            }
        }
    };

    return (
        <div>
            {/* Header minimalista */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
                <div className="p-4 border-b border-zinc-800">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-zinc-200">Servicios Asociados</h2>
                        <div className="flex items-center gap-2">
                            <a
                                href={`/admin/dashboard/eventos/${evento.id}/cotizacion/${cotizacionAprobada?.id}`}
                                className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                                title="Editar cotización"
                            >
                                <FileText className="w-4 h-4 inline mr-1" />
                                Editar
                            </a>
                            <button
                                onClick={() => setMostrarInformacionFinanciera(!mostrarInformacionFinanciera)}
                                className="p-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-md transition-colors"
                                title={mostrarInformacionFinanciera ? "Ocultar costos" : "Mostrar costos"}
                            >
                                {mostrarInformacionFinanciera ? (
                                    <EyeOff className="w-4 h-4" />
                                ) : (
                                    <Eye className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Servicios compactos */}
                <div className="p-4 space-y-4">
                    {seccionesOrdenadas.map(([seccion, seccionData]) => {
                        const categoriasOrdenadas = Object.entries(seccionData.categorias).sort(([nombreA, a], [nombreB, b]) => {
                            if (a.posicion !== b.posicion) {
                                return a.posicion - b.posicion;
                            }
                            return nombreA.localeCompare(nombreB);
                        });

                        return (
                            <div key={seccion} className="space-y-3">
                                {/* Sección título más compacto */}
                                <h3 className="text-sm font-semibold text-zinc-300 border-b border-zinc-700 pb-1">
                                    {seccion}
                                </h3>

                                {categoriasOrdenadas.map(([categoria, categoriaData]) => (
                                    <div key={categoria} className="space-y-2">
                                        {/* Categoría más sutil */}
                                        <h4 className="text-xs font-medium text-zinc-400 ml-2">
                                            {categoria}
                                        </h4>

                                        {/* Servicios en lista compacta */}
                                        <div className="space-y-2 ml-4">
                                            {categoriaData.servicios.map((servicio: any) => {
                                                const cantidad = servicio.cantidad || 1;
                                                const costo = servicio.costo_snapshot || 0;
                                                const total = costo * cantidad;

                                                return (
                                                    <div key={servicio.id} className="p-3 bg-zinc-800/30 border border-zinc-700/50 rounded-md hover:bg-zinc-800/50 transition-colors">
                                                        {/* Línea principal: Servicio + Cantidad + Personal + Acciones */}
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div className="flex items-center gap-3 flex-1">
                                                                {/* Nombre del servicio */}
                                                                <span className="font-medium text-zinc-200 text-sm">
                                                                    {servicio.nombre_snapshot || servicio.nombre || 'Servicio sin nombre'}
                                                                </span>

                                                                {/* Cantidad */}
                                                                <span className="text-xs text-zinc-400 bg-zinc-700 px-2 py-0.5 rounded">
                                                                    x{cantidad}
                                                                </span>

                                                                {/* Personal asignado */}
                                                                {servicio.User ? (
                                                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-900/20 border border-blue-800/50 rounded text-xs">
                                                                        <User className="w-3 h-3 text-blue-400" />
                                                                        <span className="text-blue-300">
                                                                            {servicio.User.username || servicio.User.email}
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-xs text-zinc-500 px-2 py-1 bg-zinc-700/30 rounded">
                                                                        Sin asignar
                                                                    </span>
                                                                )}

                                                                {/* Estado de nómina compacto */}
                                                                {(() => {
                                                                    const infoNomina = obtenerInfoNomina(servicio);
                                                                    if (infoNomina && servicio.User) {
                                                                        return obtenerBadgeNomina(infoNomina);
                                                                    }
                                                                    return null;
                                                                })()}
                                                            </div>

                                                            {/* Botones de acción compactos */}
                                                            <div className="flex items-center gap-1">
                                                                {servicio.User ? (
                                                                    <>
                                                                        {/* Botón remover si aplica */}
                                                                        {(() => {
                                                                            const infoNomina = obtenerInfoNomina(servicio);
                                                                            const puedeRemover = !infoNomina || infoNomina.status === 'cancelado';
                                                                            if (puedeRemover) {
                                                                                return (
                                                                                    <button
                                                                                        onClick={() => handleRemover(servicio)}
                                                                                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors"
                                                                                        title="Remover asignación"
                                                                                    >
                                                                                        <XCircle className="w-4 h-4" />
                                                                                    </button>
                                                                                );
                                                                            }
                                                                            return null;
                                                                        })()}

                                                                        {/* Botón nómina si está visible la información financiera */}
                                                                        {mostrarInformacionFinanciera && (() => {
                                                                            const infoNomina = obtenerInfoNomina(servicio);
                                                                            if (infoNomina) {
                                                                                return (
                                                                                    <button
                                                                                        onClick={() => {/* TODO: Ver nómina */ }}
                                                                                        className="p-1.5 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-700/50 rounded transition-colors"
                                                                                        title="Ver nómina"
                                                                                    >
                                                                                        <FileText className="w-4 h-4" />
                                                                                    </button>
                                                                                );
                                                                            } else {
                                                                                return (
                                                                                    <button
                                                                                        onClick={() => handleAutorizarPago(servicio)}
                                                                                        className="p-1.5 text-green-400 hover:text-green-300 hover:bg-green-900/30 rounded transition-colors"
                                                                                        title="Crear nómina"
                                                                                    >
                                                                                        <DollarSign className="w-4 h-4" />
                                                                                    </button>
                                                                                );
                                                                            }
                                                                        })()}
                                                                    </>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleAsignar(servicio)}
                                                                        className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                                                                    >
                                                                        Asignar
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Información financiera compacta (condicional) */}
                                                        {mostrarInformacionFinanciera && (
                                                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-700/50">
                                                                <div className="flex items-center gap-4 text-xs text-zinc-400">
                                                                    <span>Costo: <strong className="text-zinc-300">${costo.toLocaleString()}</strong></span>
                                                                    <span>Total: <strong className="text-green-400">${total.toLocaleString()}</strong></span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modales */}
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

            <CrearNominaModal
                isOpen={modalNominaAbierto}
                onClose={() => {
                    setModalNominaAbierto(false);
                    setServicioSeleccionado(null);
                }}
                servicio={servicioSeleccionado}
                onConfirmar={handleConfirmarNomina}
            />
        </div>
    );
}
