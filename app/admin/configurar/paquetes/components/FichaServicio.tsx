import React from 'react'
import { Servicio } from '@/app/admin/_lib/types'

interface FichaServicioProps {
    servicio: Servicio
}

function FichaServicio({ servicio }: FichaServicioProps) {

    return (
        <div className='flex justify-between'>
            <p>
                {servicio.nombre}
            </p>
        </div>
    )
}

export default FichaServicio
