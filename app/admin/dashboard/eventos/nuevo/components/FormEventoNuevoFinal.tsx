'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import Cookies from 'js-cookie'
import {
    Search,
    Phone,
    Mail,
    Plus,
    Check,
    AlertCircle,
    Loader2,
    ExternalLink
} from 'lucide-react'

// Actions y tipos
import { obtenerTiposEventoLegacy as obtenerTiposEvento } from '@/app/admin/_lib/actions/eventoTipo/eventoTipo.actions'
import { obtenerCanalesLegacy as obtenerCanales } from '@/app/admin/_lib/actions/canal/canal.actions'
import { crearBitacoraEventoLegacy as crearBitacoraEvento } from '@/app/admin/_lib/actions/evento/bitacora.actions'
import {
    buscarClientes,
    crearEventoCompleto,
    validarDisponibilidadFecha
} from '@/app/admin/_lib/actions/evento/crearEventoCompleto/crearEventoCompleto.actions'
import { type DisponibilidadFecha } from '@/app/admin/_lib/actions/evento/crearEventoCompleto/crearEventoCompleto.schemas'

// UI Components
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'

interface TipoEvento {
    id: string
    nombre: string
}

interface Canal {
    id: string
    nombre: string
    posicion: number
}

interface ClienteBusqueda {
    id: string
    nombre: string
    telefono: string | null
    email?: string | null
    status: string
    Canal?: { nombre: string } | null
}

export default function FormEventoNuevoFinal() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Estados
    const [tiposEvento, setTiposEvento] = useState<TipoEvento[]>([])
    const [canales, setCanales] = useState<Canal[]>([])
    const [clientesBusqueda, setClientesBusqueda] = useState<ClienteBusqueda[]>([])
    const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteBusqueda | null>(null)
    const [mostrarBusqueda, setMostrarBusqueda] = useState(false)
    const [mostrarFormCliente, setMostrarFormCliente] = useState(false)
    const [busquedaQuery, setBusquedaQuery] = useState('')
    const [cargandoBusqueda, setCargandoBusqueda] = useState(false)
    const [disponibilidadFecha, setDisponibilidadFecha] = useState<DisponibilidadFecha | null>(null)
    const [validandoFecha, setValidandoFecha] = useState(false)
    const [mostrarAutorizacion, setMostrarAutorizacion] = useState(false)
    const [codigoAutorizacion, setCodigoAutorizacion] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [fechaTentativa, setFechaTentativa] = useState(false)

    // Form data
    const [formData, setFormData] = useState({
        eventoTipoId: '',
        nombre: '',
        fecha_evento: '',
        clienteNombre: '',
        clienteTelefono: '',
        clienteEmail: '',
        clienteCanalId: ''
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        cargarTiposEvento()
        cargarCanales()

        // Si viene clienteId por URL
        const clienteId = searchParams?.get('clienteId')
        if (clienteId) {
            buscarClientes(clienteId).then(clientes => {
                const cliente = clientes.find(c => c.id === clienteId)
                if (cliente) {
                    setClienteSeleccionado(cliente)
                }
            })
        }
    }, [searchParams])

    // Validar fecha cuando cambie
    useEffect(() => {
        if (formData.fecha_evento) {
            validarFecha()
        }
    }, [formData.fecha_evento])

    const cargarTiposEvento = async () => {
        try {
            const tipos = await obtenerTiposEvento()
            setTiposEvento(tipos)
        } catch (error) {
            toast.error('Error al cargar tipos de evento')
        }
    }

    const cargarCanales = async () => {
        try {
            const canalesData = await obtenerCanales()
            setCanales(canalesData)
        } catch (error) {
            toast.error('Error al cargar canales')
        }
    }

    const buscarClientesDebounced = React.useMemo(() => {
        let timeoutId: NodeJS.Timeout | null = null

        return (query: string) => {
            if (timeoutId) {
                clearTimeout(timeoutId)
            }

            if (query.length < 2) {
                setClientesBusqueda([])
                setCargandoBusqueda(false)
                return
            }

            setCargandoBusqueda(true)

            timeoutId = setTimeout(async () => {
                try {
                    console.log('Buscando clientes con query:', query)
                    const clientes = await buscarClientes(query)
                    console.log('Clientes encontrados:', clientes)
                    setClientesBusqueda(clientes)
                } catch (error) {
                    console.error('Error al buscar clientes:', error)
                    toast.error('Error al buscar clientes')
                    setClientesBusqueda([])
                } finally {
                    setCargandoBusqueda(false)
                }
            }, 300)
        }
    }, [])

    const validarFecha = async () => {
        if (!formData.fecha_evento) return

        setValidandoFecha(true)
        try {
            const validacionData = {
                fecha_evento: new Date(formData.fecha_evento),
                permitirDuplicada: false
            }

            const resultado = await validarDisponibilidadFecha(validacionData)

            console.log('Resultado disponibilidad:', resultado)

            setDisponibilidadFecha(resultado)

            if (!resultado.disponible) {
                console.log('Fecha no disponible, conflictos:', resultado.conflictos)
                setMostrarAutorizacion(true)
            } else {
                setMostrarAutorizacion(false)
            }
        } catch (error) {
            toast.error('Error al validar fecha')
        } finally {
            setValidandoFecha(false)
        }
    }

    const handleBusquedaChange = (query: string) => {
        console.log('handleBusquedaChange llamado con:', query)
        setBusquedaQuery(query)
        buscarClientesDebounced(query)
    }

    const handleSeleccionarCliente = (cliente: ClienteBusqueda) => {
        setClienteSeleccionado(cliente)
        setMostrarBusqueda(false)
        setBusquedaQuery('')
        setMostrarFormCliente(false)
    }

    const handleCrearClienteNuevo = () => {
        setMostrarFormCliente(true)
        setMostrarBusqueda(false)
        setClienteSeleccionado(null)
    }

    const handleLimpiarCliente = () => {
        setClienteSeleccionado(null)
        setMostrarFormCliente(false)
        setMostrarBusqueda(true)
    }

    const handleVerEvento = (eventoId: string) => {
        const url = `/admin/dashboard/eventos/${eventoId}`
        window.open(url, '_blank', 'noopener,noreferrer')
    }

    const handleInputChange = (field: string, value: string) => {
        let formattedValue = value

        // Aplicar formatos específicos según el campo
        switch (field) {
            case 'clienteNombre':
                // Convertir a camelCase (primera letra mayúscula, el resto en minúscula de cada palabra)
                formattedValue = value.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
                break

            case 'clienteTelefono':
                // Solo números y tomar los últimos 10 dígitos
                const numbersOnly = value.replace(/\D/g, '')
                formattedValue = numbersOnly.slice(-10)
                break

            case 'clienteEmail':
                // Todo en minúscula
                formattedValue = value.toLowerCase()
                break

            default:
                // Para otros campos no aplicar formato
                formattedValue = value
        }

        setFormData(prev => ({ ...prev, [field]: formattedValue }))

        // Limpiar error del campo
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.eventoTipoId) {
            newErrors.eventoTipoId = 'Tipo de evento es requerido'
        }
        if (!formData.nombre) {
            newErrors.nombre = 'Nombre del evento es requerido'
        }
        if (!formData.fecha_evento) {
            newErrors.fecha_evento = 'Fecha del evento es requerida'
        }

        // Validar cliente
        if (!clienteSeleccionado && mostrarFormCliente) {
            if (!formData.clienteNombre) {
                newErrors.clienteNombre = 'Nombre del cliente es requerido'
            }
            if (!formData.clienteTelefono) {
                newErrors.clienteTelefono = 'Teléfono del cliente es requerido'
            }
            if (!formData.clienteCanalId) {
                newErrors.clienteCanalId = 'Canal de adquisición es requerido'
            }
        } else if (!clienteSeleccionado && !mostrarFormCliente) {
            newErrors.cliente = 'Debe seleccionar o crear un cliente'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsSubmitting(true)

        try {
            // Obtener usuario de cookies
            const userData = Cookies.get('user')
            const user = userData ? JSON.parse(userData) : null

            const submitData = {
                eventoTipoId: formData.eventoTipoId,
                nombre: formData.nombre,
                fecha_evento: new Date(formData.fecha_evento),
                userId: user?.id,
                permitirFechaDuplicada: mostrarAutorizacion && !!codigoAutorizacion,
                codigoAutorizacion: mostrarAutorizacion ? codigoAutorizacion : undefined,
                fechaTentativa,
                clienteId: clienteSeleccionado?.id,
                clienteNuevo: !clienteSeleccionado && mostrarFormCliente ? {
                    nombre: formData.clienteNombre,
                    telefono: formData.clienteTelefono,
                    email: formData.clienteEmail || null,
                    canalId: formData.clienteCanalId || null
                } : undefined
            }

            const resultado = await crearEventoCompleto(submitData)

            if (resultado.success) {
                // Si es fecha tentativa, agregar entrada en la bitácora
                if (fechaTentativa && resultado.eventoId) {
                    try {
                        await crearBitacoraEvento(
                            resultado.eventoId,
                            '⚠️ FECHA TENTATIVA - La fecha del evento no está confirmada y puede cambiar'
                        )
                    } catch (error) {
                        console.error('Error al crear entrada de bitácora:', error)
                        // No interrumpir el flujo si falla la bitácora
                    }
                }

                toast.success(resultado.message || 'Evento creado exitosamente')
                router.push(`/admin/dashboard/eventos/${resultado.eventoId}`)
            } else {
                toast.error(resultado.error || 'Error al crear evento')
            }
        } catch (error) {
            toast.error('Error inesperado al crear evento')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="bg-zinc-900 rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold text-zinc-200 mb-6 flex items-center gap-2">
                    <Plus className="w-6 h-6" />
                    Crear Nuevo Evento
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Sección Cliente */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-zinc-300 border-b border-zinc-700 pb-2">
                            Cliente
                        </h3>

                        {clienteSeleccionado ? (
                            <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                                <div>
                                    <p className="text-zinc-200 font-medium">{clienteSeleccionado.nombre}</p>
                                    <p className="text-zinc-400 text-sm flex items-center gap-1">
                                        <Phone className="w-3 h-3" />
                                        {clienteSeleccionado.telefono || 'Sin teléfono'}
                                    </p>
                                    {clienteSeleccionado.email && (
                                        <p className="text-zinc-400 text-sm flex items-center gap-1">
                                            <Mail className="w-3 h-3" />
                                            {clienteSeleccionado.email}
                                        </p>
                                    )}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleLimpiarCliente}
                                >
                                    Cambiar
                                </Button>
                            </div>
                        ) : mostrarFormCliente ? (
                            <div className="space-y-4 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                                <h4 className="text-zinc-300 font-medium">Nuevo Cliente</h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-1">
                                            Nombre *
                                        </label>
                                        <Input
                                            value={formData.clienteNombre}
                                            onChange={(e) => handleInputChange('clienteNombre', e.target.value)}
                                            className="bg-zinc-900 border-zinc-700"
                                            placeholder="Nombre completo"
                                        />
                                        {errors.clienteNombre && (
                                            <p className="text-red-400 text-sm mt-1">{errors.clienteNombre}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-1">
                                            Teléfono *
                                        </label>
                                        <Input
                                            value={formData.clienteTelefono}
                                            onChange={(e) => handleInputChange('clienteTelefono', e.target.value)}
                                            className="bg-zinc-900 border-zinc-700"
                                            placeholder="5551234567"
                                        />
                                        {errors.clienteTelefono && (
                                            <p className="text-red-400 text-sm mt-1">{errors.clienteTelefono}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">
                                        Email
                                    </label>
                                    <Input
                                        type="email"
                                        value={formData.clienteEmail}
                                        onChange={(e) => handleInputChange('clienteEmail', e.target.value)}
                                        className="bg-zinc-900 border-zinc-700"
                                        placeholder="cliente@email.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">
                                        Canal de Adquisición *
                                    </label>
                                    <select
                                        value={formData.clienteCanalId}
                                        onChange={(e) => handleInputChange('clienteCanalId', e.target.value)}
                                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-zinc-200"
                                    >
                                        <option value="">Seleccionar canal</option>
                                        {canales.map((canal) => (
                                            <option key={canal.id} value={canal.id}>
                                                {canal.nombre}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.clienteCanalId && (
                                        <p className="text-red-400 text-sm mt-1">{errors.clienteCanalId}</p>
                                    )}
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setMostrarBusqueda(true)}
                                >
                                    Buscar cliente existente
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {mostrarBusqueda ? (
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                                            <Input
                                                className="pl-10 bg-zinc-800 border-zinc-700"
                                                placeholder="Buscar por nombre o teléfono..."
                                                value={busquedaQuery}
                                                onChange={(e) => handleBusquedaChange(e.target.value)}
                                            />
                                        </div>

                                        {cargandoBusqueda && (
                                            <div className="flex items-center justify-center p-4">
                                                <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                                            </div>
                                        )}

                                        {clientesBusqueda.length > 0 && (
                                            <>
                                                <p className="text-xs text-zinc-500 mb-2">
                                                    {clientesBusqueda.length} cliente(s) encontrado(s)
                                                </p>
                                                <div className="max-h-60 overflow-y-auto bg-zinc-800 border border-zinc-700 rounded-lg">
                                                    {clientesBusqueda.map((cliente) => (
                                                        <button
                                                            key={cliente.id}
                                                            type="button"
                                                            onClick={() => handleSeleccionarCliente(cliente)}
                                                            className="w-full p-3 text-left hover:bg-zinc-700 border-b border-zinc-700 last:border-b-0"
                                                        >
                                                            <p className="text-zinc-200 font-medium">{cliente.nombre}</p>
                                                            <p className="text-zinc-400 text-sm">{cliente.telefono || 'Sin teléfono'}</p>
                                                            {cliente.Canal && (
                                                                <p className="text-zinc-500 text-xs">{cliente.Canal.nombre}</p>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}

                                        {!cargandoBusqueda && busquedaQuery.length >= 2 && clientesBusqueda.length === 0 && (
                                            <div className="p-4 text-center text-zinc-500">
                                                No se encontraron clientes con "{busquedaQuery}"
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleCrearClienteNuevo}
                                                className="flex-1"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Crear nuevo cliente
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setMostrarBusqueda(true)}
                                        className="w-full"
                                    >
                                        <Search className="w-4 h-4 mr-2" />
                                        Buscar o crear cliente
                                    </Button>
                                )}
                            </div>
                        )}

                        {errors.cliente && (
                            <p className="text-red-400 text-sm">{errors.cliente}</p>
                        )}
                    </div>

                    {/* Sección Evento */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-zinc-300 border-b border-zinc-700 pb-2">
                            Información del Evento
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">
                                    Tipo de Evento *
                                </label>
                                <select
                                    value={formData.eventoTipoId}
                                    onChange={(e) => handleInputChange('eventoTipoId', e.target.value)}
                                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-200"
                                >
                                    <option value="">Seleccionar tipo</option>
                                    {tiposEvento.map((tipo) => (
                                        <option key={tipo.id} value={tipo.id}>
                                            {tipo.nombre}
                                        </option>
                                    ))}
                                </select>
                                {errors.eventoTipoId && (
                                    <p className="text-red-400 text-sm mt-1">{errors.eventoTipoId}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">
                                    Fecha del Evento *
                                </label>
                                <Input
                                    type="date"
                                    value={formData.fecha_evento}
                                    onChange={(e) => handleInputChange('fecha_evento', e.target.value)}
                                    className="bg-zinc-800 border-zinc-700"
                                />
                                {errors.fecha_evento && (
                                    <p className="text-red-400 text-sm mt-1">{errors.fecha_evento}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">
                                Nombre del Evento *
                            </label>
                            <Input
                                value={formData.nombre}
                                onChange={(e) => handleInputChange('nombre', e.target.value)}
                                className="bg-zinc-800 border-zinc-700"
                                placeholder="Ej: Boda María & Juan"
                            />
                            {errors.nombre && (
                                <p className="text-red-400 text-sm mt-1">{errors.nombre}</p>
                            )}
                        </div>

                        {/* Checkbox para fecha tentativa */}
                        <div className={`p-3 rounded-lg border transition-all ${fechaTentativa
                            ? 'bg-amber-900/20 border-amber-800'
                            : 'bg-zinc-800/50 border-zinc-700'
                            }`}>
                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    id="fechaTentativa"
                                    checked={fechaTentativa}
                                    onChange={(e) => setFechaTentativa(e.target.checked)}
                                    className="w-4 h-4 text-amber-600 bg-zinc-800 border-zinc-700 rounded focus:ring-amber-500 focus:ring-2"
                                />
                                <div className="flex-1">
                                    <label htmlFor="fechaTentativa" className={`text-sm font-medium cursor-pointer ${fechaTentativa ? 'text-amber-300' : 'text-zinc-300'
                                        }`}>
                                        📅 Fecha tentativa (no confirmada)
                                    </label>
                                    {fechaTentativa && (
                                        <p className="text-xs text-amber-400 mt-1">
                                            ⚠️ Se agregará un comentario en la bitácora indicando que la fecha puede cambiar
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Validación de fecha */}
                        {validandoFecha && (
                            <div className="flex items-center gap-2 text-zinc-400">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Validando disponibilidad...
                            </div>
                        )}

                        {disponibilidadFecha && !disponibilidadFecha.disponible && (
                            <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
                                <div className="flex items-center gap-2 text-red-400 mb-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Fecha no disponible
                                </div>

                                {disponibilidadFecha.conflictos && (
                                    <div className="space-y-3">
                                        <p className="text-sm text-red-300">Agenda ocupada en esta fecha:</p>
                                        {(() => {
                                            console.log('Renderizando conflictos:', disponibilidadFecha.conflictos)
                                            return disponibilidadFecha.conflictos.map((conflicto) => (
                                                <div key={conflicto.id} className="p-3 bg-red-900/30 rounded border border-red-700">
                                                    <div className="flex justify-between items-start">
                                                        <div className="text-sm text-red-200 flex-1">
                                                            <div className="font-medium">
                                                                📅 {conflicto.nombre} - {conflicto.cliente}
                                                            </div>
                                                            {conflicto.concepto && (
                                                                <div className="text-red-300 mt-1">
                                                                    📋 {conflicto.concepto}
                                                                </div>
                                                            )}
                                                            {conflicto.hora && (
                                                                <div className="text-red-300 mt-1">
                                                                    🕐 {conflicto.hora}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleVerEvento(conflicto.id)}
                                                            className="ml-3 shrink-0 h-8 px-2 text-xs border-red-600 text-red-300 hover:bg-red-900/50"
                                                        >
                                                            <ExternalLink className="w-3 h-3 mr-1" />
                                                            Ver
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        })()}
                                    </div>
                                )}

                                {mostrarAutorizacion && (
                                    <div className="mt-4 space-y-2">
                                        <Input
                                            type="password"
                                            placeholder="Código de autorización"
                                            value={codigoAutorizacion}
                                            onChange={(e) => setCodigoAutorizacion(e.target.value)}
                                            className="bg-zinc-800 border-zinc-700"
                                        />
                                        <p className="text-xs text-red-300">
                                            Ingrese código de autorización para permitir fecha duplicada
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {disponibilidadFecha?.disponible && (
                            <div className="flex items-center gap-2 text-green-400">
                                <Check className="w-4 h-4" />
                                Fecha disponible
                            </div>
                        )}
                    </div>

                    {/* Botones */}
                    <div className="flex gap-4 pt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            className="flex-1"
                        >
                            Cancelar
                        </Button>

                        <Button
                            type="submit"
                            disabled={
                                isSubmitting ||
                                (disponibilidadFecha && !disponibilidadFecha.disponible && !codigoAutorizacion) ||
                                (!clienteSeleccionado && !mostrarFormCliente) ||
                                !formData.eventoTipoId
                            }
                            className="flex-1"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creando...
                                </>
                            ) : (
                                'Crear Evento'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
