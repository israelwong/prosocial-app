// Ruta: app/admin/configurar/usuarios/components/UsuariosCliente.tsx

'use client';

import { useState, useMemo } from 'react';
import { type User } from '@prisma/client';
import { useRouter } from 'next/navigation';

interface Props {
    initialUsuarios: User[];
}

export default function UsuariosCliente({ initialUsuarios }: Props) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsuarios = useMemo(() => {
        return initialUsuarios.filter(usuario =>
            usuario.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            usuario.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [initialUsuarios, searchTerm]);

    return (
        <div className="max-w-4xl mx-auto">
            <input
                type="text"
                placeholder="Buscar por nombre o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 mb-6"
            />
            <div className="space-y-4">
                {filteredUsuarios.map((usuario) => (
                    <div key={usuario.id} className="p-4 rounded-lg border border-zinc-800 bg-zinc-900 flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${usuario.role === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                                        usuario.role === 'empleado' ? 'bg-blue-500/20 text-blue-300' :
                                            'bg-zinc-700 text-zinc-300'
                                    }`}>
                                    {usuario.role}
                                </span>
                                <p className="text-base font-medium text-zinc-100">{usuario.username}</p>
                            </div>
                            <p className="text-sm text-zinc-400 mt-1">{usuario.email}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`flex items-center gap-2 text-xs ${usuario.status === 'active' ? 'text-green-400' : 'text-zinc-500'}`}>
                                <span className={`h-2 w-2 rounded-full ${usuario.status === 'active' ? 'bg-green-500' : 'bg-zinc-600'}`}></span>
                                {usuario.status === 'active' ? 'Activo' : 'Inactivo'}
                            </span>
                            <button
                                onClick={() => router.push(`/admin/configurar/usuarios/${usuario.id}`)}
                                className="px-3 py-1 rounded-md bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-xs font-medium"
                            >
                                Editar
                            </button>
                        </div>
                    </div>
                ))}
                {filteredUsuarios.length === 0 && (
                    <div className="text-center text-zinc-500 py-10">
                        No se encontraron usuarios.
                    </div>
                )}
            </div>
        </div>
    );
}
