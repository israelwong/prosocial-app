import { EtapaDistribucion } from '@/types/dashboard'
import { PieChart } from 'lucide-react'
import Link from 'next/link'

interface DistribucionEtapasWidgetProps {
    etapas: EtapaDistribucion[]
}

export function DistribucionEtapasWidget({ etapas }: DistribucionEtapasWidgetProps) {
    const totalEventos = etapas.reduce((sum, etapa) => sum + etapa.total_eventos, 0)

    // Calcular ángulos para la gráfica de pastel
    const getSegmentPath = (percentage: number, startAngle: number) => {
        const endAngle = startAngle + (percentage / 100) * 360
        const largeArcFlag = percentage > 50 ? 1 : 0

        const start = polarToCartesian(50, 50, 40, endAngle)
        const end = polarToCartesian(50, 50, 40, startAngle)

        return `M 50,50 L ${start.x},${start.y} A 40,40 0 ${largeArcFlag},0 ${end.x},${end.y} Z`
    }

    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        }
    }

    const colors = [
        '#3B82F6', // blue-500
        '#10B981', // emerald-500
        '#F59E0B', // amber-500
        '#EF4444', // red-500
        '#8B5CF6', // violet-500
        '#06B6D4', // cyan-500
        '#84CC16', // lime-500
        '#F97316', // orange-500
    ]

    return (
        <div className="bg-zinc-900 rounded-lg shadow-sm border border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-indigo-400" />
                    Distribución de Etapas
                </h3>
            </div>

            {etapas.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                    <PieChart className="h-8 w-8 mx-auto mb-2 text-zinc-600" />
                    <p>No hay datos de etapas disponibles</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Gráfica de pastel */}
                    <div className="flex items-center justify-center">
                        <div className="relative">
                            <svg width="120" height="120" viewBox="0 0 100 100" className="transform -rotate-90">
                                {etapas.map((etapa, index) => {
                                    const percentage = (etapa.total_eventos / totalEventos) * 100
                                    const startAngle = etapas.slice(0, index).reduce((sum, e) => sum + (e.total_eventos / totalEventos) * 360, 0)

                                    return (
                                        <path
                                            key={etapa.etapa_nombre}
                                            d={getSegmentPath(percentage, startAngle)}
                                            fill={colors[index % colors.length]}
                                            className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                                        />
                                    )
                                })}
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-sm font-semibold text-zinc-100">{totalEventos}</div>
                                    <div className="text-xs text-zinc-400">Total</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lista de etapas */}
                    <div className="space-y-3">
                        {etapas.map((etapa, index) => {
                            const percentage = ((etapa.total_eventos / totalEventos) * 100).toFixed(1)
                            return (
                                <Link
                                    key={etapa.etapa_nombre}
                                    href={`/admin/dashboard/eventos?etapa=${encodeURIComponent(etapa.etapa_nombre)}`}
                                    className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800 transition-colors border border-zinc-800"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-3 h-3 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: colors[index % colors.length] }}
                                        />
                                        <span className="text-sm text-zinc-300 truncate">
                                            {etapa.etapa_nombre}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-zinc-100">
                                            {etapa.total_eventos}
                                        </span>
                                        <span className="text-xs text-zinc-500 min-w-[3rem] text-right">
                                            {percentage}%
                                        </span>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Estadísticas adicionales */}
            <div className="mt-6 pt-4 border-t border-zinc-800">
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <div className="text-lg font-semibold text-zinc-100">{totalEventos}</div>
                        <div className="text-xs text-zinc-500">Total eventos</div>
                    </div>
                    <div>
                        <div className="text-lg font-semibold text-zinc-100">
                            {etapas.length}
                        </div>
                        <div className="text-xs text-zinc-500">Etapas activas</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
