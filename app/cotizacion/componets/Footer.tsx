'use client'
import React from 'react'
import Image from 'next/image'

interface Props {
    telefono: string;
    asunto: string;
}

export default function Footer({ telefono, asunto }: Props) {

    const handleWhatsapp = () => {
        const mensaje = `${asunto}`
        const telefonoEntrante = telefono.trim().replace(/ /g, '')
        const url = `https://wa.me/52${telefonoEntrante}?text=${encodeURIComponent(mensaje)}`
        window.open(url, '_blank')
    }

    const handleLlamada = () => {
        const telefonoEntrante = telefono.trim().replace(/ /g, '')
        const url = `tel:${telefonoEntrante}`
        window.open(url, '_blank')
    }

    return (
        <section className='w-full mt-5 p-5 border-t border-t-zinc-800 text-zinc-400'>

            <h3 className='mb-3 text-zinc-600 font-semibold text-lg'>
                ¿Tienes alguna duda?
            </h3>

            <ul className='mb-4 space-y-2 text-sm'>
                <li className='flex items-center'
                    onClick={handleLlamada}
                >
                    <i className="fas fa-phone-alt mr-2"></i>
                    Llama al {telefono}
                </li>
                <li className='flex items-center'
                    onClick={handleWhatsapp}
                >
                    <i className="fab fa-whatsapp mr-2"></i>
                    Envía un whatsapp al {telefono}
                </li>
                <li className='flex items-center'>
                    <i className="far fa-clock mr-2"></i> Atención de lunes a viernes de 10:00 a 20:00
                </li>
            </ul>


            <div className='text-sm my-10'>
                <p>@Todos los derechos reservados a prosocial.mx</p>
                <p>
                    <a href="/aviso-de-privacidad" target="_blank" rel="noopener noreferrer" className='text-zinc-400 underline'>Aviso de privacidad</a>
                </p>
            </div>

            <div className='mb-3'>
                <p className='text-sm pb-1 text-zinc-600'>
                    Diseño y desarrollo  <a href="https://promedia.mx" target="_blank" rel="noopener noreferrer" className='text-zinc-400 underline'>Promedia México</a>
                </p>
                <Image
                    src='https://sfsjdyuwttrcgchbsxim.supabase.co/storage/v1/object/public/ProMedia/logo_dark_gray.svg'
                    width={100}
                    height={100}
                    alt='Promedia México'
                    className=''
                />

            </div>
        </section>
    )
}
