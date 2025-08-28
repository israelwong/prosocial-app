'use client'
import React, { useState, useEffect } from 'react'
import { Package, Link, Share, Eye, MessageCircle } from 'lucide-react'
import type { EventoCompleto } from '@/app/admin/_lib/actions/evento/evento.schemas'

interface Props {
    eventoCompleto: EventoCompleto
}

export default function FichaPaquetesCompartir({ eventoCompleto }: Props) {
    const [copiandoLink, setCopiandoLink] = useState(false)
    const [compartiendo, setCompartiendo] = useState(false)
    const [eventoUrl, setEventoUrl] = useState('')

    // Generar URL cuando el componente se monte (client-side)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setEventoUrl(`${window.location.origin}/evento/${eventoCompleto.id}`)
        }
    }, [eventoCompleto.id])

    // Generar mensaje para WhatsApp
    const mensajeWhatsApp = `Hola ${eventoCompleto.Cliente?.nombre || 'estimado cliente'}, te compartimos los paquetes disponibles para tu ${eventoCompleto.EventoTipo?.nombre?.toLowerCase() || 'evento'}: ${eventoUrl}`

    const handleCopiarLink = async () => {
        setCopiandoLink(true)
        try {
            await navigator.clipboard.writeText(eventoUrl)
            // Mostrar feedback visual
            setTimeout(() => setCopiandoLink(false), 2000)
        } catch (error) {
            console.error('Error copiando link:', error)
            setCopiandoLink(false)
        }
    }

    const handlePrevisualizar = () => {
        window.open(eventoUrl, '_blank')
    }

    const handleCompartirWhatsApp = async () => {
        setCompartiendo(true)

        try {
            // 1. Abrir WhatsApp
            const whatsappUrl = `https://wa.me/${eventoCompleto.Cliente?.telefono?.replace(/\D/g, '')}?text=${encodeURIComponent(mensajeWhatsApp)}`
            window.open(whatsappUrl, '_blank')

            // 2. Registrar en bitácora
            const response = await fetch('/api/admin/eventos/bitacora', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    eventoId: eventoCompleto.id,
                    comentario: `📦 Se compartieron los paquetes por WhatsApp - ${new Date().toLocaleString('es-ES')}`
                })
            })

            if (!response.ok) {
                throw new Error('Error al registrar en bitácora')
            }

            console.log('✅ Compartición registrada en bitácora')

        } catch (error) {
            console.error('❌ Error al compartir por WhatsApp:', error)
        } finally {
            setCompartiendo(false)
        }
    }

    return (
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-white">Compartir Paquetes</h3>
                    <p className="text-xs text-zinc-400">Opciones disponibles para el cliente</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
                {/* Copiar Link */}
                <button
                    onClick={handleCopiarLink}
                    disabled={copiandoLink}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-all duration-200 ${copiandoLink
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-600'
                        }`}
                    title="Copiar enlace al portapapeles"
                >
                    {copiandoLink ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <Link className="w-4 h-4" />
                    )}
                    <span>{copiandoLink ? '¡Copiado!' : 'Copiar Link'}</span>
                </button>

                {/* Compartir WhatsApp */}
                <button
                    onClick={handleCompartirWhatsApp}
                    disabled={compartiendo || !eventoCompleto.Cliente?.telefono}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-all duration-200 ${compartiendo
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : eventoCompleto.Cliente?.telefono
                                ? 'bg-green-600 hover:bg-green-700 text-white border border-green-500'
                                : 'bg-zinc-700 text-zinc-500 border border-zinc-600 cursor-not-allowed'
                        }`}
                    title={eventoCompleto.Cliente?.telefono ? 'Compartir por WhatsApp' : 'Sin teléfono registrado'}
                >
                    {compartiendo ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    ) : (
                        <MessageCircle className="w-4 h-4" />
                    )}
                    <span>{compartiendo ? 'Enviando...' : 'WhatsApp'}</span>
                </button>

                {/* Previsualizar */}
                <button
                    onClick={handlePrevisualizar}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg text-xs bg-blue-600 hover:bg-blue-700 text-white border border-blue-500 transition-all duration-200"
                    title="Abrir vista previa en nueva pestaña"
                >
                    <Eye className="w-4 h-4" />
                    <span>Vista Previa</span>
                </button>
            </div>
        </div>
    )
}
