import React from 'react'
import { Metadata } from 'next'
import FormCondicionesComercialesEditar from '../components/FormCondicionesComercialesEditar'


export const metadata: Metadata = {
  title: 'Editar Condición Comercial',
  description: 'Crear una nueva condición comercial',
}

export default async function page({ params }: { params: Promise<{ condicionesComercialesId: string }> }) {
  const { condicionesComercialesId } = await params
  return <FormCondicionesComercialesEditar condicionesComercialesId={condicionesComercialesId} />
}
