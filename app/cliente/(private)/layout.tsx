/**
 * Layout para páginas privadas del cliente (requieren autenticación)
 */

'use client';

import { useClienteAuth } from '@/app/cliente/hooks/useClienteAuth';
import ClienteNavbar from '@/app/cliente/components/navbar/ClienteNavbar';

export default function ClientePrivateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, loading, cliente } = useClienteAuth();

    // Mostrar loading mientras se verifica la autenticación
    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
                    <p className="mt-4 text-zinc-400">Verificando autenticación...</p>
                </div>
            </div>
        );
    }

    // Si no está autenticado, el hook ya manejó la redirección
    if (!isAuthenticated || !cliente) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
                    <p className="mt-4 text-zinc-400">Redirigiendo...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950">
            {/* Navbar Component */}
            <ClienteNavbar />

            {/* Contenido principal */}
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}