/**
 * Layout del portal del cliente con navegación y autenticación
 */

import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

// En producción, obtendrías esta información de tu sistema de autenticación
async function getClienteAutenticado() {
    // Simular verificación de autenticación
    // En realidad verificarías JWT, sesión, etc.
    const isAuthenticated = true; // Cambiar por tu lógica real

    if (!isAuthenticated) {
        redirect('/cliente/login');
    }

    return {
        id: 'cliente_123',
        nombre: 'María García',
        email: 'maria@example.com',
        avatar: null
    };
}

export default async function ClienteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cliente = await getClienteAutenticado();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header/Navbar */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo y navegación principal */}
                        <div className="flex items-center space-x-8">
                            <Link href="/cliente/dashboard" className="flex items-center">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                                    <span className="text-white font-bold text-sm">P</span>
                                </div>
                                <span className="text-xl font-bold text-gray-900">ProSocial</span>
                                <span className="ml-2 text-sm text-gray-500 hidden sm:inline">Portal Cliente</span>
                            </Link>

                            {/* Navegación principal */}
                            <nav className="hidden md:flex space-x-6">
                                <Link
                                    href="/cliente/dashboard"
                                    className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/cliente/cotizaciones"
                                    className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                                >
                                    Mis Cotizaciones
                                </Link>
                                <Link
                                    href="/cliente/eventos"
                                    className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                                >
                                    Mis Eventos
                                </Link>
                                <Link
                                    href="/cliente/pagos"
                                    className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                                >
                                    Historial de Pagos
                                </Link>
                            </nav>
                        </div>

                        {/* Menú de usuario */}
                        <div className="flex items-center space-x-4">
                            {/* Notificaciones */}
                            <button className="text-gray-400 hover:text-gray-600 relative">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5a7 7 0 11-1.414 1.414L15 17z" />
                                </svg>
                                {/* Indicador de notificaciones */}
                                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                            </button>

                            {/* Menú desplegable de usuario */}
                            <div className="relative">
                                <button className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 focus:outline-none">
                                    {/* Avatar */}
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 font-medium text-sm">
                                            {cliente.nombre.split(' ').map(n => n[0]).join('')}
                                        </span>
                                    </div>

                                    {/* Información del usuario */}
                                    <div className="hidden sm:block text-left">
                                        <p className="text-sm font-medium text-gray-900">{cliente.nombre}</p>
                                        <p className="text-xs text-gray-500">{cliente.email}</p>
                                    </div>

                                    {/* Icono dropdown */}
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Menú desplegable (en producción usarías un componente de dropdown) */}
                                <div className="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                    <Link href="/cliente/perfil" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        Mi Perfil
                                    </Link>
                                    <Link href="/cliente/configuracion" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        Configuración
                                    </Link>
                                    <Link href="/cliente/soporte" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        Soporte
                                    </Link>
                                    <div className="border-t border-gray-100"></div>
                                    <Link href="/cliente/logout" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        Cerrar Sesión
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navegación móvil */}
                <div className="md:hidden border-t border-gray-200">
                    <nav className="px-4 py-3 space-y-1">
                        <Link
                            href="/cliente/dashboard"
                            className="block text-gray-700 hover:text-blue-600 py-2 text-sm font-medium transition-colors"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/cliente/cotizaciones"
                            className="block text-gray-700 hover:text-blue-600 py-2 text-sm font-medium transition-colors"
                        >
                            Mis Cotizaciones
                        </Link>
                        <Link
                            href="/cliente/eventos"
                            className="block text-gray-700 hover:text-blue-600 py-2 text-sm font-medium transition-colors"
                        >
                            Mis Eventos
                        </Link>
                        <Link
                            href="/cliente/pagos"
                            className="block text-gray-700 hover:text-blue-600 py-2 text-sm font-medium transition-colors"
                        >
                            Historial de Pagos
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Contenido principal */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer simplificado */}
            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center space-x-6 mb-4 md:mb-0">
                            <Link href="/cliente/soporte" className="text-sm text-gray-600 hover:text-gray-900">
                                Soporte
                            </Link>
                            <Link href="/aviso-de-privacidad" className="text-sm text-gray-600 hover:text-gray-900">
                                Privacidad
                            </Link>
                            <Link href="/terminos" className="text-sm text-gray-600 hover:text-gray-900">
                                Términos
                            </Link>
                        </div>

                        <div className="flex items-center space-x-4">
                            <p className="text-sm text-gray-500">
                                © 2025 ProSocial. Todos los derechos reservados.
                            </p>

                            {/* Enlaces de contacto */}
                            <div className="flex items-center space-x-3">
                                <a href="tel:5512345678" className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </a>
                                <a href="mailto:soporte@prosocial.mx" className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
