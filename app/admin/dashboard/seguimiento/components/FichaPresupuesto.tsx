import React from 'react'

interface Props {
    precio: number
    condicionComercial: string | null
}

export default function FichaPresupuesto({ precio, condicionComercial }: Props) {
    return (
        <div className='bg-zinc-900 p-4 rounded-lg shadow-md mb-5 border border-zinc-800'>
            <h3 className='text-xl font-semibold text-zinc-500 mb-1'>
                Presupuesto
            </h3>
            <p className='text-4xl font-semibold mb-3'>
                {Number(precio)?.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
            </p>
            <p className='text-sm text-zinc-500 italic'>
                Condición comercial: {condicionComercial}
            </p>
        </div>
    )
}
