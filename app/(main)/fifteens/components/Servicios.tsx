'use client';
import React from 'react'
import TitlePulse from '@/app/components/main/TitlePulse';
// Importaciones comentadas - componentes eliminados, reemplazados por MediaSlider
// import SlideFotosSesionesVestido from '@/app/components/main/Fifteens/SlideFotosSesionesVestido';
// import SlideFotosSesionesCasuales from '@/app/components/main/Fifteens/SlideFotosSesionesCasuales';
// import SlideFotosEvento from '@/app/components/main/Fifteens/SlideFotosEvento';
import { VideoPlayer } from '@/app/components/shared/video';
import QuoteSection from '@/app/components/main/QuoteSection';
import { ArrowDown } from 'lucide-react';

function Servicios() {

    return (
        <div>

            {/* <!-- TITULO --> */}
            <div className="px-10 md:max-w-screen-md mx-auto mt-10">
                <p className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 mb-4 font-semibold md:text-2xl">
                    ¿Qué te ofrecemos?
                </p>
                <h2 className="font-Bebas-Neue text-4xl md:text-5xl">
                    Calidad y resultados profesionales
                </h2>
                <p className="font-light text-xl md:text-2xl">
                    Te prometemos atención personalizada en cada momento.
                </p>
            </div>

            {/* <!-- FOTOGRAFÍA DE VESTIDO --> */}
            {/* <Fade > */}
            <div className="mb-10">
                <div className="py-10 px-10 md:max-w-screen-md mx-auto">
                    <TitlePulse titulo={"Sesión fotográfica de vestido"} />
                    <p className="md:text-xl text-md font-light text-slate-200">
                        Capturamos los mejores momentos de tu sesión de vestido en locaciones increíbles
                    </p>
                </div>
                {/* <SlideFotosSesionesVestido /> */}
                <div className="p-8 text-center text-slate-400">
                    <p>Componente reemplazado por MediaSlider en ServiciosRefactorizado.tsx</p>
                </div>

            </div>
            {/* </Fade> */}

            {/* <!-- Separador --> */}
            <div className="text-center mx-auto animate-pulse">
                <ArrowDown className="mx-auto" />
            </div>
            {/* <!-- Separador --> */}

            {/* <!-- FOTOGRAFÍA CASUAL --> */}
            {/* <Fade > */}
            <div className="mb-10">
                <div className="py-10 px-10 md:max-w-screen-md mx-auto">
                    <TitlePulse titulo={"Sesión fotográfica casual"} />
                    <p className="md:text-xl text-md font-light text-slate-200">
                        Tu esencia y personalidad en fotografías casuales en locaciones urbanas y naturales
                    </p>
                </div>
                {/* <SlideFotosSesionesCasuales /> */}
                <div className="p-8 text-center text-slate-400">
                    <p>Componente reemplazado por MediaSlider en ServiciosRefactorizado.tsx</p>
                </div>
            </div>
            {/* </Fade> */}

            {/* <!-- Separador --> */}
            <div className="text-center mx-auto animate-pulse">
                <ArrowDown className="mx-auto" />
            </div>
            {/* <!-- Separador --> */}

            {/* <!-- IMPRESIÓN CUADROS  --> */}
            {/* <Fade > */}
            <div className="mb-10">

                <div className="pt-10 pb-5 px-10 md:max-w-screen-md mx-auto">
                    <TitlePulse titulo={"Impresión de cuadros"} />
                    <p className="md:text-xl text-md font-light text-slate-200">
                        Puedes imprimir una de las fotografías de sesión en un cuadro de acrílico de 24x36&quot;
                    </p>
                </div>

                <div className="max-w-screen-md mx-auto">
                    <VideoPlayer
                        src={'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/video/cuadro-acrilico.mp4'}
                        autoPlay={true}
                        loop={true}
                    />
                </div>

            </div>
            {/* </Fade> */}

            {/* <!-- Separador --> */}
            <div className="text-center mx-auto animate-pulse">
                <ArrowDown className="mx-auto" />
            </div>
            {/* <!-- Separador --> */}


            {/* <!-- SESIÓN VIDEO CINEMÁTICO --> */}
            {/* <Fade > */}
            <div className="mb-10">

                <div className="pt-10 px-10 pb-0 md:max-w-screen-md mx-auto">
                    <TitlePulse titulo={"Sesión de video cinemático"} />
                    <p className="md:text-xl text-md font-light text-slate-200">
                        Toda la esencia en una sesión cinemática con dinámicas y tomas creativas
                    </p>
                </div>

                {/* <div className="max-w-screen-md mx-auto">
                    <VideoPlayer
                        src={'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/video/reels/fifteens/reel_sesiones_2019.mp4?t=2024-09-29T01%3A57%3A43.146Z'}
                        autoPlay={true}
                        muted={true}
                        loop={true}
                    />
                </div> */}

            </div>
            {/* </Fade> */}

            <QuoteSection
                message="Vive al máximo tu evento, nosotros nos encargamos de inmortalizarlo."
            />

            {/* <!-- FOTOGRAFÍA PARA EVENTO --> */}
            {/* <Fade > */}
            <div className="mb-10 mt-10">
                <div className="pb-10 px-10 md:max-w-screen-md mx-auto">
                    <TitlePulse titulo={"Fotografía para evento"} />
                    <p className="md:text-xl text-md font-light text-slate-200">
                        Nosotros nos encargamos de capturar los mejores momentos de tu evento
                    </p>
                </div>
                {/* <SlideFotosEvento /> */}
                <div className="p-8 text-center text-slate-400">
                    <p>Componente reemplazado por MediaSlider en ServiciosRefactorizado.tsx</p>
                </div>
            </div>
            {/* </Fade> */}


            {/* <!-- Separador --> */}
            <div className="text-center mx-auto animate-pulse">
                <ArrowDown className="mx-auto" />
            </div>
            {/* <!-- Separador --> */}

            {/* <!-- VIDEO DE EVENTO --> */}
            <div className="mb-5">
                <div className="pt-10 px-10 md:max-w-screen-md mx-auto">
                    <TitlePulse titulo={"Cinematografía para evento"} />
                    <p className="md:text-xl text-md font-light text-slate-200">
                        Grabamos tu evento con 1 o 2 cámaras en piso, dron para tomas aéreas y grúa con cabezal robótico para tomas elevedas
                    </p>
                </div>

                <div className="max-w-screen-md mx-auto">
                    <VideoPlayer
                        src={'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/video/reels/fifteens/reel_evento_2019.mp4?t=2024-09-29T01%3A58%3A00.130Z'}
                        autoPlay={true}
                        loop={true}
                    />
                </div>

            </div>

        </div>
    )
}

export default Servicios
