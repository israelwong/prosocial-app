import React from 'react'
import { AlertTriangle, X, Trash2, Info, AlertCircle } from 'lucide-react'

interface DependenciaInfo {
    tipo: string
    cantidad: number
    accion: 'eliminar' | 'desvincular' | 'preservar'
    descripcion?: string
}

interface ModalConfirmacionEliminacionProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    titulo: string
    entidad: {
        nombre: string
        valor?: string
        descripcion?: string
    }
    dependencias: DependenciaInfo[]
    advertencias?: string[]
    bloqueos?: string[]
    isLoading?: boolean
    loadingText?: string
}

export default function ModalConfirmacionEliminacion({
    isOpen,
    onClose,
    onConfirm,
    titulo,
    entidad,
    dependencias,
    advertencias = [],
    bloqueos = [],
    isLoading = false,
    loadingText = 'Procesando...'
}: ModalConfirmacionEliminacionProps) {

    if (!isOpen) return null

    const hayBloqueos = bloqueos.length > 0
    const dependenciasEliminar = dependencias.filter(d => d.accion === 'eliminar')
    const dependenciasDesvincular = dependencias.filter(d => d.accion === 'desvincular')
    const dependenciasPreservar = dependencias.filter(d => d.accion === 'preservar')

    const getIconoAccion = (accion: string) => {
        switch (accion) {
            case 'eliminar': return '🗑️'
            case 'desvincular': return '🔗'
            case 'preservar': return '💾'
            default: return '📋'
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-700">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                        <h2 className="text-xl font-semibold text-zinc-100">{titulo}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors"
                        disabled={isLoading}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Contenido */}
                <div className="p-6 space-y-6">
                    {/* Información de la entidad */}
                    <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
                        <h3 className="font-medium text-zinc-200 mb-2">Elemento a eliminar:</h3>
                        <div className="space-y-1 text-sm">
                            <p className="text-zinc-300">
                                <span className="font-medium">Nombre:</span> {entidad.nombre}
                            </p>
                            {entidad.valor && (
                                <p className="text-zinc-300">
                                    <span className="font-medium">Valor:</span> {entidad.valor}
                                </p>
                            )}
                            {entidad.descripcion && (
                                <p className="text-zinc-400">{entidad.descripcion}</p>
                            )}
                        </div>
                    </div>

                    {/* Bloqueos críticos */}
                    {hayBloqueos && (
                        <div className="bg-red-900/30 border border-red-700 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertCircle className="w-5 h-5 text-red-400" />
                                <h3 className="font-medium text-red-300">Eliminación Bloqueada</h3>
                            </div>
                            <ul className="space-y-1 text-sm text-red-200">
                                {bloqueos.map((bloqueo, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <span className="text-red-400 mt-0.5">•</span>
                                        {bloqueo}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Dependencias que se eliminarán */}
                    {dependenciasEliminar.length > 0 && (
                        <div className="bg-red-900/20 border border-red-800 p-4 rounded-lg">
                            <h3 className="font-medium text-red-300 mb-3 flex items-center gap-2">
                                <Trash2 className="w-4 h-4" />
                                Elementos que se eliminarán permanentemente:
                            </h3>
                            <ul className="space-y-2 text-sm">
                                {dependenciasEliminar.map((dep, index) => (
                                    <li key={index} className="flex items-center gap-2 text-red-200">
                                        <span>{getIconoAccion(dep.accion)}</span>
                                        <span className="font-medium">{dep.cantidad}</span>
                                        <span>{dep.tipo}</span>
                                        {dep.descripcion && (
                                            <span className="text-red-300">- {dep.descripcion}</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Dependencias que se desvincularán */}
                    {dependenciasDesvincular.length > 0 && (
                        <div className="bg-yellow-900/20 border border-yellow-800 p-4 rounded-lg">
                            <h3 className="font-medium text-yellow-300 mb-3 flex items-center gap-2">
                                <Info className="w-4 h-4" />
                                Elementos que se desvincularán:
                            </h3>
                            <ul className="space-y-2 text-sm">
                                {dependenciasDesvincular.map((dep, index) => (
                                    <li key={index} className="flex items-center gap-2 text-yellow-200">
                                        <span>{getIconoAccion(dep.accion)}</span>
                                        <span className="font-medium">{dep.cantidad}</span>
                                        <span>{dep.tipo}</span>
                                        {dep.descripcion && (
                                            <span className="text-yellow-300">- {dep.descripcion}</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Dependencias que se preservan */}
                    {dependenciasPreservar.length > 0 && (
                        <div className="bg-blue-900/20 border border-blue-800 p-4 rounded-lg">
                            <h3 className="font-medium text-blue-300 mb-3 flex items-center gap-2">
                                <Info className="w-4 h-4" />
                                Elementos que se preservan:
                            </h3>
                            <ul className="space-y-2 text-sm">
                                {dependenciasPreservar.map((dep, index) => (
                                    <li key={index} className="flex items-center gap-2 text-blue-200">
                                        <span>{getIconoAccion(dep.accion)}</span>
                                        <span className="font-medium">{dep.cantidad}</span>
                                        <span>{dep.tipo}</span>
                                        {dep.descripcion && (
                                            <span className="text-blue-300">- {dep.descripcion}</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Advertencias adicionales */}
                    {advertencias.length > 0 && (
                        <div className="bg-orange-900/20 border border-orange-800 p-4 rounded-lg">
                            <h3 className="font-medium text-orange-300 mb-3">Advertencias importantes:</h3>
                            <ul className="space-y-1 text-sm text-orange-200">
                                {advertencias.map((advertencia, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <span className="text-orange-400 mt-0.5">⚠️</span>
                                        {advertencia}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-700">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading || hayBloqueos}
                        className={`px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            hayBloqueos 
                                ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                {loadingText}
                            </div>
                        ) : hayBloqueos ? (
                            'Eliminación Bloqueada'
                        ) : (
                            'Confirmar Eliminación'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
