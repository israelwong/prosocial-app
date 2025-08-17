// Página de prueba para verificar el componente de Balance Financiero Avanzado
import { BalanceFinancieroAvanzado } from '../dashboard/seguimiento/[eventoId]/components/BalanceFinancieroAvanzado'

// Datos de prueba
const datosEjemplo = {
    cotizacion: {
        id: 'cmbfsmni70017jq04t4qaei06',
        precio: 25007.06,
        status: 'aprobada'
    },
    pagos: [
        {
            id: 'cmcm8xamn0001jz042ng34lbf',
            monto: 2500.71,
            cantidad: 2500.71,
            status: 'paid',
            metodo_pago: 'card',
            concepto: 'Pago del 10% de anticipo del total del servicio',
            descripcion: 'Anticipo inicial del evento',
            createdAt: '2024-12-15T10:30:00Z'
        }
    ]
}

export default function TestBalanceFinanciero() {
    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">
                🧪 Prueba: Balance Financiero Avanzado
            </h1>

            <BalanceFinancieroAvanzado
                cotizacion={datosEjemplo.cotizacion}
                pagos={datosEjemplo.pagos}
            />

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h2 className="font-semibold mb-2">Datos de prueba:</h2>
                <pre className="text-xs overflow-auto">
                    {JSON.stringify(datosEjemplo, null, 2)}
                </pre>
            </div>
        </div>
    )
}
