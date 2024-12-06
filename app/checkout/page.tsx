import React from 'react'
import { Metadata } from 'next'
import FormCheckout from './components/FormCheckout'

export const metadata: Metadata = {
  title: 'Checkout',
}

export default function page() {
  return <FormCheckout />
}
