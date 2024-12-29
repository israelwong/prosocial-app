import React from 'react'
import { Metadata } from 'next';
import Comprobante from '../../components/Comprobante';

export const metadata: Metadata = {
  title: 'Comprobante de pago',
  description: 'Comprobante de pago',
};

export default async function page({ params }: { params: Promise<{ pagoId: string }> }) {
  const { pagoId } = await params;
  return <Comprobante pagoId={pagoId} />;
}
