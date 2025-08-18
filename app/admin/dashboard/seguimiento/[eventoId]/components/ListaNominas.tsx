'use client';

import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    Calendar,
    User,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    EyeOff,
    FileText,
    AlertCircle
} from 'lucide-react';

interface NominaData {
    id: string;
    concepto: string;
    descripcion: string | null;
    monto_bruto: number;
    deducciones: number;
    monto_neto: number;
    status: string;
    metodo_pago: string;
    fecha_asignacion: string;
    fecha_autorizacion: string | null;
    fecha_pago: string | null;
    User: {
        id: string;
        username: string | null;
        email: string | null;
    };
    AutorizadoPor: {
        id: string;
        username: string | null;
        email: string | null;
    } | null;
    PagadoPor: {
        id: string;
        username: string | null;
        email: string | null;
    } | null;
}

interface Props {
    nominas: NominaData[];
    onAutorizar?: (nominaId: string) => void;
    onMarcarPagado?: (nominaId: string) => void;
    onCancelar?: (nominaId: string) => void;
}

export default function ListaNominas({ nominas, onAutorizar, onMarcarPagado, onCancelar }: Props) {
    const [mostrarDetalles, setMostrarDetalles] = useState(false);
    const [nominaExpandida, setNominaExpandida] = useState<string | null>(null);

    const getStatusBadge = (status: string) => {
        const configs = {
            pendiente: {
                bg: 'bg-yellow-900/30',
                border: 'border-yellow-700',
                text: 'text-yellow-300',
                icon: Clock
            },
            autorizado: {
                bg: 'bg-blue-900/30',
                border: 'border-blue-700',
                text: 'text-blue-300',
                icon: CheckCircle
            },
            pagado: {
                bg: 'bg-green-900/30',
                border: 'border-green-700',
                text: 'text-green-300',
                icon: CheckCircle
            },
            cancelado: {
                bg: 'bg-red-900/30',
                border: 'border-red-700',
                text: 'text-red-300',
                icon: XCircle
            }
        };

        const config = configs[status as keyof typeof configs] || configs.pendiente;
        const Icon = config.icon;

        return (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bg} ${config.border} border`}>
                <Icon className="w-3 h-3" />
                <span className={`text-xs font-medium ${config.text} capitalize`}>
                    {status}
                </span>
            </div>
        );
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2
        });
    };

    const totalNominas = nominas.reduce((acc, nomina) => {
        acc.total += nomina.monto_neto;
        if (nomina.status === 'pendiente') acc.pendiente += nomina.monto_neto;
        if (nomina.status === 'autorizado') acc.autorizado += nomina.monto_neto;
        if (nomina.status === 'pagado') acc.pagado += nomina.monto_neto;
        return acc;
    }, { total: 0, pendiente: 0, autorizado: 0, pagado: 0 });

    if (nominas.length === 0) {
        return (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-zinc-300 mb-2">No hay nóminas registradas</h3>
                    <p className="text-zinc-500">
                        Cuando se creen nóminas para este evento, aparecerán aquí.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Resumen Financiero */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-zinc-200 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-400" />
                        Resumen de Nóminas
                    </h2>
                    <button
                        onClick={() => setMostrarDetalles(!mostrarDetalles)}
                        className="flex items-center gap-2 px-3 py-1 text-sm bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded transition-colors"
                    >
                        {mostrarDetalles ? (
                            <>
                                <EyeOff className="w-4 h-4" />
                                Ocultar detalles
                            </>
                        ) : (
                            <>
                                <Eye className="w-4 h-4" />
                                Ver detalles
                            </>
                        )}
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <span className="text-sm text-zinc-400 block">Total</span>
                        <span className="text-lg font-bold text-zinc-200">
                            {formatCurrency(totalNominas.total)}
                        </span>
                    </div>
                    <div className="text-center">
                        <span className="text-sm text-zinc-400 block">Programado</span>
                        <span className="text-lg font-bold text-yellow-400">
                            {formatCurrency(totalNominas.pendiente)}
                        </span>
                    </div>
                    <div className="text-center">
                        <span className="text-sm text-zinc-400 block">Autorizado</span>
                        <span className="text-lg font-bold text-blue-400">
                            {formatCurrency(totalNominas.autorizado)}
                        </span>
                    </div>
                    <div className="text-center">
                        <span className="text-sm text-zinc-400 block">Pagado</span>
                        <span className="text-lg font-bold text-green-400">
                            {formatCurrency(totalNominas.pagado)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Lista de Nóminas */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-zinc-200 mb-6 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Nóminas del Evento ({nominas.length})
                </h3>

                <div className="space-y-4">
                    {nominas.map((nomina) => (
                        <div
                            key={nomina.id}
                            className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:bg-zinc-800 transition-colors"
                        >
                            {/* Información Principal */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <User className="w-4 h-4 text-zinc-400" />
                                    <div>
                                        <h4 className="text-zinc-100 font-medium">
                                            {nomina.User.username || nomina.User.email}
                                        </h4>
                                        <p className="text-sm text-zinc-400 truncate max-w-md">
                                            {nomina.concepto}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-bold text-green-400">
                                        {formatCurrency(nomina.monto_neto)}
                                    </span>
                                    {getStatusBadge(nomina.status)}
                                </div>
                            </div>

                            {/* Detalles Expandibles */}
                            {mostrarDetalles && (
                                <div className="pt-3 border-t border-zinc-700 space-y-3">
                                    {/* Montos Detallados */}
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="text-zinc-400">Monto Bruto:</span>
                                            <span className="text-zinc-200 ml-2">
                                                {formatCurrency(nomina.monto_bruto)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-zinc-400">Deducciones:</span>
                                            <span className="text-zinc-200 ml-2">
                                                {formatCurrency(nomina.deducciones)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-zinc-400">Método:</span>
                                            <span className="text-zinc-200 ml-2 capitalize">
                                                {nomina.metodo_pago}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Fechas */}
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="text-zinc-400">Asignación:</span>
                                            <span className="text-zinc-200 ml-2">
                                                {formatDate(nomina.fecha_asignacion)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-zinc-400">Autorización:</span>
                                            <span className="text-zinc-200 ml-2">
                                                {formatDate(nomina.fecha_autorizacion)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-zinc-400">Pago:</span>
                                            <span className="text-zinc-200 ml-2">
                                                {formatDate(nomina.fecha_pago)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Descripción */}
                                    {nomina.descripcion && (
                                        <div className="text-sm">
                                            <span className="text-zinc-400">Descripción:</span>
                                            <p className="text-zinc-200 mt-1 whitespace-pre-line">
                                                {nomina.descripcion}
                                            </p>
                                        </div>
                                    )}

                                    {/* Acciones por Estado */}
                                    {(nomina.status === 'pendiente' || nomina.status === 'autorizado') && (
                                        <div className="flex items-center gap-2 pt-2 border-t border-zinc-700">
                                            {nomina.status === 'pendiente' && onAutorizar && (
                                                <button
                                                    onClick={() => onAutorizar(nomina.id)}
                                                    className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-600/80 hover:bg-blue-600 text-white rounded transition-colors"
                                                >
                                                    <CheckCircle className="w-3 h-3" />
                                                    Autorizar
                                                </button>
                                            )}
                                            {nomina.status === 'autorizado' && onMarcarPagado && (
                                                <button
                                                    onClick={() => onMarcarPagado(nomina.id)}
                                                    className="flex items-center gap-1 px-3 py-1 text-xs bg-green-600/80 hover:bg-green-600 text-white rounded transition-colors"
                                                >
                                                    <CheckCircle className="w-3 h-3" />
                                                    Marcar como Pagado
                                                </button>
                                            )}
                                            {(nomina.status === 'pendiente' || nomina.status === 'autorizado') && onCancelar && (
                                                <button
                                                    onClick={() => onCancelar(nomina.id)}
                                                    className="flex items-center gap-1 px-3 py-1 text-xs bg-red-600/80 hover:bg-red-600 text-white rounded transition-colors"
                                                >
                                                    <XCircle className="w-3 h-3" />
                                                    Cancelar
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
