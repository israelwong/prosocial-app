// 'use client';
// import { Fade } from 'react-awesome-reveal';
import { CircleCheck, Clock8, Calendar, User, Camera, Award } from 'lucide-react';
import NosotrosItem from '@/app/ui/main/NosotrosItem';

function Nosotros() {

    return (
        <div>

            <div className="px-8 md:max-w-screen-md mx-auto">

                <p className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 mb-4 font-semibold md:text-2xl ">
                    ¿Por qué nosotros?
                </p>

                <h2 className="font-Bebas-Neue text-4xl md:text-5xl font-bold mb-2">
                    Más de <u>10 años de experiencia</u> cubriendo momentos especiales
                </h2>

                <p className="md:text-3xl text-2xl pb-5 font-light mb-3">
                    Te brindamos un servicio personalizado y profesional en todo momento.
                </p>

                <div className="grid md:grid-cols-2 grid-flow-row gap-3 justify-center align-middle">

                    <NosotrosItem
                        icon={CircleCheck}
                        title="Compromiso"
                        description="Resolvemos cualquier eventualidad y te apoyamos en todo momento."
                    />

                    <NosotrosItem
                        icon={Clock8}
                        title="Puntualidad"
                        description="Nos anticipamos a llegar 40min antes de que inice tu servicio.."
                    />

                    <NosotrosItem
                        icon={Calendar}
                        title="Planeación y logística"
                        description="Trabajamos contigo la planificación de sesiones previas y cobertura de evento."
                    />

                    <NosotrosItem
                        icon={User}
                        title="Personal calificado"
                        description="Personal con experiencia garantizará para cubrir tu evento."
                    />

                    <NosotrosItem
                        icon={Camera}
                        title="Producción profesional"
                        description="Utilizamos equipos de gama alta para garantizar resultados de calidad."
                    />

                    <NosotrosItem
                        icon={Award}
                        title="Seguimiento post-entrega"
                        description="Te ofrecemos garantias de post-entrega para garantizar tu satisfacción."
                    />

                </div>

            </div>

        </div>
    )
}

export default Nosotros
