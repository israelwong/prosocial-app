'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { ArrowLeft, Building2, Copy, Check, AlertCircle } from 'lucide-react'
import { useClienteAuth } from '../../../../../../hooks'

export default function SPEIPage() {
    const [copied, setCopied] = useState<string | null>(null)
    const { cliente, isAuthenticated } = useClienteAuth()
    const router = useRouter()
    const params = useParams()
    const searchParams = useSearchParams()

    const eventoId = params?.eventoId as string
    const cotizacionId = params?.cotizacionId as string
    const monto = searchParams?.get('monto')

    useEffect(() => {
        if (!isAuthenticated || !cliente) {
            return
        }

        if (!monto || parseFloat(monto) <= 0) {
            router.push(`/cliente/evento/${eventoId}/pago/${cotizacionId}`)
        }
    }, [isAuthenticated, cliente, monto, eventoId, cotizacionId, router])

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount)
    }

    const datosBancarios = {
        banco: 'BBVA México',
        cuentaClabe: '012180001234567890',
        beneficiario: 'PROSOCIAL EVENTOS SA DE CV',
        concepto: `PAGO-${cotizacionId}-${new Date().toISOString().slice(0, 10)}`
    }

    const copyToClipboard = async (text: string, field: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(field)
            setTimeout(() => setCopied(null), 2000)
        } catch (err) {
            console.error('Error al copiar:', err)
        }
    }

    if (!isAuthenticated || !monto) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-zinc-300 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-zinc-400">Cargando...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-950">
            {/* Header */}
            <div className="bg-zinc-900 shadow-sm border-b border-zinc-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center py-6">
                        <Button
                            variant="ghost"
                            onClick={() => router.push(`/cliente/evento/${eventoId}/pago/${cotizacionId}`)}
                            className="mr-4 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Button>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-zinc-100 flex items-center">
                                <Building2 className="h-6 w-6 mr-2" />
                                Transferencia SPEI
                            </h1>
                            <p className="text-zinc-400">Datos bancarios para tu transferencia</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Monto a Transferir */}
                <Card className="bg-green-900/20 border-green-800 mb-6">
                    <CardContent className="text-center py-6">
                        <div className="text-sm text-green-300 mb-1">Monto a transferir</div>
                        <div className="text-3xl font-bold text-green-400">
                            {formatMoney(parseFloat(monto))}
                        </div>
                    </CardContent>
                </Card>

                {/* Datos Bancarios */}
                <Card className="bg-zinc-900 border-zinc-800 mb-6">
                    <CardHeader>
                        <CardTitle className="text-zinc-100">Datos Bancarios</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Banco */}
                        <div className="flex justify-between items-center p-3 bg-zinc-800 rounded-lg">
                            <div>
                                <div className="text-sm text-zinc-400">Banco</div>
                                <div className="font-medium text-zinc-100">{datosBancarios.banco}</div>
                            </div>
                        </div>

                        {/* CLABE */}
                        <div className="flex justify-between items-center p-3 bg-zinc-800 rounded-lg">
                            <div className="flex-1">
                                <div className="text-sm text-zinc-400">CLABE Interbancaria</div>
                                <div className="font-mono text-lg font-medium text-zinc-100">
                                    {datosBancarios.cuentaClabe}
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(datosBancarios.cuentaClabe, 'clabe')}
                                className="text-zinc-400 hover:text-zinc-100"
                            >
                                {copied === 'clabe' ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                        </div>

                        {/* Beneficiario */}
                        <div className="flex justify-between items-center p-3 bg-zinc-800 rounded-lg">
                            <div className="flex-1">
                                <div className="text-sm text-zinc-400">Beneficiario</div>
                                <div className="font-medium text-zinc-100">{datosBancarios.beneficiario}</div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(datosBancarios.beneficiario, 'beneficiario')}
                                className="text-zinc-400 hover:text-zinc-100"
                            >
                                {copied === 'beneficiario' ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                        </div>

                        {/* Concepto */}
                        <div className="flex justify-between items-center p-3 bg-zinc-800 rounded-lg">
                            <div className="flex-1">
                                <div className="text-sm text-zinc-400">Concepto de pago</div>
                                <div className="font-mono text-sm font-medium text-zinc-100">
                                    {datosBancarios.concepto}
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(datosBancarios.concepto, 'concepto')}
                                className="text-zinc-400 hover:text-zinc-100"
                            >
                                {copied === 'concepto' ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Instrucciones */}
                <Card className="bg-blue-900/20 border-blue-800 mb-6">
                    <CardHeader>
                        <CardTitle className="text-blue-300 text-lg">📋 Instrucciones</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-blue-200">
                        <p>1. Realiza la transferencia desde tu banco en línea o aplicación móvil</p>
                        <p>2. Usa exactamente la CLABE y concepto proporcionados</p>
                        <p>3. Conserva tu comprobante de transferencia</p>
                        <p>4. El pago se reflejará en 10-30 minutos (horario bancario)</p>
                    </CardContent>
                </Card>

                {/* Advertencia */}
                <Card className="bg-amber-900/20 border-amber-800">
                    <CardContent className="py-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-amber-200">
                                <p className="font-medium mb-1">Importante:</p>
                                <p>Es muy importante que uses el concepto de pago exacto para que podamos identificar tu transferencia automáticamente.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Botón de regreso */}
                <div className="mt-8 text-center">
                    <Button
                        onClick={() => router.push(`/cliente/evento/${eventoId}/pago/${cotizacionId}`)}
                        variant="outline"
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    >
                        Volver a pagos
                    </Button>
                </div>
            </div>
        </div>
    )
}
