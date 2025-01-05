import React from 'react'

export default function SkeletonPendiente() {
    return (
        <div className="flex items-center justify-center">
            <div className="max-w-screen-sm py-40 px-16 mx-auto">
                <h3 className='text-2xl font-bold text-center text-zinc-400 mb-2'>
                    Un momento por favor...
                </h3>

                <p className='mb-2 text-center text-zinc-400 animate-pulse text-sm'>
                    Estamos cargando la información de tu cotización, condiciones comerciales vigentes y métodos de pago disponibles.
                    <br />
                </p>

                <div className="flex flex-col space-y-4 mb-5">
                    <div className="grid grid-cols-2 space-x-2">
                        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                    </div>

                    <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                    <div className="grid grid-cols-3 space-x-2">
                        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>

                <p className='mb-5 text-center text-zinc-400 text-sm'>
                    Agradecemos tu paciencia.
                </p>
            </div>

        </div>
    )
}
