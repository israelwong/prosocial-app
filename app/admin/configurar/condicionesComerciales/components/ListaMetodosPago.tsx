'use client'
import React, { useEffect, useState } from 'react'
import { MetodoPago } from '@/app/admin/_lib/types'

interface Props {
    metodosPago: MetodoPago[]
    onMetodosPagoAceptados: MetodoPago[]
    onMetodosPagoChange: (metodosPagoAceptados: MetodoPago[]) => void
}

export default function ListaMetodosPago({ metodosPago, onMetodosPagoAceptados, onMetodosPagoChange }: Props) {

    const [metodosPagoDisponibles, setMetodosPagoDisponibles] = useState([] as MetodoPago[])
    const [metodosPagoAceptados, setMetodosPagoAceptados] = useState([] as MetodoPago[])

    useEffect(() => {
        setMetodosPagoDisponibles(metodosPago)
        setMetodosPagoAceptados(onMetodosPagoAceptados)
    }, [metodosPago, onMetodosPagoAceptados])

    const handleCheckboxChange = (metodo: MetodoPago) => {
        const isChecked = metodosPagoAceptados.some(mp => mp.id === metodo.id)
        const updatedMetodosPagoAceptados = isChecked
            ? metodosPagoAceptados.filter(mp => mp.id !== metodo.id)
            : [...metodosPagoAceptados, metodo]

        setMetodosPagoAceptados(updatedMetodosPagoAceptados)
        onMetodosPagoChange(updatedMetodosPagoAceptados)
    }

    return (
        <div>
            <p className='block text-sm font-medium text-zinc-500 mb-3'>
                Métodos de pago para la condición comercial
            </p>

            {metodosPagoDisponibles.map(metodo => (
                <div key={metodo.id}>
                    <label className="flex items-center cursor-pointer space-y-1">
                        <input
                            type="checkbox"
                            checked={metodosPagoAceptados.some(mp => mp.id === metodo.id)}
                            onChange={() => handleCheckboxChange(metodo)}
                            className="sr-only"
                        />
                        <div className="w-8 h-4 bg-zinc-700 rounded-full shadow-inner relative">
                            <div className={`dot absolute w-4 h-4 bg-white rounded-full shadow left-0 top-0 transition ${metodosPagoAceptados.some(mp => mp.id === metodo.id) ? 'transform translate-x-full bg-green-500' : ''}`}>
                            </div>
                        </div>
                        <span className="ml-3 text-zinc-300 uppercase">{metodo.metodo_pago}</span>
                    </label>
                </div>
            ))}
        </div>
    )
}