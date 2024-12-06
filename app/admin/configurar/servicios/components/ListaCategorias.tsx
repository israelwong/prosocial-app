'use client'
import React, { useEffect, useState } from 'react'
import { obtenerCategories } from '@/app/admin/_lib/categorias.actions'
import { ServicioCategoria } from '@/app/admin/_lib/types'
import ContenedorCategoriaServicio from './ContenedorCategoriaServicio'
import { useRouter } from 'next/navigation'

function ListaCategorias() {
  const [categorias, setCategorias] = useState([] as ServicioCategoria[]);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  async function fetchCategorias() {
    const categorias = await obtenerCategories();
    setCategorias(categorias);
  }

  useEffect(() => {
    fetchCategorias();
  }, []);


  return (
    <div>
      <div className='flex items-center mb-8 '>
        <h1 className='text-2xl font-semibold flex-grow'>
          Lista de servicios
        </h1>
        <div className='flex items-center flex-grow'>
          <input
            type="text"
            placeholder="Buscar servicio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border border-gray-300 rounded text-black w-full"
          />
        </div>
        <button
          className='bg-green-800 border border-zinc-700 text-white font-bold py-2 px-4 rounded ml-3'
          onClick={() => router.push('servicios/nuevo')}>
          Registrar nuevo servicio
        </button>
      </div>
      {
        categorias.map((categoria) => (
          <div key={categoria.id}>
            <ContenedorCategoriaServicio
              categoria={categoria}
              searchTerm={searchTerm}
            />
          </div>
        ))
      }
    </div>
  )
}

export default ListaCategorias