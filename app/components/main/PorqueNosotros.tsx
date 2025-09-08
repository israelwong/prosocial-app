'use client'
import React from 'react'
import { LucideIcon } from 'lucide-react'
import { CircleCheck, Clock8, Calendar, User, Camera, Award } from 'lucide-react'

// Interfaz para los items
interface PorqueNosotrosItemProps {
    icon: LucideIcon
    title: string
    description: string
}

// Componente item interno
function PorqueNosotrosItem({ icon: Icon, title, description }: PorqueNosotrosItemProps) {
    return (
        <div className="py-5 bg-zinc-950 p-5 rounded-md border border-violet-900">
            <h5 className="font-semibold text-violet-400 pb-1">
                <Icon className="inline-block mr-2" /> {title}
            </h5>
            <p className="text-sm font-light text-gray-300">{description}</p>
        </div>
    )
}

// Componente principal
function PorqueNosotros() {
    return (
        <div>
            <div className="px-8 md:max-w-screen-md mx-auto">
                <p className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 mb-4 font-semibold md:text-2xl">
                    ¿Por qué nosotros?
                </p>

                <h2 className="font-Bebas-Neue text-4xl md:text-5xl font-bold mb-2">
                    Más de <u>10 años de experiencia</u>
                </h2>

                <p className="md:text-3xl text-2xl pb-5 font-light mb-3">
                    Servicio personalizado y profesional en todo momento.
                </p>

                <div className="grid md:grid-cols-2 grid-flow-row gap-3 justify-center align-middle">
                    <PorqueNosotrosItem
                        icon={CircleCheck}
                        title="Compromiso"
                        description="Resolvemos cualquier eventualidad y te apoyamos en todo momento."
                    />

                    <PorqueNosotrosItem
                        icon={Clock8}
                        title="Puntualidad"
                        description="Nos anticipamos a llegar 40min antes de que inice tu servicio."
                    />

                    <PorqueNosotrosItem
                        icon={Calendar}
                        title="Planeación y logística"
                        description="Trabajamos contigo la planificación de sesiones previas y cobertura de evento."
                    />

                    <PorqueNosotrosItem
                        icon={User}
                        title="Personal calificado"
                        description="Personal con experiencia garantizará para cubrir tu evento."
                    />

                    <PorqueNosotrosItem
                        icon={Camera}
                        title="Producción profesional"
                        description="Utilizamos equipos de gama alta para garantizar resultados de calidad."
                    />

                    <PorqueNosotrosItem
                        icon={Award}
                        title="Seguimiento post-entrega"
                        description="Te ofrecemos garantias de post-entrega para garantizar tu satisfacción."
                    />
                </div>
            </div>
        </div>
    )
}

export default PorqueNosotros
