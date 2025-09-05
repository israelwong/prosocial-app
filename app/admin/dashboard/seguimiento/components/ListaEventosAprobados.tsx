'use client'
import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { CircleDollarSign, Calendar, CircleUserRound, Search } from 'lucide-react'
import { toast } from 'sonner'
import { type SeguimientoEtapas, type EventoSeguimiento } from '@/app/admin/_lib/actions/seguimiento'
import { formatearFecha, calcularDiasRestantes, compararFechas, crearFechaLocal } from '@/app/admin/_lib/utils/fechas'
import { actualizarEtapaEvento } from '@/app/admin/_lib/actions/seguimiento/seguimiento.actions'

// Drag and Drop imports
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
    useDroppable,
    useDraggable
} from '@dnd-kit/core'

interface Props {
    eventosPorEtapaIniciales: SeguimientoEtapas;
}

export default function ListaEventosAprobados({ eventosPorEtapaIniciales }: Props) {
    const router = useRouter()
    const [filtro, setFiltro] = useState('')
    const [filtroBalance, setFiltroBalance] = useState<'todos' | 'pagados' | 'pendientes'>('todos')

    // Estado para drag and drop
    const [eventosPorEtapa, setEventosPorEtapa] = useState<SeguimientoEtapas>(eventosPorEtapaIniciales)
    const [activeId, setActiveId] = useState<string | null>(null)
    const [activeEvento, setActiveEvento] = useState<EventoSeguimiento | null>(null)

    // Configurar sensores para drag and drop
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3,
            },
        })
    )

    // Convertir datos agrupados a lista plana para filtros
    const todosLosEventos = useMemo(() => {
        const eventos: EventoSeguimiento[] = []
        Object.values(eventosPorEtapa).forEach(eventosEtapa => {
            eventos.push(...eventosEtapa)
        })
        return eventos.sort((a, b) => compararFechas(a.fecha_evento, b.fecha_evento))
    }, [eventosPorEtapa])

    // Aplicar filtros
    const eventosFiltrados = useMemo(() => {
        return todosLosEventos.filter(evento => {
            // Filtro de texto
            const coincideTexto = !filtro || (
                evento.nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
                evento.clienteNombre.toLowerCase().includes(filtro.toLowerCase()) ||
                evento.tipoEventoNombre.toLowerCase().includes(filtro.toLowerCase()) ||
                formatearFecha(evento.fecha_evento, {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                }).toLowerCase().includes(filtro.toLowerCase())
            )

            // Filtro de balance
            const coincideBalance =
                filtroBalance === 'todos' ||
                (filtroBalance === 'pagados' && evento.balance === 0) ||
                (filtroBalance === 'pendientes' && evento.balance > 0)

            return coincideTexto && coincideBalance
        })
    }, [todosLosEventos, filtro, filtroBalance])

    // Reagrupar eventos filtrados por etapa
    const eventosFiltradosPorEtapa = useMemo(() => {
        const agrupados: SeguimientoEtapas = {}

        // Inicializar con etapas vacías
        Object.keys(eventosPorEtapa).forEach(etapa => {
            agrupados[etapa] = []
        })

        // Reagrupar eventos filtrados
        eventosFiltrados.forEach(evento => {
            if (agrupados[evento.etapaNombre]) {
                agrupados[evento.etapaNombre].push(evento)
            }
        })

        return agrupados
    }, [eventosFiltrados, eventosPorEtapa])

    const handleClickEvento = (eventoId: string) => {
        router.push(`/admin/dashboard/seguimiento/${eventoId}`)
    }

    const formatearPrecio = (precio: number) => {
        return precio.toLocaleString('es-MX', {
            style: 'currency',
            currency: 'MXN'
        })
    }

    const obtenerColorBalance = (evento: EventoSeguimiento) => {
        if (evento.balance === 0) return 'text-green-500'
        if (evento.balance > 0) return 'text-red-500'
        return 'text-orange-500' // sobregiro
    }

    const obtenerDiasTexto = (dias: number) => {
        if (dias < 0) return `${Math.abs(dias)} días pasados`
        if (dias === 0) return 'Hoy'
        if (dias === 1) return 'Mañana'
        return `En ${dias} días`
    }

    // Funciones para drag and drop
    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        setActiveId(active.id as string)

        // Encontrar el evento que se está arrastrando
        const evento = todosLosEventos.find(e => e.id === active.id)
        setActiveEvento(evento || null)
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        if (!over) {
            setActiveId(null)
            setActiveEvento(null)
            return
        }

        const eventoId = active.id as string
        const overId = over.id as string

        // Extraer el ID real del evento del ID prefijado
        const realEventoId = eventoId.startsWith('evento-')
            ? eventoId.replace('evento-', '')
            : eventoId

        // Extraer el ID real de la etapa del ID prefijado
        const nuevaEtapaId = overId.startsWith('droppable-')
            ? overId.replace('droppable-', '')
            : overId        // Encontrar evento y nueva etapa
        const evento = todosLosEventos.find(e => e.id === realEventoId)
        if (!evento) {
            setActiveId(null)
            setActiveEvento(null)
            return
        }

        // Validar que nuevaEtapaId no esté vacío
        if (!nuevaEtapaId || nuevaEtapaId.trim() === '') {
            setActiveId(null)
            setActiveEvento(null)
            return
        }

        // Si no cambió de etapa, no hacer nada
        if (evento.eventoEtapaId === nuevaEtapaId) {
            setActiveId(null)
            setActiveEvento(null)
            return
        }

        try {
            // Actualizar el estado local inmediatamente
            setEventosPorEtapa(prev => {
                const nuevoEstado = { ...prev }

                // Remover evento de la etapa anterior
                Object.keys(nuevoEstado).forEach(etapaNombre => {
                    nuevoEstado[etapaNombre] = nuevoEstado[etapaNombre].filter(e => e.id !== realEventoId)
                })

                // Encontrar el nombre de la nueva etapa usando el mapeo de IDs
                const nuevaEtapaNombre = Object.keys(etapaIds).find(etapaNombre =>
                    etapaIds[etapaNombre] === nuevaEtapaId
                )

                console.log('🔍 Buscando nueva etapa:', {
                    nuevaEtapaId,
                    etapaIds,
                    nuevaEtapaNombre,
                    etapasDisponibles: Object.keys(nuevoEstado)
                })

                if (nuevaEtapaNombre && nuevoEstado[nuevaEtapaNombre]) {
                    // Actualizar el evento con la nueva etapa
                    const eventoActualizado = {
                        ...evento,
                        eventoEtapaId: nuevaEtapaId,
                        etapaNombre: nuevaEtapaNombre
                    }
                    nuevoEstado[nuevaEtapaNombre].push(eventoActualizado)
                }

                return nuevoEstado
            })

            // Llamar a la API para actualizar en la base de datos
            const resultado = await actualizarEtapaEvento({
                eventoId: realEventoId,
                eventoEtapaId: nuevaEtapaId
            })

            if (!resultado.success) {
                // Revertir el cambio si falló
                setEventosPorEtapa(eventosPorEtapaIniciales)
                toast.error(resultado.error || 'Error al actualizar etapa del evento')
            } else {
                toast.success(resultado.message || 'Etapa actualizada correctamente')
            }

        } catch (error) {
            // Revertir el cambio
            setEventosPorEtapa(eventosPorEtapaIniciales)
            toast.error('Error inesperado al actualizar etapa')
        } finally {
            setActiveId(null)
            setActiveEvento(null)
        }
    }

    // Calcular métricas de resumen
    const metricas = useMemo(() => {
        const totalEventos = todosLosEventos.length
        const eventosPagados = todosLosEventos.filter(e => e.balance === 0).length
        const eventosPendientes = totalEventos - eventosPagados

        const montoTotal = todosLosEventos.reduce((sum, evento) => sum + evento.precio, 0)
        const montoPagado = todosLosEventos.reduce((sum, evento) => sum + evento.totalPagado, 0)
        const montoPendiente = montoTotal - montoPagado

        return {
            totalEventos,
            eventosPagados,
            eventosPendientes,
            montoTotal,
            montoPagado,
            montoPendiente,
            porcentajePagado: montoTotal > 0 ? (montoPagado / montoTotal) * 100 : 0
        }
    }, [todosLosEventos])

    // Componente para tarjetas draggables
    const DraggableEventCard = ({ evento }: { evento: EventoSeguimiento }) => {
        const {
            attributes,
            listeners,
            setNodeRef,
            transform,
            isDragging,
        } = useDraggable({ id: `evento-${evento.id}` })

        const style = {
            transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
            opacity: isDragging ? 0.5 : 1,
        }

        return (
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                onClick={() => !isDragging && handleClickEvento(evento.id)}
                className="bg-zinc-800 rounded-lg p-4 cursor-pointer transition-all hover:bg-zinc-700 hover:scale-[1.02] border border-zinc-700 hover:border-zinc-600"
            >
                {/* Nombre del Evento */}
                <div className="mb-3">
                    <span className="inline-block bg-yellow-600 text-black text-xs px-2 py-1 rounded-full font-medium mb-2">
                        {evento.tipoEventoNombre}
                    </span>
                    <h3 className="font-semibold text-white text-lg leading-tight">
                        {evento.nombre || 'Sin nombre'}
                    </h3>
                </div>

                {/* Cliente e información */}
                <div className="space-y-2 text-sm">
                    <div className="flex items-center text-zinc-300">
                        <CircleUserRound size={16} className="mr-2 text-zinc-400" />
                        <span>{evento.clienteNombre}</span>
                    </div>

                    <div className="flex items-center text-zinc-300">
                        <Calendar size={16} className="mr-2 text-zinc-400" />
                        <span>{formatearFecha(evento.fecha_evento, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        {(() => {
                            const diasRestantes = calcularDiasRestantes(evento.fecha_evento);
                            return (
                                <span className={`ml-2 text-xs ${diasRestantes < 0 ? 'text-red-400' :
                                    diasRestantes <= 7 ? 'text-yellow-400' :
                                        'text-zinc-400'
                                    }`}>
                                    ({obtenerDiasTexto(diasRestantes)})
                                </span>
                            );
                        })()}
                    </div>
                </div>

                {/* Información Financiera */}
                <div className="pt-3 border-t border-zinc-700">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-400">Precio:</span>
                        <span className="text-white font-medium">
                            {formatearPrecio(evento.precio)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-1">
                        <span className="text-zinc-400">Pagado:</span>
                        <span className="text-green-400">
                            {formatearPrecio(evento.totalPagado)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-1">
                        <span className="text-zinc-400">Balance:</span>
                        <span className={`font-medium ${obtenerColorBalance(evento)}`}>
                            {evento.balance === 0 ? (
                                <span className="flex items-center">
                                    <CircleDollarSign size={14} className="mr-1" />
                                    Pagado
                                </span>
                            ) : (
                                formatearPrecio(evento.balance)
                            )}
                        </span>
                    </div>
                </div>
            </div>
        )
    }

    // Obtener IDs de etapas para droppable zones
    const etapaIds = useMemo(() => {
        const ids: Record<string, string> = {}
        Object.values(eventosPorEtapaIniciales).flat().forEach(evento => {
            if (!ids[evento.etapaNombre] && evento.eventoEtapaId) {
                ids[evento.etapaNombre] = evento.eventoEtapaId
            }
        })
        return ids
    }, [eventosPorEtapaIniciales])

    // Componente DroppableColumn
    const DroppableColumn = ({ etapaNombre, eventos, etapaId }: {
        etapaNombre: string;
        eventos: EventoSeguimiento[];
        etapaId: string
    }) => {
        const { isOver, setNodeRef } = useDroppable({
            id: `droppable-${etapaId}`,
        })

        return (
            <div
                ref={setNodeRef}
                className={`bg-zinc-900 rounded-lg p-4 transition-colors ${isOver ? 'bg-zinc-800 ring-2 ring-blue-500' : ''
                    }`}
            >
                {/* Header de Etapa */}
                <div className="mb-6 pb-4 border-b border-zinc-700 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full"
                                style={{
                                    background:
                                        etapaNombre === 'Aprobado'
                                            ? '#38bdf8'
                                            : etapaNombre === 'En edición'
                                                ? '#fbbf24'
                                                : etapaNombre === 'En revisión por cliente'
                                                    ? '#a78bfa'
                                                    : etapaNombre === 'En garantía'
                                                        ? '#10b981'
                                                        : '#d4d4d8'
                                }}
                            ></span>
                            {etapaNombre}
                        </h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-zinc-400">
                                {eventos.length} evento{eventos.length !== 1 ? 's' : ''}
                            </span>
                            {eventos.length > 0 && (
                                <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-1 rounded font-semibold flex items-center gap-1">
                                    {formatearPrecio(eventos.reduce((sum, ev) => sum + (ev.balance > 0 ? ev.balance : 0), 0))}
                                    <span className="ml-1 text-zinc-400 font-normal">pendiente</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Lista de Eventos */}
                <div className="space-y-3">
                    {eventos.length === 0 ? (
                        <div className="text-zinc-500 text-center py-8 border-2 border-dashed border-zinc-700 rounded-lg">
                            Arrastra eventos aquí
                        </div>
                    ) : (
                        eventos.map(evento => (
                            <DraggableEventCard key={evento.id} evento={evento} />
                        ))
                    )}
                </div>
            </div>
        )
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="p-6 max-w-7xl mx-auto">
                {/* Encabezado Principal */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white mb-2">
                        Seguimiento de Eventos
                    </h1>
                    <p className="text-zinc-400">
                        Eventos en etapas de seguimiento: Aprobado, En edición, En revisión por cliente, En garantía
                    </p>
                </div>

                {/* Ficha de Resumen */}
                <div className="mb-6 bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-xl p-6 border border-zinc-700">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <CircleDollarSign className="text-blue-400" size={20} />
                        Resumen General
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {/* Total Eventos */}
                        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                            <div className="text-zinc-400 text-sm">Total Eventos</div>
                            <div className="text-2xl font-bold text-white">{metricas.totalEventos}</div>
                        </div>

                        {/* Eventos Pagados */}
                        <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
                            <div className="text-green-400 text-sm">Pagados</div>
                            <div className="text-2xl font-bold text-green-400">{metricas.eventosPagados}</div>
                        </div>

                        {/* Eventos Pendientes */}
                        <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/30">
                            <div className="text-red-400 text-sm">Pendientes</div>
                            <div className="text-2xl font-bold text-red-400">{metricas.eventosPendientes}</div>
                        </div>

                        {/* Monto Total */}
                        <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
                            <div className="text-blue-400 text-sm">Monto Total</div>
                            <div className="text-xl font-bold text-blue-400">{formatearPrecio(metricas.montoTotal)}</div>
                        </div>

                        {/* Monto Pagado */}
                        <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
                            <div className="text-green-400 text-sm">Pagado</div>
                            <div className="text-xl font-bold text-green-400">{formatearPrecio(metricas.montoPagado)}</div>
                        </div>

                        {/* Monto Pendiente */}
                        <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/30">
                            <div className="text-orange-400 text-sm">Pendiente</div>
                            <div className="text-xl font-bold text-orange-400">{formatearPrecio(metricas.montoPendiente)}</div>
                        </div>
                    </div>

                    {/* Barra de Progreso */}
                    <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-zinc-400">Progreso de Cobro</span>
                            <span className="text-sm font-medium text-white">{metricas.porcentajePagado.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-zinc-700 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-green-600 to-green-400 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(metricas.porcentajePagado, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="mb-6 bg-zinc-900 rounded-xl p-4 border border-zinc-700">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Buscador */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, cliente o fecha..."
                                value={filtro}
                                onChange={(e) => setFiltro(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Filtro de Balance */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFiltroBalance('todos')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${filtroBalance === 'todos'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                                    }`}
                            >
                                Todos ({metricas.totalEventos})
                            </button>
                            <button
                                onClick={() => setFiltroBalance('pagados')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${filtroBalance === 'pagados'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                                    }`}
                            >
                                Pagados ({metricas.eventosPagados})
                            </button>
                            <button
                                onClick={() => setFiltroBalance('pendientes')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${filtroBalance === 'pendientes'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                                    }`}
                            >
                                Pendientes ({metricas.eventosPendientes})
                            </button>
                        </div>
                    </div>

                    {/* Contador de resultados filtrados */}
                    {(filtro || filtroBalance !== 'todos') && (
                        <div className="mt-3 pt-3 border-t border-zinc-700">
                            <span className="text-sm text-zinc-400">
                                Mostrando {eventosFiltrados.length} de {metricas.totalEventos} eventos
                            </span>
                        </div>
                    )}
                </div>

                {/* Columnas por Etapa con Drag and Drop */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {Object.entries(eventosFiltradosPorEtapa).map(([etapaNombre, eventos]) => {
                        const etapaId = etapaIds[etapaNombre]

                        if (!etapaId) {
                            console.warn(`⚠️ No se encontró ID para etapa: ${etapaNombre}`)
                            return (
                                <div key={etapaNombre} className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
                                    <h2 className="text-red-400">Error: Etapa sin ID</h2>
                                    <p className="text-red-300 text-sm">{etapaNombre}</p>
                                </div>
                            )
                        }

                        return (
                            <DroppableColumn
                                key={etapaNombre}
                                etapaNombre={etapaNombre}
                                eventos={eventos}
                                etapaId={etapaId}
                            />
                        )
                    })}
                </div>

                {/* Overlay para drag and drop */}
                <DragOverlay>
                    {activeEvento ? (
                        <div className="opacity-50">
                            <DraggableEventCard evento={activeEvento} />
                        </div>
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    )
}
