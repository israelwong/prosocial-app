import React from 'react'
import { EventoTipo } from '@/app/admin/_lib/types'
import { crearPaquete } from '@/app/admin/_lib/paquete.actions'
import { useRouter } from 'next/navigation'

interface Props {
    tipoEvento: EventoTipo
    onCancel: () => void
}

function FormPaqueteNuevo({ tipoEvento, onCancel }: Props) {

    const [nombrePaquete, setNombrePaquete] = React.useState('');
    const [errors, setErrors] = React.useState<{ nombrePaquete?: string }>({});
    const router = useRouter();
    const [guardando, setGuardando] = React.useState(false);

    const handleSubmit = async () => {

        console.log('tipoEvento:', tipoEvento);

        const formErrors: { nombrePaquete?: string } = {};

        if (!nombrePaquete) {
            formErrors.nombrePaquete = 'El nombre del paquete es obligatorio';
        }

        if (Object.keys(formErrors).length === 0) {
            setGuardando(true);
            const result = await crearPaquete({ nombre: nombrePaquete, eventoTipoId: tipoEvento.id });
            if (result) {
                router.push('/admin/configurar/paquetes/' + result.id);
            }
            setGuardando(false);
        } else {
            setErrors(formErrors);
        }
    };

    return (
        <div>
            <h2 className='mb-3 text-xl text-zinc-500'>
                Crear paquete para {tipoEvento.nombre}
            </h2>

            <div>

                <input
                    type='text'
                    placeholder='Nombre del Paquete'
                    className='bg-zinc-900 border border-zinc-800 rounded w-full text-zinc-200 p-2 mb-2'
                    value={nombrePaquete}
                    onChange={(e) => setNombrePaquete((e.target.value).charAt(0).toUpperCase() + (e.target.value).slice(1))}
                />
                {errors.nombrePaquete && (
                    <p className='py-3 text-red-500 text-xs italic text-center'>
                        {errors.nombrePaquete}
                    </p>
                )}

                <button
                    className='bg-zinc-800 text-zinc-200 p-2 rounded w-full mb-2'
                    onClick={handleSubmit}
                    disabled={guardando}>
                    {guardando ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                    className='bg-zinc-900 text-zinc-200 p-2 rounded w-full'
                    onClick={onCancel}>
                    Cancelar</button>
            </div>

        </div>
    )
}

export default FormPaqueteNuevo
