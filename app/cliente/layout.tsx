/**
 * Layout público del portal del cliente (login, auth, etc.)
 */

'use client'

import React from 'react';

export default function ClienteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-zinc-950">
            {/* No header/navbar para páginas públicas */}
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}