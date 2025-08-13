'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, Calculator, Save, X, Package, Copy, MessageCircle, TrendingUp, CreditCard, Percent, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'

import { cargarServiciosDePaquete, crearCotizacionCongelada, type ServicioCongelado } from '@/app/admin/_lib/cotizacion.congelada.actions'
import { obtenerPaquete } from '@/app/admin/_lib/paquete.actions'
import { obtenerTipoEvento } from '@/app/admin/_lib/eventoTipo.actions'
import { obtenerCondicionesComercialesActivas } from '@/app/admin/_lib/condicionesComerciales.actions'
import { obtenerMetodosPago } from '@/app/admin/_lib/metodoPago.actions'

import WishlistCongelada from './WishlistCongelada'
import WishlistNestedCongelada from './WishlistNestedCongelada'
import SimuladorMetodosPago from './SimuladorMetodosPago'
import ListaServicios from './ListaServicios'

interface Props {
    eventoId: string
    eventoTipoId: string
    paqueteId?: string // Si viene de un paquete específico
}

export default function FormCotizacionCongelada({ eventoId, eventoTipoId, paqueteId }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [guardando, setGuardando] = useState(false)

    // Estados principales
    const [nombreCotizacion, setNombreCotizacion] = useState('')
    const [serviciosWishlist, setServiciosWishlist] = useState<ServicioCongelado[]>([])
    const [eventoTipo, setEventoTipo] = useState<string>('')
    const [paqueteBase, setPaqueteBase] = useState<{ nombre: string } | null>(null)

    // Estados de cálculos y utilidades
    const [totales, setTotales] = useState({
        subtotal: 0,
        total: 0,
        cantidad: 0,
        costoTotal: 0,
        utilidadBruta: 0,
        margenPorcentaje: 0
    })

    // Estados de condiciones comerciales y métodos de pago
    const [condicionesComerciales, setCondicionesComerciales] = useState<any[]>([])
    const [condicionSeleccionada, setCondicionSeleccionada] = useState<string>('')
    const [metodosPago, setMetodosPago] = useState<any[]>([])
    const [metodosDisponibles, setMetodosDisponibles] = useState<any[]>([])
    const [cotizacionId, setCotizacionId] = useState<string | null>(null)

    // Estados de UI
    const [mostrarUtilidades, setMostrarUtilidades] = useState(false)
    const [mostrarSimulador, setMostrarSimulador] = useState(false)
    const [vistaWishlist, setVistaWishlist] = useState<'tabla' | 'nested'>('nested')

    // Estados de validación
    const [errores, setErrores] = useState({
        nombre: '',
        servicios: ''
    })

    // Cargar datos iniciales
    useEffect(() => {
        async function cargarDatos() {
            try {
                setLoading(true)

                // Cargar tipo de evento
                const tipoEvento = await obtenerTipoEvento(eventoTipoId)
                setEventoTipo(tipoEvento?.nombre || '')

                // Cargar condiciones comerciales y métodos de pago
                const [condiciones, metodos] = await Promise.all([
                    obtenerCondicionesComercialesActivas(),
                    obtenerMetodosPago()
                ])
                setCondicionesComerciales(condiciones)
                setMetodosPago(metodos)

                // Si viene de un paquete, precarga datos
                if (paqueteId) {
                    const [paquete, serviciosPaquete] = await Promise.all([
                        obtenerPaquete(paqueteId),
                        cargarServiciosDePaquete(paqueteId)
                    ])

                    if (paquete) {
                        setPaqueteBase({ nombre: paquete.nombre })
                        setNombreCotizacion(`Cotización ${paquete.nombre}`)
                        setServiciosWishlist(serviciosPaquete) // ✅ Wishlist precargada con datos congelados
                    }
                }

            } catch (error) {
                console.error('Error cargando datos:', error)
                toast.error('Error cargando datos iniciales')
            } finally {
                setLoading(false)
            }
        }

        cargarDatos()
    }, [eventoTipoId, paqueteId])

    // Recalcular totales cuando cambia la wishlist
    useEffect(() => {
        const subtotal = serviciosWishlist.reduce((sum, s) => sum + s.subtotal, 0)
        const cantidad = serviciosWishlist.reduce((sum, s) => sum + s.cantidad, 0)
        const costoTotal = serviciosWishlist.reduce((sum, s) => sum + (s.costo * s.cantidad), 0)
        const utilidadBruta = subtotal - costoTotal
        const margenPorcentaje = subtotal > 0 ? (utilidadBruta / subtotal) * 100 : 0

        setTotales({
            subtotal,
            total: subtotal, // Por ahora sin descuentos
            cantidad,
            costoTotal,
            utilidadBruta,
            margenPorcentaje
        })
    }, [serviciosWishlist])

    // Actualizar métodos de pago disponibles cuando cambia la condición comercial
    useEffect(() => {
        if (condicionSeleccionada) {
            const condicion = condicionesComerciales.find(c => c.id === condicionSeleccionada)
            if (condicion?.metodosPago) {
                setMetodosDisponibles(condicion.metodosPago)
            } else {
                setMetodosDisponibles(metodosPago)
            }
        } else {
            setMetodosDisponibles(metodosPago)
        }
    }, [condicionSeleccionada, condicionesComerciales, metodosPago])

    // Manejar cambios en servicios de la wishlist
    const handleServicioChange = (servicioActualizado: ServicioCongelado) => {
        setServiciosWishlist(prev =>
            prev.map(s =>
                s.servicioId === servicioActualizado.servicioId
                    ? {
                        ...servicioActualizado,
                        subtotal: servicioActualizado.precioUnitario * servicioActualizado.cantidad
                    }
                    : s
            )
        )
    }

    // Agregar servicio desde catálogo
    const handleAgregarServicio = (servicio: any) => {
        const servicioCongelado: ServicioCongelado = {
            servicioId: servicio.id,
            servicioCategoriaId: servicio.servicioCategoriaId,
            nombre: servicio.nombre,
            precioUnitario: servicio.precio_publico || 0,
            costo: servicio.costo || 0,
            cantidad: 1,
            subtotal: servicio.precio_publico || 0
        }

        setServiciosWishlist(prev => [...prev, servicioCongelado])
    }

    // Eliminar servicio de wishlist
    const handleEliminarServicio = (servicioId: string) => {
        setServiciosWishlist(prev => prev.filter(s => s.servicioId !== servicioId))
    }

    // Funciones de compartir
    const copiarLink = async () => {
        if (!cotizacionId) {
            toast.error('Guarda la cotización primero')
            return
        }

        const link = `${window.location.origin}/cotizacion/${cotizacionId}`
        await navigator.clipboard.writeText(link)
        toast.success('Link copiado al portapapeles')
    }

    const compartirWhatsApp = () => {
        if (!cotizacionId) {
            toast.error('Guarda la cotización primero')
            return
        }

        const link = `${window.location.origin}/cotizacion/${cotizacionId}`
        const mensaje = `Hola! Te comparto la cotización "${nombreCotizacion}" con un total de $${totales.total.toLocaleString()}: ${link}`
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(mensaje)}`
        window.open(whatsappUrl, '_blank')
    }

    // Simulador de métodos de pago
    const simularPago = (metodo: any, monto: number) => {
        const comisionPorcentaje = metodo.comision_porcentaje_base || 0
        const comisionFija = metodo.comision_fija_monto || 0
        const comisionTotal = (monto * comisionPorcentaje / 100) + comisionFija
        const montoFinal = monto + comisionTotal

        return {
            monto,
            comision: comisionTotal,
            total: montoFinal,
            msi: metodo.num_msi || 0
        }
    }

    // Validar formulario
    const validarFormulario = (): boolean => {
        const nuevosErrores = { nombre: '', servicios: '' }

        if (!nombreCotizacion.trim()) {
            nuevosErrores.nombre = 'El nombre es requerido'
        }

        if (serviciosWishlist.length === 0) {
            nuevosErrores.servicios = 'Debe agregar al menos un servicio'
        }

        setErrores(nuevosErrores)
        return !nuevosErrores.nombre && !nuevosErrores.servicios
    }

    // Guardar cotización
    const handleGuardar = async () => {
        if (!validarFormulario()) {
            toast.error('Corrige los errores antes de guardar')
            return
        }

        try {
            setGuardando(true)

            const resultado = await crearCotizacionCongelada({
                eventoId,
                eventoTipoId,
                nombre: nombreCotizacion,
                servicios: serviciosWishlist,
                condicionesComercialesId: condicionSeleccionada || undefined
            })

            setCotizacionId(resultado.cotizacion.id)
            toast.success('Cotización creada exitosamente')

            // Redirigir al detalle de la cotización
            router.push(`/admin/dashboard/eventos/${eventoId}/cotizacion/${resultado.cotizacion.id}`)

        } catch (error) {
            console.error('Error guardando cotización:', error)
            toast.error('Error al crear la cotización')
        } finally {
            setGuardando(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-2">Nueva Cotización</h1>
                        <p className="text-zinc-400">
                            {eventoTipo}
                            {paqueteBase && (
                                <span className="flex items-center gap-2 mt-1">
                                    <Package size={16} />
                                    Basada en: {paqueteBase.nombre}
                                </span>
                            )}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Acciones de compartir (solo si ya está guardada) */}
                        {cotizacionId && (
                            <>
                                <button
                                    onClick={copiarLink}
                                    className="flex items-center gap-2 px-3 py-2 bg-zinc-700 text-white rounded-md hover:bg-zinc-600 text-sm"
                                >
                                    <Copy size={16} />
                                    Copiar Link
                                </button>
                                <button
                                    onClick={compartirWhatsApp}
                                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                                >
                                    <MessageCircle size={16} />
                                    WhatsApp
                                </button>
                            </>
                        )}

                        <button
                            onClick={() => router.back()}
                            className="p-2 text-zinc-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Columna 1: Información, Condiciones y Resumen (como en Paquetes) */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Información básica */}
                    <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Información</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Nombre de la Cotización
                                </label>
                                <input
                                    type="text"
                                    value={nombreCotizacion}
                                    onChange={(e) => setNombreCotizacion(e.target.value)}
                                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-blue-500"
                                    placeholder="Nombre descriptivo"
                                />
                                {errores.nombre && (
                                    <p className="text-red-400 text-sm mt-1">{errores.nombre}</p>
                                )}
                            </div>

                            {condicionesComerciales.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                                        Condición Comercial
                                    </label>
                                    <select
                                        value={condicionSeleccionada}
                                        onChange={(e) => setCondicionSeleccionada(e.target.value)}
                                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="">Sin condición especial</option>
                                        {condicionesComerciales.map(condicion => (
                                            <option key={condicion.id} value={condicion.id}>
                                                {condicion.nombre}
                                                {condicion.descuento > 0 && ` (-${condicion.descuento}%)`}
                                            </option>
                                        ))}
                                    </select>
                                    {condicionSeleccionada && (
                                        <div className="mt-2 text-sm text-zinc-400">
                                            {(() => {
                                                const condicion = condicionesComerciales.find(c => c.id === condicionSeleccionada)
                                                return condicion ? (
                                                    <div className="space-y-1">
                                                        {condicion.descuento > 0 && (
                                                            <p>• Descuento: {condicion.descuento}%</p>
                                                        )}
                                                        {condicion.porcentaje_anticipo > 0 && (
                                                            <p>• Anticipo: {condicion.porcentaje_anticipo}%</p>
                                                        )}
                                                    </div>
                                                ) : null
                                            })()}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Información del Paquete Base (si aplica) */}
                    {paqueteBase && (
                        <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                            <h4 className="text-blue-300 font-medium mb-2 flex items-center gap-2">
                                <Package size={16} />
                                Basada en Paquete
                            </h4>
                            <p className="text-blue-200 text-sm">{paqueteBase.nombre}</p>
                            <p className="text-blue-400 text-xs mt-1">
                                Los precios están congelados al momento de crear la cotización
                            </p>
                        </div>
                    )}

                    {/* Resumen de precios (estilo paquetes) */}
                    <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Resumen</h3>
                            <button
                                onClick={() => setMostrarUtilidades(!mostrarUtilidades)}
                                className="text-xs px-2 py-1 bg-zinc-700 text-zinc-300 rounded hover:bg-zinc-600"
                            >
                                <TrendingUp size={12} className="inline mr-1" />
                                {mostrarUtilidades ? 'Ocultar' : 'Ver'} Utilidad
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-zinc-300">
                                <span>Servicios:</span>
                                <span>{totales.cantidad}</span>
                            </div>
                            <div className="flex justify-between text-zinc-300">
                                <span>Subtotal:</span>
                                <span>${totales.subtotal.toLocaleString()}</span>
                            </div>

                            {/* Utilidades estratégicas (ocultas por defecto) */}
                            {mostrarUtilidades && (
                                <div className="border-t border-zinc-700 pt-3 space-y-2">
                                    <div className="flex justify-between text-orange-400 text-sm">
                                        <span>Costo Total:</span>
                                        <span>${totales.costoTotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-green-400 text-sm">
                                        <span>Utilidad Bruta:</span>
                                        <span>${totales.utilidadBruta.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-green-400 text-sm">
                                        <span>Margen:</span>
                                        <span>{totales.margenPorcentaje.toFixed(1)}%</span>
                                    </div>
                                </div>
                            )}

                            <div className="border-t border-zinc-700 pt-3">
                                <div className="flex justify-between text-white font-semibold">
                                    <span>Total:</span>
                                    <span>${totales.total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {errores.servicios && (
                            <p className="text-red-400 text-sm mt-4">{errores.servicios}</p>
                        )}
                    </div>

                    {/* Simulador de Métodos de Pago compacto */}
                    {metodosDisponibles.length > 0 && totales.total > 0 && (
                        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
                            <h4 className="text-sm font-medium text-white mb-3">Simulación de Pagos</h4>
                            <div className="space-y-2">
                                {metodosDisponibles.slice(0, 3).map((metodo, index) => {
                                    const condicion = condicionSeleccionada ?
                                        condicionesComerciales.find(c => c.id === condicionSeleccionada) :
                                        undefined

                                    // Cálculo simplificado para la vista compacta
                                    let montoFinal = totales.total
                                    if (condicion && condicion.descuento > 0) {
                                        montoFinal = totales.total * (1 - condicion.descuento / 100)
                                    }

                                    const comision = (montoFinal * (metodo.comision_porcentaje_base || 0) / 100) + (metodo.comision_fija_monto || 0)
                                    const totalConComision = montoFinal + comision

                                    return (
                                        <div key={metodo.id || index} className="flex items-center justify-between p-2 bg-zinc-800 rounded text-xs">
                                            <div className="flex items-center gap-2">
                                                <CreditCard size={12} className="text-zinc-400" />
                                                <span className="text-white">{metodo.metodo_pago}</span>
                                                {metodo.num_msi > 0 && (
                                                    <span className="text-xs px-1 py-0.5 bg-blue-600 text-white rounded">
                                                        {metodo.num_msi} MSI
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-white font-medium">
                                                ${totalConComision.toLocaleString()}
                                            </span>
                                        </div>
                                    )
                                })}
                                {metodosDisponibles.length > 3 && (
                                    <p className="text-zinc-400 text-xs mt-2">
                                        +{metodosDisponibles.length - 3} métodos más...
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Acciones */}
                    <div className="space-y-3">
                        {!cotizacionId ? (
                            <button
                                onClick={handleGuardar}
                                disabled={guardando || serviciosWishlist.length === 0}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {guardando ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        Crear Cotización
                                    </>
                                )}
                            </button>
                        ) : (
                            <div className="space-y-2">
                                <button
                                    onClick={copiarLink}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-700 text-white rounded-md hover:bg-zinc-600"
                                >
                                    <Copy size={16} />
                                    Copiar Link
                                </button>
                                <button
                                    onClick={compartirWhatsApp}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
                                >
                                    <MessageCircle size={16} />
                                    Compartir por WhatsApp
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => router.back()}
                            className="w-full px-4 py-3 bg-zinc-700 text-white rounded-md hover:bg-zinc-600"
                        >
                            {cotizacionId ? 'Cerrar' : 'Cancelar'}
                        </button>
                    </div>
                </div>

                {/* Columnas 2-4: Lista de Servicios Wishlist (3 columnas como en paquetes) */}
                <div className="lg:col-span-3">
                    <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-white">
                                Servicios Seleccionados
                                {serviciosWishlist.length > 0 && (
                                    <span className="text-zinc-400 text-lg ml-2">
                                        ({serviciosWishlist.length} servicios)
                                    </span>
                                )}
                            </h2>

                            {serviciosWishlist.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setVistaWishlist('nested')}
                                        className={`px-3 py-2 text-sm rounded ${vistaWishlist === 'nested'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                                            }`}
                                    >
                                        Vista Agrupada
                                    </button>
                                    <button
                                        onClick={() => setVistaWishlist('tabla')}
                                        className={`px-3 py-2 text-sm rounded ${vistaWishlist === 'tabla'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                                            }`}
                                    >
                                        Vista Tabla
                                    </button>
                                </div>
                            )}
                        </div>

                        {serviciosWishlist.length === 0 ? (
                            <div className="text-center py-12 text-zinc-500">
                                <Calculator size={64} className="mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-medium mb-2">No hay servicios seleccionados</h3>
                                <p className="text-sm">Agrega servicios desde el catálogo en la siguiente columna</p>
                            </div>
                        ) : (
                            <>
                                {vistaWishlist === 'nested' ? (
                                    <WishlistNestedCongelada
                                        servicios={serviciosWishlist}
                                        onServicioChange={handleServicioChange}
                                        onEliminarServicio={handleEliminarServicio}
                                        mostrarUtilidades={mostrarUtilidades}
                                    />
                                ) : (
                                    <WishlistCongelada
                                        servicios={serviciosWishlist}
                                        onServicioChange={handleServicioChange}
                                        onEliminarServicio={handleEliminarServicio}
                                        mostrarUtilidades={mostrarUtilidades}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Columna 5: Catálogo de Servicios y Simulador Detallado */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Catálogo de Servicios */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Agregar Servicios</h3>
                        <ListaServicios
                            eventoTipoId={eventoTipoId}
                            onAgregarServicio={handleAgregarServicio}
                            serviciosExcluidos={serviciosWishlist.map(s => s.servicioId)}
                        />
                    </div>

                    {/* Simulador de Métodos de Pago Detallado */}
                    {metodosDisponibles.length > 0 && totales.total > 0 && (
                        <SimuladorMetodosPago
                            metodosPago={metodosDisponibles}
                            montoBase={totales.total}
                            condicionComercial={condicionSeleccionada ?
                                condicionesComerciales.find(c => c.id === condicionSeleccionada) :
                                undefined
                            }
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
