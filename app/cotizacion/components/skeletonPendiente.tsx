import React from 'react'

export default function SkeletonPendiente() {
    return (
        <div className="py-20">

            <h3 className='text-2xl font-bold text-center text-zinc-400 mb-2'>
                Un momento por favor...
            </h3>

            <p className='mb-2 text-center text-zinc-400 animate-pulse text-sm'>
                Estamos cargando la información de tu cotización, condiciones comerciales y métodos de pago.
                <br />
            </p>
            <p className='mb-5 text-center text-zinc-400 text-sm'>
                Agradecemos tu paciencia.
            </p>

            <div className="w-full space-y-6">
                <div className="space-y-4">

                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                </div>

                <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="h-4 w-[100px] bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-[100px] bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-[100px] bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </div>

                <div className="space-y-2">

                    <div className="h-6 w-full bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-24 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>

                <div className="flex justify-start space-x-2">
                    <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
            </div>




        </div>
    )
}
