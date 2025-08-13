'use client'

import React, { useState, useTransition, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Textarea } from '@/app/components/ui/textarea'
import { format } from 'date-fns'
import { Pen, Save, X, PlusCircle, MinusCircle } from 'lucide-react'
import toast from 'react-hot-toast'

// Importar actions
import { obtenerEventoPorId } from '@/app/admin/_lib/evento.actions'
import { obtenerPaquete } from '@/app/admin/_lib/actions/paquetes/paquetes.actions'
import { obtenerServiciosConRelaciones } from '@/app/admin/_lib/servicio.actions'
import { obtenerConfiguracionActiva } from '@/app/admin/_lib/configuracion.actions'
import { crearCotizacionCongelada, congelarDatosServicios, type ServicioCongelado as ServicioCongeladoBase } from '@/app/admin/_lib/cotizacion.congelada.actions'
import { calcularServicioDesdeBase, type ServicioBaseDatos } from '@/app/admin/_lib/pricing/calculos'

// Extender la interfaz base para incluir descripción
interface ServicioCongelado extends ServicioCongeladoBase {
    descripcion?: string | null;
}

// Interfaces
interface ServicioDisponible {
    id: string
    nombre: string
    descripcion?: string | null
    precio_publico: number
    costo: number
    gasto: number
    utilidad: number
    tipo_utilidad: 'servicio' | 'producto'
    posicion: number
    ServicioCategoria: {
        id: string
        nombre: string
        posicion: number
        seccionCategoria?: {
            Seccion: {
                id: string
                nombre: string
                posicion: number
            }
        } | null
    }
}interface Props {
    eventoId: string
    eventoTipoId: string
    paqueteId?: string
}

// Schema de validación
const formSchema = z.object({
    nombre: z.string().min(1, "El nombre es requerido"),
    observaciones: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function FormCotizacionCongelada({ eventoId, eventoTipoId, paqueteId }: Props) {
    const [isPending, startTransition] = useTransition()
    const [loading, setLoading] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [isEditingTitle, setIsEditingTitle] = useState(false)
    const [tempTitle, setTempTitle] = useState("")

    // Estados de datos
    const [evento, setEvento] = useState<any>(null)
    const [paquete, setPaquete] = useState<any>(null)
    const [serviciosDisponibles, setServiciosDisponibles] = useState<ServicioDisponible[]>([])
    const [wishlist, setWishlist] = useState<ServicioCongelado[]>([])
    const [configuracion, setConfiguracion] = useState<any>(null)

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nombre: "",
            observaciones: "",
        }
    })

    // Función para calcular precio correcto de un servicio
    const calcularPrecioServicio = (servicio: ServicioDisponible): number => {
        if (!configuracion) return servicio.precio_publico

        try {
            const resultado = calcularServicioDesdeBase({
                costo: servicio.costo,
                gastos: servicio.gasto,
                tipo_utilidad: servicio.tipo_utilidad,
                configuracion
            })
            return resultado.precioSistema
        } catch (error) {
            console.error('Error calculando precio del servicio:', error)
            return servicio.precio_publico
        }
    }

    // Cargar datos iniciales
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true)

                // Cargar configuración activa
                const configData = await obtenerConfiguracionActiva()
                setConfiguracion(configData)

                // Cargar evento
                const eventoData = await obtenerEventoPorId(eventoId)
                setEvento(eventoData)

                // Cargar paquete si existe
                let paqueteData = null
                if (paqueteId) {
                    paqueteData = await obtenerPaquete(paqueteId)
                    setPaquete(paqueteData)
                }

                // Cargar servicios disponibles
                const servicios = await obtenerServiciosConRelaciones()
                // Convertir el tipo de utilidad a los valores esperados
                const serviciosFormateados = servicios.map((servicio: any) => ({
                    ...servicio,
                    tipo_utilidad: servicio.tipo_utilidad === 'servicio' || servicio.tipo_utilidad === 'producto'
                        ? servicio.tipo_utilidad
                        : 'servicio'
                }))
                setServiciosDisponibles(serviciosFormateados)

                // Configurar nombre inicial
                const nombreInicial = paqueteData
                    ? `Cotización ${paqueteData.nombre} - ${eventoData?.Cliente?.nombre || 'Cliente'}`
                    : `Cotización ${eventoData?.EventoTipo?.nombre || 'Evento'} - ${eventoData?.Cliente?.nombre || 'Cliente'}`

                form.setValue('nombre', nombreInicial)

                // Si hay paquete, cargar servicios congelados
                if (paqueteData && paqueteData.PaqueteServicio) {
                    const serviciosCongelados = await congelarDatosServicios(
                        paqueteData.PaqueteServicio.map((ps: any) => ({ servicioId: ps.servicioId, cantidad: ps.cantidad }))
                    )
                    setWishlist(serviciosCongelados)
                }

            } catch (error) {
                console.error('Error cargando datos:', error)
                toast.error('Error al cargar los datos')
            } finally {
                setLoading(false)
            }
        }

        cargarDatos()
    }, [eventoId, eventoTipoId, paqueteId, form])

    // Cálculos de totales
    const subtotal = useMemo(() => {
        return wishlist.reduce((acc, servicio) => acc + servicio.subtotal, 0)
    }, [wishlist])

    const iva = useMemo(() => {
        return subtotal * 0.16
    }, [subtotal])

    const total = useMemo(() => {
        return subtotal + iva
    }, [subtotal, iva])

    // Agrupar wishlist por sección y categoría con ordenamiento por posición
    const wishlistAgrupada = useMemo(() => {
        const grupos: Record<string, Record<string, { servicios: ServicioCongelado[], posicionSeccion: number, posicionCategoria: number }>> = {}

        wishlist.forEach(servicio => {
            // Buscar el servicio original para obtener la categoría
            const servicioOriginal = serviciosDisponibles.find(s => s.id === servicio.servicioId)
            if (!servicioOriginal || !servicioOriginal.ServicioCategoria.seccionCategoria) return

            const seccion = servicioOriginal.ServicioCategoria.seccionCategoria.Seccion.nombre
            const categoria = servicioOriginal.ServicioCategoria.nombre
            const posicionSeccion = servicioOriginal.ServicioCategoria.seccionCategoria.Seccion.posicion
            const posicionCategoria = servicioOriginal.ServicioCategoria.posicion

            if (!grupos[seccion]) {
                grupos[seccion] = {}
            }
            if (!grupos[seccion][categoria]) {
                grupos[seccion][categoria] = {
                    servicios: [],
                    posicionSeccion,
                    posicionCategoria
                }
            }

            grupos[seccion][categoria].servicios.push(servicio)
        })

        // Ordenar servicios dentro de cada categoría por posición
        Object.values(grupos).forEach(categorias => {
            Object.values(categorias).forEach(categoriaData => {
                categoriaData.servicios.sort((a, b) => {
                    const servicioA = serviciosDisponibles.find(s => s.id === a.servicioId)
                    const servicioB = serviciosDisponibles.find(s => s.id === b.servicioId)
                    return (servicioA?.posicion || 0) - (servicioB?.posicion || 0)
                })
            })
        })

        return grupos
    }, [wishlist, serviciosDisponibles])

    // Agrupar servicios disponibles por sección y categoría
    const serviciosAgrupadosDisponibles = useMemo(() => {
        const grupos: Record<string, Record<string, ServicioDisponible[]>> = {}

        serviciosDisponibles.forEach(servicio => {
            // No filtrar servicios - mostrar todos
            if (!servicio.ServicioCategoria.seccionCategoria) return

            const seccion = servicio.ServicioCategoria.seccionCategoria.Seccion.nombre
            const categoria = servicio.ServicioCategoria.nombre

            if (!grupos[seccion]) {
                grupos[seccion] = {}
            }
            if (!grupos[seccion][categoria]) {
                grupos[seccion][categoria] = []
            }

            grupos[seccion][categoria].push(servicio)
        })

        return grupos
    }, [serviciosDisponibles]) // Removido wishlist de dependencias

    const handleEditTitle = () => {
        setTempTitle(form.getValues('nombre'))
        setIsEditingTitle(true)
    }

    const handleSaveTitle = () => {
        form.setValue('nombre', tempTitle)
        setIsEditingTitle(false)
    }

    const handleCancelEdit = () => {
        setTempTitle("")
        setIsEditingTitle(false)
    }

    const agregarServicio = async (servicio: ServicioDisponible) => {
        try {
            // Verificar si el servicio ya está en el wishlist
            const servicioExistente = wishlist.find(w => w.servicioId === servicio.id)

            if (servicioExistente) {
                // Si ya existe, aumentar la cantidad
                aumentarCantidad(servicio.id)
            } else {
                // Calcular precio correcto usando pricing
                const precioCalculado = calcularPrecioServicio(servicio)

                // Crear servicio congelado con precio calculado
                const servicioCongelado: ServicioCongelado = {
                    servicioId: servicio.id,
                    servicioCategoriaId: servicio.ServicioCategoria.id,
                    nombre: servicio.nombre,
                    descripcion: servicio.descripcion,
                    precioUnitario: precioCalculado,
                    costo: servicio.costo,
                    cantidad: 1,
                    subtotal: precioCalculado
                }

                setWishlist(prev => [...prev, servicioCongelado])
            }
        } catch (error) {
            console.error('Error agregando servicio:', error)
            toast.error('Error al agregar el servicio')
        }
    }

    const aumentarCantidad = async (servicioId: string) => {
        try {
            const servicioActual = wishlist.find(s => s.servicioId === servicioId)
            if (!servicioActual) return

            const nuevaCantidad = servicioActual.cantidad + 1
            const nuevoSubtotal = servicioActual.precioUnitario * nuevaCantidad

            setWishlist(prev => prev.map(s =>
                s.servicioId === servicioId
                    ? { ...s, cantidad: nuevaCantidad, subtotal: nuevoSubtotal }
                    : s
            ))
        } catch (error) {
            console.error('Error aumentando cantidad:', error)
            toast.error('Error al aumentar la cantidad')
        }
    }

    const disminuirCantidad = async (servicioId: string) => {
        try {
            const servicioActual = wishlist.find(s => s.servicioId === servicioId)
            if (!servicioActual) return

            if (servicioActual.cantidad <= 1) {
                // Si la cantidad es 1 o menos, eliminar el servicio
                eliminarServicio(servicioId)
            } else {
                const nuevaCantidad = servicioActual.cantidad - 1
                const nuevoSubtotal = servicioActual.precioUnitario * nuevaCantidad

                setWishlist(prev => prev.map(s =>
                    s.servicioId === servicioId
                        ? { ...s, cantidad: nuevaCantidad, subtotal: nuevoSubtotal }
                        : s
                ))
            }
        } catch (error) {
            console.error('Error disminuyendo cantidad:', error)
            toast.error('Error al disminuir la cantidad')
        }
    }

    const eliminarServicio = (servicioId: string) => {
        setWishlist(prev => prev.filter(s => s.servicioId !== servicioId))
    }

    const onSubmit = async (data: FormData) => {
        if (wishlist.length === 0) {
            toast.error('Agrega al menos un servicio')
            return
        }

        setGuardando(true)
        startTransition(async () => {
            try {
                const resultado = await crearCotizacionCongelada({
                    eventoId,
                    eventoTipoId,
                    nombre: data.nombre,
                    servicios: wishlist,
                })

                toast.success('Cotización creada exitosamente')
                window.history.back()

            } catch (error) {
                console.error('Error al crear la cotización:', error)
                toast.error('Error al crear la cotización')
            } finally {
                setGuardando(false)
            }
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-900 text-zinc-100 p-6 space-y-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                    {isEditingTitle ? (
                        <div className="flex items-center gap-2 flex-1">
                            <Input
                                value={tempTitle}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTempTitle(e.target.value)}
                                className="flex-1 bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-zinc-500"
                                autoFocus
                            />
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={handleSaveTitle}
                                className="border-zinc-600 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
                            >
                                <Save className="h-4 w-4" />
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                                className="border-zinc-600 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 flex-1">
                            <h1 className="text-2xl font-bold flex-1 text-zinc-50">
                                {form.watch('nombre')}
                            </h1>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={handleEditTitle}
                                className="border-zinc-600 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
                            >
                                <Pen className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>

                <div className="text-sm text-zinc-400 space-y-1">
                    <p><strong className="text-zinc-300">Cliente:</strong> {evento?.Cliente?.nombre || 'Cargando...'}</p>
                    <p><strong className="text-zinc-300">Evento:</strong> {evento?.nombre || 'Cargando...'}</p>
                    <p><strong className="text-zinc-300">Fecha:</strong> {evento?.fecha_evento ? format(new Date(evento.fecha_evento), 'dd/MM/yyyy') : 'Cargando...'}</p>
                    <p><strong className="text-zinc-300">Tipo:</strong> {evento?.EventoTipo?.nombre || 'Cargando...'}</p>
                    {paquete && <p><strong className="text-zinc-300">Paquete base:</strong> {paquete.nombre}</p>}
                </div>
            </div>            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Columna 1: Nombre y Resumen */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Nombre de la cotización */}
                        <div className="border border-zinc-700 bg-zinc-800 rounded-lg p-4">
                            <h3 className="font-semibold mb-3 text-zinc-200">Cotización</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-1">
                                        Nombre
                                    </label>
                                    <Input
                                        {...form.register('nombre')}
                                        placeholder="Nombre de la cotización"
                                        className="bg-zinc-700 border-zinc-600 text-zinc-200 placeholder-zinc-400"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Resumen de precios */}
                        <div className="border border-zinc-700 bg-zinc-800 rounded-lg p-4">
                            <h3 className="font-semibold mb-3 text-zinc-200">Resumen</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center pb-2 border-b border-zinc-700">
                                    <span className="text-sm text-zinc-300">Subtotal:</span>
                                    <span className="font-semibold text-zinc-200">
                                        ${wishlist.reduce((acc, servicio) => acc + servicio.subtotal, 0).toLocaleString()}
                                    </span>
                                </div>

                                {paquete && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-zinc-400">Precio paquete:</span>
                                        <span className="text-emerald-400">
                                            ${paquete.precio?.toLocaleString() || '0'}
                                        </span>
                                    </div>
                                )}

                                {!paquete && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-zinc-400">Cotización personalizada</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Observaciones */}
                        <div className="border border-zinc-700 bg-zinc-800 rounded-lg p-4">
                            <h3 className="font-semibold mb-3 text-zinc-200">Observaciones</h3>
                            <Textarea
                                {...form.register('observaciones')}
                                placeholder="Observaciones adicionales..."
                                className="bg-zinc-700 border-zinc-600 text-zinc-200 placeholder-zinc-400 min-h-[100px]"
                            />
                        </div>
                    </div>

                    {/* Columna 2-3: Wishlist */}
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="font-semibold text-lg text-zinc-200">Servicios Seleccionados</h3>

                        {Object.keys(wishlistAgrupada).length === 0 ? (
                            <div className="border-2 border-dashed border-zinc-600 bg-zinc-800/50 rounded-lg p-8 text-center">
                                <p className="text-zinc-400">No hay servicios seleccionados</p>
                                <p className="text-sm text-zinc-500 mt-1">
                                    Agrega servicios desde el catálogo
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {Object.entries(wishlistAgrupada)
                                    .sort(([, categoriasA], [, categoriasB]) => {
                                        // Ordenar secciones por posición
                                        const posicionA = Object.values(categoriasA)[0]?.posicionSeccion || 0
                                        const posicionB = Object.values(categoriasB)[0]?.posicionSeccion || 0
                                        return posicionA - posicionB
                                    })
                                    .map(([seccion, categorias]) => (
                                        <div key={`wishlist-${seccion}`} className="border border-zinc-700 bg-zinc-800 rounded-lg p-4">
                                            <h4 className="font-medium text-sm text-blue-400 mb-3 uppercase tracking-wide">
                                                {seccion}
                                            </h4>

                                            {Object.entries(categorias)
                                                .sort(([, a], [, b]) => a.posicionCategoria - b.posicionCategoria)
                                                .map(([categoria, categoriaData]) => (
                                                    <div key={`wishlist-${seccion}-${categoria}`} className="mb-4 last:mb-0">
                                                        <h5 className="font-medium text-sm text-zinc-300 mb-2">
                                                            {categoria}
                                                        </h5>

                                                        <div className="space-y-2">
                                                            {categoriaData.servicios.map((servicio) => (
                                                                <div
                                                                    key={`wishlist-${servicio.servicioId}`}
                                                                    className="flex items-start gap-3 p-3 bg-zinc-700 rounded-lg border border-zinc-600"
                                                                >
                                                                    {/* Nombre del servicio y descripción */}
                                                                    <div className="flex-1 min-w-0">
                                                                        <h6 className="font-medium text-sm text-zinc-200 break-words">
                                                                            {servicio.nombre}
                                                                        </h6>
                                                                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                                                                            {servicio.descripcion || 'Servicio personalizado para tu evento especial'}
                                                                        </p>
                                                                    </div>

                                                                    {/* Controles de cantidad */}
                                                                    <div className="flex items-center gap-1">
                                                                        <Button
                                                                            type="button"
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            onClick={() => disminuirCantidad(servicio.servicioId)}
                                                                            className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-600"
                                                                        >
                                                                            <MinusCircle className="h-3 w-3" />
                                                                        </Button>

                                                                        <Input
                                                                            type="number"
                                                                            value={servicio.cantidad}
                                                                            onChange={(e) => {
                                                                                const nuevaCantidad = parseInt(e.target.value) || 1
                                                                                if (nuevaCantidad > 0) {
                                                                                    // Aquí podrías agregar lógica para cambio directo de cantidad
                                                                                }
                                                                            }}
                                                                            className="w-10 h-7 text-center bg-zinc-800 border-zinc-600 text-zinc-200 text-xs"
                                                                            min="1"
                                                                        />

                                                                        <Button
                                                                            type="button"
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            onClick={() => aumentarCantidad(servicio.servicioId)}
                                                                            className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-600"
                                                                        >
                                                                            <PlusCircle className="h-3 w-3" />
                                                                        </Button>
                                                                    </div>

                                                                    {/* Precio */}
                                                                    <div className="text-right min-w-[70px] flex-shrink-0">
                                                                        <p className="text-sm font-semibold text-emerald-400">
                                                                            ${servicio.subtotal.toLocaleString()}
                                                                        </p>
                                                                    </div>

                                                                    {/* Botón eliminar */}
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() => eliminarServicio(servicio.servicioId)}
                                                                        className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20 flex-shrink-0"
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>

                    {/* Columna 4-5: Catálogo de servicios disponibles */}
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="font-semibold text-lg text-zinc-200">Catálogo de Servicios</h3>

                        {Object.keys(serviciosAgrupadosDisponibles).length === 0 ? (
                            <div className="border border-zinc-700 bg-zinc-800 rounded-lg p-8 text-center">
                                <p className="text-zinc-400">Todos los servicios han sido agregados</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[600px] overflow-y-auto">
                                {Object.entries(serviciosAgrupadosDisponibles).map(([seccion, categorias]) => (
                                    <div key={`catalog-${seccion}`} className="border border-zinc-700 bg-zinc-800 rounded-lg p-4">
                                        <h4 className="font-medium text-sm text-purple-400 mb-3 uppercase tracking-wide">
                                            {seccion}
                                        </h4>

                                        {Object.entries(categorias).map(([categoria, servicios]) => (
                                            <div key={`catalog-${seccion}-${categoria}`} className="mb-4 last:mb-0">
                                                <h5 className="font-medium text-sm text-zinc-300 mb-2">
                                                    {categoria}
                                                </h5>

                                                <div className="space-y-2">
                                                    {servicios.map((servicio) => (
                                                        <div
                                                            key={`catalog-${servicio.id}`}
                                                            className="border border-zinc-600 bg-zinc-700 rounded-lg p-4 hover:border-purple-500 hover:bg-zinc-600 transition-colors cursor-pointer"
                                                            onClick={() => agregarServicio(servicio)}
                                                        >
                                                            {/* Header con nombre y precio */}
                                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                                <h6 className="font-medium text-sm text-zinc-200 flex-1">
                                                                    {servicio.nombre}
                                                                </h6>
                                                                <div className="text-right flex-shrink-0">
                                                                    <span className="text-lg font-bold text-emerald-400">
                                                                        ${calcularPrecioServicio(servicio).toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Descripción completa */}
                                                            {servicio.descripcion && (
                                                                <p className="text-sm text-zinc-300 leading-relaxed">
                                                                    {servicio.descripcion}
                                                                </p>
                                                            )}

                                                            {/* Botón de agregar */}
                                                            <div className="mt-3 pt-2 border-t border-zinc-600">
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="w-full border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        agregarServicio(servicio)
                                                                    }}
                                                                >
                                                                    <PlusCircle className="h-4 w-4 mr-2" />
                                                                    Agregar servicio
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer con acciones */}
                <div className="mt-8 pt-6 border-t border-zinc-700">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-zinc-400">
                            {wishlist.length} servicios seleccionados • Total: ${total.toLocaleString()}
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
                                className="border-zinc-600 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
                            >
                                Cancelar
                            </Button>

                            <Button
                                type="submit"
                                disabled={guardando || isPending || wishlist.length === 0}
                                className="min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white disabled:bg-zinc-700 disabled:text-zinc-400"
                            >
                                {guardando || isPending ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Creando...
                                    </div>
                                ) : (
                                    'Crear Cotización'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}
