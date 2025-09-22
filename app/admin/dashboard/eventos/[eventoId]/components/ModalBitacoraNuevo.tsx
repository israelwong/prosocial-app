import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { crearBitacora } from '@/app/admin/_lib/actions/bitacora/bitacora.actions'
import { Button } from '@/app/components/ui/button'

interface Props {
    eventoId: string
    onClose: () => void
    onSubmit: () => void
}

export default function ModalBitacoraNuevo({ eventoId, onClose, onSubmit }: Props) {

    const [anotacion, setAnotacion] = React.useState('')
    const [error, setError] = React.useState<string | null>(null)
    const [guardando, setGuardando] = React.useState(false)

    const handleCrearBitacora = async () => {
        if (!anotacion) {
            setError('Debes ingresar una anotación')
            return
        }
        setGuardando(true)
        await crearBitacora({
            eventoId,
            comentario: anotacion.charAt(0).toUpperCase() + anotacion.slice(1)
        })
        onSubmit()
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
            <div className="bg-zinc-900 p-6 rounded-lg shadow-lg w-1/5">

                <h3 className='text-xl font-semibold mb-3'>
                    Registrar nueva anotación
                </h3>

                <div>
                    <textarea
                        onChange={(e) => setAnotacion(e.target.value)}
                        value={anotacion}
                        className="w-full h-32 bg-zinc-900 border border-zinc-700 rounded-md p-2"
                        placeholder="Escribe tu anotación aquí"></textarea>
                    {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

                    <button className="bg-blue-600 py-2 px-3 rounded-md w-full"
                        onClick={handleCrearBitacora}
                        disabled={guardando}>
                        {guardando ? 'Guardando...' : 'Guardar'}
                    </button>

                    <button className="bg-red-600 py-2 px-3 rounded-md w-full mt-2"
                        onClick={onClose}>
                        Cancelar
                    </button>

                </div>
            </div>
        </div>
    )
}
