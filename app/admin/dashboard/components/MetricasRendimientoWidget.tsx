import { MetricasRendimiento } from '@/types/dashboard'
import { TrendingUp, TrendingDown, Minus, Target, Clock, Trophy, Phone } from 'lucide-react'

interface MetricasRendimientoWidgetProps {
    metricas: MetricasRendimiento
}

export function MetricasRendimientoWidget({ metricas }: MetricasRendimientoWidgetProps) {
    const getTendenciaIcon = (direccion: 'up' | 'down' | 'stable') => {
        switch (direccion) {
            case 'up':
                return <TrendingUp className="h-4 w-4 text-green-600" />
            case 'down':
                return <TrendingDown className="h-4 w-4 text-red-600" />
            default:
                return <Minus className="h-4 w-4 text-zinc-400" />
        }
    }

    const getTendenciaColor = (direccion: 'up' | 'down' | 'stable') => {
        switch (direccion) {
            case 'up':
                return 'text-green-600'
            case 'down':
                return 'text-red-600'
            default:
                return 'text-zinc-400'
        }
    }

    return (
        <div className="bg-zinc-900 rounded-lg shadow-sm border border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-600" />
                    Métricas de Rendimiento
                </h3>
                <div className="flex items-center gap-2">
                    {getTendenciaIcon(metricas.tendenciaMensual.direccion)}
                    <span className={`text-sm font-medium ${getTendenciaColor(metricas.tendenciaMensual.direccion)}`}>
                        {metricas.tendenciaMensual.cambio > 0 ? '+' : ''}{metricas.tendenciaMensual.cambio}%
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Conversión */}
                <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Target className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-700">
                        {metricas.conversionRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-green-600">Conversión</div>
                    <div className="text-xs text-green-500 mt-1">
                        Cotización → Venta
                    </div>
                </div>

                {/* Tiempo promedio de cierre */}
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-700">
                        {metricas.tiempoPromedioCierre}
                    </div>
                    <div className="text-sm text-blue-600">Días promedio</div>
                    <div className="text-xs text-blue-500 mt-1">
                        Para cerrar
                    </div>
                </div>
            </div>

            {/* Efectividad de citas */}
            <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">Efectividad citas</span>
                    </div>
                    <span className="text-lg font-bold text-purple-700">
                        {metricas.efectividadCitas.toFixed(1)}%
                    </span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2">
                    <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(metricas.efectividadCitas, 100)}%` }}
                    />
                </div>
            </div>

            {/* Evento más popular */}
            <div className="mb-6 p-4 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">Evento más popular</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-amber-700">{metricas.eventoMasPopular.tipo}</span>
                    <div className="text-right">
                        <div className="text-lg font-bold text-amber-800">
                            {metricas.eventoMasPopular.cantidad}
                        </div>
                        <div className="text-xs text-amber-600">
                            {metricas.eventoMasPopular.porcentaje.toFixed(1)}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Fuente de lead más efectiva */}
            <div className="p-4 bg-indigo-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-indigo-600" />
                    <span className="text-sm font-medium text-indigo-800">Canal más efectivo</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-indigo-700">{metricas.fuenteLeadMasEfectiva.canal}</span>
                    <div className="text-right">
                        <div className="text-lg font-bold text-indigo-800">
                            {metricas.fuenteLeadMasEfectiva.conversion}
                        </div>
                        <div className="text-xs text-indigo-600">prospectos</div>
                    </div>
                </div>
            </div>

            {/* Tendencia mensual detallada */}
            <div className="mt-6 pt-4 border-t border-zinc-800">
                <div className="flex items-center justify-center gap-2 text-sm">
                    <span className="text-zinc-400">Tendencia del mes:</span>
                    {getTendenciaIcon(metricas.tendenciaMensual.direccion)}
                    <span className={`font-medium ${getTendenciaColor(metricas.tendenciaMensual.direccion)}`}>
                        {metricas.tendenciaMensual.direccion === 'up'
                            ? 'Crecimiento'
                            : metricas.tendenciaMensual.direccion === 'down'
                                ? 'Declive'
                                : 'Estable'}
                    </span>
                    <span className="text-zinc-500">
                        ({metricas.tendenciaMensual.cambio > 0 ? '+' : ''}{metricas.tendenciaMensual.cambio}%)
                    </span>
                </div>
            </div>
        </div>
    )
}
