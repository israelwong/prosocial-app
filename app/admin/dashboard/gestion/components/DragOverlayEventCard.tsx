'use client';

import React from 'react';
import { Calendar, User, MapPin, DollarSign } from 'lucide-react';
import { EventoKanbanType } from '@/app/admin/_lib/actions/gestion/gestion.schemas';

interface DragOverlayEventCardProps {
    evento: EventoKanbanType;
}

export default function DragOverlayEventCard({ evento }: DragOverlayEventCardProps) {
    const formatearFecha = (fecha: string | Date) => {
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatearMonto = (monto: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0
        }).format(monto);
    };

    const getEstadoColor = () => {
        // Como no tenemos estadoEvento en el schema, usaremos un color por defecto
        return 'bg-blue-100 text-blue-800 border-blue-200';
    };

    return (
        <div className="w-72 bg-white border border-gray-200 rounded-lg shadow-lg opacity-95 transform rotate-2 z-50">
            <div className="p-4">
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                        {evento.nombre || 'Evento sin nombre'}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getEstadoColor()}`}>
                        En Movimiento
                    </span>
                </div>

                {/* Información del cliente */}
                <div className="flex items-center text-gray-600 text-sm mb-2">
                    <User size={14} className="mr-1" />
                    <span className="truncate">{evento.clienteNombre || 'Cliente no especificado'}</span>
                </div>

                {/* Fecha del evento */}
                <div className="flex items-center text-gray-600 text-sm mb-2">
                    <Calendar size={14} className="mr-1" />
                    <span>{formatearFecha(evento.fecha_evento)}</span>
                </div>

                {/* Locación */}
                {evento.sede && (
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                        <MapPin size={14} className="mr-1" />
                        <span className="truncate">{evento.sede}</span>
                    </div>
                )}

                {/* Información financiera */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Precio Cotización:</span>
                        <span className="font-semibold text-gray-900">
                            {evento.cotizacionPrecio ? formatearMonto(evento.cotizacionPrecio) : 'N/A'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-1">
                        <span className="text-gray-600">Pagado:</span>
                        <span className="font-semibold text-green-600">
                            {formatearMonto(evento.totalPagado)}
                        </span>
                    </div>
                    {evento.totalPendiente > 0 && (
                        <div className="flex justify-between items-center text-sm mt-1">
                            <span className="text-red-600">Pendiente:</span>
                            <span className="font-semibold text-red-600">
                                {formatearMonto(evento.totalPendiente)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Etapa actual */}
                {evento.etapaNombre && (
                    <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                            {evento.etapaNombre}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
