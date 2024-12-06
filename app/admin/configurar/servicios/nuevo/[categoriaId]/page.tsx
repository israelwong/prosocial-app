import React from 'react'
import { Metadata } from 'next'
import FormCrearServicio from '../../components/FormCrearServico'

export const metadata: Metadata = {
    title: 'Nuevo Servicio',
}
async function page({ params }: { params: Promise<{ categoriaId: string }> }) {
    const { categoriaId } = await params
    console.log(categoriaId)
    return <FormCrearServicio categoriaId={categoriaId} />
}

export default page
