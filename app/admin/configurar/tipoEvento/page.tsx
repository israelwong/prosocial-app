import React from 'react'
import { Metadata } from 'next';
import ListaTipoEvento from './component/ListaTipoEvento';

export const metadata: Metadata = {
    title: 'Tipo evento',
    description: 'Tipo de evento',
}

function page() {
    return (
        <div className='p-5'>
            <ListaTipoEvento />
        </div>
    )
}

export default page
