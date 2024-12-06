import React from 'react'
import { Metadata } from 'next'
import ListaCategorias from './components/ListaCategorias'

export const metadata: Metadata = {
    title: 'Categorias'
}

function CategoriasPage() {
    return (
        <div className='p-5'>
            <ListaCategorias />
        </div>
    )
}

export default CategoriasPage
