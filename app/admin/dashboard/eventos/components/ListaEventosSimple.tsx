'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, User, Calendar, MapPin, Clock, FileText, Phone, Archive, ArchiveX, ArrowUpDown, ArrowUp, ArrowDown, CircleDollarSign, CircleUserRound } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { EventoPorEtapa } from '@/app/admin/_lib/schemas/evento.schemas'
import { EventoEtapa } from '@/app/admin/_lib/actions/evento/eventoManejo/eventoManejo.schemas'
import { formatearFecha } from '@/app/admin/_lib/utils/fechas'
import { AGENDA_STATUS, EVENTO_STATUS } from '@/app/admin/_lib/constants/status'
import { getEventosPendientesPorEtapa } from '@/app/admin/_lib/actions/eventos/eventos.actions'
import { toast } from 'sonner'

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

// Helper para formatear tiempo relativo
const formatearTiempoRelativo = (fecha: Date) => {
    const ahora = new Date()
    const diferencia = ahora.getTime() - fecha.getTime()
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))
    const horas = Math.floor(diferencia / (1000 * 60 * 60))
    const minutos = Math.floor(diferencia / (1000 * 60))

    if (dias > 0) return `hace ${dias}d`
    if (horas > 0) return `hace ${horas}h`
    if (minutos > 0) return `hace ${minutos}m`
    return 'ahora'
}

// Helper para calcular días hasta el evento
const calcularDiasHastaEvento = (fechaEvento: Date) => {
    const ahora = new Date()
    const fecha = new Date(fechaEvento)
    const diferencia = fecha.getTime() - ahora.getTime()
    const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24))

    if (dias < 0) return { dias: Math.abs(dias), estado: 'pasado' }
    if (dias === 0) return { dias: 0, estado: 'hoy' }
    if (dias <= 7) return { dias, estado: 'urgente' }
    if (dias <= 30) return { dias, estado: 'pronto' }
    return { dias, estado: 'lejano' }
}

interface ListaEventosSimpleProps {
    eventosIniciales: EventoPorEtapa[]
    etapas: EventoEtapa[]
}

export default function ListaEventosSimple({ eventosIniciales, etapas }: ListaEventosSimpleProps) {
    const router = useRouter()

    // Estados principales
    const [eventos, setEventos] = useState<EventoPorEtapa[]>(eventosIniciales)
    const [busqueda, setBusqueda] = useState<string>('')
    const [creandoEvento, setCreandoEvento] = useState(false)
    const [mostrarArchivados, setMostrarArchivados] = useState(false)
    const [cargandoArchivados, setCargandoArchivados] = useState(false)
    const [ordenAscendente, setOrdenAscendente] = useState(true)

    // Estados para drag and drop
    const [activeId, setActiveId] = useState<string | null>(null)
    const [activeEvento, setActiveEvento] = useState<EventoPorEtapa | null>(null)

    // Configurar sensores para drag and drop
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3,
            },
        })
    )

    // Función para cargar eventos con o sin archivados
    const cargarEventos = async (incluirArchivados: boolean) => {
        try {
            setCargandoArchivados(true)
            const etapaPosiciones = etapas.map(etapa => etapa.posicion)
            const eventosActualizados = await getEventosPendientesPorEtapa(etapaPosiciones, incluirArchivados)
            setEventos(eventosActualizados)
        } catch (error) {
            console.error('Error al cargar eventos:', error)
        } finally {
            setCargandoArchivados(false)
        }
    }

    // Manejar toggle de archivados
    const handleToggleArchivados = async () => {
        const nuevoEstado = !mostrarArchivados
        setMostrarArchivados(nuevoEstado)
        await cargarEventos(nuevoEstado)
    }

    // Filtrar eventos
    const eventosFiltrados = eventos.filter(evento => {
        const coincideBusqueda = !busqueda ||
            evento.Cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            (evento.nombre?.toLowerCase() || '').includes(busqueda.toLowerCase()) ||
            (evento.Cliente.telefono?.toLowerCase() || '').includes(busqueda.toLowerCase())

        return coincideBusqueda
    })

    // Agrupar eventos por etapa y ordenar por fecha
    const eventosPorEtapa = etapas.map(etapa => {
        const eventosDeEtapa = eventosFiltrados.filter(evento => evento.eventoEtapaId === etapa.id)

        // Ordenar eventos por fecha con lógica diferente según el modo
        const eventosOrdenados = eventosDeEtapa.sort((a, b) => {
            const fechaA = new Date(a.fecha_evento).getTime()
            const fechaB = new Date(b.fecha_evento).getTime()

            if (mostrarArchivados) {
                // Para archivados: mostrar primero los activos, luego archivados
                const aEsArchivado = a.status === EVENTO_STATUS.ARCHIVADO
                const bEsArchivado = b.status === EVENTO_STATUS.ARCHIVADO

                if (aEsArchivado && !bEsArchivado) return 1  // Archivados al final
                if (!aEsArchivado && bEsArchivado) return -1 // Activos al principio

                // Si ambos son del mismo tipo, aplicar ordenamiento por fecha
                return ordenAscendente ? (fechaA - fechaB) : (fechaB - fechaA)
            } else {
                // Para eventos normales: aplicar ordenamiento por fecha según preferencia
                return ordenAscendente ? (fechaA - fechaB) : (fechaB - fechaA)
            }
        })

        return {
            etapa,
            eventos: eventosOrdenados
        }
    })

    // Convertir datos agrupados a lista plana para filtros
    const todosLosEventos = useMemo(() => {
        const eventosPlanos: EventoPorEtapa[] = []
        eventosPorEtapa.forEach(({ eventos: eventosEtapa }) => {
            eventosPlanos.push(...eventosEtapa)
        })
        return eventosPlanos
    }, [eventosPorEtapa])

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
            : overId

        // Encontrar evento y nueva etapa
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
            setEventos(prevEventos => {
                return prevEventos.map(e =>
                    e.id === realEventoId
                        ? { ...e, eventoEtapaId: nuevaEtapaId }
                        : e
                )
            })

            // TODO: Aquí se debe llamar a la API para actualizar en la base de datos
            toast.success('Evento movido correctamente')

        } catch (error) {
            // Revertir el cambio
            setEventos(eventosIniciales)
            toast.error('Error inesperado al mover evento')
        } finally {
            setActiveId(null)
            setActiveEvento(null)
        }
    }

    const formatearPrecio = (precio: number) => {
        return precio.toLocaleString('es-MX', {
            style: 'currency',
            currency: 'MXN'
        })
    }

    const obtenerColorBalance = (balance: number) => {
        if (balance === 0) return 'text-green-500'
        if (balance > 0) return 'text-red-500'
        return 'text-orange-500' // sobregiro
    }

    const obtenerDiasTexto = (dias: number) => {
        if (dias < 0) return `${Math.abs(dias)} días pasados`
        if (dias === 0) return 'Hoy'
        if (dias === 1) return 'Mañana'
        return `En ${dias} días`
    }

    const handleCrearEvento = () => {
        setCreandoEvento(true)
        router.push('/admin/dashboard/eventos/nuevo')
    }

    const handleVerEvento = (eventoId: string) => {
        router.push(`/admin/dashboard/eventos/${eventoId}`)
    }

    // Componente para tarjetas draggables
    const DraggableEventCard = ({ evento }: { evento: EventoPorEtapa }) => {
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

        const diasHastaEvento = calcularDiasHastaEvento(evento.fecha_evento)
        const esArchivado = evento.status === EVENTO_STATUS.ARCHIVADO

        return (
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                onClick={() => !isDragging && handleVerEvento(evento.id)}
                className={`rounded-lg p-4 cursor-pointer transition-all hover:scale-[1.02] border ${esArchivado
                    ? 'bg-amber-900/10 hover:bg-amber-900/20 border-amber-700/50'
                    : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 hover:border-zinc-600'
                    }`}
            >
                {/* Nombre del Evento */}
                <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                        {evento.EventoTipo && (
                            <span className="inline-block bg-yellow-600 text-black text-xs px-2 py-1 rounded-full font-medium">
                                {evento.EventoTipo.nombre}
                            </span>
                        )}
                        {esArchivado && (
                            <span className="inline-block bg-amber-900/50 text-amber-300 border border-amber-700 text-xs px-2 py-1 rounded-full font-medium">
                                <Archive className="h-3 w-3 inline mr-1" />
                                ARCHIVADO
                            </span>
                        )}
                    </div>
                    <h3 className="font-semibold text-white text-lg leading-tight">
                        {evento.nombre || 'Por configurar'}
                    </h3>
                </div>

                {/* Cliente e información */}
                <div className="space-y-2 text-sm">
                    <div className="flex items-center text-zinc-300">
                        <CircleUserRound size={16} className="mr-2 text-zinc-400" />
                        <span>{evento.Cliente.nombre}</span>
                    </div>

                    <div className="flex items-center text-zinc-300">
                        <Calendar size={16} className="mr-2 text-zinc-400" />
                        <span>{formatearFecha(evento.fecha_evento, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span className={`ml-2 text-xs ${diasHastaEvento.estado === 'pasado' ? 'text-red-400' :
                            diasHastaEvento.estado === 'urgente' ? 'text-yellow-400' :
                                'text-zinc-400'
                            }`}>
                            ({obtenerDiasTexto(diasHastaEvento.dias)})
                        </span>
                    </div>

                    {evento.Cliente.telefono && (
                        <div className="flex items-center text-zinc-300">
                            <Phone size={16} className="mr-2 text-zinc-400" />
                            <span className="text-xs">{evento.Cliente.telefono}</span>
                        </div>
                    )}
                </div>

                {/* Información de cotizaciones */}
                {evento.Cotizacion && evento.Cotizacion.length > 0 && (
                    <div className="pt-3 border-t border-zinc-700">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-zinc-400">Cotizaciones:</span>
                            <span className="text-blue-400 font-medium">
                                {evento.Cotizacion.length}
                            </span>
                        </div>
                        {evento.Cotizacion[0].precio && (
                            <div className="flex justify-between items-center text-sm mt-1">
                                <span className="text-zinc-400">Precio:</span>
                                <span className="text-white font-medium">
                                    {formatearPrecio(evento.Cotizacion[0].precio)}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Última actividad */}
                {evento.EventoBitacora && evento.EventoBitacora.length > 0 && (
                    <div className="pt-3 border-t border-zinc-700">
                        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                            <Clock size={12} />
                            <span>hace {formatearTiempoRelativo(evento.EventoBitacora[0].createdAt)}</span>
                            {evento.EventoBitacora[0].importancia !== '1' && (
                                <span className={`px-1.5 py-0.5 rounded-full font-medium ${evento.EventoBitacora[0].importancia === '3'
                                    ? 'bg-red-900/50 text-red-300'
                                    : 'bg-orange-900/50 text-orange-300'
                                    }`}>
                                    {evento.EventoBitacora[0].importancia === '3' ? 'Urgente' : 'Importante'}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                            {evento.EventoBitacora[0].comentario}
                        </p>
                    </div>
                )}
            </div>
        )
    }

    // Componente DroppableColumn
    const DroppableColumn = ({ etapa, eventos }: {
        etapa: EventoEtapa;
        eventos: EventoPorEtapa[];
    }) => {
        const { isOver, setNodeRef } = useDroppable({
            id: `droppable-${etapa.id}`,
        })

        // Determinar color según la etapa
        const obtenerColorEtapa = (nombre: string) => {
            if (nombre.toLowerCase().includes('nuevo')) return '#38bdf8' // blue-400
            if (nombre.toLowerCase().includes('seguimiento')) return '#fbbf24' // yellow-400
            if (nombre.toLowerCase().includes('promesa')) return '#a78bfa' // violet-400
            return '#d4d4d8' // zinc-300
        }

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
                            <span
                                className="inline-block w-2 h-2 rounded-full"
                                style={{ background: obtenerColorEtapa(etapa.nombre) }}
                            ></span>
                            {etapa.nombre}
                        </h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-zinc-400">
                                {eventos.length} evento{eventos.length !== 1 ? 's' : ''}
                            </span>
                            {eventos.length > 0 && (
                                <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded font-semibold">
                                    {eventos.filter(e => e.Cotizacion && e.Cotizacion.length > 0).length} con cotización
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Lista de Eventos */}
                <div className="space-y-3">
                    {eventos.length === 0 ? (
                        <div className="text-zinc-500 text-center py-8 border-2 border-dashed border-zinc-700 rounded-lg">
                            <div className="text-sm">No hay eventos en esta etapa</div>
                            <div className="text-xs mt-1">Los nuevos eventos aparecerán aquí</div>
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

    const totalEventos = eventosFiltrados.length
    const eventosConCotizaciones = eventosFiltrados.filter(e => e.Cotizacion && e.Cotizacion.length > 0).length
    const eventosSinCotizaciones = eventosFiltrados.filter(e => !e.Cotizacion || e.Cotizacion.length === 0).length
    const eventosArchivados = eventosFiltrados.filter(e => e.status === EVENTO_STATUS.ARCHIVADO).length
    const eventosActivos = eventosFiltrados.filter(e => e.status !== EVENTO_STATUS.ARCHIVADO).length

    // Calcular métricas de resumen
    const metricas = useMemo(() => {
        const totalEventos = todosLosEventos.length
        const eventosPagados = todosLosEventos.filter(e =>
            e.Cotizacion && e.Cotizacion.length > 0 &&
            e.Cotizacion.some(cot => cot.Pago && cot.Pago.length > 0)
        ).length
        const eventosPendientes = totalEventos - eventosPagados

        const montoTotal = todosLosEventos.reduce((sum, evento) => {
            if (evento.Cotizacion && evento.Cotizacion.length > 0) {
                return sum + evento.Cotizacion[0].precio
            }
            return sum
        }, 0)

        const montoPagado = todosLosEventos.reduce((sum, evento) => {
            if (evento.Cotizacion && evento.Cotizacion.length > 0) {
                const pagos = evento.Cotizacion[0].Pago || []
                return sum + pagos.reduce((pagosSum, pago) => pagosSum + pago.monto, 0)
            }
            return sum
        }, 0)

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

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="p-6 w-full mx-auto">
                {/* Encabezado Principal */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-2">
                                Pipeline de Conversión
                            </h1>
                            <p className="text-zinc-400">
                                Gestión de leads y seguimiento: Nuevo, Seguimiento, Promesa
                            </p>
                        </div>
                        <Button
                            onClick={handleCrearEvento}
                            disabled={creandoEvento}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            {creandoEvento ? 'Creando...' : 'Nuevo Evento'}
                        </Button>
                    </div>
                </div>

                {/* Ficha de Resumen */}
                <div className="mb-6 bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-xl p-6 border border-zinc-700">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <CircleDollarSign className="text-blue-400" size={20} />
                        Resumen de Pipeline
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {/* Total Eventos */}
                        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                            <div className="text-zinc-400 text-sm">Total Eventos</div>
                            <div className="text-2xl font-bold text-white">{metricas.totalEventos}</div>
                        </div>

                        {/* Con Cotizaciones */}
                        <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
                            <div className="text-blue-400 text-sm">Con Cotización</div>
                            <div className="text-2xl font-bold text-blue-400">{eventosConCotizaciones}</div>
                        </div>

                        {/* Sin Cotizaciones */}
                        <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/30">
                            <div className="text-yellow-400 text-sm">Sin Cotización</div>
                            <div className="text-2xl font-bold text-yellow-400">{eventosSinCotizaciones}</div>
                        </div>

                        {/* Monto Total */}
                        <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
                            <div className="text-green-400 text-sm">Monto Total</div>
                            <div className="text-xl font-bold text-green-400">{formatearPrecio(metricas.montoTotal)}</div>
                        </div>

                        {/* Monto Pagado */}
                        <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/30">
                            <div className="text-emerald-400 text-sm">Pagado</div>
                            <div className="text-xl font-bold text-emerald-400">{formatearPrecio(metricas.montoPagado)}</div>
                        </div>

                        {/* Monto Pendiente */}
                        <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/30">
                            <div className="text-orange-400 text-sm">Pendiente</div>
                            <div className="text-xl font-bold text-orange-400">{formatearPrecio(metricas.montoPendiente)}</div>
                        </div>
                    </div>

                    {/* Barra de Progreso */}
                    {metricas.montoTotal > 0 && (
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
                    )}
                </div>

                {/* Filtros */}
                <div className="mb-6 bg-zinc-900 rounded-xl p-4 border border-zinc-700">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Buscador */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, cliente o teléfono..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Filtros de estado */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setOrdenAscendente(!ordenAscendente)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${ordenAscendente
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                                    }`}
                            >
                                {ordenAscendente ? (
                                    <ArrowUp className="h-4 w-4 mr-2 inline" />
                                ) : (
                                    <ArrowDown className="h-4 w-4 mr-2 inline" />
                                )}
                                {ordenAscendente ? 'Próximas' : 'Lejanas'}
                            </button>

                            <button
                                onClick={handleToggleArchivados}
                                disabled={cargandoArchivados}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${mostrarArchivados
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                                    }`}
                            >
                                {cargandoArchivados ? (
                                    <Clock className="h-4 w-4 mr-2 inline animate-spin" />
                                ) : mostrarArchivados ? (
                                    <ArchiveX className="h-4 w-4 mr-2 inline" />
                                ) : (
                                    <Archive className="h-4 w-4 mr-2 inline" />
                                )}
                                {cargandoArchivados
                                    ? 'Cargando...'
                                    : mostrarArchivados
                                        ? `Ocultar (${eventosArchivados})`
                                        : `Archivados (${eventosArchivados})`
                                }
                            </button>
                        </div>
                    </div>

                    {/* Contador de resultados filtrados */}
                    {(busqueda || mostrarArchivados) && (
                        <div className="mt-3 pt-3 border-t border-zinc-700">
                            <span className="text-sm text-zinc-400">
                                Mostrando {eventosFiltrados.length} de {eventos.length} eventos
                            </span>
                        </div>
                    )}
                </div>

                {/* Indicador de modo archivados */}
                {mostrarArchivados && (
                    <div className="mb-6 p-4 bg-amber-900/20 border border-amber-700/50 rounded-lg">
                        <div className="flex items-center gap-2 text-amber-300">
                            <Archive className="h-4 w-4" />
                            <span className="text-sm font-medium">
                                Mostrando eventos archivados. Los eventos archivados aparecen con fondo ámbar.
                            </span>
                        </div>
                    </div>
                )}

                {/* Columnas por Etapa con Drag and Drop */}
                {eventosFiltrados.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-zinc-500 mb-4">
                            {busqueda ? 'No se encontraron eventos' : 'No hay eventos registrados'}
                        </div>
                        {!busqueda && (
                            <Button onClick={handleCrearEvento} disabled={creandoEvento}>
                                Crear tu primer evento
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {eventosPorEtapa.map(({ etapa, eventos }) => (
                            <DroppableColumn
                                key={etapa.id}
                                etapa={etapa}
                                eventos={eventos}
                            />
                        ))}
                    </div>
                )}

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
