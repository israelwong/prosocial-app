import { Suspense } from 'react'
import { getDashboardData, getDashboardStats } from '@/app/admin/_lib/actions/dashboard/dashboard.actions'
import { DashboardHeader } from './components/DashboardHeader'
import { EventosDelMesWidget } from './components/EventosDelMesWidget'
import { BalanceFinancieroWidget } from './components/BalanceFinancieroWidget'
import { ProspectosNuevosWidget } from './components/ProspectosNuevosWidget'
import { DistribucionEtapasWidget } from './components/DistribucionEtapasWidget'
import { CitasProgramadasWidget } from './components/CitasProgramadasWidget'
import { MetricasRendimientoWidget } from './components/MetricasRendimientoWidget'
import { ReloadButton } from './components/ReloadButton'
import { Loader2 } from 'lucide-react'

// Importar limpieza automática de Realtime (se ejecuta automáticamente)
import '@/lib/realtime-cleanup'

export const metadata = {
  title: 'Dashboard General - ProSocial',
  description: 'Dashboard principal con métricas y estadísticas en tiempo real',
}

// Componente de loading para widgets
function WidgetSkeleton() {
  return (
    <div className="bg-zinc-900 rounded-lg shadow-sm border border-zinc-800 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-zinc-800 rounded w-32"></div>
        <div className="h-6 bg-zinc-800 rounded-full w-16"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-zinc-800 rounded w-full"></div>
        <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
        <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
      </div>
    </div>
  )
}

// Componente de loading para el dashboard completo
function DashboardLoading() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header skeleton */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 animate-pulse">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="h-8 bg-zinc-800 rounded w-48 mb-2"></div>
            <div className="h-4 bg-zinc-800 rounded w-64"></div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-zinc-800 rounded-lg p-3">
                <div className="h-4 bg-zinc-700 rounded w-20 mb-2"></div>
                <div className="h-6 bg-zinc-700 rounded w-12 mb-1"></div>
                <div className="h-3 bg-zinc-700 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <WidgetSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

// Componente para manejar los datos del dashboard
async function DashboardContent() {
  try {
    const [dashboardData, dashboardStats] = await Promise.all([
      getDashboardData(),
      getDashboardStats()
    ])

    return (
      <div className="min-h-screen bg-zinc-950">
        <DashboardHeader
          stats={dashboardStats}
          ultimaActualizacion={dashboardData.ultimaActualizacion}
        />

        <div className="p-6">
          {/* Grid responsivo de widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
            {/* Fila 1 */}
            <EventosDelMesWidget eventos={dashboardData.eventosDelMes} />
            <BalanceFinancieroWidget balance={dashboardData.balanceFinanciero} />
            <ProspectosNuevosWidget prospectos={dashboardData.prospectosNuevos} />

            {/* Fila 2 */}
            <DistribucionEtapasWidget etapas={dashboardData.distribucionEtapas} />
            <CitasProgramadasWidget citas={dashboardData.citasProximas} />
            <MetricasRendimientoWidget metricas={dashboardData.metricasRendimiento} />
          </div>

          {/* Información adicional */}
          <div className="mt-8 bg-zinc-900 rounded-lg shadow-sm border border-zinc-800 p-6">
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">Información del Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-zinc-300">Última actualización:</span>
                <p className="text-zinc-400">
                  {new Intl.DateTimeFormat('es-MX', {
                    dateStyle: 'full',
                    timeStyle: 'short'
                  }).format(dashboardData.ultimaActualizacion)}
                </p>
              </div>
              <div>
                <span className="font-medium text-zinc-300">Datos actualizados:</span>
                <p className="text-zinc-400">En tiempo real</p>
              </div>
              <div>
                <span className="font-medium text-zinc-300">Próxima actualización:</span>
                <p className="text-zinc-400">Automática</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error al cargar el dashboard:', error)

    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-900/50 border border-red-800 text-red-300 px-4 py-3 rounded mb-4">
            <h3 className="font-bold">Error al cargar el dashboard</h3>
            <p>Hubo un problema al obtener los datos. Por favor, intenta recargar la página.</p>
          </div>
          <ReloadButton />
        </div>
      </div>
    )
  }
}

export default function Dashboard() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  )
}
