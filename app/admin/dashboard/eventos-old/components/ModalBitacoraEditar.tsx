import React, { useEffect, useState } from 'react'
import { actualizarBitacoraEvento, obtenerBitacora } from '@/app/admin/_lib/EventoBitacora.actions'

interface Props {
    bitacoraId: string
    onClose: () => void
    onSubmit: () => void
}

export default function ModalBitacoraEditar({ bitacoraId, onClose, onSubmit }: Props) {

    const [anotacion, setAnotacion] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const bitacoraData = await obtenerBitacora(bitacoraId)
                if (bitacoraData) {
                    setAnotacion(bitacoraData.comentario)
                    setLoading(false)
                }
            } catch (error) {
                setError(`Error al obtener la bitácora ${error}}`)
            }
        }
        fetchData()
    }, [bitacoraId])

    const handleActualizarBitacora = async () => {
        if (!anotacion) {
            setError('Debes ingresar una anotación')
            return
        }

        setLoading(true)
        try {
            await actualizarBitacoraEvento(
                bitacoraId,
                anotacion.charAt(0).toUpperCase() + anotacion.slice(1)
            )
            onSubmit()
        } catch (error) {
            setError(`Error al actualizar la bitácora ${error}}`)
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
            <div className="bg-zinc-900 p-6 rounded-lg shadow-lg w-1/5">

                <h3 className='text-xl font-semibold mb-3'>
                    Actualizar anotación
                </h3>

                <div>
                    <textarea
                        onChange={(e) => setAnotacion(e.target.value)}
                        value={anotacion}
                        className="w-full h-32 bg-zinc-900 border border-zinc-700 rounded-md p-2"
                        placeholder="Escribe tu anotación aquí"
                        aria-label="Escribe tu anotación aquí"></textarea>
                    {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

                    <button className="bg-blue-600 py-2 px-3 rounded-md w-full"
                        onClick={handleActualizarBitacora}
                        disabled={loading}>
                        {loading ? '...' : 'Actualizar'}
                    </button>
                    <button className="bg-red-600 py-2 px-3 rounded-md w-full mt-2"
                        onClick={onClose}
                        aria-label="Cancelar">
                        Cancelar
                    </button>

                </div>
            </div>
        </div>
    )
}
