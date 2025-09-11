'use client'
import React, { useEffect, useState } from 'react'
import { X, Building2, Copy, Check, CreditCard } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { obtenerCuentasBancarias, type NegocioBanco } from '@/app/admin/_lib/actions/negocio/negocioBanco.actions'

interface Props {
    isOpen: boolean
    onClose: () => void
}

export default function ModalCuentasBancarias({ isOpen, onClose }: Props) {
    const [cuentas, setCuentas] = useState<NegocioBanco[]>([])
    const [loading, setLoading] = useState(false)
    const [copiado, setCopiado] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            cargarCuentas()
        }
    }, [isOpen])

    const cargarCuentas = async () => {
        try {
            setLoading(true)
            const cuentasBancarias = await obtenerCuentasBancarias()
            setCuentas(cuentasBancarias)
        } catch (error) {
            console.error('Error al cargar cuentas bancarias:', error)
        } finally {
            setLoading(false)
        }
    }

    const copiarTexto = async (texto: string, tipo: string) => {
        try {
            await navigator.clipboard.writeText(texto)
            setCopiado(`${tipo}-${texto}`)
            setTimeout(() => setCopiado(null), 2000)
        } catch (error) {
            console.error('Error al copiar:', error)
        }
    }

    const formatearCLABE = (clabe: string) => {
        // Formatear CLABE en grupos de 4 dígitos: 1234 5678 9012 3456 78
        return clabe.replace(/(\d{4})/g, '$1 ').trim()
    }

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    if (!isOpen) return null

    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto"
            onClick={handleOverlayClick}
        >
            <div className="bg-zinc-900 rounded-lg border border-zinc-700 w-full max-w-2xl max-h-[85vh] my-auto overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-700">
                    <div className="flex items-center gap-3">
                        <Building2 className="h-6 w-6 text-blue-400" />
                        <h2 className="text-xl font-semibold text-zinc-100">
                            Cuentas CLABE del Negocio
                        </h2>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-600"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                        </div>
                    ) : cuentas.length === 0 ? (
                        <div className="text-center py-12">
                            <CreditCard className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
                            <p className="text-zinc-400 text-lg mb-2">No hay cuentas bancarias registradas</p>
                            <p className="text-zinc-500 text-sm">
                                Ve a Configuración → Cuenta Bancaria para agregar una cuenta
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cuentas.map((cuenta) => (
                                <div
                                    key={cuenta.id}
                                    className={`p-5 rounded-lg border transition-colors ${cuenta.principal
                                            ? 'bg-blue-500/10 border-blue-500/30'
                                            : 'bg-zinc-800/50 border-zinc-700'
                                        }`}
                                >
                                    {/* Header de la cuenta */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-zinc-100 text-lg">
                                                {cuenta.banco}
                                            </h3>
                                            {cuenta.principal && (
                                                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                                                    Principal
                                                </span>
                                            )}
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-full ${cuenta.status === 'activo'
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                            }`}>
                                            {cuenta.status === 'activo' ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </div>

                                    {/* Información de la cuenta */}
                                    <div className="space-y-3">
                                        {/* Beneficiario */}
                                        <div>
                                            <label className="text-sm text-zinc-400 mb-1 block">
                                                Beneficiario
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <span className="text-zinc-200 font-medium">
                                                    {cuenta.beneficiario}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => copiarTexto(cuenta.beneficiario, 'beneficiario')}
                                                    className="h-7 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-600"
                                                >
                                                    {copiado === `beneficiario-${cuenta.beneficiario}` ? (
                                                        <Check className="h-3 w-3" />
                                                    ) : (
                                                        <Copy className="h-3 w-3" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>

                                        {/* CLABE */}
                                        <div>
                                            <label className="text-sm text-zinc-400 mb-1 block">
                                                CLABE Interbancaria
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <span className="text-zinc-200 font-mono text-lg tracking-wider">
                                                    {formatearCLABE(cuenta.clabe)}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => copiarTexto(cuenta.clabe, 'clabe')}
                                                    className="h-7 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-600"
                                                >
                                                    {copiado === `clabe-${cuenta.clabe}` ? (
                                                        <Check className="h-3 w-3" />
                                                    ) : (
                                                        <Copy className="h-3 w-3" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Número de cuenta (opcional) */}
                                        {cuenta.cuenta && (
                                            <div>
                                                <label className="text-sm text-zinc-400 mb-1 block">
                                                    Número de Cuenta
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-zinc-200 font-mono">
                                                        {cuenta.cuenta}
                                                    </span>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => copiarTexto(cuenta.cuenta!, 'cuenta')}
                                                        className="h-7 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-600"
                                                    >
                                                        {copiado === `cuenta-${cuenta.cuenta}` ? (
                                                            <Check className="h-3 w-3" />
                                                        ) : (
                                                            <Copy className="h-3 w-3" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Sucursal (opcional) */}
                                        {cuenta.sucursal && (
                                            <div>
                                                <label className="text-sm text-zinc-400 mb-1 block">
                                                    Sucursal
                                                </label>
                                                <span className="text-zinc-200">
                                                    {cuenta.sucursal}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-zinc-700 bg-zinc-800/50">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-zinc-400">
                            {cuentas.length > 0
                                ? `${cuentas.length} cuenta${cuentas.length === 1 ? '' : 's'} registrada${cuentas.length === 1 ? '' : 's'}`
                                : 'Administra tus cuentas bancarias desde Configuración'
                            }
                        </p>
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="bg-zinc-700 hover:bg-zinc-600 text-zinc-200 border-zinc-600"
                        >
                            Cerrar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
