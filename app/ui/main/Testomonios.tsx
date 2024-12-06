import React from 'react'
import Link from 'next/link'
import SlideTestimonios from '@/app/ui/main/SlideTestimonios';

function Testomonios() {
    return (
        <div className="mb-12">

            {/* <!-- TITULO --> */}
            <div className="px-10 pb-5 mx-auto md:max-w-screen-md">
                <p className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 mb-4 font-semibold
        md:text-2xl">
                    ¿Qué dicen nuestros clientes?
                </p>
                <h2 className="font-Bebas-Neue text-4xl md:text-6xl">
                    Agradecimientos infinitos a todos nuestros clientes
                </h2>
                <p className="font-light text-xl md:text-2xl md:mb-5">
                    Para nosotros, nuestros clientes son únicos y especiales, lo decimos de corazón.
                </p>
            </div>

            <SlideTestimonios />

            <div className="text-center mx-auto mb-10">
                <Link
                    target="_blank"
                    className="px-4 py-3 bg-blue-900 rounded-full text-sm animate-pulse"
                    href="https://www.facebook.com/prosocialmx/reviews">
                    Leer testimonios en Facebook
                </Link>
            </div>

        </div>


    )
}

export default Testomonios
