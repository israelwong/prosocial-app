'use client';

import React from 'react';
import { Hash, DollarSign } from 'lucide-react';

interface ColumnHeaderProps {
    etapaNombre: string;
    totalEventos: number;
    totalPendienteCobrar: number;
    posicion: number;
}

const getEtapaColor = (posicion: number) => {
    const colors = [
        'border-l-red-500',      // 1
        'border-l-orange-500',   // 2
        'border-l-yellow-500',   // 3
        'border-l-blue-500',     // 4
        'border-l-purple-500',   // 5
        'border-l-green-500',    // 6
        'border-l-emerald-500',  // 7
        'border-l-teal-500',     // 8
    ];
    return colors[posicion - 1] || 'border-l-zinc-500';
};

export default function ColumnHeader({
    etapaNombre,
    totalEventos,
    totalPendienteCobrar,
    posicion
}: ColumnHeaderProps) {
    return (
        <div className={`
            bg-zinc-800 rounded-lg p-4 mb-3 border-l-4 ${getEtapaColor(posicion)}
        `}>
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-zinc-100 text-sm">
                    {etapaNombre}
                </h3>
                <div className="flex items-center gap-1 text-xs text-zinc-400">
                    <Hash className="w-3 h-3" />
                    <span>{posicion}</span>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Eventos:</span>
                    <span className="font-medium text-zinc-200">{totalEventos}</span>
                </div>

                {totalPendienteCobrar > 0 && (
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400 flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            Pendiente:
                        </span>
                        <span className="font-medium text-red-400">
                            {totalPendienteCobrar.toLocaleString('es-MX', {
                                style: 'currency',
                                currency: 'MXN',
                                minimumFractionDigits: 0,
                            })}
                        </span>
                    </div>
                )}

                {totalPendienteCobrar === 0 && totalEventos > 0 && (
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400 flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            Pendiente:
                        </span>
                        <span className="font-medium text-green-400">
                            $0
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
