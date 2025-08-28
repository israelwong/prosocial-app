'use client'
import React, { useState, useMemo } from 'react'
import { Button } from '@/app/components/ui/button'
import { CheckCircle, Star, Package, MessageCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

// Tipos base
interface ServicioDetalle {
    id: string
    nombre: string
    cantidad: number
    costo?: number
    gasto?: number
    utilidad?: number
    precio_publico?: number
}

interface ServiciosAgrupados {
    [seccion: string]: {
        posicion: number
        categorias: {
            [categoria: string]: {
                posicion: number
                servicios: ServicioDetalle[]
            }
        }
    }
}

interface PaqueteSugerido {
    id: string
    nombre: string
    descripcion?: string
    precio: number
    popularidad: 'básico' | 'intermedio' | 'premium'
    PaqueteServicio: Array<{
        id: string
        cantidad: number
        posicion: number
        Servicio: {
            id: string
            nombre: string
            ServicioCategoria: {
                nombre: string
                posicion: number
                seccionCategoria?: {
                    Seccion: {
                        nombre: string
                        posicion: number
                    }
                }
            }
        }
        ServicioCategoria: {
            nombre: string
            posicion: number
            seccionCategoria?: {
                Seccion: {
                    nombre: string
                    posicion: number
                }
            }
        }
    }>
}

interface Props {
    cotizacion: {
        id: string
        nombre: string
        precio: number
        servicios: any[]
        cliente: {
            id: string
            nombre: string
            email: string
            telefono?: string
        }
        evento: {
            eventoTipoId: string
        }
    }
    paquetesSugeridos: PaqueteSugerido[]
    serviciosAgrupadosActuales: ServiciosAgrupados
    onSolicitarPaquete: (paqueteId: string, mensaje?: string) => Promise<void>
    onProcederPago: () => void
}

export default function PaqueteComparador({
    cotizacion,
    paquetesSugeridos,
    serviciosAgrupadosActuales,
    onSolicitarPaquete,
    onProcederPago
}: Props) {
    const [mostrarComparacion, setMostrarComparacion] = useState(false)
    const [paqueteExpandido, setPaqueteExpandido] = useState<string | null>(null)

    // Función para agrupar servicios de paquetes usando la misma lógica exitosa
    const agruparServiciosPaquete = (paqueteServicios: PaqueteSugerido['PaqueteServicio']): ServiciosAgrupados => {
        const serviciosAgrupados: ServiciosAgrupados = {}

        // ✅ Validar que paqueteServicios existe y es un array
        if (!paqueteServicios || !Array.isArray(paqueteServicios)) {
            return serviciosAgrupados
        }

        paqueteServicios.forEach((paqueteServicio) => {
            // ✅ Verificar que el servicio y sus relaciones existen
            if (!paqueteServicio.Servicio || !paqueteServicio.Servicio.ServicioCategoria) {
                return // Skip este servicio si no tiene la estructura correcta
            }

            // Usar la lógica exitosa: obtener sección y categoría
            const seccionNombre =
                paqueteServicio.Servicio?.ServicioCategoria?.seccionCategoria?.Seccion?.nombre ||
                paqueteServicio.ServicioCategoria?.seccionCategoria?.Seccion?.nombre ||
                'Servicios Generales'

            const categoriaNombre =
                paqueteServicio.Servicio?.ServicioCategoria?.nombre ||
                paqueteServicio.ServicioCategoria?.nombre ||
                'Sin categoría'

            // Obtener posiciones
            const seccionPosicion =
                paqueteServicio.Servicio?.ServicioCategoria?.seccionCategoria?.Seccion?.posicion ||
                paqueteServicio.ServicioCategoria?.seccionCategoria?.Seccion?.posicion || 0

            const categoriaPosicion =
                paqueteServicio.Servicio?.ServicioCategoria?.posicion ||
                paqueteServicio.ServicioCategoria?.posicion || 0

            // Inicializar sección si no existe
            if (!serviciosAgrupados[seccionNombre]) {
                serviciosAgrupados[seccionNombre] = {
                    posicion: seccionPosicion,
                    categorias: {}
                }
            }

            // Inicializar categoría si no existe
            if (!serviciosAgrupados[seccionNombre].categorias[categoriaNombre]) {
                serviciosAgrupados[seccionNombre].categorias[categoriaNombre] = {
                    posicion: categoriaPosicion,
                    servicios: []
                }
            }

            // Agregar el servicio a la categoría correspondiente
            serviciosAgrupados[seccionNombre].categorias[categoriaNombre].servicios.push({
                id: paqueteServicio.id,
                nombre: paqueteServicio.Servicio.nombre,
                cantidad: paqueteServicio.cantidad
            })
        })

        return serviciosAgrupados
    }

    // Calcular diferencia de precio
    const calcularDiferencia = (precioPaquete: number | null) => {
        const precio1 = cotizacion.precio || 0
        const precio2 = precioPaquete || 0
        const diferencia = precio2 - precio1
        return {
            diferencia,
            esAhorro: diferencia < 0,
            porcentaje: precio1 > 0 ? Math.abs((diferencia / precio1) * 100) : 0
        }
    }

    // Obtener badge de popularidad
    const getBadgePopularidad = (popularidad: string) => {
        switch (popularidad) {
            case 'premium':
                return {
                    color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
                    texto: 'Premium',
                    icon: '👑'
                }
            case 'intermedio':
                return {
                    color: 'bg-gradient-to-r from-blue-500 to-purple-500',
                    texto: 'Popular',
                    icon: '⭐'
                }
            default:
                return {
                    color: 'bg-gradient-to-r from-green-500 to-teal-500',
                    texto: 'Básico',
                    icon: '✨'
                }
        }
    }

    const handleSolicitarPaquete = async (paqueteId: string) => {
        try {
            await onSolicitarPaquete(paqueteId)
            toast.success('Solicitud enviada. Te contactaremos pronto.')
        } catch (error) {
            toast.error('Error al enviar la solicitud. Intenta de nuevo.')
            console.error('Error al solicitar paquete:', error)
        }
    }

    if (paquetesSugeridos.length === 0) {
        return null
    }

    return (
        <div className="mt-8 space-y-6">
            {/* Header de sección */}
            <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                    <Package className="w-5 h-5 text-blue-400" />
                    Paquetes Disponibles para tu Evento
                </h3>
                <p className="text-zinc-400 text-sm">
                    Compara tu cotización personalizada con nuestros paquetes preconfigurados
                </p>

                <Button
                    onClick={() => setMostrarComparacion(!mostrarComparacion)}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-sm"
                >
                    {mostrarComparacion ? 'Ocultar Comparación' : 'Ver Paquetes Disponibles'}
                </Button>
            </div>

            {mostrarComparacion && (
                <div className="space-y-6">
                    {/* Paquete Actual (Personalizado) */}
                    <div className="border-2 border-green-500 rounded-lg p-4 bg-green-500/5">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <h4 className="text-lg font-bold text-green-400">Tu Cotización Personalizada</h4>
                                <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full font-medium">
                                    ACTUAL
                                </span>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-white">
                                    ${(cotizacion.precio || 0).toLocaleString('es-MX')}
                                </div>
                                <div className="text-xs text-zinc-400">Precio personalizado</div>
                            </div>
                        </div>

                        <Button
                            onClick={onProcederPago}
                            className="w-full bg-green-600 hover:bg-green-700"
                        >
                            💳 Pagar Este Paquete Personalizado
                        </Button>
                    </div>

                    {/* Paquetes Sugeridos */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-zinc-200 text-center">
                            Paquetes Preconfigurados Disponibles
                        </h4>

                        {paquetesSugeridos.map((paquete) => {
                            const diferenciaPrecio = calcularDiferencia(paquete.precio)
                            const badge = getBadgePopularidad(paquete.popularidad)
                            const serviciosAgrupados = agruparServiciosPaquete(paquete.PaqueteServicio)
                            // ✅ Validar que PaqueteServicio existe antes de usar reduce
                            const totalServicios = paquete.PaqueteServicio?.reduce((total, ps) => total + ps.cantidad, 0) || 0

                            return (
                                <div
                                    key={paquete.id}
                                    className="border border-zinc-600 rounded-lg p-4 bg-zinc-800/50 hover:bg-zinc-800/70 transition-all duration-200"
                                >
                                    {/* Header del paquete */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h5 className="text-lg font-semibold text-blue-300">
                                                    {paquete.nombre}
                                                </h5>
                                                <span
                                                    className={`px-2 py-1 ${badge.color} text-white text-xs rounded-full font-medium flex items-center gap-1`}
                                                >
                                                    <span>{badge.icon}</span>
                                                    {badge.texto}
                                                </span>
                                            </div>

                                            {paquete.descripcion && (
                                                <p className="text-sm text-zinc-400 mb-2">
                                                    {paquete.descripcion}
                                                </p>
                                            )}

                                            <div className="text-xs text-zinc-500">
                                                {totalServicios} servicios incluidos
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-white mb-1">
                                                ${(paquete.precio || 0).toLocaleString('es-MX')}
                                            </div>

                                            {/* Diferencia de precio */}
                                            {diferenciaPrecio.esAhorro ? (
                                                <div className="text-green-400 text-sm font-medium">
                                                    ✅ Ahorras ${Math.abs(diferenciaPrecio.diferencia || 0).toLocaleString('es-MX')}
                                                </div>
                                            ) : diferenciaPrecio.diferencia > 0 ? (
                                                <div className="text-orange-400 text-sm font-medium">
                                                    💰 +${(diferenciaPrecio.diferencia || 0).toLocaleString('es-MX')} adicional
                                                </div>
                                            ) : (
                                                <div className="text-zinc-400 text-sm">
                                                    💯 Mismo precio
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Vista rápida de servicios */}
                                    <div className="mb-4">
                                        <Button
                                            onClick={() => setPaqueteExpandido(paqueteExpandido === paquete.id ? null : paquete.id)}
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                        >
                                            {paqueteExpandido === paquete.id ? 'Ocultar Detalles' : 'Ver Servicios Incluidos'}
                                        </Button>
                                    </div>

                                    {/* Detalles expandibles */}
                                    {paqueteExpandido === paquete.id && (
                                        <div className="mb-4 p-3 bg-zinc-900/50 rounded-lg border border-zinc-700">
                                            <div className="space-y-4">
                                                {Object.entries(serviciosAgrupados)
                                                    .sort(([, a], [, b]) => (a.posicion || 0) - (b.posicion || 0))
                                                    .map(([seccionNombre, seccionData]) => (
                                                        <div key={seccionNombre} className="space-y-2">
                                                            {/* Header de la sección */}
                                                            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-3 py-1 rounded text-white text-sm font-medium">
                                                                {seccionNombre}
                                                            </div>

                                                            {/* Categorías y servicios */}
                                                            <div className="space-y-3 pl-2">
                                                                {Object.entries(seccionData.categorias)
                                                                    .sort(([, a], [, b]) => (a.posicion || 0) - (b.posicion || 0))
                                                                    .map(([categoriaNombre, categoriaData]) => (
                                                                        <div key={categoriaNombre}>
                                                                            {/* Header de categoría */}
                                                                            <div className="flex items-center gap-2 pb-1 border-b border-blue-500/30">
                                                                                <div className="w-1 h-3 bg-blue-500 rounded"></div>
                                                                                <h6 className="text-sm font-semibold text-blue-300">
                                                                                    {categoriaNombre}
                                                                                </h6>
                                                                            </div>

                                                                            {/* Lista de servicios */}
                                                                            <div className="space-y-1 mt-2">
                                                                                {categoriaData.servicios.map((servicio) => (
                                                                                    <div key={servicio.id} className="flex items-center justify-between text-sm">
                                                                                        <div className="flex items-center gap-2">
                                                                                            <CheckCircle className="w-3 h-3 text-green-400" />
                                                                                            <span className="text-zinc-200">{servicio.nombre}</span>
                                                                                        </div>
                                                                                        <span className="text-zinc-400 text-xs">
                                                                                            Cantidad: {servicio.cantidad}
                                                                                        </span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Botón de acción */}
                                    <Button
                                        onClick={() => handleSolicitarPaquete(paquete.id)}
                                        className="w-full bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        🎉 Solicita agregar este paquete para reservar
                                    </Button>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
