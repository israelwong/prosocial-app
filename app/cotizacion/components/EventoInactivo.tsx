import React from 'react'

export default function EventoInactivo() {
    return (
        <div className='max-w-screen-sm mx-auto justify-center items-center mt-10 py-5 md:px-0 px-5'>
            <h1 className='text-3xl font-bold text-zinc-500 font-Bebas-Neues mb-3'>
                ¡Lo sentimos!
            </h1>
            <p className='text-xl text-zinc-300 mb-5'>
                Las cotizaciones asociadas a este evento ya no están disponibles.
                <span role="img" aria-label="sad face">😔</span>
            </p>
            <p className='text-zinc-500 italic mb-5'>
                Si te interesa activarlas nuevamente por favor solicita que te las reactiven.</p>

            <a
                href='https://wa.me/5544546582?text=Hola,%20me%20gustaría%20reactivar%20las%20cotizaciones%20asociadas%20a%20este%20evento.'
                target='_blank'
                rel='noopener noreferrer'
                className='inline-block bg-green-800 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-300'
            >
                Solicitar reactivación
            </a>
        </div>
    )
}
