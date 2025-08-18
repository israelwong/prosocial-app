'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { suscribirCotizacion, desuscribirCotizacion, ESTADOS_COTIZACION } from '@/lib/supabase-realtime'
import { obtenerEventoDetalleCompleto } from '@/app/admin/_lib/actions/seguimiento/seguimiento-detalle.actions'
import { obtenerCondicionesComerciales } from '@/app/admin/_lib/actions/condicionesComerciales/condicionesComerciales.actions'
import { obtenerCondicionesComercialesMetodosPago } from '@/app/admin/_lib/condicionesComerciales.actions'
import { obtenerMetodoPago } from '@/app/admin/_lib/metodoPago.actions'
import type { EventoExtendido, ServicioDetalle, EventoDetalleCompleto } from '@/app/admin/_lib/actions/seguimiento/seguimiento-detalle.schemas'
import { verificarDisponibilidadFecha } from '@/app/admin/_lib/agenda.actions'
import type { Cliente, EventoTipo, Cotizacion, Evento } from '@/app/admin/_lib/types'

// Subcomponentes
import BadgeDisponibilidad from './BadgeDisponibilidad'
import CondicionesComerciales from './CondicionesComerciales'
import ServiciosAgrupados from './ServiciosAgrupados'
import BotonPago from './BotonPago'

// Tipos específicos para servicios agrupados en el display
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

interface Props {
    cotizacion: any // Temporal para evitar conflictos de tipos
    evento: any // Temporal para evitar conflictos de tipos
    esRealtime?: boolean
    esAdmin?: boolean
    esLegacy?: boolean
}

export default function CotizacionDetalle({
    cotizacion: cotizacionInicial,
    evento,
    esRealtime = false,
    esAdmin = false,
    esLegacy = false
}: Props) {
    const [cotizacion, setCotizacion] = useState(cotizacionInicial)
    const [serviciosAgrupados, setServiciosAgrupados] = useState<ServiciosAgrupados>({})
    const [costos, setCostos] = useState([])
    const [condicionesComerciales, setCondicionesComerciales] = useState<any[]>([])
    const [metodosPago, setMetodosPago] = useState<any[]>([])
    const [condicionSeleccionada, setCondicionSeleccionada] = useState<string>('')
    const [fechaDisponible, setFechaDisponible] = useState<boolean>(true)
    const [loading, setLoading] = useState(false)
    const [conectado, setConectado] = useState(false)

    useEffect(() => {
        // Cargar servicios al montar el componente
        cargarServiciosAgrupados()
        cargarCondicionesComerciales()
        verificarDisponibilidadReal()

        if (esRealtime) {
            console.log('Iniciando sesión de tiempo real...')
            setConectado(true)

            const channel = suscribirCotizacion(cotizacion.id!, (payload) => {
                console.log('Actualización recibida:', payload)

                if (payload.table === 'Cotizacion') {
                    setCotizacion(payload.new)
                }

                if (payload.table === 'CotizacionServicio') {
                    cargarServiciosAgrupados()
                }

                if (payload.table === 'CotizacionCosto') {
                    cargarCostos()
                }
            })

            return () => {
                console.log('Cerrando sesión de tiempo real...')
                desuscribirCotizacion(channel)
                setConectado(false)
            }
        }
    }, [cotizacion.id, esRealtime])

    const verificarDisponibilidadReal = async () => {
        try {
            const fechaEvento = new Date(evento.fecha_evento)
            const disponibilidad = await verificarDisponibilidadFecha(fechaEvento, evento.id)
            setFechaDisponible(disponibilidad.disponible)
        } catch (error) {
            console.error('Error al verificar disponibilidad:', error)
            setFechaDisponible(true) // Por defecto asumimos que está disponible si hay error
        }
    }

    const cargarServiciosAgrupados = async () => {
        try {
            setLoading(true)
            console.log('🔍 === INICIANDO DEBUG DE SERVICIOS ===')
            console.log('1. Evento ID:', evento.id)
            console.log('2. Cotización ID:', cotizacion.id)

            // Usar los servicios que ya vienen en la cotizacion
            console.log('3. Usando servicios de cotización directamente...')

            if (!cotizacion.Servicio || cotizacion.Servicio.length === 0) {
                console.log('❌ No hay servicios en la cotización')
                setServiciosAgrupados({})
                return
            }

            console.log('✅ Servicios encontrados:', cotizacion.Servicio.length)

            // Mostrar cada servicio detalladamente
            cotizacion.Servicio.forEach((cotizacionServicio: any, index: number) => {
                console.log(`\n📦 SERVICIO ${index + 1}:`)
                console.log('  - ID:', cotizacionServicio.id)
                console.log('  - Servicio:', cotizacionServicio.Servicio?.nombre)
                console.log('  - Snapshot nombre:', cotizacionServicio.nombre_snapshot)
                console.log('  - Categoría:', cotizacionServicio.ServicioCategoria?.nombre)
                console.log('  - Snapshot categoría:', cotizacionServicio.categoria_nombre_snapshot)
                console.log('  - Sección snapshot:', cotizacionServicio.seccion_nombre_snapshot)
                console.log('  - Precio:', cotizacionServicio.precioUnitario)
                console.log('  - Cantidad:', cotizacionServicio.cantidad)
                console.log('  - Subtotal:', cotizacionServicio.subtotal)
            })

            // Procesar agrupación usando los datos de la cotización
            const agrupados: ServiciosAgrupados = {}

            cotizacion.Servicio.forEach((cotizacionServicio: any, index: number) => {
                console.log(`\n--- Servicio ${index + 1} ---`)

                // Usar primero los snapshots, luego los datos relacionados como fallback
                const nombreServicio = cotizacionServicio.nombre_snapshot && cotizacionServicio.nombre_snapshot !== 'Servicio migrado'
                    ? cotizacionServicio.nombre_snapshot
                    : cotizacionServicio.Servicio?.nombre || 'Servicio sin nombre'

                // Mejorar la obtención de categoría y sección usando relaciones correctas
                const categoriaNombre = cotizacionServicio.categoria_nombre_snapshot ||
                    cotizacionServicio.Servicio?.ServicioCategoria?.nombre ||
                    cotizacionServicio.ServicioCategoria?.nombre ||
                    'Sin categoría'

                const seccionNombre = cotizacionServicio.seccion_nombre_snapshot ||
                    cotizacionServicio.Servicio?.ServicioCategoria?.seccionCategoria?.Seccion?.nombre ||
                    cotizacionServicio.ServicioCategoria?.seccionCategoria?.Seccion?.nombre ||
                    'Servicios Generales'
                const precio = cotizacionServicio.precio_unitario_snapshot || cotizacionServicio.precioUnitario || 0
                const cantidad = cotizacionServicio.cantidad || 1
                const subtotal = cotizacionServicio.subtotal || (cantidad * precio)

                // Obtener posiciones de sección y categoría usando relaciones correctas
                const seccionPosicion = cotizacionServicio.Servicio?.ServicioCategoria?.seccionCategoria?.Seccion?.posicion ||
                    cotizacionServicio.ServicioCategoria?.seccionCategoria?.Seccion?.posicion || 0


                const categoriaPosicion = cotizacionServicio.Servicio?.ServicioCategoria?.posicion ||
                    cotizacionServicio.ServicioCategoria?.posicion || 0

                console.log(`\nProcesando: Sección="${seccionNombre}" (pos:${seccionPosicion}), Categoría="${categoriaNombre}" (pos:${categoriaPosicion}), Servicio="${nombreServicio}"`)
                console.log(`Cantidad: ${cantidad}, Precio: ${precio}, Subtotal: ${subtotal}`)

                // Inicializar sección si no existe
                if (!agrupados[seccionNombre]) {
                    agrupados[seccionNombre] = {
                        posicion: seccionPosicion,
                        categorias: {}
                    }
                }

                // Inicializar categoría si no existe
                if (!agrupados[seccionNombre].categorias[categoriaNombre]) {
                    agrupados[seccionNombre].categorias[categoriaNombre] = {
                        posicion: categoriaPosicion,
                        servicios: []
                    }
                }

                // Crear objeto ServicioDetalle compatible
                const servicioDetalle: ServicioDetalle = {
                    id: cotizacionServicio.id,
                    cotizacionId: cotizacionServicio.cotizacionId,
                    servicioId: cotizacionServicio.servicioId,
                    nombre: nombreServicio,
                    descripcion: cotizacionServicio.descripcion_snapshot || cotizacionServicio.Servicio?.descripcion,
                    precio: precio,
                    cantidad: cantidad,
                    subtotal: subtotal,
                    categoria: cotizacionServicio.servicioCategoriaId,
                    categoriaNombre: categoriaNombre,
                    seccion: seccionNombre,
                    responsableId: cotizacionServicio.userId,
                    responsableNombre: undefined,
                    responsableEmail: undefined,
                    status: cotizacionServicio.status || 'pendiente',
                    statusDisplay: cotizacionServicio.status || 'pendiente',
                    colorStatus: 'gray',
                    fechaAsignacion: cotizacionServicio.fechaAsignacion,
                    FechaEntrega: cotizacionServicio.FechaEntrega,
                    posicion: cotizacionServicio.posicion,
                    es_personalizado: cotizacionServicio.es_personalizado || false,
                    createdAt: cotizacionServicio.createdAt,
                    updatedAt: cotizacionServicio.updatedAt
                }

                // Agregar el servicio
                agrupados[seccionNombre].categorias[categoriaNombre].servicios.push(servicioDetalle)
            })

            console.log('\n=== SERVICIOS AGRUPADOS RESULTADO ===')
            console.log('Secciones encontradas:', Object.keys(agrupados))
            Object.entries(agrupados).forEach(([seccion, datos]) => {
                console.log(`\nSección: ${seccion}`)
                console.log(`  Categorías: ${Object.keys(datos.categorias)}`)
                Object.entries(datos.categorias).forEach(([categoria, catDatos]) => {
                    console.log(`    Categoría: ${categoria} - ${catDatos.servicios.length} servicios`)
                    catDatos.servicios.forEach((servicio, idx) => {
                        console.log(`      ${idx + 1}. ${servicio.nombre} (Cant: ${servicio.cantidad}, Precio: $${servicio.precio})`)
                    })
                })
            })

            // Ordenar servicios dentro de cada categoría por nombre
            Object.keys(agrupados).forEach(seccionNombre => {
                Object.keys(agrupados[seccionNombre].categorias).forEach(categoriaNombre => {
                    agrupados[seccionNombre].categorias[categoriaNombre].servicios.sort((a, b) =>
                        a.nombre.localeCompare(b.nombre)
                    )
                })
            })

            setServiciosAgrupados(agrupados)
        } catch (error) {
            console.error('Error al cargar servicios:', error)
            setServiciosAgrupados({})
        } finally {
            setLoading(false)
        }
    }

    const cargarCondicionesComerciales = async () => {
        try {
            console.log('🏪 === CARGANDO CONDICIONES COMERCIALES ===')
            const condicionesActivas = await obtenerCondicionesComerciales()

            // Filtrar solo las condiciones activas
            const condicionesFiltradas = condicionesActivas.filter(condicion => condicion.status === 'activa')

            console.log('Condiciones comerciales encontradas:', condicionesFiltradas.length)

            // Obtener métodos de pago para cada condición comercial
            const condicionesConMetodos = await Promise.all(
                condicionesFiltradas.map(async (condicion) => {
                    try {
                        const metodos_pago_condicion = await obtenerCondicionesComercialesMetodosPago(condicion.id!)
                        const metodos_pago_con_nombre = await Promise.all(
                            metodos_pago_condicion.map(async (metodo) => {
                                const metodo_pago = await obtenerMetodoPago(metodo.metodoPagoId)
                                return {
                                    ...metodo,
                                    metodo_pago: metodo_pago?.metodo_pago || '',
                                    num_msi: metodo_pago?.num_msi || 0,
                                    orden: metodo.orden || 0,
                                    comision_porcentaje_base: metodo_pago?.comision_porcentaje_base,
                                    comision_fija_monto: metodo_pago?.comision_fija_monto,
                                    comision_msi_porcentaje: metodo_pago?.comision_msi_porcentaje,
                                    payment_method: metodo_pago?.payment_method,
                                }
                            })
                        )

                        // Ordenar métodos de pago por orden
                        metodos_pago_con_nombre.sort((a, b) => Number(a.orden ?? 0) - Number(b.orden ?? 0))

                        return {
                            ...condicion,
                            metodosPago: metodos_pago_con_nombre
                        }
                    } catch (error) {
                        console.error(`Error cargando métodos para condición ${condicion.id}:`, error)
                        return {
                            ...condicion,
                            metodosPago: []
                        }
                    }
                })
            )

            console.log('Condiciones comerciales con métodos de pago:', condicionesConMetodos)
            setCondicionesComerciales(condicionesConMetodos)

            // Si hay condiciones, seleccionar la primera por defecto
            if (condicionesConMetodos.length > 0) {
                setCondicionSeleccionada(condicionesConMetodos[0].id)
            }
        } catch (error) {
            console.error('Error al cargar condiciones comerciales:', error)
            setCondicionesComerciales([])
        }
    }

    // Verificar disponibilidad de fecha usando la entidad Agenda
    const verificarDisponibilidad = async () => {
        try {
            const fechaEvento = new Date(evento.fecha_evento)
            const disponibilidad = await verificarDisponibilidadFecha(fechaEvento, evento.id)
            return disponibilidad.disponible
        } catch (error) {
            console.error('Error al verificar disponibilidad:', error)
            return true // Por defecto asumimos disponible si hay error
        }
    }

    const cargarCostos = async () => {
        console.log('Cargando costos...')
        // Aquí iría la llamada real para obtener costos
    }

    const iniciarPago = () => {
        if (!fechaDisponible) {
            alert('Lo sentimos, la fecha ya ha sido ocupada por otro cliente.')
            return
        }

        // Redirigir a Stripe Checkout
        window.location.href = `/api/checkout/create-session?cotizacionId=${cotizacion.id}`
    }

    const handleCondicionChange = (condicionId: string) => {
        setCondicionSeleccionada(condicionId)
    }

    // Determinar el estado visual
    const getEstadoVisual = () => {
        if (!fechaDisponible) {
            return {
                titulo: 'Fecha no disponible',
                color: 'red',
                icon: '🚫'
            }
        }

        return {
            titulo: 'Fecha disponible',
            color: 'green',
            icon: '✅'
        }
    }

    const estadoVisual = getEstadoVisual()
    const puedeRealizarPago = fechaDisponible && !!condicionSeleccionada

    const urlRegreso = esLegacy ? `/cotizacion/${cotizacion.id}` : `/evento/${evento.id}`

    return (
        <div className="min-h-screen bg-zinc-900">
            {/* Indicador de tiempo real */}
            {esRealtime && (
                <div className="fixed top-4 right-4 z-50">
                    <div className={`px-3 py-2 rounded-lg text-xs font-medium ${conectado
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-600 text-gray-200'
                        }`}>
                        <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${conectado ? 'bg-green-300 animate-pulse' : 'bg-gray-400'
                                }`}></div>
                            <span>{conectado ? 'En vivo' : 'Desconectado'}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Header móvil */}
            <div className="bg-zinc-800 p-4 border-b border-zinc-700 sticky top-0 z-10">
                <div className="flex items-center space-x-3 mb-2">
                    <Link
                        href={urlRegreso}
                        className="text-blue-400 hover:text-blue-300"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg font-bold text-white truncate">
                            {cotizacion.nombre}
                        </h1>
                        <div className="text-zinc-400 text-sm">
                            {evento.nombre || 'Evento sin nombre'} - {new Date(evento.fecha_evento).toLocaleDateString('es-MX', {
                                month: 'short',
                                day: 'numeric'
                            })}
                        </div>
                    </div>

                    {/* Botón de compartir */}
                    <button
                        onClick={() => {
                            const url = window.location.href
                            const titulo = `Cotización: ${cotizacion.nombre}`
                            const texto = `Te comparto mi cotización para ${evento.nombre}`

                            if (navigator.share) {
                                navigator.share({
                                    title: titulo,
                                    text: texto,
                                    url: url
                                }).catch(console.error)
                            } else {
                                navigator.clipboard.writeText(url).then(() => {
                                    alert('Enlace copiado al portapapeles')
                                }).catch(() => {
                                    alert('No se pudo copiar el enlace')
                                })
                            }
                        }}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                        title="Compartir cotización"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Estado de la cotización */}
            <div className="p-4">
                <div className="flex items-center justify-center mt-4">
                    <BadgeDisponibilidad fechaDisponible={fechaDisponible} />
                </div>

                {esRealtime && !esAdmin && (
                    <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-3 mt-4">
                        <div className="flex items-center space-x-2 mb-1">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                            <span className="text-blue-400 font-medium text-sm">Sesión en tiempo real</span>
                        </div>
                        <p className="text-blue-300 text-xs">
                            Estás viendo esta cotización en tiempo real.
                        </p>
                    </div>
                )}
            </div>

            {/* Contenido principal */}
            <div className="p-4 pb-24 space-y-4">
                {/* Condiciones comerciales */}
                <CondicionesComerciales 
                    condicionesComerciales={condicionesComerciales}
                    condicionSeleccionada={condicionSeleccionada}
                    onCondicionChange={handleCondicionChange}
                    fechaDisponible={fechaDisponible}
                />
                {/* Servicios incluidos */}
                <ServiciosAgrupados 
                    serviciosAgrupados={serviciosAgrupados}
                    loading={loading}
                    esRealtime={esRealtime}
                />

                {/* Información adicional */}
                <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                    <div className="text-zinc-400 space-y-2 text-sm">
                        <div>Creada: {cotizacion.createdAt ? new Date(cotizacion.createdAt).toLocaleDateString('es-MX') : 'Fecha no disponible'}</div>
                        <div className="text-xs text-zinc-500">ID: {cotizacion.id}</div>
                    </div>
                </div>
            </div>

            {/* Botón de pago */}
            <BotonPago 
                puedeRealizarPago={puedeRealizarPago}
                fechaDisponible={fechaDisponible}
                condicionSeleccionada={condicionSeleccionada}
                onIniciarPago={iniciarPago}
                loading={loading}
            />
        </div>
    )
}
                    <div className="text-zinc-400 space-y-2 text-sm">
                        <div>Creada: {cotizacion.createdAt ? new Date(cotizacion.createdAt).toLocaleDateString('es-MX') : 'Fecha no disponible'}</div>
                        <div className="text-xs text-zinc-500">ID: {cotizacion.id}</div>
                    </div>
                </div>

                    {loading ? (
                        <div className="text-center py-6">
                            <div className="text-zinc-400 mb-2 text-sm">
                                Cargando servicios...
                            </div>
                        </div>
                    ) : Object.keys(serviciosAgrupados).length === 0 ? (
                        <div className="text-center py-6">
                            <div className="text-zinc-400 mb-2 text-sm">
                                No hay servicios incluidos
                            </div>
                            {esRealtime && (
                                <div className="text-xs text-zinc-500">
                                    Los servicios aparecerán conforme se agreguen
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(serviciosAgrupados)
                                .sort(([, a], [, b]) => (a.posicion || 0) - (b.posicion || 0))
                                .map(([seccionNombre, seccionData]) => (
                                    <div key={seccionNombre} className="border border-zinc-600 rounded-lg overflow-hidden">
                                        {/* Header de la sección */}
                                        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-2">
                                            <h4 className="text-sm font-medium text-white">
                                                {seccionNombre}
                                            </h4>
                                        </div>

                                        {/* Contenido de la sección */}
                                        <div className="bg-zinc-700/30 p-4 space-y-4">
                                            {Object.entries(seccionData.categorias)
                                                .sort(([, a], [, b]) => (a.posicion || 0) - (b.posicion || 0))
                                                .map(([categoriaNombre, categoriaData]) => (
                                                    <div key={categoriaNombre} className="space-y-3">
                                                        {/* Header de la categoría */}
                                                        <div className="flex items-center gap-2 pb-2 border-b border-blue-500/50">
                                                            <div className="w-1 h-4 bg-blue-500 rounded"></div>
                                                            <h5 className="text-base font-semibold text-blue-300">
                                                                {categoriaNombre}
                                                            </h5>
                                                        </div>

                                                        {/* Lista de servicios */}
                                                        <div className="space-y-2">
                                                            {categoriaData.servicios
                                                                .sort((a, b) => (a.posicion || 0) - (b.posicion || 0))
                                                                .map((cotizacionServicio) => (
                                                                    <div key={cotizacionServicio.id} className="bg-gradient-to-r from-zinc-900/50 to-zinc-800/50 rounded-lg p-3 border border-zinc-600/30 hover:border-zinc-500/50 transition-all duration-200">
                                                                        <div className="flex items-center justify-between gap-4">
                                                                            {/* Información del servicio */}
                                                                            <div className="flex-1 min-w-0">
                                                                                <h6 className="text-white font-medium text-sm leading-tight">
                                                                                    {cotizacionServicio.nombre}
                                                                                </h6>
                                                                                <div className="text-xs text-zinc-400 mt-1">
                                                                                    Cantidad: {cotizacionServicio.cantidad}
                                                                                </div>
                                                                            </div>

                                                                            {/* Subtotal del servicio - OCULTO temporalmente */}
                                                                            {/* 
                                                                        <div className="text-right">
                                                                            <div className="text-green-400 font-semibold">
                                                                                {cotizacionServicio.subtotal.toLocaleString('es-MX', {
                                                                                    style: 'currency',
                                                                                    currency: 'MXN'
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                        */}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                ))}

                            {/* Total general de todos los servicios */}
                            <div className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 rounded-xl p-6 border border-green-500/50 shadow-xl">
                                <div className="text-center space-y-3">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                                        <span className="text-green-100 font-semibold text-sm uppercase tracking-wide">
                                            Total de servicios
                                        </span>
                                        <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                                    </div>

                                    {/* Total de servicios - OCULTO temporalmente */}
                                    {/* 
                                    <div className="bg-white/10 rounded-lg py-4 px-6">
                                        <div className="text-white font-bold text-3xl">
                                            {Object.values(serviciosAgrupados)
                                                .reduce((total, seccion) =>
                                                    total + Object.values(seccion.categorias)
                                                        .reduce((secTotal, categoria) =>
                                                            secTotal + categoria.servicios.reduce((catTotal, servicio) => catTotal + servicio.subtotal, 0), 0), 0)
                                                .toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                        </div>
                                        <div className="text-green-200 text-sm mt-1">
                                            Total antes de anticipo
                                        </div>
                                    </div>
                                    */}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Costos adicionales */}
                {costos.length > 0 && (
                    <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                        <h3 className="font-bold text-white mb-3">
                            Costos adicionales
                        </h3>
                        <div className="space-y-2">
                            {costos.map((costo: any) => (
                                <div key={costo.id} className="flex justify-between items-center p-3 bg-zinc-700 rounded-lg">
                                    <span className="text-white text-sm">{costo.concepto}</span>
                                    <span className="text-orange-400 font-medium text-sm">
                                        ${costo.monto?.toLocaleString('es-MX')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Información adicional */}
                <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">

                        <div className="space-y-3">
                            {condicionesComerciales.map((condicion: any) => (
                                <div
                                    key={condicion.id}
                                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${condicionSeleccionada === condicion.id
                                        ? 'border-green-500 bg-green-900/20'
                                        : 'border-zinc-600 bg-zinc-700/30 hover:border-zinc-500'
                                        }`}
                                    onClick={() => setCondicionSeleccionada(condicion.id)}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h4 className="text-white font-semibold text-base mb-1">
                                                {condicion.nombre}
                                            </h4>
                                            {condicion.descripcion && (
                                                <p className="text-zinc-400 text-sm mb-2">
                                                    {condicion.descripcion}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-4 text-sm">
                                                {condicion.descuento && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-green-400">💰</span>
                                                        <span className="text-green-300">
                                                            {condicion.descuento}% descuento
                                                        </span>
                                                    </div>
                                                )}

                                                {condicion.porcentaje_anticipo && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-blue-400">📊</span>
                                                        <span className="text-blue-300">
                                                            {condicion.porcentaje_anticipo}% anticipo
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Métodos de pago disponibles para esta condición */}
                                            <div className="mt-3">
                                                <div className="text-xs text-zinc-500 mb-2">Métodos de pago disponibles:</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {condicion.CondicionesComercialesMetodoPago?.map((rel: any) => {
                                                        const metodoPago = metodosPago.find(m => m.id === rel.metodoPagoId)
                                                        return metodoPago ? (
                                                            <span
                                                                key={metodoPago.id}
                                                                className="px-2 py-1 bg-zinc-600 text-zinc-300 text-xs rounded uppercase"
                                                            >
                                                                {metodoPago.metodo_pago}
                                                            </span>
                                                        ) : null
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Indicador de selección */}
                                        <div className={`w-5 h-5 rounded-full border-2 transition-colors ${condicionSeleccionada === condicion.id
                                            ? 'border-green-500 bg-green-500'
                                            : 'border-zinc-500'
                                            }`}>
                                            {condicionSeleccionada === condicion.id && (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {!condicionSeleccionada && (
                            <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                                <p className="text-yellow-300 text-sm">
                                    ⚠️ Selecciona una condición comercial para continuar con el pago
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Información adicional */}
                <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                    <div className="text-zinc-400 space-y-2 text-sm">
                        <div>Creada: {cotizacion.createdAt ? new Date(cotizacion.createdAt).toLocaleDateString('es-MX') : 'Fecha no disponible'}</div>
                        <div className="text-xs text-zinc-500">ID: {cotizacion.id}</div>
                    </div>
                </div>
            </div>

            {/* Botón de pago */}
            <BotonPago 
                puedeRealizarPago={puedeRealizarPago}
                fechaDisponible={fechaDisponible}
                condicionSeleccionada={condicionSeleccionada}
                onIniciarPago={iniciarPago}
                loading={loading}
            />
        </div>
    )
}
