'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, User, MapPin, DollarSign, GripVertical, Archive } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { EventoKanbanType } from '@/app/admin/_lib/actions/gestion/gestion.schemas';

interface EventCardProps {
    evento: EventoKanbanType;
    isDragging?: boolean;
    onArchive?: (eventoId: string) => void;
}

export default function EventCard({ evento, isDragging = false, onArchive }: EventCardProps) {
    const router = useRouter();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging,
    } = useSortable({
        id: evento.id,
        data: {
            type: 'evento',
            item: evento
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }; const handleClick = (e: React.MouseEvent) => {
        if (!isDragging && !isSortableDragging) {
            e.stopPropagation();
            router.push(`/admin/dashboard/seguimiento/${evento.id}`);
        }
    };

    const handleArchive = (e: React.MouseEvent) => {
        e.stopPropagation();

        const eventName = evento.nombre || 'Evento sin nombre';
        const clientName = evento.clienteNombre;

        const confirmArchive = window.confirm(
            `🗄️ Archivar Evento\n\n` +
            `Evento: ${eventName}\n` +
            `Cliente: ${clientName}\n\n` +
            `¿Confirmas que deseas archivar este evento?\n\n` +
            `• El evento se removerá del kanban\n` +
            `• Se mantendrá en el historial del sistema\n` +
            `• Esta acción se puede revertir desde el historial`
        );

        if (confirmArchive && onArchive) {
            onArchive(evento.id);
        }
    };

    const formatDate = (date: Date) => {
        const eventDate = new Date(date);
        const today = new Date();
        const diffTime = eventDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let timeStatus = '';
        let timeColor = '';

        if (diffDays > 0) {
            timeStatus = `en ${diffDays} días`;
            timeColor = 'text-green-400';
        } else if (diffDays === 0) {
            timeStatus = 'hoy';
            timeColor = 'text-yellow-400';
        } else {
            timeStatus = `hace ${Math.abs(diffDays)} días`;
            timeColor = 'text-red-400';
        }

        return {
            dayName: eventDate.toLocaleDateString('es-ES', { weekday: 'long' }),
            day: eventDate.getDate(),
            monthName: eventDate.toLocaleDateString('es-ES', { month: 'long' }),
            year: eventDate.getFullYear(),
            timeStatus,
            timeColor,
            shortFormat: eventDate.toLocaleDateString('es-ES', {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
            })
        };
    };

    const getPaymentStatus = () => {
        if (evento.totalPendiente <= 0) {
            return {
                text: 'Pagado',
                color: 'text-green-400',
                bgColor: 'bg-green-400/10'
            };
        } else {
            return {
                text: evento.totalPendiente.toLocaleString('es-MX', {
                    style: 'currency',
                    currency: 'MXN',
                    minimumFractionDigits: 0,
                }),
                color: 'text-red-400',
                bgColor: 'bg-red-400/10'
            };
        }
    };

    const paymentStatus = getPaymentStatus();
    const dateInfo = formatDate(evento.fecha_evento);

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className={`
                bg-zinc-800 rounded-lg p-3 cursor-pointer border border-zinc-700
                hover:border-zinc-600 hover:bg-zinc-750 transition-all duration-200
                ${isDragging || isSortableDragging ? 'opacity-50 rotate-2 shadow-lg' : ''}
            `}
            onClick={handleClick}
        >
            {/* Drag Handle */}
            <div
                {...listeners}
                className="flex items-center justify-between mb-2 cursor-grab active:cursor-grabbing"
            >
                <div className="flex items-center gap-2">
                    {evento.eventoTipo && (
                        <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full">
                            {evento.eventoTipo}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    {onArchive && (
                        <button
                            onClick={handleArchive}
                            className="p-1 hover:bg-zinc-700 rounded transition-colors text-zinc-400 hover:text-red-400"
                            title="Archivar evento"
                        >
                            <Archive className="w-3 h-3" />
                        </button>
                    )}
                    <GripVertical className="w-4 h-4 text-zinc-500" />
                </div>
            </div>

            {/* Event Name */}
            <h4 className="font-medium text-zinc-100 text-sm mb-2 line-clamp-2">
                {evento.nombre || 'Evento sin nombre'}
            </h4>

            {/* Event Details */}
            <div className="space-y-3 text-xs text-zinc-400">
                {/* Client */}
                <div className="flex items-center gap-2">
                    <User className="w-3 h-3" />
                    <span className="truncate">{evento.clienteNombre}</span>
                </div>

                {/* Date - Enhanced Display */}
                <div className="bg-zinc-700/50 rounded-lg p-3 border border-zinc-600">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400 font-medium text-xs uppercase tracking-wide">
                            Fecha del evento
                        </span>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-zinc-100 font-Bebas-Neue">
                                {dateInfo.day}
                            </span>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-zinc-200 capitalize">
                                    {dateInfo.monthName}
                                </span>
                                <span className="text-xs text-zinc-400">
                                    {dateInfo.year}
                                </span>
                            </div>
                        </div>
                        <div className="text-xs text-zinc-400 capitalize">
                            {dateInfo.dayName}
                        </div>
                        <div className={`text-xs font-medium ${dateInfo.timeColor}`}>
                            {dateInfo.timeStatus}
                        </div>
                    </div>
                </div>

                {/* Location */}
                {evento.sede && (
                    <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{evento.sede}</span>
                    </div>
                )}

                {/* Payment Status */}
                <div className={`
                    flex items-center gap-2 p-2 rounded-md ${paymentStatus.bgColor}
                `}>
                    <DollarSign className="w-3 h-3" />
                    <span className={`font-medium ${paymentStatus.color}`}>
                        {paymentStatus.text}
                    </span>
                </div>
            </div>
        </div>
    );
}
