'use client'
import React from 'react'

export default function PagoCancelado() {
    return (
        <div className="mt-10 mb-16">
            <p className='font-Bebas-Neue text-2xl text-left mb-10 text-red-300'>
                Pago cancelado
            </p>
            <p className='mb-5 leading-6'>
                Tu pago no se proceso, lamentamos los inconvenientes.
            </p>
            <p className='mb-5 leading-6'>
                Si crees que esto es un error, por favor contacta a soporte para realizar la validación, con gusto te atenderemos.
            </p>

        </div>
    )
}
