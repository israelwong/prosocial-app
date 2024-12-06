import React from 'react'
import { Metadata } from 'next'
import FormEditarServicio from '../components/FormEditarServicio'
import NavegdorServicios from '../../paquetes/components/NavegdorServicios'

export const metadata: Metadata = {
    title: 'Editar Servicio',
}

async function page({ params }: { params: Promise<{ servicioId: string }> }) {
    const { servicioId } = await params
    return (
        <div>
            <NavegdorServicios servicioId={servicioId} />
            <FormEditarServicio servicioId={servicioId} />
        </div>
    )
}

export default page
