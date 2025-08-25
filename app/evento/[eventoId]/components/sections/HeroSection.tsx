'use client'
import React from 'react'
import { Calendar, Clock, MapPin, User } from 'lucide-react'

interface Evento {
    id: string
    nombre: string | null
    fecha_evento: Date
    sede?: string | null
    direccion?: string | null
    EventoTipo?: {
        nombre: string
        id?: string
    } | null
    Cliente?: {
        nombre: string
        id?: string
        telefono?: string | null
        email?: string | null
    } | null
}

interface Props {
    evento: Evento
    diasRestantes: number
    tipoContenido: 'cotizaciones' | 'paquetes' | 'preparando'
    cantidadOpciones?: number
}

export default function HeroSection({
    evento,
    diasRestantes,
    tipoContenido,
    cantidadOpciones = 0
}: Props) {
    const fechaEvento = new Date(evento.fecha_evento)

    const formatearFecha = (fecha: Date) => {
        return fecha.toLocaleDateString('es-MX', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getTipoEventoIcon = (tipo?: string) => {
        if (!tipo) return '🎉'
        if (tipo.toLowerCase().includes('boda')) return '💍'
        if (tipo.toLowerCase().includes('xv') || tipo.toLowerCase().includes('15')) return '👑'
        if (tipo.toLowerCase().includes('bautizo')) return '🤍'
        if (tipo.toLowerCase().includes('primera comunión')) return '✨'
        if (tipo.toLowerCase().includes('graduación')) return '🎓'
        if (tipo.toLowerCase().includes('baby shower')) return '👶'
        return '🎉'
    }

    const getStatusColor = (dias: number) => {
        if (dias < 30) return 'text-orange-400 bg-orange-500/20 border-orange-500/30'
        if (dias < 60) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
        return 'text-green-400 bg-green-500/20 border-green-500/30'
    }

    const getContenidoTexto = () => {
        switch (tipoContenido) {
            case 'cotizaciones':
                return {
                    titulo: `${evento.Cliente?.nombre}`,
                    subtitulo: cantidadOpciones === 1
                        ? 'Tenemos una cotización especial para ti'
                        : `Tenemos ${cantidadOpciones} cotizaciones para tu evento`,
                    descripcion: `Hemos preparado las mejores opciones para tu ${evento.EventoTipo?.nombre?.toLowerCase()}`
                }
            case 'paquetes':
                return {
                    titulo: `${evento.Cliente?.nombre}`,
                    subtitulo: 'Tenemos paquetes especiales para ti',
                    descripcion: `Elige el paquete perfecto para tu ${evento.EventoTipo?.nombre?.toLowerCase()}`
                }
            case 'preparando':
                return {
                    titulo: `${evento.Cliente?.nombre}`,
                    subtitulo: 'Estamos preparando tu cotización',
                    descripcion: 'Nuestro equipo está trabajando en las mejores opciones para tu evento'
                }
            default:
                return {
                    titulo: `${evento.Cliente?.nombre}`,
                    subtitulo: 'Tu evento especial',
                    descripcion: `Todo listo para tu ${evento.EventoTipo?.nombre?.toLowerCase()}`
                }
        }
    }

    const contenido = getContenidoTexto()

    return (
        <section className="relative pt-20 pb-12 px-4 overflow-hidden min-h-[60vh] sm:min-h-[70vh]">
            {/* Video Background */}
            <div className="absolute inset-0">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                    poster="https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/logos/logotipo_blanco.svg"
                >
                    <source
                        src="https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/video/hero-30fps.webm"
                        type="video/webm"
                    />
                    {/* Fallback para navegadores que no soporten WebM */}
                    <source
                        src="https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/video/hero-30fps.mp4"
                        type="video/mp4"
                    />
                </video>

                {/* Overlay gradient para mejorar legibilidad */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />

                {/* Overlay de color temático sutil */}
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-purple-900/20" />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto text-center">
                {/* Cliente y título principal */}
                <div className="mb-6">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-lg mb-4">
                        {contenido.titulo}
                    </h1>
                    <p className="text-lg sm:text-xl text-white/90 font-medium drop-shadow-md">
                        {contenido.subtitulo}
                    </p>
                </div>

                {/* Información del evento */}
                <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-2xl p-6 mb-8 max-w-2xl mx-auto shadow-2xl">
                    {/* Tipo de evento con emoji */}
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <span className="text-2xl drop-shadow-sm">{getTipoEventoIcon(evento.EventoTipo?.nombre)}</span>
                        <span className="text-white font-semibold text-lg drop-shadow-sm">
                            {evento.EventoTipo?.nombre}
                        </span>
                    </div>

                    {/* Detalles del evento */}
                    <div className="space-y-3 text-sm sm:text-base">
                        {/* Fecha */}
                        <div className="flex items-center justify-center gap-2 text-white/90">
                            <Calendar className="w-4 h-4 text-white/80" />
                            <span className="drop-shadow-sm">{formatearFecha(fechaEvento)}</span>
                        </div>

                        {/* Días restantes */}
                        <div className="flex items-center justify-center gap-2">
                            <Clock className="w-4 h-4 text-white/80" />
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${getStatusColor(diasRestantes)}`}>
                                {diasRestantes === 0 ? '¡Es hoy!' :
                                    diasRestantes === 1 ? '¡Mañana!' :
                                        diasRestantes < 0 ? 'Evento finalizado' :
                                            `Faltan ${diasRestantes} días`}
                            </span>
                        </div>

                        {/* Ubicación si existe */}
                        {(evento.sede || evento.direccion) && (
                            <div className="flex items-center justify-center gap-2 text-white/90">
                                <MapPin className="w-4 h-4 text-white/80 flex-shrink-0" />
                                <span className="truncate drop-shadow-sm">
                                    {evento.sede || evento.direccion}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Descripción */}
                <p className="text-white/90 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed drop-shadow-md">
                    {contenido.descripcion}
                </p>

                {/* Indicador visual para mobile */}
                <div className="mt-8 flex justify-center lg:hidden">
                    <div className="flex items-center gap-2 text-xs text-white/70 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                        <span className="drop-shadow-sm">Desliza hacia abajo</span>
                        <div className="w-5 h-5 border border-white/60 rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white/80 rounded-full animate-bounce" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
