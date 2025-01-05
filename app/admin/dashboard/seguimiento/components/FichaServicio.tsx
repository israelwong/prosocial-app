import React, { useState, useEffect } from 'react'
import { CotizacionServicio, User } from '@/app/admin/_lib/types'
import { obtenerServicio } from '@/app/admin/_lib/servicio.actions'
import { obtenerCotizacionServicio } from '@/app/admin/_lib/cotizacion.actions'
import ResponsableModal from './ResponsableModal';
import { X } from 'lucide-react';

import { asignarResponsableCotizacionServicio } from '@/app/admin/_lib/cotizacion.actions'
import { obtenerUsuario } from '@/app/admin/_lib/User.actions';

interface Props {
    usuarios: User[]
    cotizacionServicioId: string | undefined,
}

export default function FichaServicio({ usuarios, cotizacionServicioId }: Props) {

    const [servicio, setServicio] = useState<CotizacionServicio | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [asignandingResponsable, setAsignandingResponsable] = useState(false);

    useEffect(() => {
        const fetchData = async () => {

            if (!cotizacionServicioId) return

            try {
                const cotizacionServicio = await obtenerCotizacionServicio(cotizacionServicioId)
                if (!cotizacionServicio) return

                const [servicioData, usuarioData] = await Promise.all([
                    obtenerServicio(cotizacionServicio.servicioId),
                    cotizacionServicio.userId ? obtenerUsuario(cotizacionServicio.userId) : Promise.resolve(null)
                ])

                if (servicioData && servicioData.nombre) {
                    setServicio({
                        ...cotizacionServicio,
                        nombre: servicioData.nombre,
                        costo: servicioData.costo,
                        cantidad: cotizacionServicio.cantidad
                    })
                }

                if (usuarioData) {
                    setUserId(usuarioData.id)
                    setUsername(usuarioData.username)
                }

            } catch (error) {
                console.error('Error fetching data:', error)
                setError('Error fetching data')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [cotizacionServicioId])


    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    //! Asignar Responsable a servicio
    const handleSeleccionarResponsable = (userId: string, username: string) => {
        setAsignandingResponsable(true);
        asignarResponsableCotizacionServicio(userId, cotizacionServicioId!, userId).then(() => {
            setUserId(userId);
            setUsername(username);
            setIsModalOpen(false);
            setAsignandingResponsable(false);
        })
    };

    const handleRemoveResponsable = () => {
        asignarResponsableCotizacionServicio('', cotizacionServicioId!, '').then(() => {
            setUserId(null);
            setUsername(null);
        })
    }

    if (loading) {
        return <div className='text-sm text-zinc-700'>Cargando servicio...</div>
    }

    if (error) {
        return <div className='text-sm text-red-500'>{error}</div>
    }

    return (
        <>
            <div className="flex items-center space-x-2 mb-0">
                <div>
                    <p className="mb-1">{servicio?.nombre ?? "N/A"}</p>
                    <div className="text-sm text-zinc-600">
                        {servicio && (
                            <>
                                {userId ? (
                                    <div className="flex items-center space-x-2 mb-1">
                                        <p className='text-sm text-zinc-400'>
                                            Responsable <span className='text-green-600'>{username}</span>
                                        </p>
                                        <button
                                            onClick={handleRemoveResponsable}
                                            className='text-red-500'>
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        className='text-blue-500 mb-1'
                                        onClick={handleOpenModal}
                                        disabled={asignandingResponsable}
                                    >
                                        {asignandingResponsable ? 'Asignando responsable...' : 'Asignar responsable'}
                                    </button>
                                )}
                                <ul className="flex space-x-3">
                                    {/* <li className="hidden sm:block">Honorarios:</li> */}
                                    <li>P.U: {servicio.costo?.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) ?? "N/A"}</li>
                                    <li>Cant.: {servicio.cantidad}</li>
                                    <li>Total: {typeof servicio.costo === 'number' && typeof servicio.cantidad === 'number' ? (servicio.costo * servicio.cantidad).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) : "N/A"}</li>
                                </ul>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* //! MODAL */}
            {isModalOpen && <ResponsableModal
                usuarios={usuarios}
                servicio={servicio?.nombre ?? ''}
                onSeleccionarResponsable={handleSeleccionarResponsable}
                onClose={handleCloseModal}
            />}

        </>
    )
}
