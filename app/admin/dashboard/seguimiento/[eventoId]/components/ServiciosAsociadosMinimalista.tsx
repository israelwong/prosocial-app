'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, UserPlus, XCircle, CheckCircle, Eye, EyeOff, DollarSign, FileText, ChevronDown, X, Edit } from 'lucide-react';
import AsignarUsuarioModal from './AsignarUsuarioModal';
import CrearNominaModal from './CrearNominaModal';
import { asignarUsuarioAServicio, removerUsuarioDeServicio } from '@/app/admin/_lib/actions/seguimiento/servicios.actions';
import { crearNominaIndividual, cancelarPago, eliminarNomina } from '@/app/admin/_lib/actions/seguimiento/nomina.actions';
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

export default function ServiciosAsociadosMinimalista({ evento, usuarios }: Props) {
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modalNominaAbierto, setModalNominaAbierto] = useState(false);
    const [servicioSeleccionado, setServicioSeleccionado] = useState<any | null>(null);
    const [mostrarInformacionFinanciera, setMostrarInformacionFinanciera] = useState(false);
    const [serviciosExpandidos, setServiciosExpandidos] = useState<{ [key: string]: boolean }>({});

    // Obtener la cotización aprobada y sus servicios
    const cotizacionAprobada = evento?.Cotizacion?.[0];
    const servicios = cotizacionAprobada?.Servicio || [];

    // Lógica de agrupamiento (copiada exactamente del archivo original)
    const serviciosAgrupados: ServiciosAgrupados = {};

    servicios.forEach((cotizacionServicio: any, index: number) => {
        // Usar primero los snapshots, luego los datos relacionados como fallback (igual que en cotización pública)
        const nombreServicio = cotizacionServicio.nombre_snapshot && cotizacionServicio.nombre_snapshot !== 'Servicio migrado'
            ? cotizacionServicio.nombre_snapshot
            : cotizacionServicio.Servicio?.nombre || 'Servicio sin nombre';

        // Obtener categoría y sección usando la misma lógica exitosa
        const categoriaNombre = cotizacionServicio.categoria_nombre_snapshot ||
            cotizacionServicio.Servicio?.ServicioCategoria?.nombre ||
            cotizacionServicio.ServicioCategoria?.nombre ||
            'Sin categoría';

        const seccionNombre = cotizacionServicio.seccion_nombre_snapshot ||
            cotizacionServicio.Servicio?.ServicioCategoria?.seccionCategoria?.Seccion?.nombre ||
            cotizacionServicio.ServicioCategoria?.seccionCategoria?.Seccion?.nombre ||
            'Servicios Generales';

        // Obtener posiciones usando relaciones correctas
        const seccionPosicion = cotizacionServicio.Servicio?.ServicioCategoria?.seccionCategoria?.Seccion?.posicion ||
            cotizacionServicio.ServicioCategoria?.seccionCategoria?.Seccion?.posicion || 0;

        const categoriaPosicion = cotizacionServicio.Servicio?.ServicioCategoria?.posicion ||
            cotizacionServicio.ServicioCategoria?.posicion || 0;

        // Inicializar sección si no existe
        if (!serviciosAgrupados[seccionNombre]) {
            serviciosAgrupados[seccionNombre] = {
                posicion: seccionPosicion,
                categorias: {}
            };
        }

        // Inicializar categoría si no existe
        if (!serviciosAgrupados[seccionNombre].categorias[categoriaNombre]) {
            serviciosAgrupados[seccionNombre].categorias[categoriaNombre] = {
                posicion: categoriaPosicion,
                servicios: []
            };
        }

        // Agregar el servicio a la categoría correspondiente CON SU POSICIÓN ORIGINAL
        serviciosAgrupados[seccionNombre].categorias[categoriaNombre].servicios.push({
            ...cotizacionServicio,
            posicion: cotizacionServicio.posicion || index // Mantener posición original o usar índice como fallback
        });
    });

    // Ordenar secciones por posición (igual que el original)
    const seccionesOrdenadas = Object.entries(serviciosAgrupados)
        .sort(([, a], [, b]) => (a.posicion || 0) - (b.posicion || 0));

    // Función para manejar el toggle de información financiera
    const handleToggleInformacionFinanciera = () => {
        const nuevoEstado = !mostrarInformacionFinanciera;
        setMostrarInformacionFinanciera(nuevoEstado);

        if (nuevoEstado) {
            // Si se activa ver costos, expandir todos los servicios
            const todosExpandidos: { [key: string]: boolean } = {};
            servicios.forEach((servicio: any) => {
                todosExpandidos[servicio.id] = true;
            });
            setServiciosExpandidos(todosExpandidos);
        } else {
            // Si se desactiva ver costos, contraer todos los servicios
            setServiciosExpandidos({});
        }
    };

    // Handlers de eventos
    const handleAsignar = (servicio: any) => {
        setServicioSeleccionado(servicio);
        setModalAbierto(true);
    };

    const handleRemover = async (servicio: any) => {
        const infoNomina = obtenerInfoNomina(servicio);

        // Si hay una nómina pendiente, preguntar si quiere cancelar el pago también
        if (infoNomina && infoNomina.status === NOMINA_STATUS.PENDIENTE) {
            const confirmar = confirm(
                'Este usuario tiene un pago pendiente programado.\n\n' +
                '¿Deseas cancelar el pago y remover al usuario del servicio?'
            );

            if (confirmar) {
                try {
                    // Primero cancelar el pago
                    await cancelarPago(infoNomina.id, evento.id);
                    // Luego remover al usuario
                    await removerUsuarioDeServicio(servicio.id, evento.id);
                } catch (error) {
                    console.error('Error al cancelar pago y remover usuario:', error);
                    alert('Error: ' + (error as Error).message);
                }
            }
        } else {
            // Si no hay nómina o está cancelada, solo remover usuario
            const puedeRemover = !infoNomina || infoNomina.status === NOMINA_STATUS.CANCELADO;

            if (!puedeRemover) {
                alert('No se puede remover la asignación. El servicio tiene una nómina activa.');
                return;
            }

            if (confirm(`¿Estás seguro de que deseas remover la asignación de ${servicio.User?.username || servicio.User?.email}?`)) {
                try {
                    await removerUsuarioDeServicio(servicio.id, evento.id);
                } catch (error) {
                    console.error('Error al remover usuario:', error);
                    alert('Error al remover usuario: ' + (error as Error).message);
                }
            }
        }
    };

    const handleConfirmarAsignacion = async (usuarioId: string) => {
        if (!servicioSeleccionado) return;

        try {
            await asignarUsuarioAServicio(servicioSeleccionado.id, usuarioId, evento.id);
            setModalAbierto(false);
            setServicioSeleccionado(null);
        } catch (error) {
            console.error('Error al asignar usuario:', error);
            alert('Error al asignar usuario: ' + (error as Error).message);
        }
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
            await crearNominaIndividual(
                servicioSeleccionado.id,
                evento.id,
                datosNomina
            );

            setModalNominaAbierto(false);
            setServicioSeleccionado(null);
        } catch (error) {
            console.error('Error al crear nómina:', error);
            alert('Error al crear nómina: ' + (error as Error).message);
        }
    };

    const handleAutorizarPago = async (servicio: any) => {
        setServicioSeleccionado(servicio);
        setModalNominaAbierto(true);
    };

    const handleCrearNomina = async (servicio: any) => {
        try {
            const infoNomina = obtenerInfoNomina(servicio);
            if (!infoNomina) return;

            const datosNomina = {
                concepto: `Pago por servicio: ${servicio.nombre_snapshot}`,
                descripcion: `Servicio para evento ${evento.id}`,
                monto_bruto: infoNomina.monto_neto,
                deducciones: 0,
                monto_neto: infoNomina.monto_neto,
                metodo_pago: 'transferencia'
            };

            await crearNominaIndividual(
                servicio.id,
                evento.id,
                datosNomina
            );
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

    const handleEliminarPagoProgramado = async (servicio: any) => {
        const infoNomina = obtenerInfoNomina(servicio);
        if (!infoNomina) return;

        if (confirm('¿Estás seguro de que deseas eliminar este pago programado?')) {
            try {
                await eliminarNomina(infoNomina.id);
                // Recargar la página para actualizar la UI
                window.location.reload();
            } catch (error) {
                console.error('Error al eliminar pago programado:', error);
                alert('Error al eliminar pago programado: ' + (error as Error).message);
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
                {infoNomina.monto_neto && (
                    <span className="ml-1">
                        ${infoNomina.monto_neto.toLocaleString()}
                    </span>
                )}
            </div>
        );
    };

    const toggleServicioExpandido = (servicioId: string) => {
        setServiciosExpandidos(prev => ({
            ...prev,
            [servicioId]: !prev[servicioId]
        }));
    };

    if (servicios.length === 0) {
        return (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <div className="text-center text-zinc-400">
                    <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No hay servicios en la cotización aprobada</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-zinc-400" />
                    <h2 className="text-lg font-semibold text-zinc-100">Servicios Asociados</h2>
                </div>

                <div className="flex items-center gap-2">
                    {/* Botón editar evento */}
                    <Link
                        href={`/admin/dashboard/eventos/${evento.id}/cotizacion/${cotizacionAprobada?.id}`}
                        className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-md transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                        Editar
                    </Link>

                    {/* Botón ver costos */}
                    <button
                        onClick={handleToggleInformacionFinanciera}
                        className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md transition-colors"
                        title={mostrarInformacionFinanciera ? 'Ocultar costos' : 'Ver costos'}
                    >
                        {mostrarInformacionFinanciera ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Contenido */}
            <div className="p-4">
                <div className="space-y-4">
                    {seccionesOrdenadas.map(([seccion, seccionData]) => {
                        return (
                            <div key={seccion} className="space-y-3">
                                <h3 className="text-base font-semibold text-zinc-200 border-b border-zinc-700 pb-2">
                                    {seccion}
                                </h3>

                                {/* Categorías ordenadas exactamente igual que el original */}
                                <div className="space-y-2">
                                    {Object.entries(seccionData.categorias)
                                        .sort(([, a], [, b]) => (a.posicion || 0) - (b.posicion || 0))
                                        .map(([categoria, categoriaData]) => (
                                            <div key={categoria} className="space-y-2">
                                                <h4 className="text-sm font-medium text-zinc-300 pl-3">
                                                    {categoria}
                                                </h4>

                                                {/* Servicios en diseño minimalista - SIN ordenamiento adicional como el original */}
                                                <div className="space-y-1">
                                                    {categoriaData.servicios.map((servicio: any) => {
                                                        const cantidad = servicio.cantidad || 1;
                                                        const costo = servicio.costo_snapshot || 0;
                                                        const total = costo * cantidad;
                                                        const isExpanded = serviciosExpandidos[servicio.id] || mostrarInformacionFinanciera;

                                                        return (
                                                            <div key={servicio.id} className="bg-zinc-800/30 border border-zinc-700/50 rounded-md overflow-hidden">
                                                                {/* Línea 1 visible - sin paddings laterales */}
                                                                <div
                                                                    className="flex items-center justify-between py-2 cursor-pointer hover:bg-zinc-800/50"
                                                                    onClick={() => toggleServicioExpandido(servicio.id)}
                                                                >
                                                                    {/* Nombre del servicio */}
                                                                    <div className="flex-1 pl-3">
                                                                        <span className="font-medium text-zinc-200 text-sm">
                                                                            {servicio.nombre_snapshot || servicio.nombre || 'Servicio sin nombre'}
                                                                        </span>
                                                                    </div>

                                                                    {/* Asignación de usuario */}
                                                                    <div className="flex items-center">
                                                                        {servicio.User ? (
                                                                            <div className="flex items-center gap-1">
                                                                                <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-900/20 border border-blue-800/50 rounded text-xs">
                                                                                    <User className="w-3 h-3 text-blue-400" />
                                                                                    <span className="text-blue-300">
                                                                                        {servicio.User.username || servicio.User.email}
                                                                                    </span>
                                                                                </div>
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation()
                                                                                        handleRemover(servicio)
                                                                                    }}
                                                                                    className="p-1 text-red-400 hover:text-red-300 rounded transition-colors"
                                                                                >
                                                                                    <X className="h-3 w-3" />
                                                                                </button>
                                                                            </div>
                                                                        ) : (
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation()
                                                                                    handleAsignar(servicio)
                                                                                }}
                                                                                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                                                                            >
                                                                                Asignar
                                                                            </button>
                                                                        )}
                                                                    </div>

                                                                    {/* Separador visual */}
                                                                    <div className="mx-3 text-zinc-500">|</div>

                                                                    {/* Cantidad */}
                                                                    <div className="text-xs text-zinc-400 pr-2">
                                                                        {cantidad}
                                                                    </div>

                                                                    {/* Indicador de expansión */}
                                                                    <div className="pr-3">
                                                                        <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                                    </div>
                                                                </div>

                                                                {/* Línea 2 oculta - información de costos y acciones */}
                                                                {isExpanded && (
                                                                    <div className="px-3 py-2 bg-zinc-900/50 border-t border-zinc-700/50 flex items-center justify-between text-xs">
                                                                        <div className="flex items-center space-x-4">
                                                                            <span className="text-zinc-400">
                                                                                Costo: <span className="text-zinc-200 font-medium">${costo.toLocaleString()}</span>
                                                                            </span>
                                                                            <span className="text-zinc-400">
                                                                                Total: <span className="text-zinc-200 font-medium">${total.toLocaleString()}</span>
                                                                            </span>
                                                                        </div>

                                                                        <div className="flex items-center space-x-2">
                                                                            {/* Estado de nómina */}
                                                                            {(() => {
                                                                                const infoNomina = obtenerInfoNomina(servicio);
                                                                                if (infoNomina && servicio.User) {
                                                                                    return obtenerBadgeNomina(infoNomina);
                                                                                }
                                                                                return null;
                                                                            })()}

                                                                            {/* Botones de acciones */}
                                                                            {servicio.User && (() => {
                                                                                const infoNomina = obtenerInfoNomina(servicio);
                                                                                if (infoNomina) {
                                                                                    const { status } = infoNomina;

                                                                                    // Si está programado (pendiente), mostrar botón para eliminar y volver al estado inicial
                                                                                    if (status === 'pendiente') {
                                                                                        return (
                                                                                            <button
                                                                                                onClick={() => handleEliminarPagoProgramado(servicio)}
                                                                                                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                                                                                            >
                                                                                                Cancelar
                                                                                            </button>
                                                                                        );
                                                                                    }

                                                                                    // Si está autorizado, mostrar botón cancelar (cambia status a cancelado)
                                                                                    if (status === 'autorizado') {
                                                                                        return (
                                                                                            <button
                                                                                                onClick={() => handleCancelarPago(servicio)}
                                                                                                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                                                                                            >
                                                                                                Cancelar
                                                                                            </button>
                                                                                        );
                                                                                    }

                                                                                    // Si ya está pagado o cancelado, no mostrar ningún botón
                                                                                    if (status === 'pagado' || status === 'cancelado') {
                                                                                        return null;
                                                                                    }
                                                                                } else {
                                                                                    // No hay nómina, mostrar botón para crear
                                                                                    return (
                                                                                        <button
                                                                                            onClick={() => handleAutorizarPago(servicio)}
                                                                                            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                                                                                        >
                                                                                            Pagar
                                                                                        </button>
                                                                                    );
                                                                                }
                                                                                return null;
                                                                            })()}
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
