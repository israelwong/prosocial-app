import React from 'react'
import type { Metadata } from 'next'
import { Briefcase, MapPin, Clock, DollarSign, Users, Star, ArrowRight, Filter, Search, Zap, Camera, Film } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Bolsa de Trabajo - ProSocial',
    description: 'Únete al equipo ProSocial. Encuentra oportunidades de trabajo en fotografía y video profesional.',
}

interface JobPosition {
    id: string
    title: string
    department: string
    location: string
    type: 'full-time' | 'part-time' | 'freelance' | 'contract'
    experience: string
    salary?: string
    description: string
    requirements: string[]
    benefits: string[]
    isRemote: boolean
    isUrgent?: boolean
    postedDays: number
}

const jobPositions: JobPosition[] = [
    {
        id: '1',
        title: 'Fotógrafo Senior de Bodas',
        department: 'Fotografía',
        location: 'Ciudad de México',
        type: 'full-time',
        experience: '3+ años',
        salary: '$25,000 - $35,000',
        description: 'Buscamos un fotógrafo experimentado especializado en bodas para unirse a nuestro equipo principal.',
        requirements: [
            'Mínimo 3 años de experiencia en fotografía de bodas',
            'Portafolio comprobable',
            'Equipo profesional propio',
            'Disponibilidad fines de semana'
        ],
        benefits: [
            'Sueldo competitivo',
            'Comisiones por evento',
            'Seguro médico',
            'Capacitación continua'
        ],
        isRemote: false,
        isUrgent: true,
        postedDays: 2
    },
    {
        id: '2',
        title: 'Editor de Video',
        department: 'Post-producción',
        location: 'Remoto',
        type: 'freelance',
        experience: '2+ años',
        description: 'Editor de video freelance para proyectos de bodas y eventos especiales.',
        requirements: [
            'Dominio de Adobe Premiere Pro',
            'Experiencia en After Effects',
            'Estilo cinematográfico',
            'Entrega puntual'
        ],
        benefits: [
            'Pago por proyecto',
            'Flexibilidad horaria',
            'Trabajo remoto',
            'Proyectos constantes'
        ],
        isRemote: true,
        postedDays: 5
    },
    {
        id: '3',
        title: 'Asistente de Fotografía',
        department: 'Fotografía',
        location: 'Guadalajara',
        type: 'part-time',
        experience: 'Sin experiencia',
        salary: '$8,000 - $12,000',
        description: 'Oportunidad para aprender fotografía profesional mientras asistes a nuestro equipo.',
        requirements: [
            'Pasión por la fotografía',
            'Disponibilidad fines de semana',
            'Buena condición física',
            'Actitud proactiva'
        ],
        benefits: [
            'Entrenamiento pagado',
            'Crecimiento profesional',
            'Horario flexible',
            'Ambiente creativo'
        ],
        isRemote: false,
        postedDays: 7
    },
    {
        id: '4',
        title: 'Community Manager',
        department: 'Marketing',
        location: 'Híbrido',
        type: 'full-time',
        experience: '2+ años',
        salary: '$18,000 - $25,000',
        description: 'Gestiona nuestras redes sociales y crea contenido atractivo para nuestra comunidad.',
        requirements: [
            'Experiencia en redes sociales',
            'Conocimiento de diseño básico',
            'Creatividad y originalidad',
            'Análisis de métricas'
        ],
        benefits: [
            'Ambiente creativo',
            'Capacitación en marketing digital',
            'Flexibilidad horaria',
            'Proyectos innovadores'
        ],
        isRemote: false,
        postedDays: 3
    }
]

export default function BolsaTrabajoPage() {
    const getJobTypeLabel = (type: JobPosition['type']) => {
        const types = {
            'full-time': 'Tiempo Completo',
            'part-time': 'Medio Tiempo',
            'freelance': 'Freelance',
            'contract': 'Por Contrato'
        }
        return types[type]
    }

    const getJobTypeColor = (type: JobPosition['type']) => {
        const colors = {
            'full-time': 'bg-green-500/20 text-green-300 border-green-500/30',
            'part-time': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
            'freelance': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
            'contract': 'bg-orange-500/20 text-orange-300 border-orange-500/30'
        }
        return colors[type]
    }

    const getDepartmentIcon = (department: string) => {
        switch (department.toLowerCase()) {
            case 'fotografía':
                return <Camera className="w-4 h-4" />
            case 'post-producción':
                return <Film className="w-4 h-4" />
            case 'marketing':
                return <Zap className="w-4 h-4" />
            default:
                return <Briefcase className="w-4 h-4" />
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-zinc-900 to-pink-900/20" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-600/10 via-transparent to-transparent" />
                
                <div className="relative container mx-auto px-6 py-20">
                    <div className="text-center max-w-4xl mx-auto">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 bg-zinc-800/50 border border-zinc-700 rounded-full px-4 py-2 mb-6">
                            <Briefcase className="w-4 h-4 text-purple-400" />
                            <span className="text-sm text-zinc-300">Únete al equipo</span>
                            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30">
                                Beta
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                            Construye tu carrera en{' '}
                            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                ProSocial
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
                            Únete a un equipo apasionado por capturar momentos únicos. 
                            Encuentra oportunidades que impulsen tu carrera profesional.
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <div className="bg-zinc-800/30 border border-zinc-700 rounded-xl p-6">
                                <div className="text-2xl font-bold text-white mb-1">50+</div>
                                <div className="text-sm text-zinc-400">Eventos al mes</div>
                            </div>
                            <div className="bg-zinc-800/30 border border-zinc-700 rounded-xl p-6">
                                <div className="text-2xl font-bold text-white mb-1">15+</div>
                                <div className="text-sm text-zinc-400">Profesionales</div>
                            </div>
                            <div className="bg-zinc-800/30 border border-zinc-700 rounded-xl p-6">
                                <div className="text-2xl font-bold text-white mb-1">5⭐</div>
                                <div className="text-sm text-zinc-400">Calificación</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Jobs Section */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    {/* Filters */}
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 mb-12">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Buscar posiciones..."
                                        className="w-full bg-zinc-900 border border-zinc-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <select className="bg-zinc-900 border border-zinc-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500">
                                    <option value="">Todos los departamentos</option>
                                    <option value="fotografia">Fotografía</option>
                                    <option value="video">Video</option>
                                    <option value="marketing">Marketing</option>
                                </select>
                                <select className="bg-zinc-900 border border-zinc-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500">
                                    <option value="">Tipo de trabajo</option>
                                    <option value="full-time">Tiempo Completo</option>
                                    <option value="part-time">Medio Tiempo</option>
                                    <option value="freelance">Freelance</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Job Listings */}
                    <div className="space-y-6">
                        {jobPositions.map((job) => (
                            <div
                                key={job.id}
                                className="group bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 hover:border-zinc-600 transition-all duration-300 hover:transform hover:scale-[1.01]"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    {/* Job Info */}
                                    <div className="flex-1">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="p-3 bg-zinc-700 rounded-lg group-hover:bg-gradient-to-br group-hover:from-purple-600/20 group-hover:to-pink-600/20 transition-all duration-300">
                                                <div className="text-zinc-300 group-hover:text-white transition-colors">
                                                    {getDepartmentIcon(job.department)}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between gap-4 mb-2">
                                                    <h3 className="text-xl font-semibold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-pink-300 group-hover:bg-clip-text transition-all duration-300">
                                                        {job.title}
                                                    </h3>
                                                    {job.isUrgent && (
                                                        <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full border border-red-500/30">
                                                            Urgente
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400 mb-3">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {job.location}
                                                        {job.isRemote && " (Remoto)"}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-3 h-3" />
                                                        {job.experience}
                                                    </span>
                                                    {job.salary && (
                                                        <span className="flex items-center gap-1">
                                                            <DollarSign className="w-3 h-3" />
                                                            {job.salary}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        Hace {job.postedDays} días
                                                    </span>
                                                </div>
                                                <p className="text-zinc-300 mb-4">
                                                    {job.description}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getJobTypeColor(job.type)}`}>
                                                        {getJobTypeLabel(job.type)}
                                                    </span>
                                                    <span className="px-3 py-1 bg-zinc-700 text-zinc-300 text-xs rounded-full">
                                                        {job.department}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="flex-shrink-0">
                                        <button className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105">
                                            <span>Aplicar</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CTA Section */}
                    <div className="text-center mt-16 p-8 bg-zinc-800/50 border border-zinc-700 rounded-xl">
                        <h3 className="text-2xl font-semibold text-white mb-4">
                            ¿No encuentras la posición perfecta?
                        </h3>
                        <p className="text-zinc-400 mb-6 max-w-2xl mx-auto">
                            Envíanos tu portafolio y CV. Siempre estamos buscando talento excepcional 
                            para unirse a nuestro equipo en futuras oportunidades.
                        </p>
                        <button className="inline-flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300">
                            <span>Enviar Portafolio</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    )
}
