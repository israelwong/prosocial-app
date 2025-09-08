import { ProspectoNuevo } from '@/types/dashboard'
import { UserPlus, Phone, Mail, Calendar, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface ProspectosNuevosWidgetProps {
    prospectos: ProspectoNuevo[]
}

export function ProspectosNuevosWidget({ prospectos }: ProspectosNuevosWidgetProps) {
    const formatFecha = (fecha: Date) => {
        return new Intl.DateTimeFormat('es-MX', {
            day: 'numeric',
            month: 'short'
        }).format(new Date(fecha))
    }

    const getEtapaColor = (etapa: string | null) => {
        switch (etapa?.toLowerCase()) {
            case 'nuevo':
                return 'bg-blue-950/50 text-blue-300 border-blue-800'
            case 'seguimiento':
                return 'bg-yellow-950/50 text-yellow-300 border-yellow-800'
            case 'cotización':
                return 'bg-purple-950/50 text-purple-300 border-purple-800'
            case 'aprobado':
                return 'bg-green-950/50 text-green-300 border-green-800'
            default:
                return 'bg-zinc-800 text-zinc-300 border-zinc-700'
        }
    }

    const calcularCrecimiento = () => {
        // Simulamos un crecimiento del 25% vs mes anterior
        return 25
    }

    return (
        <div className="bg-zinc-900 rounded-lg shadow-sm border border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-purple-400" />
                    Prospectos del Mes
                </h3>
                <span className="bg-purple-950/50 text-purple-300 text-sm font-medium px-2.5 py-0.5 rounded border border-purple-800">
                    {prospectos.length} nuevos
                </span>
            </div>

            {/* Indicador de crecimiento */}
            <div className="flex items-center gap-2 mb-4 p-3 bg-green-950/30 rounded-lg border border-green-800">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-300">
                    +{calcularCrecimiento()}% vs mes anterior
                </span>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
                {prospectos.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500">
                        <UserPlus className="h-8 w-8 mx-auto mb-2 text-zinc-600" />
                        <p>No hay prospectos nuevos este mes</p>
                    </div>
                ) : (
                    prospectos.map((prospecto) => (
                        <Link
                            key={prospecto.id}
                            href={prospecto.evento_nombre
                                ? `/admin/dashboard/eventos/seguimiento/${prospecto.id}`
                                : `/admin/dashboard/clientes/${prospecto.id}`
                            }
                            className="block p-3 rounded-lg border border-zinc-800 hover:border-purple-700 hover:bg-purple-950/30 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-medium text-purple-400">
                                            {formatFecha(prospecto.createdAt)}
                                        </span>
                                        {prospecto.etapa_nombre && (
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getEtapaColor(prospecto.etapa_nombre)}`}>
                                                {prospecto.etapa_nombre}
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm font-medium text-zinc-100 mb-1">
                                        {prospecto.nombre}
                                    </p>

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1 text-xs text-zinc-400">
                                            <Phone className="h-3 w-3" />
                                            {prospecto.telefono}
                                        </div>

                                        {prospecto.email && (
                                            <div className="flex items-center gap-1 text-xs text-zinc-400">
                                                <Mail className="h-3 w-3" />
                                                <span className="truncate">{prospecto.email}</span>
                                            </div>
                                        )}

                                        {prospecto.evento_nombre && (
                                            <div className="flex items-center gap-1 text-xs text-blue-400">
                                                <Calendar className="h-3 w-3" />
                                                <span className="truncate">
                                                    {prospecto.evento_nombre}
                                                    {prospecto.tipo_evento && ` • ${prospecto.tipo_evento}`}
                                                </span>
                                            </div>
                                        )}

                                        {prospecto.canal_nombre && (
                                            <div className="text-xs text-zinc-500">
                                                Vía: {prospecto.canal_nombre}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            {prospectos.length > 0 && (
                <div className="mt-4 pt-4 border-t border-zinc-800">
                    <Link
                        href="/admin/dashboard/clientes?filter=prospectos"
                        className="w-full text-center text-sm text-purple-400 hover:text-purple-300 font-medium block py-2 hover:bg-zinc-800 rounded transition-colors"
                    >
                        Ver todos los prospectos →
                    </Link>
                </div>
            )}
        </div>
    )
}
