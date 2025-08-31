'use client'
import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
    CheckCircle2,
    Clock,
    Eye,
    CreditCard,
    HandCoins,
    X,
    Check,
    AlertCircle
} from 'lucide-react'
import { obtenerResumenNomina } from '@/app/admin/_lib/actions/finanzas/reportes.actions'
import { autorizarPago, marcarComoPagado, autorizarYPagar } from '@/app/admin/_lib/actions/seguimiento/nomina.actions'
import { getCurrentUserId } from '@/app/admin/_lib/utils/auth.utils'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { NOMINA_STATUS } from '@/app/admin/_lib/constants/status'
import { NominaResumen } from '@/app/admin/_lib/actions/finanzas/finanzas.schemas'
import { useRouter } from 'next/navigation'

export default function NominaPage() {
    const router = useRouter()
    const [resumen, setResumen] = useState<NominaResumen>({
        totalPendiente: 0,
        totalAutorizado: 0,
        totalPagado: 0,
        cantidadPendiente: 0,
        cantidadAutorizada: 0,
        cantidadPagada: 0,
        proximosPagos: []
    })
    const [loading, setLoading] = useState(true)
    const [pagosSeleccionados, setPagosSeleccionados] = useState<string[]>([])
    const [procesando, setProcesando] = useState<string[]>([])
    const [filtroActivo, setFiltroActivo] = useState<'todos' | 'pendientes' | 'autorizados' | 'pagados'>('todos')

    useEffect(() => {
        cargarResumen()
    }, [])

    useEffect(() => {
        document.title = 'Gestión de Nómina - ProSocial'
    }, [])

    const cargarResumen = async () => {
        try {
            setLoading(true)
            const data = await obtenerResumenNomina()
            setResumen(data)
        } catch (error) {
            console.error('Error al cargar resumen:', error)
            toast.error('Error al cargar el resumen de nómina')
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case NOMINA_STATUS.PENDIENTE:
                return (
                    <Badge variant="secondary" className="bg-yellow-900 text-yellow-200 border-yellow-700">
                        <Clock className="w-3 h-3 mr-1" />
                        Pendiente
                    </Badge>
                )
            case NOMINA_STATUS.AUTORIZADO:
                return (
                    <Badge variant="secondary" className="bg-blue-900 text-blue-200 border-blue-700">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Autorizado
                    </Badge>
                )
            case NOMINA_STATUS.PAGADO:
                return (
                    <Badge variant="secondary" className="bg-green-900 text-green-200 border-green-700">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Pagado
                    </Badge>
                )
            default:
                return (
                    <Badge variant="outline" className="border-zinc-600 text-zinc-400">
                        Desconocido
                    </Badge>
                )
        }
    }

    // Función para actualizar un pago específico en el estado local
    const actualizarPagoLocal = (pagoId: string, nuevoStatus: string) => {
        setResumen(prev => {
            const nuevosProximosPagos = prev.proximosPagos.map(pago =>
                pago.id === pagoId
                    ? { ...pago, status: nuevoStatus }
                    : pago
            )

            // Recalcular totales y cantidades
            const pendientes = nuevosProximosPagos.filter(p => p.status === NOMINA_STATUS.PENDIENTE)
            const autorizados = nuevosProximosPagos.filter(p => p.status === NOMINA_STATUS.AUTORIZADO)
            const pagados = nuevosProximosPagos.filter(p => p.status === NOMINA_STATUS.PAGADO)

            return {
                ...prev,
                proximosPagos: nuevosProximosPagos,
                cantidadPendiente: pendientes.length,
                cantidadAutorizada: autorizados.length,
                cantidadPagada: pagados.length,
                totalPendiente: pendientes.reduce((sum, p) => sum + p.monto, 0),
                totalAutorizado: autorizados.reduce((sum, p) => sum + p.monto, 0),
                totalPagado: pagados.reduce((sum, p) => sum + p.monto, 0),
            }
        })
    }

    const handleAutorizar = async (pagoId: string, eventoId?: string) => {
        try {
            if (!eventoId) {
                toast.error('ID de evento no encontrado')
                return
            }

            const currentUserId = getCurrentUserId()
            if (!currentUserId) {
                toast.error('Error: No se pudo obtener la información del usuario actual')
                return
            }

            setProcesando(prev => [...prev, pagoId])
            await autorizarPago(pagoId, currentUserId, eventoId)
            toast.success('Pago autorizado correctamente')

            // Actualizar estado local en lugar de recargar todo
            actualizarPagoLocal(pagoId, NOMINA_STATUS.AUTORIZADO)
        } catch (error) {
            console.error('Error al autorizar pago:', error)
            toast.error('Error al autorizar el pago')
        } finally {
            setProcesando(prev => prev.filter(id => id !== pagoId))
        }
    }

    const handleMarcarPagado = async (pagoId: string, eventoId?: string) => {
        try {
            if (!eventoId) {
                toast.error('ID de evento no encontrado')
                return
            }

            const currentUserId = getCurrentUserId()
            if (!currentUserId) {
                toast.error('Error: No se pudo obtener la información del usuario actual')
                return
            }

            setProcesando(prev => [...prev, pagoId])
            await marcarComoPagado(pagoId, currentUserId, eventoId)
            toast.success('Pago marcado como pagado')

            // Actualizar estado local en lugar de recargar todo
            actualizarPagoLocal(pagoId, NOMINA_STATUS.PAGADO)
        } catch (error) {
            console.error('Error al marcar como pagado:', error)
            toast.error('Error al marcar como pagado')
        } finally {
            setProcesando(prev => prev.filter(id => id !== pagoId))
        }
    }

    const handleAutorizarYPagar = async (pagoId: string, eventoId?: string) => {
        try {
            if (!eventoId) {
                toast.error('ID de evento no encontrado')
                return
            }

            const currentUserId = getCurrentUserId()
            if (!currentUserId) {
                toast.error('Error: No se pudo obtener la información del usuario actual')
                return
            }

            setProcesando(prev => [...prev, pagoId])
            await autorizarYPagar(pagoId, currentUserId, eventoId)
            toast.success('Pago autorizado y marcado como pagado')

            // Actualizar estado local en lugar de recargar todo
            actualizarPagoLocal(pagoId, NOMINA_STATUS.PAGADO)
        } catch (error) {
            console.error('Error al autorizar y pagar:', error)
            toast.error('Error al autorizar y pagar')
        } finally {
            setProcesando(prev => prev.filter(id => id !== pagoId))
        }
    }

    const handleVerDetalle = (eventoId: string) => {
        if (eventoId) {
            router.push(`/admin/dashboard/seguimiento/${eventoId}`)
        }
    }

    const toggleSeleccionTodos = () => {
        const pagosPendientesFiltrados = pagosFiltrados.filter(p => p.status === NOMINA_STATUS.PENDIENTE)
        if (pagosSeleccionados.length === pagosPendientesFiltrados.length && pagosPendientesFiltrados.length > 0) {
            setPagosSeleccionados([])
        } else {
            setPagosSeleccionados(pagosPendientesFiltrados.map(p => p.id))
        }
    }

    const toggleSeleccionPago = (pagoId: string) => {
        setPagosSeleccionados(prev =>
            prev.includes(pagoId)
                ? prev.filter(id => id !== pagoId)
                : [...prev, pagoId]
        )
    }

    const handleAccionMasiva = async (accion: 'autorizar' | 'autorizar_y_pagar') => {
        if (pagosSeleccionados.length === 0) {
            toast.error('Selecciona al menos un pago')
            return
        }

        const currentUserId = getCurrentUserId()
        if (!currentUserId) {
            toast.error('Error: No se pudo obtener la información del usuario actual')
            return
        }

        try {
            setProcesando(prev => [...prev, ...pagosSeleccionados])

            for (const pagoId of pagosSeleccionados) {
                const pago = resumen.proximosPagos.find(p => p.id === pagoId)
                if (pago && pago.eventoId) {
                    if (accion === 'autorizar') {
                        await autorizarPago(pagoId, currentUserId, pago.eventoId)
                        // Actualizar estado local
                        actualizarPagoLocal(pagoId, NOMINA_STATUS.AUTORIZADO)
                    } else {
                        await autorizarYPagar(pagoId, currentUserId, pago.eventoId)
                        // Actualizar estado local
                        actualizarPagoLocal(pagoId, NOMINA_STATUS.PAGADO)
                    }
                }
            }

            toast.success(`${pagosSeleccionados.length} pagos procesados correctamente`)
            setPagosSeleccionados([])
        } catch (error) {
            console.error('Error en acción masiva:', error)
            toast.error('Error al procesar los pagos')
        } finally {
            setProcesando([])
        }
    }

    const pagosPendientes = resumen.proximosPagos.filter(p => p.status === NOMINA_STATUS.PENDIENTE)
    const pagosAutorizados = resumen.proximosPagos.filter(p => p.status === NOMINA_STATUS.AUTORIZADO)
    const pagosPagados = resumen.proximosPagos.filter(p => p.status === NOMINA_STATUS.PAGADO)

    // Función para obtener pagos filtrados
    const getPagosFiltrados = () => {
        switch (filtroActivo) {
            case 'pendientes':
                return pagosPendientes
            case 'autorizados':
                return pagosAutorizados
            case 'pagados':
                return pagosPagados
            default:
                return resumen.proximosPagos
        }
    }

    const pagosFiltrados = getPagosFiltrados()

    if (loading) {
        return (
            <div className="p-6 bg-zinc-900 min-h-screen">
                <h1 className="text-2xl font-bold mb-6 text-white">Gestión de Nómina</h1>
                <div className="animate-pulse space-y-4">
                    <div className="h-32 bg-zinc-800 rounded"></div>
                    <div className="h-64 bg-zinc-800 rounded"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6 bg-zinc-900 min-h-screen">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Gestión de Nómina</h1>
                {filtroActivo !== 'todos' && (
                    <Button
                        onClick={() => setFiltroActivo('todos')}
                        variant="ghost"
                        size="sm"
                        className="text-zinc-400 hover:text-white"
                    >
                        <X className="w-4 h-4 mr-1" />
                        Mostrar Todos
                    </Button>
                )}
            </div>

            {/* Resumen de estado - Ahora clicables */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                    className={`cursor-pointer transition-all duration-200 border-l-4 p-4 rounded ${filtroActivo === 'pendientes'
                        ? 'bg-yellow-900/30 border-yellow-400 ring-2 ring-yellow-500'
                        : 'bg-zinc-800 border-yellow-500 hover:bg-yellow-900/20'
                        }`}
                    onClick={() => setFiltroActivo(filtroActivo === 'pendientes' ? 'todos' : 'pendientes')}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-yellow-400">Pendientes</p>
                            <p className="text-2xl font-bold text-yellow-300">{resumen.cantidadPendiente}</p>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-500" />
                    </div>
                    <p className="text-sm text-yellow-200 mt-2">
                        ${resumen.totalPendiente.toLocaleString('es-MX')}
                    </p>
                    {filtroActivo === 'pendientes' && (
                        <p className="text-xs text-yellow-300 mt-1 opacity-75">
                            ← Filtro activo
                        </p>
                    )}
                </div>

                <div
                    className={`cursor-pointer transition-all duration-200 border-l-4 p-4 rounded ${filtroActivo === 'autorizados'
                        ? 'bg-blue-900/30 border-blue-400 ring-2 ring-blue-500'
                        : 'bg-zinc-800 border-blue-500 hover:bg-blue-900/20'
                        }`}
                    onClick={() => setFiltroActivo(filtroActivo === 'autorizados' ? 'todos' : 'autorizados')}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-400">Autorizados</p>
                            <p className="text-2xl font-bold text-blue-300">{resumen.cantidadAutorizada}</p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="text-sm text-blue-200 mt-2">
                        ${resumen.totalAutorizado.toLocaleString('es-MX')}
                    </p>
                    {filtroActivo === 'autorizados' && (
                        <p className="text-xs text-blue-300 mt-1 opacity-75">
                            ← Filtro activo
                        </p>
                    )}
                </div>

                <div
                    className={`cursor-pointer transition-all duration-200 border-l-4 p-4 rounded ${filtroActivo === 'pagados'
                        ? 'bg-green-900/30 border-green-400 ring-2 ring-green-500'
                        : 'bg-zinc-800 border-green-500 hover:bg-green-900/20'
                        }`}
                    onClick={() => setFiltroActivo(filtroActivo === 'pagados' ? 'todos' : 'pagados')}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-400">Pagados</p>
                            <p className="text-2xl font-bold text-green-300">{resumen.cantidadPagada}</p>
                        </div>
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <p className="text-sm text-green-200 mt-2">
                        ${resumen.totalPagado.toLocaleString('es-MX')}
                    </p>
                    {filtroActivo === 'pagados' && (
                        <p className="text-xs text-green-300 mt-1 opacity-75">
                            ← Filtro activo
                        </p>
                    )}
                </div>
            </div>

            {/* Acciones masivas */}
            {pagosPendientes.length > 0 && filtroActivo !== 'pagados' && filtroActivo !== 'autorizados' && (
                <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={pagosSeleccionados.length === pagosFiltrados.filter(p => p.status === NOMINA_STATUS.PENDIENTE).length && pagosFiltrados.filter(p => p.status === NOMINA_STATUS.PENDIENTE).length > 0}
                                    onChange={toggleSeleccionTodos}
                                    className="rounded border-zinc-600 bg-zinc-700 text-blue-500"
                                />
                                <span className="text-sm text-zinc-300">
                                    Seleccionar todos los pendientes ({pagosFiltrados.filter(p => p.status === NOMINA_STATUS.PENDIENTE).length})
                                </span>
                            </label>
                        </div>
                        {pagosSeleccionados.length > 0 && (
                            <div className="flex space-x-2">
                                <Button
                                    onClick={() => handleAccionMasiva('autorizar')}
                                    disabled={procesando.length > 0}
                                    variant="outline"
                                    size="sm"
                                    className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                                >
                                    <Check className="w-4 h-4 mr-1" />
                                    Autorizar ({pagosSeleccionados.length})
                                </Button>
                                <Button
                                    onClick={() => handleAccionMasiva('autorizar_y_pagar')}
                                    disabled={procesando.length > 0}
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <HandCoins className="w-4 h-4 mr-1" />
                                    Autorizar y Pagar ({pagosSeleccionados.length})
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Indicador de filtro activo */}
            {filtroActivo !== 'todos' && (
                <div className="bg-zinc-800 p-3 rounded-lg border border-zinc-700 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${filtroActivo === 'pendientes' ? 'bg-yellow-500' :
                            filtroActivo === 'autorizados' ? 'bg-blue-500' : 'bg-green-500'
                            }`}></div>
                        <span className="text-zinc-300 text-sm">
                            Mostrando solo pagos <strong className="text-white capitalize">{filtroActivo}</strong>
                            ({pagosFiltrados.length} de {resumen.proximosPagos.length})
                        </span>
                    </div>
                    <Button
                        onClick={() => setFiltroActivo('todos')}
                        variant="ghost"
                        size="sm"
                        className="text-zinc-400 hover:text-white h-6"
                    >
                        Limpiar filtro
                    </Button>
                </div>
            )}

            {/* Lista de pagos */}
            <div className="bg-zinc-800 rounded-lg border border-zinc-700 shadow">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-zinc-700 border-b border-zinc-600">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                                    Usuario
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                                    Evento
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                                    Concepto
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                                    Monto
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-zinc-800 divide-y divide-zinc-700">
                            {pagosFiltrados.length > 0 ? (
                                pagosFiltrados.map(pago => (
                                    <tr key={pago.id} className="hover:bg-zinc-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {pago.status === NOMINA_STATUS.PENDIENTE && (
                                                    <input
                                                        type="checkbox"
                                                        checked={pagosSeleccionados.includes(pago.id)}
                                                        onChange={() => toggleSeleccionPago(pago.id)}
                                                        className="mr-3 rounded border-zinc-600 bg-zinc-700 text-blue-500"
                                                    />
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium text-white">
                                                        {pago.usuario}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-white">{pago.evento}</div>
                                            <div className="text-sm text-zinc-400">{pago.cliente}</div>
                                            {pago.fechaEvento && (
                                                <div className="text-xs text-zinc-500">
                                                    {new Date(pago.fechaEvento).toLocaleDateString('es-MX')}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                                            {pago.concepto}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-400">
                                            ${pago.monto.toLocaleString('es-MX')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(pago.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <div className="flex items-center space-x-2">
                                                {pago.status === NOMINA_STATUS.PENDIENTE && (
                                                    <>
                                                        <Button
                                                            onClick={() => handleAutorizar(pago.id, pago.eventoId)}
                                                            disabled={procesando.includes(pago.id)}
                                                            variant="outline"
                                                            size="sm"
                                                            className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                                                        >
                                                            <Check className="w-4 h-4 mr-1" />
                                                            Autorizar
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleAutorizarYPagar(pago.id, pago.eventoId)}
                                                            disabled={procesando.includes(pago.id)}
                                                            size="sm"
                                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                                        >
                                                            <HandCoins className="w-4 h-4 mr-1" />
                                                            Autorizar y Pagar
                                                        </Button>
                                                    </>
                                                )}
                                                {pago.status === NOMINA_STATUS.AUTORIZADO && (
                                                    <Button
                                                        onClick={() => handleMarcarPagado(pago.id, pago.eventoId)}
                                                        disabled={procesando.includes(pago.id)}
                                                        size="sm"
                                                        className="bg-purple-600 hover:bg-purple-700 text-white"
                                                    >
                                                        <CreditCard className="w-4 h-4 mr-1" />
                                                        Marcar como Pagado
                                                    </Button>
                                                )}
                                                {pago.status === NOMINA_STATUS.PAGADO && (
                                                    <div className="text-sm text-green-400 flex items-center">
                                                        <CheckCircle2 className="w-4 h-4 mr-1" />
                                                        Completado
                                                    </div>
                                                )}
                                                {pago.eventoId && (
                                                    <Button
                                                        onClick={() => handleVerDetalle(pago.eventoId!)}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-zinc-400 hover:text-white hover:bg-zinc-700"
                                                    >
                                                        <Eye className="w-4 h-4 mr-1" />
                                                        Ver Detalle
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-zinc-500">
                                        No hay pagos de nómina registrados
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
