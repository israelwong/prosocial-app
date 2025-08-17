'use client';

import React, { useState } from 'react';
import { User, UserPlus, XCircle, CheckCircle, Eye, EyeOff, DollarSign, FileText } from 'lucide-react';
import AsignarUsuarioModal from './AsignarUsuarioModal';
import CrearNominaModal from './CrearNominaModal';
import { asignarUsuarioAServicio, removerUsuarioDeServicio } from '@/app/admin/_lib/actions/seguimiento/servicios.actions';
import { crearNominaIndividual, cancelarPago } from '@/app/admin/_lib/actions/seguimiento/nomina.actions';

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
    const [modalNominaAbierto, setModalNominaAbierto] = useState(false);
    const [servicioSeleccionado, setServicioSeleccionado] = useState<any | null>(null);
    const [mostrarInformacionFinanciera, setMostrarInformacionFinanciera] = useState(false);

    // Obtener la cotización aprobada y sus servicios
    const cotizacionAprobada = evento?.Cotizacion?.[0];
    const servicios = cotizacionAprobada?.Servicio || [];

    // Calcular totales financieros
    const totales = servicios.reduce((acc: any, servicio: any) => {
        const costo = servicio.costo_snapshot || servicio.costo || 0;
        const gasto = servicio.gasto_snapshot || servicio.gasto || 0;
        const utilidad = servicio.utilidad_snapshot || servicio.utilidad || 0;
        const cantidad = servicio.cantidad || 1;

        acc.costoTotal += costo * cantidad;
        acc.gastoTotal += gasto * cantidad;
        acc.utilidadTotal += utilidad * cantidad;

        return acc;
    }, { costoTotal: 0, gastoTotal: 0, utilidadTotal: 0 });

    // Calcular total a pagar (para retrocompatibilidad)
    const totalAPagar = totales.costoTotal;

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
        const infoNomina = obtenerInfoNomina(servicio);

        // Si hay una nómina pendiente, preguntar si quiere cancelar el pago también
        if (infoNomina && infoNomina.status === 'pendiente') {
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
                    alert('Pago cancelado y usuario removido exitosamente');
                } catch (error) {
                    console.error('Error al cancelar pago y remover usuario:', error);
                    alert('Error: ' + (error as Error).message);
                }
            }
        } else {
            // Si no hay nómina o está cancelada, solo remover usuario
            const confirmar = confirm('¿Estás seguro de que deseas remover a este usuario del servicio?');

            if (confirmar) {
                try {
                    await removerUsuarioDeServicio(servicio.id, evento.id);
                    alert('Usuario removido exitosamente');
                } catch (error) {
                    console.error('Error al remover usuario:', error);
                    alert('Error al remover usuario: ' + (error as Error).message);
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
            alert('Nómina creada exitosamente');
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
                alert('Pago cancelado exitosamente');
            } catch (error) {
                console.error('Error al cancelar pago:', error);
                alert('Error al cancelar pago: ' + (error as Error).message);
            }
        }
    };

    // Función para obtener información de la nómina de un servicio
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

    // Función para obtener el badge de estado de la nómina
    const obtenerBadgeNomina = (infoNomina: any) => {
        if (!infoNomina) return null;

        const statusConfig = {
            pendiente: {
                bg: 'bg-yellow-900/30',
                border: 'border-yellow-700',
                text: 'text-yellow-300',
                label: 'Pendiente'
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
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bg} ${config.border} border`}>
                <span className={`text-xs font-medium ${config.text}`}>
                    {config.label}
                </span>
            </div>
        );
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
            {/* Cabecera con Información Financiera */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                {/* Línea 1: Título | Botón toggle */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-zinc-200">Servicios Asociados</h2>
                    <button
                        onClick={() => setMostrarInformacionFinanciera(!mostrarInformacionFinanciera)}
                        className="flex items-center gap-2 px-3 py-1 text-sm bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded transition-colors"
                        title={mostrarInformacionFinanciera ? "Ocultar información financiera" : "Mostrar información financiera"}
                    >
                        {mostrarInformacionFinanciera ? (
                            <>
                                <EyeOff className="w-4 h-4" />
                                Ocultar
                            </>
                        ) : (
                            <>
                                <Eye className="w-4 h-4" />
                                Mostrar
                            </>
                        )}
                    </button>
                </div>

                {/* Línea 2: Gastos, costos, utilidad */}
                {mostrarInformacionFinanciera && (
                    <div className="grid grid-cols-3 gap-6">
                        <div className="text-center">
                            <span className="text-sm text-zinc-400 block">Gastos</span>
                            <span className="text-lg font-bold text-red-400">
                                ${totales.gastoTotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="text-center">
                            <span className="text-sm text-zinc-400 block">Costos</span>
                            <span className="text-lg font-bold text-blue-400">
                                ${totales.costoTotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="text-center">
                            <span className="text-sm text-zinc-400 block">Utilidad</span>
                            <span className="text-lg font-bold text-green-400">
                                ${totales.utilidadTotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                )}
            </div>            {/* Servicios Agrupados */}
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
                                            const gasto = servicio.gasto_snapshot || servicio.gasto || 0;
                                            const cantidad = servicio.cantidad || 1;
                                            const total = costo * cantidad;

                                            return (
                                                <div key={servicio.id} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:bg-zinc-800 transition-colors">
                                                    {/* Línea 1: Nombre del servicio | Cantidad */}
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h5 className="text-zinc-100 font-medium">
                                                            {servicio.nombre_snapshot || servicio.nombre || 'Servicio sin nombre'}
                                                        </h5>
                                                        <span className="text-sm text-zinc-300 bg-zinc-700 px-2 py-1 rounded">
                                                            x{cantidad}
                                                        </span>
                                                    </div>

                                                    {/* Línea 2: Personal | Botón asignar | Botón pagar (si usuario asignado) */}
                                                    <div className="flex items-center justify-between mb-3">
                                                        {/* Personal asignado */}
                                                        <div className="flex items-center gap-2 flex-1">
                                                            <span className="text-sm text-zinc-400">Personal:</span>
                                                            {servicio.User ? (
                                                                <div className="flex items-center gap-2 px-3 py-1 bg-blue-900/30 border border-blue-700 rounded-full">
                                                                    <User className="w-4 h-4 text-blue-400" />
                                                                    <span className="text-sm text-blue-300">
                                                                        {servicio.User.username || servicio.User.email}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-sm text-zinc-500 px-3 py-1 bg-zinc-700/50 rounded-full">
                                                                    Sin asignar
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Botones */}
                                                        <div className="flex items-center gap-2">
                                                            {servicio.User ? (
                                                                <>
                                                                    {/* Solo mostrar botón remover si no existe nómina o si la nómina está cancelada */}
                                                                    {(() => {
                                                                        const infoNomina = obtenerInfoNomina(servicio);
                                                                        // Solo mostrar botón remover si no hay nómina o está cancelada
                                                                        const puedeRemover = !infoNomina || infoNomina.status === 'cancelado';

                                                                        if (puedeRemover) {
                                                                            return (
                                                                                <button
                                                                                    onClick={() => handleRemover(servicio)}
                                                                                    className="flex items-center gap-1 px-3 py-1 text-xs bg-red-600/80 hover:bg-red-600 text-white rounded transition-colors"
                                                                                    title="Remover asignación"
                                                                                >
                                                                                    <XCircle className="w-3 h-3" />
                                                                                    Remover
                                                                                </button>
                                                                            );
                                                                        }
                                                                        return null;
                                                                    })()}

                                                                    {/* Mostrar solo badge de estado si existe nómina, sin botones */}
                                                                    {(() => {
                                                                        const infoNomina = obtenerInfoNomina(servicio);

                                                                        if (infoNomina) {
                                                                            return (
                                                                                <div className="flex items-center gap-2">
                                                                                    {obtenerBadgeNomina(infoNomina)}
                                                                                </div>
                                                                            );
                                                                        }
                                                                        return null;
                                                                    })()}
                                                                </>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleAsignar(servicio)}
                                                                    className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                                                                >
                                                                    <UserPlus className="w-3 h-3" />
                                                                    Asignar
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Línea 3: Costo, cantidad, total + estado nómina (condicional) */}
                                                    {mostrarInformacionFinanciera && (
                                                        <div className="flex items-center justify-between pt-2 border-t border-zinc-700">
                                                            <div className="flex items-center gap-4 text-sm text-zinc-300">
                                                                <span>
                                                                    <strong className="text-zinc-200">Costo:</strong> ${costo.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                </span>
                                                                <span>
                                                                    <strong className="text-zinc-200">Cant.:</strong> {cantidad}
                                                                </span>
                                                                <span className="font-medium text-green-400">
                                                                    <strong>Total:</strong> ${total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                </span>
                                                            </div>

                                                            {/* Mostrar estado de nómina o botón crear nómina */}
                                                            {(() => {
                                                                if (!servicio.User) return null;

                                                                const infoNomina = obtenerInfoNomina(servicio);

                                                                if (infoNomina) {
                                                                    // Si existe nómina, mostrar solo botón ver (sin monto duplicado)
                                                                    return (
                                                                        <div className="flex items-center gap-2">
                                                                            {/* Botón Ver para todos los estados */}
                                                                            <button
                                                                                onClick={() => {/* TODO: Implementar ver nómina */ }}
                                                                                className="flex items-center gap-1 px-3 py-1 text-xs bg-zinc-600 hover:bg-zinc-500 text-white rounded transition-colors"
                                                                                title="Ver nómina"
                                                                            >
                                                                                <FileText className="w-3 h-3" />
                                                                                Ver
                                                                            </button>
                                                                        </div>
                                                                    );
                                                                } else {
                                                                    // Si no existe nómina, mostrar botón crear
                                                                    return (
                                                                        <button
                                                                            onClick={() => handleAutorizarPago(servicio)}
                                                                            className="flex items-center gap-1 px-3 py-1 text-xs bg-green-600/80 hover:bg-green-600 text-white rounded transition-colors"
                                                                            title="Crear nómina de pago"
                                                                        >
                                                                            <DollarSign className="w-3 h-3" />
                                                                            Pagar
                                                                        </button>
                                                                    );
                                                                }
                                                            })()}
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

            {/* Modal de Crear Nómina */}
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
