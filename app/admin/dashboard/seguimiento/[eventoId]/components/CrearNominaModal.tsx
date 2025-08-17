'use client';

import React, { useState } from 'react';
import { XCircle, DollarSign, Calculator, CheckCircle, AlertCircle } from 'lucide-react';

interface ServicioData {
    id: string;
    nombre_snapshot: string;
    seccion_nombre_snapshot: string | null;
    categoria_nombre_snapshot: string | null;
    costo_snapshot: number;
    cantidad: number;
    User: {
        id: string;
        username: string | null;
        email: string | null;
    } | null;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    servicio: ServicioData | null;
    onConfirmar: (datosNomina: {
        concepto: string;
        descripcion?: string;
        monto_bruto: number;
        deducciones: number;
        monto_neto: number;
        metodo_pago: string;
    }) => void;
}

export default function CrearNominaModal({ isOpen, onClose, servicio, onConfirmar }: Props) {
    const [concepto, setConcepto] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [montoBruto, setMontoBruto] = useState(0);
    const [deducciones, setDeducciones] = useState(0);
    const [metodoPago, setMetodoPago] = useState('transferencia');
    const [loading, setLoading] = useState(false);

    // Calcular valores basados en el servicio
    React.useEffect(() => {
        if (servicio) {
            const costoTotal = (servicio.costo_snapshot || 0) * servicio.cantidad;
            setMontoBruto(costoTotal);
            // El concepto debe ser solo el nombre del servicio
            setConcepto(servicio.nombre_snapshot);
            // La descripción debe estar vacía por defecto
            setDescripcion('');
        }
    }, [servicio]);

    const montoNeto = montoBruto; // Sin deducciones por defecto

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!servicio || montoBruto <= 0) {
            alert('Datos incompletos');
            return;
        }

        setLoading(true);
        try {
            await onConfirmar({
                concepto,
                descripcion: descripcion || undefined,
                monto_bruto: montoBruto,
                deducciones: 0, // Sin deducciones
                monto_neto: montoNeto,
                metodo_pago: metodoPago
            });
            handleClose();
        } catch (error) {
            console.error('Error al crear nómina:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setConcepto('');
        setDescripcion('');
        setMontoBruto(0);
        setMetodoPago('transferencia');
        onClose();
    };

    if (!isOpen || !servicio) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-700">
                    <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-400" />
                        Crear Nómina
                    </h3>
                    <button
                        onClick={handleClose}
                        className="text-zinc-400 hover:text-zinc-200 transition-colors"
                        disabled={loading}
                    >
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Información del Servicio */}
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-zinc-200 mb-3">Información del Servicio</h4>
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="text-zinc-400">Servicio:</span>
                                <span className="text-zinc-200 ml-2">{servicio.nombre_snapshot}</span>
                            </div>
                            <div>
                                <span className="text-zinc-400">Personal:</span>
                                <span className="text-zinc-200 ml-2">
                                    {servicio.User?.username || servicio.User?.email || 'Sin asignar'}
                                </span>
                            </div>
                            <div>
                                <span className="text-zinc-400">Cantidad:</span>
                                <span className="text-zinc-200 ml-2">{servicio.cantidad}</span>
                            </div>
                            <div>
                                <span className="text-zinc-400">Costo unitario:</span>
                                <span className="text-zinc-200 ml-2">
                                    ${servicio.costo_snapshot?.toLocaleString('es-MX', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    }) || '0.00'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Concepto */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-200 mb-2">
                            Concepto *
                        </label>
                        <input
                            type="text"
                            value={concepto}
                            onChange={(e) => setConcepto(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-100 placeholder-zinc-400 focus:border-blue-500 focus:outline-none"
                            placeholder="Descripción del pago"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Descripción */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-200 mb-2">
                            Descripción
                        </label>
                        <textarea
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-100 placeholder-zinc-400 focus:border-blue-500 focus:outline-none resize-none"
                            placeholder="Detalles adicionales del pago"
                            disabled={loading}
                        />
                    </div>

                    {/* Montos */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-200 mb-2">
                                Monto a Pagar *
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-zinc-400">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={montoBruto}
                                    onChange={(e) => setMontoBruto(parseFloat(e.target.value) || 0)}
                                    className="w-full pl-8 pr-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-100 placeholder-zinc-400 focus:border-blue-500 focus:outline-none"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Monto Total a Pagar */}
                        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-200 font-medium flex items-center gap-2">
                                    <Calculator className="w-4 h-4" />
                                    Total a Pagar:
                                </span>
                                <span className="text-lg font-bold text-green-400">
                                    ${montoNeto.toLocaleString('es-MX', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Método de Pago */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-200 mb-2">
                            Método de Pago
                        </label>
                        <select
                            value={metodoPago}
                            onChange={(e) => setMetodoPago(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-100 focus:border-blue-500 focus:outline-none"
                            disabled={loading}
                        >
                            <option value="transferencia">Transferencia</option>
                            <option value="efectivo">Efectivo</option>
                            <option value="cheque">Cheque</option>
                            <option value="spei">SPEI</option>
                        </select>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-lg transition-colors"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading || montoBruto <= 0}
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <CheckCircle className="w-4 h-4" />
                            )}
                            {loading ? 'Creando...' : 'Crear Nómina'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
