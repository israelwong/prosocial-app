/**
 * Página principal del portal del cliente
 * Redirige automáticamente al dashboard del cliente
 */

import { redirect } from 'next/navigation';

export default function ClientePage() {
    // Redirigir directamente al dashboard del cliente
    redirect('/cliente/dashboard');
}
