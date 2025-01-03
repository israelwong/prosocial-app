import React from 'react'
import { Metadata } from 'next'
import Contrato from '../components/Contrato'

export const metadata: Metadata = {
  title: 'Contrato',
}

export default async function Page({ params }: { params: Promise<{ eventoId: string }> }) {

  const { eventoId } = await params;
  return <Contrato eventoId={eventoId} />

}
