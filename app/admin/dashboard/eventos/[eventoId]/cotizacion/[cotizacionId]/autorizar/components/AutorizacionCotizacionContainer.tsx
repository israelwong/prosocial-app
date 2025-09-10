'use client'
import React, { useState } from 'react'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { autorizarCotizacion } from '@/app/admin/_lib/actions/cotizacion/cotizacion.actions'
import RevisionCotizacion from './RevisionCotizacion'
import ConfiguracionComercialComponent from './ConfiguracionComercial'
import SeleccionMetodosPago from './SeleccionMetodosPago'
import ConfiguracionPagos from './ConfiguracionPagos'
import VistaPrevia from './VistaPrevia'
import type {
    AutorizacionCotizacionData,
    AutorizacionCuentaBancaria,
    ConfiguracionComercial,
    MetodoPago,
    CalendarioPagos
} from '../types'

interface Props {
    cotizacion: AutorizacionCotizacionData
    cuentasBancarias: AutorizacionCuentaBancaria[]
    eventoId: string
}

const PASOS = {
    REVISION: 'revision',
    CONFIGURACION_COMERCIAL: 'configuracion_comercial',
    METODOS_PAGO: 'metodos_pago',
    CONFIGURACION_PAGOS: 'configuracion_pagos',
    VISTA_PREVIA: 'vista_previa'
}

const TITULOS_PASOS = {
    [PASOS.REVISION]: 'Revisión de Cotización',
    [PASOS.CONFIGURACION_COMERCIAL]: 'Condiciones Comerciales',
    [PASOS.METODOS_PAGO]: 'Métodos de Pago',
    [PASOS.CONFIGURACION_PAGOS]: 'Calendario de Pagos',
    [PASOS.VISTA_PREVIA]: 'Vista Previa y Autorización'
}

export default function AutorizacionCotizacionContainer({
    cotizacion,
    cuentasBancarias,
    eventoId
}: Props) {
    const router = useRouter()
    const [pasoActual, setPasoActual] = useState(PASOS.REVISION)
    const [procesando, setProcesando] = useState(false)

    // Estados de configuración
    const [configuracionComercial, setConfiguracionComercial] = useState<ConfiguracionComercial>({
        totalOriginal: cotizacion.total,
        totalFinal: cotizacion.total,
        anticipoOriginal: cotizacion.anticipo,
        anticipoFinal: cotizacion.anticipo,
        porcentajeAnticipo: Math.round((cotizacion.anticipo / cotizacion.total) * 100),
        descuentos: [],
        observaciones: ''
    })

    const [metodoPago, setMetodoPago] = useState<MetodoPago>({
        cuentaBancariaId: cuentasBancarias.find(c => c.principal)?.id || '',
        tipoTransferencia: 'spei',
        requiereComprobante: true
    })

    const [calendarioPagos, setCalendarioPagos] = useState<CalendarioPagos>({
        fechaLimiteAnticipo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
        fechaVencimientoRevenue: new Date(cotizacion.Evento.fecha_evento),
        penalizaciones: {
            activadas: false,
            porcentajeDiario: 0.5
        },
        descuentoProntoPago: {
            activado: false,
            porcentaje: 2,
            diasAnticipacion: 15
        }
    })

    // Configuración inicial de la revisión
    const [configuracionRevision, setConfiguracionRevision] = useState<{
        condicionComercialId: string
        metodoPagoId: string
        montoFinal: number
    } | null>(null)

    const pasos = [
        PASOS.REVISION,
        PASOS.CONFIGURACION_COMERCIAL,
        PASOS.METODOS_PAGO,
        PASOS.CONFIGURACION_PAGOS,
        PASOS.VISTA_PREVIA
    ]

    const indiceActual = pasos.indexOf(pasoActual)
    const esPrimerPaso = indiceActual === 0
    const esUltimoPaso = indiceActual === pasos.length - 1

    const siguientePaso = () => {
        if (!esUltimoPaso) {
            setPasoActual(pasos[indiceActual + 1])
        }
    }

    const pasoAnterior = () => {
        if (!esPrimerPaso) {
            setPasoActual(pasos[indiceActual - 1])
        }
    }

    const volverALista = () => {
        router.push(`/admin/dashboard/eventos/${eventoId}/cotizacion`)
    }

    const autorizarCotizacionFinal = async () => {
        setProcesando(true)

        try {
            const resultado = await autorizarCotizacion(cotizacion.id)

            if (resultado.success) {
                toast.success('Cotización autorizada exitosamente')
                router.push(`/admin/dashboard/eventos/${eventoId}/cotizacion`)
            } else {
                toast.error(resultado.error || 'Error al autorizar cotización')
            }
        } catch (error) {
            console.error('Error autorizando cotización:', error)
            toast.error('Error inesperado al autorizar cotización')
        } finally {
            setProcesando(false)
        }
    }

    const renderPasoActual = () => {
        switch (pasoActual) {
            case PASOS.REVISION:
                return (
                    <RevisionCotizacion
                        cotizacion={cotizacion}
                        onContinuar={(configuracion: {
                            condicionComercialId: string
                            metodoPagoId: string
                            montoFinal: number
                        }) => {
                            setConfiguracionRevision(configuracion)
                            siguientePaso()
                        }}
                    />
                )
            case PASOS.CONFIGURACION_COMERCIAL:
                return (
                    <ConfiguracionComercialComponent
                        configuracion={configuracionComercial}
                        onChange={setConfiguracionComercial}
                        onContinuar={siguientePaso}
                        onVolver={pasoAnterior}
                    />
                )
            case PASOS.METODOS_PAGO:
                return (
                    <SeleccionMetodosPago
                        cuentasBancarias={cuentasBancarias}
                        configuracion={metodoPago}
                        onChange={setMetodoPago}
                        onContinuar={siguientePaso}
                        onVolver={pasoAnterior}
                    />
                )
            case PASOS.CONFIGURACION_PAGOS:
                return (
                    <ConfiguracionPagos
                        configuracion={calendarioPagos}
                        onChange={setCalendarioPagos}
                        fechaEvento={new Date(cotizacion.Evento.fecha_evento)}
                        onContinuar={siguientePaso}
                        onVolver={pasoAnterior}
                    />
                )
            case PASOS.VISTA_PREVIA:
                return (
                    <VistaPrevia
                        cotizacion={cotizacion}
                        configuracionComercial={configuracionComercial}
                        metodoPago={metodoPago}
                        calendarioPagos={calendarioPagos}
                        cuentasBancarias={cuentasBancarias}
                        onAutorizar={autorizarCotizacionFinal}
                        onVolver={pasoAnterior}
                        procesando={procesando}
                    />
                )
            default:
                return null
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100">
            {/* Header */}
            <div className="border-b border-zinc-800 bg-zinc-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={volverALista}
                                className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors"
                            >
                                <ArrowLeft size={20} />
                                <span>Volver a cotizaciones</span>
                            </button>
                            <div className="h-6 w-px bg-zinc-700" />
                            <div>
                                <h1 className="text-xl font-semibold text-zinc-100">
                                    Autorizar Cotización
                                </h1>
                                <p className="text-sm text-zinc-400">
                                    {cotizacion.Evento.nombre} • {cotizacion.Evento.Cliente.nombre}
                                </p>
                            </div>
                        </div>

                        {/* Indicador de progreso */}
                        <div className="flex items-center gap-3">
                            {pasos.map((paso, index) => (
                                <div key={paso} className="flex items-center gap-2">
                                    <div className={`
                                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                                        ${index <= indiceActual
                                            ? 'bg-green-600 text-white'
                                            : 'bg-zinc-700 text-zinc-400'
                                        }
                                    `}>
                                        {index < indiceActual ? (
                                            <CheckCircle size={16} />
                                        ) : (
                                            index + 1
                                        )}
                                    </div>
                                    {index < pasos.length - 1 && (
                                        <div className={`
                                            w-8 h-0.5 
                                            ${index < indiceActual
                                                ? 'bg-green-600'
                                                : 'bg-zinc-700'
                                            }
                                        `} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Título del paso actual */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <h2 className="text-2xl font-bold text-zinc-100">
                    {TITULOS_PASOS[pasoActual]}
                </h2>
                <p className="text-zinc-400 mt-1">
                    Paso {indiceActual + 1} de {pasos.length}
                </p>
            </div>

            {/* Contenido del paso */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                {renderPasoActual()}
            </div>
        </div>
    )
}
