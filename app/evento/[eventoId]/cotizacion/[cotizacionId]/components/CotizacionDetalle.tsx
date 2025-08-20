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

// 🔥 STRIPE ELEMENTS INTEGRATION
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import FormularioPagoStripe from '@/app/components/checkout/FormularioPagoStripe'

// Subcomponentes
import BadgeDisponibilidad from './BadgeDisponibilidad'
import CondicionesComerciales from './CondicionesComerciales'
import ServiciosAgrupados from './ServiciosAgrupados'
import BotonPago from './BotonPago'

// 🔑 Configuración de Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

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
    const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState<string>('')
    const [precioFinalStripe, setPrecioFinalStripe] = useState<number>(0)
    const [infoMetodoPago, setInfoMetodoPago] = useState<{
        esMSI: boolean
        numMSI: number
        esAnticipo: boolean
        montoPorPago: number
    } | null>(null)
    const [fechaDisponible, setFechaDisponible] = useState<boolean>(true)
    const [loading, setLoading] = useState(false)
    const [conectado, setConectado] = useState(false)
    const [totalCotizacion, setTotalCotizacion] = useState<number>(0)

    // 🚀 Estados para Payment Intents con modal
    const [modalPagoAbierto, setModalPagoAbierto] = useState(false)
    const [clientSecret, setClientSecret] = useState<string | null>(null)
    const [procesandoPago, setProcesandoPago] = useState(false)

    // Función para obtener el total de la cotización
    const calcularTotalCotizacion = () => {
        // Usar directamente el precio de la cotización
        const precio = cotizacion.precio || 0
        console.log('� Precio de cotización:', precio)
        return precio
    }

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

    // Efecto para calcular el total cuando cambie la cotización
    useEffect(() => {
        const total = calcularTotalCotizacion()
        setTotalCotizacion(total)
        console.log('💰 Total de cotización actualizado:', total)
    }, [cotizacion.precio])

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

    const cargarCondicionesComerciales = async () => {
        try {
            console.log('🏪 === CARGANDO CONDICIONES COMERCIALES ===')
            const condicionesActivas = await obtenerCondicionesComerciales()

            // Filtrar solo las condiciones activas
            const condicionesFiltradas = condicionesActivas.filter(condicion => {
                return condicion.status === 'active' || condicion.status === 'activa'
            })

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

    const cargarServiciosAgrupados = async () => {
        try {
            setLoading(true)
            // console.log('🔍 === INICIANDO DEBUG DE SERVICIOS ===')
            // console.log('1. Evento ID:', evento.id)
            // console.log('2. Cotización ID:', cotizacion.id)

            // Usar los servicios que ya vienen en la cotizacion
            // console.log('3. Usando servicios de cotización directamente...')

            if (!cotizacion.Servicio || cotizacion.Servicio.length === 0) {
                console.log('❌ No hay servicios en la cotización')
                setServiciosAgrupados({})
                return
            }

            // console.log('✅ Servicios encontrados:', cotizacion.Servicio.length)

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

            // 🔧 ORDENAMIENTO DESHABILITADO TEMPORALMENTE PARA DIAGNÓSTICO
            console.log('🔍 COTIZACIÓN PÚBLICA - Servicios sin ordenar frontend:');
            Object.entries(agrupados).forEach(([seccionNombre, seccionData]) => {
                console.log(`\n📁 Sección: ${seccionNombre} (posicion: ${seccionData.posicion})`);
                Object.entries(seccionData.categorias).forEach(([categoriaNombre, categoriaData]) => {
                    console.log(`  📂 Categoría: ${categoriaNombre} (posicion: ${categoriaData.posicion})`);
                    categoriaData.servicios.forEach((servicio: any, index: number) => {
                        const posicion = servicio.posicion || 'sin posición';
                        const nombre = servicio.nombre;
                        console.log(`    ${index + 1}. [${posicion}] ${nombre}`);
                    });
                });
            });

            // COMENTADO TEMPORALMENTE: Ordenamiento frontend
            // Object.keys(agrupados).forEach(seccionNombre => {
            //     Object.keys(agrupados[seccionNombre].categorias).forEach(categoriaNombre => {
            //         agrupados[seccionNombre].categorias[categoriaNombre].servicios.sort(
            //             (a: ServicioDetalle, b: ServicioDetalle) => (a.posicion || 0) - (b.posicion || 0)
            //         );
            //     });
            // });

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

            console.log('🔍 === FIN DEBUG DE SERVICIOS ===')
            setServiciosAgrupados(agrupados)
        } catch (error) {
            console.error('Error al cargar servicios agrupados:', error)
            setServiciosAgrupados({})
        } finally {
            setLoading(false)
        }
    }

    const cargarCostos = async () => {
        console.log('Cargando costos...')
        // Aquí iría la llamada real para obtener costos
    }

    // 🚀 NUEVA FUNCIÓN PAYMENT INTENTS - Reemplaza create-session
    const iniciarPago = async () => {
        if (!fechaDisponible) {
            alert('Lo sentimos, la fecha ya ha sido ocupada por otro cliente.')
            return
        }

        if (!condicionSeleccionada || !metodoPagoSeleccionado) {
            alert('Por favor selecciona una condición comercial y método de pago.')
            return
        }

        if (procesandoPago) return

        setProcesandoPago(true)
        console.log('🚀 Iniciando creación de Payment Intent...')

        try {
            // Obtener información del método de pago seleccionado
            const condicionActiva = condicionesComerciales.find(c => c.id === condicionSeleccionada)
            const metodoActivo = condicionActiva?.metodosPago.find((m: any) => m.metodoPagoId === metodoPagoSeleccionado)

            // Determinar el tipo de método de pago
            let metodoPago = 'card' // Por defecto
            if (metodoActivo) {
                metodoPago = metodoActivo.payment_method || metodoActivo.metodo_pago || 'card'
            }

            // 🎯 LLAMADA A PAYMENT INTENT API
            const response = await fetch('/api/checkout/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cotizacionId: cotizacion.id,
                    metodoPago: metodoPago,
                    montoConComision: precioFinalStripe,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Error al preparar el pago.')
            }

            console.log('✅ Payment Intent creado:', {
                paymentIntentId: data.paymentIntentId,
                metodoPago: data.metodoPago,
                montoFinal: data.montoFinal,
                clientSecret: data.clientSecret ? '***RECIBIDO***' : 'NO_RECIBIDO'
            })

            // 🎨 Abrir modal con el clientSecret
            setClientSecret(data.clientSecret)
            setModalPagoAbierto(true)

        } catch (error) {
            console.error('❌ Error al crear Payment Intent:', error)
            alert('Error al preparar el pago. Por favor inténtalo de nuevo.')
        }

        setProcesandoPago(false)
    }

    const cerrarModalPago = () => {
        setModalPagoAbierto(false)
        setClientSecret(null)
        setProcesandoPago(false)
    }

    const onPagoExitoso = () => {
        console.log('✅ Pago procesado exitosamente')
        setModalPagoAbierto(false)
        setClientSecret(null)
        // Aquí podrías actualizar el estado de la cotización, mostrar mensaje de éxito, etc.
    }

    const handleCondicionChange = (condicionId: string) => {
        setCondicionSeleccionada(condicionId)
        // Limpiar método de pago cuando cambie la condición
        setMetodoPagoSeleccionado('')
        setPrecioFinalStripe(0)
        setInfoMetodoPago(null)
    }

    const handleMetodoPagoChange = (metodoPagoId: string, precioFinal: number) => {
        setMetodoPagoSeleccionado(metodoPagoId)
        setPrecioFinalStripe(precioFinal)

        // Buscar información detallada del método de pago
        const condicionActiva = condicionesComerciales.find(c => c.id === condicionSeleccionada)
        const metodoActivo = condicionActiva?.metodosPago.find((m: any) => m.metodoPagoId === metodoPagoId)

        if (metodoActivo) {
            const esMSI = metodoActivo.num_msi > 0
            const esAnticipo = !!condicionActiva?.porcentaje_anticipo && condicionActiva.porcentaje_anticipo > 0
            const montoPorPago = esMSI ? precioFinal / metodoActivo.num_msi : precioFinal

            setInfoMetodoPago({
                esMSI,
                numMSI: metodoActivo.num_msi,
                esAnticipo,
                montoPorPago
            })

            console.log('💳 Método de pago seleccionado:', {
                metodoPagoId,
                precioFinal: precioFinal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
                esMSI,
                numMSI: metodoActivo.num_msi,
                esAnticipo,
                montoPorPago: montoPorPago.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
            })
        }
    }

    const puedeRealizarPago = fechaDisponible && !!condicionSeleccionada && !!metodoPagoSeleccionado
    const urlRegreso = esLegacy ? `/cotizacion/${cotizacion.id}` : `/evento/${evento.id}`

    return (
        <div className="min-h-screen bg-zinc-900">
            {/* Indicador de tiempo real */}
            {esRealtime && (
                <div className="bg-blue-600/20 border-b border-blue-500/30">
                    <div className="max-w-md mx-auto p-2">
                        <div className="flex items-center justify-center space-x-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                            <span className="text-blue-400 font-medium text-sm">
                                {conectado ? 'Conectado en tiempo real' : 'Conectando...'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-zinc-800 border-b border-zinc-700">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-3">
                        <Link href={urlRegreso}>
                            <button className="text-zinc-400 hover:text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        </Link>
                        <div>
                            <h1 className="text-white font-bold text-lg">
                                {evento.nombre || 'Evento sin nombre'}
                            </h1>
                            <p className="text-zinc-400 text-sm">
                                {new Date(evento.fecha_evento).toLocaleDateString('es-MX', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>

                    <button className="text-zinc-400 hover:text-white">
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
                {/* Servicios incluidos */}
                <ServiciosAgrupados
                    serviciosAgrupados={serviciosAgrupados}
                    loading={loading}
                    esRealtime={esRealtime}
                />

                {/* Condiciones comerciales */}
                <CondicionesComerciales
                    condicionesComerciales={condicionesComerciales}
                    condicionSeleccionada={condicionSeleccionada}
                    onCondicionChange={handleCondicionChange}
                    fechaDisponible={fechaDisponible}
                    montoTotal={totalCotizacion}
                    metodoPagoSeleccionado={metodoPagoSeleccionado}
                    onMetodoPagoChange={handleMetodoPagoChange}
                />
            </div>

            {/* Botón de pago */}
            <BotonPago
                puedeRealizarPago={puedeRealizarPago}
                fechaDisponible={fechaDisponible}
                condicionSeleccionada={condicionSeleccionada}
                metodoPagoSeleccionado={metodoPagoSeleccionado}
                precioFinal={precioFinalStripe}
                infoMetodoPago={infoMetodoPago}
                onIniciarPago={iniciarPago}
                loading={procesandoPago}
            />

            {/* 🔥 MODAL DE PAGO CON STRIPE ELEMENTS */}
            {modalPagoAbierto && clientSecret && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-white text-xl font-bold">Completa tu pago</h2>
                            <button
                                onClick={cerrarModalPago}
                                className="text-zinc-400 hover:text-white text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <Elements
                            stripe={stripePromise}
                            options={{
                                clientSecret,
                                appearance: {
                                    theme: 'night',
                                    variables: {
                                        colorPrimary: '#8b5cf6',
                                        colorBackground: '#27272a',
                                        colorText: '#ffffff',
                                        colorDanger: '#ef4444',
                                        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                                        spacingUnit: '4px',
                                        borderRadius: '8px',
                                    }
                                }
                            }}
                        >
                            <FormularioPagoStripe
                                cotizacionId={cotizacion.id}
                                paymentData={{
                                    montoFinal: precioFinalStripe,
                                    esMSI: infoMetodoPago?.esMSI || false,
                                    numMSI: infoMetodoPago?.numMSI || 0,
                                    tipoPago: infoMetodoPago?.esMSI ? 'card' : 'spei',
                                    cotizacion: {
                                        nombre: cotizacion.nombre || 'Cotización',
                                        cliente: cotizacion.Evento?.Cliente?.nombre || 'Cliente'
                                    },
                                    metodo: {
                                        nombre: infoMetodoPago?.esMSI ? `${infoMetodoPago.numMSI} MSI` : 'Pago único',
                                        tipo: infoMetodoPago?.esMSI ? 'msi' : 'single'
                                    }
                                }}
                                onSuccess={onPagoExitoso}
                                onCancel={cerrarModalPago}
                            />
                        </Elements>

                        <button
                            onClick={cerrarModalPago}
                            className="text-zinc-400 text-sm mt-4 w-full text-center hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
