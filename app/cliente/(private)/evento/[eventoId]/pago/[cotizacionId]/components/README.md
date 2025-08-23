# Componentes de la Página de Pago

Esta carpeta contiene los componentes modulares extraídos de la página principal de pago para mejorar la organización del código y facilitar el mantenimiento.

## Componentes

### ResumenCotizacion.tsx

- **Propósito**: Muestra el resumen financiero de la cotización
- **Props**:
  - `total`: Monto total de la cotización
  - `pagado`: Monto ya pagado
  - `saldoPendiente`: Saldo pendiente por pagar
- **Responsabilidades**:
  - Formateo de monedas
  - Visualización del estado financiero
  - Cálculo visual de saldos

### HistorialPagos.tsx

- **Propósito**: Muestra el historial de pagos realizados
- **Props**:
  - `pagos`: Array de objetos Pago con información de transacciones
- **Responsabilidades**:
  - Formateo de fechas y monedas
  - Mapeo de estados de pago
  - Formateo de métodos de pago
  - Renderizado de lista de transacciones

## Ventajas del Refactoring

### Antes

- ✅ Archivo principal: ~574 líneas
- ❌ Todas las funciones de formateo mezcladas
- ❌ Lógica de UI y datos en el mismo archivo
- ❌ Difícil de mantener y testear

### Después

- ✅ Archivo principal: 574 líneas (más limpio, más enfocado)
- ✅ Componentes separados: 209 líneas totales
- ✅ Separación clara de responsabilidades
- ✅ Componentes reutilizables
- ✅ Más fácil de mantener y testear
- ✅ Importaciones limpias con barrel export

## Estructura

```
components/
├── index.ts              # Barrel export para importaciones limpias
├── ResumenCotizacion.tsx  # Componente de resumen financiero
├── HistorialPagos.tsx     # Componente de historial de transacciones
└── README.md             # Esta documentación
```

## Uso

```tsx
import { ResumenCotizacion, HistorialPagos } from './components'

// En el componente principal
<ResumenCotizacion
  total={cotizacion.total}
  pagado={cotizacion.pagado}
  saldoPendiente={saldoPendiente}
/>

<HistorialPagos pagos={pagos} />
```

## Beneficios Técnicos

1. **Mantenibilidad**: Cada componente tiene una responsabilidad única
2. **Testabilidad**: Componentes aislados más fáciles de testear
3. **Reutilización**: Componentes pueden usarse en otras partes de la aplicación
4. **Legibilidad**: Código más organizado y fácil de entender
5. **Performance**: Mejor tree-shaking y optimización de bundles
