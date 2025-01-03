import React from 'react'
// import { User as UserIcon } from 'lucide-react';
import { User } from '@/app/admin/_lib/types'

interface ResponsableModalProps {
    usuarios: User[];
    onSeleccionarResponsable: (userId: string, username: string) => void;
    onClose: () => void;
}

export default function ResponsableModal({ onClose, usuarios, onSeleccionarResponsable }: ResponsableModalProps) {

    const handleSeleccionarResponsable = (userId: string, username: string) => {
        onSeleccionarResponsable(userId, username)
        onClose()
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
            <div className="bg-zinc-900 p-5 rounded-md max-w-screen-sm w-full">
                <h2 className="text-xl font-semibold mb-4">Seleccionar responsable</h2>
                <ul>
                    {usuarios.map(usuario => (
                        <li key={usuario.id} className="mb-2">
                            <button
                                onClick={() => {
                                    if (usuario.id && usuario.username) {
                                        handleSeleccionarResponsable(usuario.id, usuario.username);
                                    }
                                }}
                                className="text-zinc-300 hover:underline flex items-center"
                            >
                                {/* <UserIcon size={16} className="mr-2" /> */}


                                <span className={`text-[12px] px-2 py-1 rounded-full text-zinc-200 mr-2 leading-3 ${usuario.role === 'proveedor' ? 'bg-yellow-800' : usuario.role === 'empleado' ? 'bg-blue-600' : usuario.role === 'admin' ? 'bg-purple-600' : 'bg-zinc-600'}`}>
                                    {usuario.role}
                                </span>

                                {usuario.username}
                            </button>
                        </li>
                    ))}
                </ul>

                <button
                    onClick={() => onClose()}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md w-full"
                >
                    Cerrar ventana
                </button>
            </div>
        </div>
    )
}
