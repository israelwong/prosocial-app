import { DashboardStats } from '@/types/dashboard'
import { Calendar, Users, Phone, AlertTriangle, Activity } from 'lucide-react'

interface DashboardHeaderProps {
    stats: DashboardStats
    ultimaActualizacion: Date
}

export function DashboardHeader({ stats, ultimaActualizacion }: DashboardHeaderProps) {
    const formatHora = (fecha: Date) => {
        return new Intl.DateTimeFormat('es-MX', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(fecha)
    }

    const statCards = [
        {
            title: 'Eventos Activos',
            value: stats.totalEventosActivos,
            icon: Activity,
            color: 'text-blue-400 bg-blue-950/50',
            description: 'Total en sistema'
        },
        {
            title: 'Agenda del Mes',
            value: stats.totalEventosMes,
            icon: Calendar,
            color: 'text-green-400 bg-green-950/50',
            description: 'Programados'
        },
        {
            title: 'Prospectos Nuevos',
            value: stats.totalProspectosMes,
            icon: Users,
            color: 'text-purple-400 bg-purple-950/50',
            description: 'Este mes'
        },
        {
            title: 'Citas esta Semana',
            value: stats.totalCitasSemana,
            icon: Phone,
            color: 'text-indigo-400 bg-indigo-950/50',
            description: 'Programadas'
        }
    ]

    return (
        <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-100">Dashboard General</h1>
                    <p className="text-sm text-zinc-400 flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Última actualización: {formatHora(ultimaActualizacion)}
                        {stats.alertasPendientes > 0 && (
                            <span className="ml-4 flex items-center gap-1 text-red-400">
                                <AlertTriangle className="h-4 w-4" />
                                {stats.alertasPendientes} alertas pendientes
                            </span>
                        )}
                    </p>
                </div>

                {/* Estadísticas rápidas */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {statCards.map((stat) => (
                        <div key={stat.title} className="bg-zinc-800 rounded-lg p-3 min-w-0 border border-zinc-700">
                            <div className="flex items-center gap-2 mb-1">
                                <div className={`p-1 rounded ${stat.color}`}>
                                    <stat.icon className="h-3 w-3" />
                                </div>
                                <span className="text-xs font-medium text-zinc-300 truncate">
                                    {stat.title}
                                </span>
                            </div>
                            <div className="text-lg font-bold text-zinc-100">{stat.value}</div>
                            <div className="text-xs text-zinc-500">{stat.description}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
