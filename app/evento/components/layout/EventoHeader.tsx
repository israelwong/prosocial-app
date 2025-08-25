'use client'
import React from 'react'
import Image from 'next/image'
import { ArrowLeft, Share2 } from 'lucide-react'

interface Props {
    showBackButton?: boolean
    onBack?: () => void
    showShareButton?: boolean
    shareTitle?: string
    shareDescription?: string
}

export default function EventoHeader({ showBackButton = false, onBack, showShareButton = false, shareTitle, shareDescription }: Props) {
    const handleCompartir = async () => {
        const url = window.location.href
        const texto = shareTitle || 'Cotización de evento'

        if (navigator.share) {
            try {
                await navigator.share({
                    title: texto,
                    text: shareDescription || 'Revisa mi cotización de evento',
                    url: url,
                })
            } catch (error) {
                // Fallback a copiar al portapapeles
                copyToClipboard(url)
            }
        } else {
            // Fallback para navegadores que no soportan Web Share API
            copyToClipboard(url)
        }
    }

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            // Notificación de éxito
            alert('¡Enlace copiado al portapapeles!')
        } catch (error) {
            // Fallback para navegadores muy antiguos
            const textArea = document.createElement('textarea')
            textArea.value = text
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
            alert('¡Enlace copiado al portapapeles!')
        }
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Lado izquierdo: Back button o espacio */}
                    <div className="flex items-center">
                        {showBackButton && (
                            <button
                                onClick={onBack}
                                className="p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                                aria-label="Volver"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Centro: Logo */}
                    <div className="flex items-center">
                        <Image
                            src="https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/logos/logotipo_blanco.svg"
                            width={100}
                            height={32}
                            alt="ProSocial"
                            className="h-7 w-auto"
                            unoptimized
                            priority
                        />
                    </div>

                    {/* Lado derecho: Botón de compartir o espacio */}
                    <div className="flex items-center">
                        {showShareButton && (
                            <button
                                onClick={handleCompartir}
                                className="p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                                title="Compartir cotización"
                                aria-label="Compartir"
                            >
                                <Share2 className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
