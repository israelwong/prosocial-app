'use client';

// Función para obtener el usuario actual desde las cookies del navegador
export function getCurrentUser() {
    try {
        if (typeof window === 'undefined') {
            // Si estamos en el servidor, no podemos acceder a las cookies del navegador
            return null;
        }

        // Intentar obtener de localStorage primero
        const userString = localStorage.getItem('user');
        if (userString) {
            try {
                const user = JSON.parse(userString);
                if (user && user.id) {
                    return user;
                }
            } catch (e) {
                console.warn('Error parsing user from localStorage:', e);
            }
        }

        // Fallback: intentar obtener desde las cookies del documento
        const cookies = document.cookie.split('; ');
        const userCookie = cookies.find(cookie => cookie.startsWith('user='));

        if (userCookie) {
            try {
                const userString = decodeURIComponent(userCookie.split('=')[1]);
                const user = JSON.parse(userString);
                if (user && user.id) {
                    return user;
                }
            } catch (e) {
                console.warn('Error parsing user from cookie:', e);
            }
        }

        console.warn('No se encontró información del usuario autenticado');
        return null;
    } catch (error) {
        console.error('Error al obtener usuario actual:', error);
        return null;
    }
}

// Función para obtener solo el userId
export function getCurrentUserId(): string | null {
    const user = getCurrentUser();
    return user?.id || null;
}
