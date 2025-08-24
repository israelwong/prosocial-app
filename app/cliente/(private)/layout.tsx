/**
 * Layout para páginas privadas del cliente (requieren autenticación)
 */

'use client';

import { useClienteAuth } from '@/app/cliente/hooks/useClienteAuth';
import ClienteNavbar from '@/app/cliente/components/navbar/ClienteNavbar';
import ClienteFooter from '@/app/cliente/components/footer/ClienteFooter';
import { AuthValidationSkeleton } from '@/app/cliente/components/ui/skeleton';

export default function ClientePrivateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, loading, cliente } = useClienteAuth();

    // Mostrar loading mientras se verifica la autenticación
    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col">
                <ClienteNavbar />
                <main className="flex-1">
                    <AuthValidationSkeleton />
                </main>
                <ClienteFooter />
            </div>
        );
    }

    // Si no está autenticado, el hook ya manejó la redirección
    if (!isAuthenticated || !cliente) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col">
                <ClienteNavbar />
                <main className="flex-1">
                    <AuthValidationSkeleton />
                </main>
                <ClienteFooter />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col">
            {/* Navbar Component */}
            <ClienteNavbar />

            {/* Contenido principal */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer Component */}
            <ClienteFooter />
        </div>
    );
}