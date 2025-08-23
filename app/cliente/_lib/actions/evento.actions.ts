/**
 * Acciones para manejo de eventos del cliente
 */

import { ApiResponse, Evento, EventoDetalle } from '../types'

export async function obtenerEventosCliente(clienteId: string): Promise<ApiResponse<{ eventos: Evento[] }>> {
    try {
        const response = await fetch(`/api/cliente/eventos/${clienteId}`)
        const result = await response.json()

        if (response.ok && result.success) {
            return {
                success: true,
                data: {
                    eventos: result.eventos
                }
            }
        } else {
            return {
                success: false,
                message: result.message || 'Error al obtener eventos'
            }
        }
    } catch (error) {
        console.error('Error al obtener eventos del cliente:', error)
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error desconocido'
        }
    }
}

export async function obtenerEventoDetalle(eventoId: string): Promise<ApiResponse<EventoDetalle>> {
    try {
        const response = await fetch(`/api/cliente/evento/${eventoId}`)
        const result = await response.json()

        if (response.ok && result.success) {
            return {
                success: true,
                data: result.evento
            }
        } else {
            return {
                success: false,
                message: result.message || 'Error al obtener evento'
            }
        }
    } catch (error) {
        console.error('Error en obtenerEventoDetalle:', error)
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error desconocido'
        }
    }
}

export async function editarEvento(
    eventoId: string,
    datos: { nombre: string; direccion: string; sede: string }
): Promise<ApiResponse<{ mensaje: string }>> {
    try {
        const response = await fetch(`/api/cliente/evento/${eventoId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datos),
        })

        const result = await response.json()

        if (response.ok && result.success) {
            return {
                success: true,
                data: { mensaje: 'Evento actualizado correctamente' }
            }
        } else {
            return {
                success: false,
                message: result.message || 'Error al editar el evento'
            }
        }
    } catch (error) {
        console.error('Error en editarEvento:', error)
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error desconocido'
        }
    }
}