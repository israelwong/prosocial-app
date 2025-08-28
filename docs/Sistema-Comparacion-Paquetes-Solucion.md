# Sistema de Comparación de Paquetes - Solución Integral

## 🎯 **Problema a Resolver**

1. **Presentación jerárquica**: Mantener estructura sección → categoría → servicio
2. **Cambio de paquete**: Cliente puede cambiar de personalizado a preconfigurado
3. **Pasarela de pago**: Debe funcionar con cualquier tipo de paquete
4. **Experiencia fluida**: Sin interrupciones en el flujo actual

## 🏗️ **Arquitectura de Solución**

### **1. Estado de Paquete Dinámico**

```typescript
interface EstadoPaqueteComparacion {
  paqueteActual: "personalizado" | "preconfigurado";
  paquetePersonalizado: CotizacionCompleta;
  paquetePreconfigurado?: PaqueteSeleccionado;
  serviciosComparacion: ServiciosAgrupados;
  precioComparado: number;
  diferenciasPrecio: number;
}
```

### **2. Componente Principal: PaqueteComparador.tsx**

```tsx
interface Props {
  cotizacion: CotizacionCompleta;
  paquetesDisponibles: Paquete[];
  onCambiarPaquete: (
    nuevoPaquete: "personalizado" | "preconfigurado",
    paqueteId?: string
  ) => void;
  onProcederPago: (tipoPaquete: string, datosOriginales: any) => void;
}

const PaqueteComparador = ({
  cotizacion,
  paquetesDisponibles,
  onCambiarPaquete,
  onProcederPago,
}) => {
  // Lógica de comparación y cambio de paquetes
};
```

### **3. Estructura de Servicios Jerárquica Unificada**

```tsx
const ServiciosComparados = ({
  serviciosPersonalizados,
  serviciosPreconfigurados,
}) => {
  return (
    <div className="space-y-6">
      {/* Por cada sección */}
      {Object.entries(serviciosAgrupados).map(
        ([seccionNombre, seccionData]) => (
          <div
            key={seccionNombre}
            className="border border-zinc-600 rounded-lg"
          >
            {/* Header Sección */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-2">
              <h4 className="text-white font-medium">{seccionNombre}</h4>
            </div>

            {/* Contenido */}
            <div className="p-4 space-y-4">
              {/* Por cada categoría */}
              {Object.entries(seccionData.categorias).map(
                ([categoriaNombre, categoriaData]) => (
                  <div key={categoriaNombre}>
                    {/* Header Categoría */}
                    <div className="flex items-center gap-2 pb-2 border-b border-blue-500/50">
                      <div className="w-1 h-4 bg-blue-500 rounded"></div>
                      <h5 className="text-blue-300 font-semibold">
                        {categoriaNombre}
                      </h5>
                    </div>

                    {/* Comparación Lado a Lado */}
                    <div className="grid md:grid-cols-2 gap-4 mt-3">
                      {/* Columna Personalizado */}
                      <div
                        className={`space-y-2 ${paqueteActual === "personalizado" ? "ring-2 ring-green-500 rounded-lg p-3" : "opacity-70"}`}
                      >
                        <h6 className="text-xs font-medium text-zinc-400 uppercase">
                          Tu Paquete Personalizado
                        </h6>
                        {categoriaData.serviciosPersonalizados?.map(
                          (servicio) => (
                            <ServicioItem
                              key={servicio.id}
                              servicio={servicio}
                              tipo="personalizado"
                            />
                          )
                        )}
                      </div>

                      {/* Columna Preconfigurado */}
                      <div
                        className={`space-y-2 ${paqueteActual === "preconfigurado" ? "ring-2 ring-blue-500 rounded-lg p-3" : "opacity-70"}`}
                      >
                        <h6 className="text-xs font-medium text-zinc-400 uppercase">
                          Paquete Sugerido
                        </h6>
                        {categoriaData.serviciosPreconfigurados?.map(
                          (servicio) => (
                            <ServicioItem
                              key={servicio.id}
                              servicio={servicio}
                              tipo="preconfigurado"
                            />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
};
```

## 💳 **Integración con Pasarela de Pago**

### **1. Estado de Pago Unificado**

```typescript
interface DatosPagoUnificados {
  tipo: "personalizado" | "preconfigurado";
  cotizacionId: string;
  paqueteId?: string; // Solo para preconfigurados
  servicios: ServiciosPago[];
  montoTotal: number;
  datosCliente: ClienteInfo;
}
```

### **2. Flujo de Pago Adaptado**

```tsx
const handleProcederPago = async (
  tipoPaquete: "personalizado" | "preconfigurado"
) => {
  let datosPago: DatosPagoUnificados;

  if (tipoPaquete === "personalizado") {
    // Usar cotización actual
    datosPago = {
      tipo: "personalizado",
      cotizacionId: cotizacion.id,
      servicios: cotizacion.servicios,
      montoTotal: cotizacion.precio,
      datosCliente: cotizacion.cliente,
    };
  } else {
    // Usar paquete preconfigurado seleccionado
    datosPago = {
      tipo: "preconfigurado",
      cotizacionId: cotizacion.id, // Mantener referencia original
      paqueteId: paqueteSeleccionado.id,
      servicios: paqueteSeleccionado.servicios,
      montoTotal: paqueteSeleccionado.precio,
      datosCliente: cotizacion.cliente,
    };
  }

  // Enviar a pasarela existente
  await crearSesionPagoUnificada(datosPago);
};
```

### **3. API Endpoint Modificada**

```typescript
// /api/cliente/create-payment-intent
export async function POST(request: Request) {
  const {
    cotizacionId,
    tipoPaquete, // 'personalizado' | 'preconfigurado'
    paqueteId, // Solo si es preconfigurado
    metodoPago,
    montoBase,
    eventoId,
  } = await request.json();

  let datosParaPago;

  if (tipoPaquete === "personalizado") {
    // Flujo actual - usar cotización
    datosParaPago = await obtenerDatosCotizacion(cotizacionId);
  } else {
    // Nuevo flujo - usar paquete preconfigurado
    datosParaPago = await obtenerDatosPaquete(paqueteId, cotizacionId);
  }

  // El resto del flujo de Stripe permanece igual
  const paymentIntent = await stripe.paymentIntents.create({
    amount: montoConComision * 100,
    currency: "mxn",
    metadata: {
      cotizacionId,
      tipoPaquete,
      paqueteId: paqueteId || "",
      eventoId,
    },
  });

  return Response.json({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  });
}
```

## 🔄 **Flujo de Usuario Completo**

### **Fase 1: Visualización y Comparación**

1. Cliente ve su cotización personalizada (estructura jerárquica actual)
2. Sistema muestra paquetes preconfigurados similares
3. Vista lado a lado manteniendo: Sección → Categoría → Servicio
4. Resalta diferencias de precio y servicios

### **Fase 2: Selección de Paquete**

1. Cliente puede alternar entre:
   - Su paquete personalizado (actual)
   - Paquete preconfigurado sugerido
2. Actualización inmediata de precios y servicios
3. Indicador visual del paquete activo

### **Fase 3: Proceso de Pago**

1. Botón "Proceder al Pago" funciona con cualquier paquete seleccionado
2. Pasarela recibe datos unificados
3. Sistema registra el tipo de paquete pagado
4. Confirmación según el tipo seleccionado

## 🛠️ **Implementación por Fases**

### **Fase 1: Comparador Base (2-3 días)**

- Crear componente PaqueteComparador
- Adaptar ServiciosAgrupados para comparación
- Estado de paquete dinámico

### **Fase 2: Integración de Pago (2 días)**

- Modificar API de payment intent
- Adaptar flujo de confirmación
- Testing de ambos tipos de pago

### **Fase 3: UX/UI Pulido (1-2 días)**

- Animaciones de transición
- Indicadores visuales
- Responsive para móvil

### **Fase 4: Testing y Optimización (1 día)**

- Pruebas de flujo completo
- Validación de edge cases
- Performance optimization

**Total estimado: 6-8 días**

## ✅ **Beneficios de la Solución**

1. **Mantiene estructura actual**: Sección → Categoría → Servicio
2. **Pago unificado**: Misma pasarela para ambos tipos
3. **Experiencia fluida**: Cambio sin interrupciones
4. **Escalable**: Puede agregar más paquetes fácilmente
5. **Compatible**: No rompe el flujo existente

## 🎯 **Consideraciones Técnicas**

- Usar el componente `CompletarPago.tsx` existente sin modificaciones mayores
- Aprovechar la estructura de `ServiciosAgrupados.tsx` actual
- Mantener compatibilidad con sistema de tiempo real
- Conservar toda la lógica de comisiones y métodos de pago
