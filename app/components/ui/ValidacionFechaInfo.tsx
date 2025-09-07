'use client'
import React from 'react'
import { Clock, AlertTriangle, Calendar, CheckCircle } from 'lucide-react'
import { validarFechaEvento, type ValidacionFecha } from '@/app/lib/validaciones-fecha'

interface Props {
    fechaEvento?: string | Date | null
    diasMinimosContratacion?: number | null
    explicacion?: string | null
    mostrarTodos?: boolean // Si mostrar todos los mensajes o solo el principal
    tamaño?: 'sm' | 'md' | 'lg'
    className?: string
}

export default function ValidacionFechaInfo({
    fechaEvento,
    diasMinimosContratacion,
    explicacion,
    mostrarTodos = true,
    tamaño = 'md',
    className = ''
}: Props) {
    const validacion: ValidacionFecha = validarFechaEvento(
        fechaEvento,
        diasMinimosContratacion,
        explicacion
    )

    // Si no hay datos para validar, no mostrar nada
    if (!fechaEvento || !diasMinimosContratacion) {
        return null
    }

    const estilosTamaño = {
        sm: {
            contenedor: 'p-3',
            texto: 'text-xs',
            icono: 'w-3 h-3',
            titulo: 'text-xs font-medium'
        },
        md: {
            contenedor: 'p-4',
            texto: 'text-sm',
            icono: 'w-4 h-4',
            titulo: 'text-sm font-medium'
        },
        lg: {
            contenedor: 'p-6',
            texto: 'text-base',
            icono: 'w-5 h-5',
            titulo: 'text-base font-medium'
        }
    }

    const estilos = estilosTamaño[tamaño]

    return (
        <div className={`rounded-lg border ${estilos.contenedor} ${validacion.esValida
            ? 'bg-green-900/20 border-green-700/30'
            : 'bg-amber-900/20 border-amber-700/30'
            } ${className}`}>

            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                {validacion.esValida ? (
                    <CheckCircle className={`${estilos.icono} text-green-400`} />
                ) : (
                    <Clock className={`${estilos.icono} text-amber-400`} />
                )}
                <span className={`${estilos.titulo} ${validacion.esValida ? 'text-green-400' : 'text-amber-400'
                    }`}>
                    Tiempo de contratación
                </span>
            </div>

            {/* Contenido */}
            <div className={`${estilos.texto} text-zinc-300 space-y-2`}>
                {/* Requerimiento básico */}
                <div className="flex items-center gap-2">
                    <span className="text-zinc-400">Requerido:</span>
                    <span className="font-medium">
                        {diasMinimosContratacion} días naturales mínimo
                    </span>
                </div>

                {/* Estado actual */}
                <div className="flex items-center gap-2">
                    <span className="text-zinc-400">Tu evento:</span>
                    <span className={`font-medium ${validacion.esValida ? 'text-green-200' : 'text-amber-200'
                        }`}>
                        En {validacion.diasRestantes} días
                    </span>
                </div>

                {mostrarTodos && (
                    <>
                        {/* Mensaje principal */}
                        <p className={`leading-relaxed ${validacion.esValida ? 'text-green-200' : 'text-amber-200'
                            }`}>
                            {validacion.mensaje}
                        </p>

                        {/* Mensaje de fecha límite */}
                        {validacion.mensajeFechaLimite && (
                            <div className="bg-blue-900/20 rounded p-3 border border-blue-700/30 mt-3">
                                <div className="flex items-start gap-2">
                                    <Calendar className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-blue-200 text-sm leading-relaxed">
                                        {validacion.mensajeFechaLimite}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Explicación adicional */}
                        {explicacion && (
                            <p className="text-zinc-400 text-sm leading-relaxed mt-3 pt-3 border-t border-zinc-700">
                                {explicacion}
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
