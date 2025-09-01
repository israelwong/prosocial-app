'use client'
import React from 'react'
import { Clock, CheckCircle } from 'lucide-react'

interface RedesSociales {
    id?: string
    plataforma: string
    username?: string
    url: string
    activo: boolean
    orden: number
}

interface Horarios {
    id?: string
    diaSemana: number
    horaInicio?: string
    horaFin?: string
    cerrado: boolean
    notas?: string
}

interface Props {
    nombre?: string
    isotipo?: string
    slogan?: string
    telefono?: string
    whatsapp?: string
    email?: string
    horarios?: Horarios[]
    redesSociales?: RedesSociales[]
}

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export default function EventoFooterDynamic({
    nombre = 'ProSocial',
    isotipo,
    slogan = 'Momentos para toda la vida',
    telefono = '5544546582',
    whatsapp,
    email = 'contacto@prosocial.mx',
    horarios = [],
    redesSociales = []
}: Props) {

    // Debug: Log de redes sociales recibidas
    // console.log('🔍 EventoFooterDynamic - Redes sociales recibidas:', {
    //     redesSociales,
    //     count: redesSociales?.length || 0,
    //     activas: redesSociales?.filter(red => red.activo)?.length || 0
    // })

    // Usar el teléfono como WhatsApp si no se especifica uno diferente
    const whatsappNumber = whatsapp || telefono

    // Formatear horarios para mostrar
    const formatearHorarios = () => {
        if (!horarios.length) {
            return (
                <>
                    <p className="text-zinc-400 text-sm">Lun - Sáb: 9:00 AM - 7:00 PM</p>
                    <p className="text-zinc-400 text-sm">Dom: 10:00 AM - 6:00 PM</p>
                </>
            )
        }

        // Agrupar horarios por tipo (días laborales)
        const horariosActivos = horarios
            .filter(h => !h.cerrado && h.horaInicio && h.horaFin)
            .sort((a, b) => a.diaSemana - b.diaSemana)

        if (!horariosActivos.length) {
            return <p className="text-zinc-400 text-sm">Horarios no disponibles</p>
        }

        return horariosActivos.map((horario) => (
            <p key={horario.id || horario.diaSemana} className="text-zinc-400 text-sm">
                {DIAS_SEMANA[horario.diaSemana]}: {horario.horaInicio} - {horario.horaFin}
            </p>
        ))
    }

    // Obtener icono de red social
    const obtenerIconoRedSocial = (plataforma: string) => {
        switch (plataforma.toLowerCase()) {
            case 'facebook':
                return (
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                )
            case 'instagram':
                return (
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                )
            case 'tiktok':
                return (
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                    </svg>
                )
            case 'youtube':
                return (
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                )
            case 'twitter':
            case 'x':
                return (
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                )
            default:
                return (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                )
        }
    }

    // Color hover según plataforma
    const obtenerColorHover = (plataforma: string) => {
        switch (plataforma.toLowerCase()) {
            case 'facebook':
                return 'hover:bg-blue-600'
            case 'instagram':
                return 'hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600'
            case 'tiktok':
                return 'hover:bg-black'
            case 'youtube':
                return 'hover:bg-red-600'
            case 'twitter':
            case 'x':
                return 'hover:bg-black'
            default:
                return 'hover:bg-zinc-600'
        }
    }

    // URL por defecto del isotipo
    const isotipoUrl = isotipo || 'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/logos/isotipo_gris.svg'

    return (
        <footer className="bg-zinc-900 border-t border-zinc-800 py-16">
            <div className="max-w-6xl mx-auto px-4">
                {/* Grid de 4 columnas */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">

                    {/* Columna 1: Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center p-2.5">
                                <img
                                    src={isotipoUrl}
                                    alt={nombre}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement
                                        target.src = 'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/logos/isotipo_gris.svg'
                                    }}
                                />
                            </div>
                            <div>
                                <div className="text-xl font-bold text-white">{nombre}</div>
                                <div className="text-zinc-400 text-sm italic">Momentos para toda la vida</div>
                            </div>
                        </div>
                    </div>

                    {/* Columna 2: Horarios de atención */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-400" />
                            Horarios de atención
                        </h3>
                        <div className="space-y-2">
                            {formatearHorarios()}
                        </div>
                    </div>

                    {/* Columna 3: Redes sociales */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Redes sociales</h3>
                        {redesSociales.length > 0 ? (
                            <div className="flex flex-wrap gap-3">
                                {redesSociales
                                    .filter(red => red.activo)
                                    .sort((a, b) => a.orden - b.orden)
                                    .map((red) => (
                                        <a
                                            key={red.id || red.plataforma}
                                            href={red.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 ${obtenerColorHover(red.plataforma)} hover:shadow-lg`}
                                            title={`Síguenos en ${red.plataforma}`}
                                        >
                                            {obtenerIconoRedSocial(red.plataforma)}
                                        </a>
                                    ))}
                            </div>
                        ) : (
                            <p className="text-zinc-400 text-sm">No hay redes sociales configuradas</p>
                        )}
                    </div>

                    {/* Columna 4: Contacto */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Contacto</h3>
                        <div className="space-y-3">
                            {/* WhatsApp */}
                            <a
                                href={`https://wa.me/${whatsappNumber}?text=Hola, tengo una pregunta sobre mi evento`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 text-zinc-300 hover:text-green-400 transition-colors duration-200"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z" />
                                </svg>
                                WhatsApp
                            </a>

                            {/* Teléfono */}
                            <a
                                href={`tel:${telefono}`}
                                className="flex items-center gap-3 text-zinc-300 hover:text-blue-400 transition-colors duration-200"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                {telefono}
                            </a>

                            {/* Email */}
                            <a
                                href={`mailto:${email}`}
                                className="flex items-center gap-3 text-zinc-300 hover:text-purple-400 transition-colors duration-200"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {email}
                            </a>
                        </div>
                    </div>
                </div>

                {/* Pie de página - Copyright */}
                <div className="border-t border-zinc-800 pt-6">
                    <div className="text-center">
                        <p className="text-zinc-500 text-sm">
                            &copy; 2025 {nombre}. Todos los derechos reservados.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
