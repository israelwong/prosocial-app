'use client'
import React from 'react'
import VideoPlayer from '@/app/ui/main/VideoPlayer'
import BtnPromocion from '@/app/ui/main/BtnPromocion'

function Hero() {
    return (
        <div className='
    	mx-auto 
		text-white
		bg-gradient-to-b from-gray-900 to-black
		items-center
        w-full
        pb-10
        '>

            <div className='mx-auto max-w-screen-md'>

                <div className='text-center pb-5 pt-10'>
                    <h1 className='font-Smooch text-8xl pb-2'>
                        Weddings
                    </h1>
                    <h1 className="md:px-28 md:text-4xl px-14 text-2xl font-bold lg:text-4xl text-center">
                        Momentos especiales para toda la vida.
                    </h1>
                </div>

                <VideoPlayer
                    src={'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/weddings/reels_evento_2018.mp4'}
                    muted={true}
                    controls={false}
                    loop={true}
                />

                <p className="mt-4 text-lg md:text-xl text-gray-200 font-light text-center md:px-20 px-8 mb-4">
                    &quot;Estamos comprometidos a capturar los momentos más especiales de tu vida. Nosotros nos encargaremos de capturar cada detalle de tu boda para que la puedas revivir una y otra vez.&quot;
                </p>


                <div className='flex justify-center items-center h-full pt-5'>

                    <BtnPromocion
                        title={'Más información'}
                        id_paquete={0}
                        id_asunto={1}
                        id_tipo_evento={1}
                    />

                </div>

            </div>


        </div>
    )
}

export default Hero
