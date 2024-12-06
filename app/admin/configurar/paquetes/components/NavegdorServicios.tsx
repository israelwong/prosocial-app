'use client'
import React, { useEffect, useState } from 'react'
import { obtenerServiciosAdyacentes } from '@/app/admin/_lib/servicio.actions'
import { Servicio } from '@/app/admin/_lib/types'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
    servicioId: string
}

export default function NavegdorServicios({ servicioId }: Props) {

    const router = useRouter()
    const [servicioAnterior, setServicioAnterior] = useState<Servicio | null>(null)
    const [servicioSiguiente, setServicioSiguiente] = useState<Servicio | null>(null)

    useEffect(() => {
        obtenerServiciosAdyacentes(servicioId).then(result => {
            setServicioAnterior(result.servicioAnterior)
            setServicioSiguiente(result.servicioSiguiente)
        })
    }, [servicioId])

    return (
        <div>
            <div className="">
                <div className='flex items-center justify-start float-start h-screen'>
                    {servicioAnterior && (
                        <button
                            className='
                            bg-zinc-800 py-10 px-3 rounded-md 
                            flex justify-center items-center 
                            text-zinc-600 text-center 
                            hover:bg-zinc-700 hover:text-zinc-400'
                            onClick={() => router.push(`${servicioAnterior.id}`)}>
                            <ChevronLeft size={36} />
                        </button>
                    )}
                </div>
                <div className='flex items-center justify-start float-end h-screen'>
                    {servicioSiguiente && (
                        <button
                            className='
                        bg-zinc-800 py-10 px-3 rounded-md 
                        flex justify-center items-center 
                        text-zinc-600 text-center 
                        hover:bg-zinc-700 hover:text-zinc-400'
                            onClick={() => router.push(`${servicioSiguiente.id}`)}>
                            <ChevronRight size={36} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}