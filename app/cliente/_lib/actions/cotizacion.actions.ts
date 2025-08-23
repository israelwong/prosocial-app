/**
 * Acciones para cotizaciones del cliente
 */

import { ApiResponse } from '../types'

/**
 * Obtiene las cotizaciones del cliente autenticado
 */
export async function obtenerCotizacionesCliente(): Promise<ApiResponse> {
    try {
        const response = await fetch('/api/cliente/cotizaciones', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        return {
            success: true,
            data: data
        }
    } catch (error) {
        console.error('Error al obtener cotizaciones:', error)
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error desconocido'
        }
    }
}

/**
 * Obtiene el detalle de una cotización específica
 */
export async function obtenerCotizacionDetalle(cotizacionId: string): Promise<ApiResponse> {
    try {
        const response = await fetch(`/api/cliente/cotizaciones/${cotizacionId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        return {
            success: true,
            data: data
        }
    } catch (error) {
        console.error('Error al obtener detalle de cotización:', error)
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error desconocido'
        }
    }
}
