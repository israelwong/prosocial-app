import React from 'react'
import { Metadata } from 'next';
import Comprobante from '../../components/Comprobante';

export const metadata: Metadata = {
  title: 'Comprobante de pago',
  description: 'Comprobante de pago',
};

interface PageProps { params: Promise<{ pagoId: string }> }

export default async function page({ params }: PageProps) {
  const { pagoId } = await params;
  return <Comprobante pagoId={pagoId} />;
}
