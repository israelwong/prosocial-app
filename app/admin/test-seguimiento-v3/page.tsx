import { obtenerEventoDetalleCompleto } from '@/app/admin/_lib/actions/seguimiento/seguimiento-detalle.actions'
import { SeguimientoDetalleV3 } from '@/app/admin/dashboard/seguimiento/[eventoId]/components'

interface TestSeguimientoDetalleV3Props {
    searchParams: {
        eventoId?: string
    }
}

export default async function TestSeguimientoDetalleV3({ searchParams }: TestSeguimientoDetalleV3Props) {
    const eventoId = searchParams.eventoId || 'cmbfshz3c0015jq04gwmzpirl'

    console.log('🧪 TEST V3 - Cargando datos para evento:', eventoId)

    try {
        const datosEventoRaw = await obtenerEventoDetalleCompleto(eventoId)
        // Asegurarse de que 'servicios' esté presente en el objeto de datos
        const datosEvento = {
            ...datosEventoRaw,
            servicios: datosEventoRaw.cotizacion?.servicios ?? [],
            evento: {
                id: datosEventoRaw.evento.id ?? '',
                nombre: datosEventoRaw.evento.nombre,
                // fecha: datosEventoRaw.evento.fecha, // Eliminado porque no existe en EventoExtendido
                fecha: datosEventoRaw.evento.fecha_evento ? String(datosEventoRaw.evento.fecha_evento) : '', // Agregado para cumplir con el tipo requerido
                fecha_evento: datosEventoRaw.evento.fecha_evento ? String(datosEventoRaw.evento.fecha_evento) : '',
                // hora: datosEventoRaw.evento.hora,
                // locacion: datosEventoRaw.evento.locacion,
                cliente: {
                    nombre: datosEventoRaw.cliente?.nombre ?? '',
                    telefono: datosEventoRaw.cliente?.telefono ?? undefined,
                    email: datosEventoRaw.cliente?.email ?? undefined,
                },
                status: datosEventoRaw.evento.status ?? '',
                eventoTipo: datosEventoRaw.tipoEvento,
            }
        }

        // Simular datos de bitácora para la demostración
        const bitacoraMock = [
            {
                id: '1',
                fecha: new Date().toISOString(),
                tipo: 'nota',
                titulo: 'Reunión inicial con cliente',
                descripcion: 'Se discutieron los detalles del evento y las preferencias del cliente.',
                usuario: 'Israel Wong',
                status: 'completado'
            },
            {
                id: '2',
                fecha: new Date(Date.now() - 86400000).toISOString(),
                tipo: 'tarea',
                titulo: 'Confirmar disponibilidad de locación',
                descripcion: 'Verificar que la locación esté disponible para la fecha solicitada.',
                usuario: 'María González',
                status: 'pendiente'
            },
            {
                id: '3',
                fecha: new Date(Date.now() - 172800000).toISOString(),
                tipo: 'llamada',
                titulo: 'Llamada de seguimiento',
                descripcion: 'Contacto telefónico para confirmar detalles finales.',
                usuario: 'Carlos Ruiz',
                status: 'completado'
            }
        ]

        // Handlers para las acciones (mock)
        const handleEditarEvento = () => {
            console.log('🔧 Editar evento:', eventoId)
        }

        const handleAgregarServicio = () => {
            console.log('➕ Agregar servicio al evento:', eventoId)
        }

        const handleEditarServicio = (servicioId: string) => {
            console.log('✏️ Editar servicio:', servicioId)
        }

        const handleAgregarPago = () => {
            console.log('💰 Agregar pago al evento:', eventoId)
        }

        const handleVerDetallePago = (pagoId: string) => {
            console.log('👁️ Ver detalle del pago:', pagoId)
        }

        const handleDescargarRecibo = (pagoId: string) => {
            console.log('📄 Descargar recibo del pago:', pagoId)
        }

        const handleAgregarEntradaBitacora = () => {
            console.log('📝 Agregar entrada a bitácora:', eventoId)
        }

        const handleVerDetalleBitacora = (entradaId: string) => {
            console.log('👁️ Ver detalle de bitácora:', entradaId)
        }

        const handleGenerarContrato = () => {
            console.log('📋 Generar contrato para evento:', eventoId)
        }

        const handleDescargarReporte = () => {
            console.log('📊 Descargar reporte del evento:', eventoId)
        }

        const handleCompartirEvento = () => {
            console.log('🔗 Compartir evento:', eventoId)
        }

        const handleImprimirResumen = () => {
            console.log('🖨️ Imprimir resumen del evento:', eventoId)
        }

        const handleConfiguracionAvanzada = () => {
            console.log('⚙️ Configuración avanzada del evento:', eventoId)
        }

        return (
            <div className="min-h-screen bg-gray-50">
                <div className="bg-white border-b border-gray-200 mb-6">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Seguimiento de Evento V3 - Prueba
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Versión 3.0 de los componentes de seguimiento de eventos
                        </p>
                    </div>
                </div>

                <SeguimientoDetalleV3
                    data={datosEvento}
                    bitacora={bitacoraMock}
                    onEditarEvento={handleEditarEvento}
                    onAgregarServicio={handleAgregarServicio}
                    onEditarServicio={handleEditarServicio}
                    onAgregarPago={handleAgregarPago}
                    onVerDetallePago={handleVerDetallePago}
                    onDescargarRecibo={handleDescargarRecibo}
                    onAgregarEntradaBitacora={handleAgregarEntradaBitacora}
                    onVerDetalleBitacora={handleVerDetalleBitacora}
                    onGenerarContrato={handleGenerarContrato}
                    onDescargarReporte={handleDescargarReporte}
                    onCompartirEvento={handleCompartirEvento}
                    onImprimirResumen={handleImprimirResumen}
                    onConfiguracionAvanzada={handleConfiguracionAvanzada}
                />
            </div>
        )

    } catch (error) {
        console.error('❌ Error cargando datos V3:', error)

        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">
                        Error al cargar los datos
                    </h1>
                    <p className="text-gray-600 mb-4">
                        No se pudieron cargar los datos del evento para la prueba V3
                    </p>
                    <p className="text-sm text-gray-500">
                        Error: {error instanceof Error ? error.message : 'Error desconocido'}
                    </p>
                </div>
            </div>
        )
    }
}
