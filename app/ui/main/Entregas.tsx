'use client';
// import { Fade } from 'react-awesome-reveal';

function Entregas() {
    return (
        <div className="px-10 mb-12 mx-auto md:max-w-screen-md pt-10">

            <p className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 mb-4 font-semibold
        md:text-2xl">
                ¿Qué entregamos?
            </p>

            <h2 className="font-Bebas-Neue text-4xl md:text-6xl font-bold mb-2">
                Garantías y resultados por contrato
            </h2>
            <p className="text-2xl pb-5 font-light ">
                Nos comprometemos a entregarte en 20 días hábiles posteriores a a tu evento</p>

            <ul className="
    font-light list-image-none text-gray-300 text-left
    grid grid-flow-row gap-2
    md:text-2xl
    ">

                {/* <Fade> */}
                <li className="grid grid-cols-6">
                    <i className="p-3 col-span-1 animate-pulse text-pink-500 fas fa-check text-center md:text-2xl"></i>
                    <p className="col-span-5">
                        <u>Fotografías en alta resolución</u>, listas para impresión o compartir en redes.
                    </p>
                </li>
                {/* </Fade> */}

                {/* <Fade> */}
                <li className="grid grid-cols-6">
                    <i className="p-3 col-span-1 animate-pulse text-pink-500 fas fa-check text-center md:text-2xl"></i>
                    <p className="col-span-5">
                        <u>Videos cinemáticos en alta resolución entre 45min y 2hrs </u> que capturan la esencia y emoción de tu evento.
                    </p>
                </li>
                {/* </Fade> */}

                {/* <Fade> */}
                <li className="grid grid-cols-6">
                    <i className="p-3 col-span-1 animate-pulse text-pink-500 fas fa-check text-center md:text-2xl"></i>
                    <p className="col-span-5">
                        <u>Garantías post producción</u> en la edición de video sin costo adicional.
                    </p>
                </li>
                {/* </Fade> */}

            </ul>


        </div>
    )
}

export default Entregas
