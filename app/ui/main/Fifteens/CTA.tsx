'use client';
import React from 'react'
import BtnBorderSpin from '@/app/ui/main/BtnBorderSpin';
import Link from 'next/link';

function CTA() {


    return (
        <div>
            <div className="text-center space-y-3 px-8 pt-5">

                <p className="text-center mx-auto text-xl mb-5 tracking-wide">
                    ¡Reserva hoy mismo! tenemos <span className="underline">fechas limitadas.</span>
                </p>

                <div className="flex items-center justify-center text-centerw-full max-w-lg mx-auto">
                    <BtnBorderSpin
                        id={'btn-paquetes-desde-hero'}
                        title={"Paquete promocional"}
                        href={"/fifteens/promocion"}
                        target={"_self"}
                    />
                </div>

                <Link
                    href="/fifteens/paquetes"
                    className="block my-5 underline md:text-md text-sm text-violet-400 font-light"
                    title="Paquetes de XV años"
                >
                    Todos los paquetes
                </Link>

            </div>
        </div>
    )
}

export default CTA
