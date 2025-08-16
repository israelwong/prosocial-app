# Plan de Estructura de Cotizaciones V2 - Sistema de Presentación Ejecutiva

**Fecha:** 16 de agosto de 2025  
**Objetivo:** Rediseño completo del flujo de cotizaciones para experiencia cliente-negocio en tiempo real  
**Tecnologías:** Supabase Realtime + Stripe + Next.js 15.4.6

## 🎯 **Concepto Central**

### Flujo de Negocio Propuesto

1. **Sesión Virtual** (40 min) - Negocio + Prospecto
2. **Creación en Tiempo Real** - Negocio crea, prospecto observa
3. **Link Personalizado** - Acceso posterior para procesar pago
4. **Validación de Disponibilidad** - Control de fechas ocupadas

## 📁 **Nueva Estructura de Rutas**

```
app/
├── evento/
│   └── cotizacion/
│       └── [eventoId]/
│           ├── page.tsx                    # Lista de cotizaciones del evento
│           ├── cotizacion/
│           │   └── [cotizacionId]/
│           │       ├── page.tsx            # Detalle específico de cotización
│           │       ├── realtime/
│           │       │   └── page.tsx        # Sesión en tiempo real
│           │       └── checkout/
│           │           └── page.tsx        # Proceso de pago
│           └── _components/
│               ├── ListaCotizaciones.tsx
│               ├── CotizacionCard.tsx
│               ├── EstadoDisponibilidad.tsx
│               └── SesionTiempoReal.tsx
│
├── cliente/
│   ├── login/
│   │   └── page.tsx                        # Acceso de clientes
│   ├── dashboard/
│   │   └── page.tsx                        # Panel cliente (eventos contratados)
│   └── _components/
│       ├── LoginForm.tsx
│       ├── EventosContratados.tsx
│       └── EstadoEvento.tsx
│
└── cotizacion/                             # [LEGACY - A deprecar gradualmente]
    └── [cotizacionId]/
        └── page.tsx                        # Acceso directo (mantener por compatibilidad)
```

## 🔄 **Lógica de Validación y Redirección**

### 1. **Acceso por Evento**

`/evento/cotizacion/[eventoId]`

```typescript
// Lógica de validación
if (evento.status === "contratado") {
  redirect("/cliente/login");
}

if (cotizaciones.length === 0) {
  // Mostrar "Sin cotizaciones disponibles"
}

if (cotizaciones.length === 1) {
  redirect(`/evento/cotizacion/${eventoId}/cotizacion/${cotizaciones[0].id}`);
}

if (cotizaciones.length > 1) {
  // Mostrar lista de cotizaciones
}
```

### 2. **Acceso por Cotización Específica**

`/evento/cotizacion/[eventoId]/cotizacion/[cotizacionId]`

```typescript
// Validaciones
if (evento.status === "contratado") {
  redirect("/cliente/login");
}

if (cotizacion.fechaOcupada) {
  // Mostrar "Fecha no disponible"
}

if (cotizacion.status === "expirada") {
  // Mostrar "Cotización expirada"
}
```

## 🚀 **Sistema de Tiempo Real con Supabase**

### Configuración de Realtime

```typescript
// lib/supabase-realtime.ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

export const suscribirCotizacion = (
  cotizacionId: string,
  callback: Function
) => {
  return supabase
    .channel(`cotizacion:${cotizacionId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "Cotizacion",
        filter: `id=eq.${cotizacionId}`,
      },
      callback
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "CotizacionServicio",
        filter: `cotizacionId=eq.${cotizacionId}`,
      },
      callback
    )
    .subscribe();
};
```

### Componente de Sesión en Tiempo Real

```tsx
// _components/SesionTiempoReal.tsx
"use client";
import { useEffect, useState } from "react";
import { suscribirCotizacion } from "@/lib/supabase-realtime";

interface Props {
  cotizacionId: string;
  esAdmin: boolean;
}

export default function SesionTiempoReal({ cotizacionId, esAdmin }: Props) {
  const [cotizacion, setCotizacion] = useState(null);
  const [serviciosEnVivo, setServiciosEnVivo] = useState([]);

  useEffect(() => {
    const subscription = suscribirCotizacion(cotizacionId, (payload) => {
      // Actualizar estado en tiempo real
      if (payload.table === "Cotizacion") {
        setCotizacion(payload.new);
      }
      if (payload.table === "CotizacionServicio") {
        // Recargar servicios
        obtenerServicios(cotizacionId).then(setServiciosEnVivo);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [cotizacionId]);

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Vista del prospecto - Solo lectura */}
      {!esAdmin && (
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-zinc-800 rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">
              {cotizacion?.nombre || "Preparando cotización..."}
            </h1>
            <div className="text-zinc-400">
              Total: ${cotizacion?.precio?.toLocaleString() || "---"}
            </div>
          </div>

          {/* Lista de servicios en tiempo real */}
          <div className="space-y-4">
            {serviciosEnVivo.map((servicio) => (
              <div
                key={servicio.id}
                className="bg-zinc-800 p-4 rounded-lg animate-pulse"
              >
                <div className="flex justify-between">
                  <span className="text-white">{servicio.nombre}</span>
                  <span className="text-green-400">${servicio.precio}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Estado de la sesión */}
          <div className="fixed bottom-6 left-6 right-6">
            <div className="bg-blue-600 text-white p-4 rounded-lg text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Sesión activa - Viendo en tiempo real</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vista del negocio - Control total */}
      {esAdmin && (
        <div className="max-w-4xl mx-auto p-6">
          {/* Panel de control para agregar servicios */}
          {/* Aquí iría la interfaz de administración */}
        </div>
      )}
    </div>
  );
}
```

## 💳 **Integración con Stripe**

### Configuración de Checkout

```typescript
// lib/stripe-checkout.ts
export const crearSesionPago = async (cotizacionId: string) => {
  const response = await fetch("/api/checkout/create-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cotizacionId,
      mode: "payment",
      success_url: `${window.location.origin}/evento/cotizacion/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${window.location.origin}/evento/cotizacion/${cotizacionId}`,
    }),
  });

  const session = await response.json();

  if (session.url) {
    window.location.href = session.url;
  }
};
```

## 🔐 **Sección Cliente**

### Login de Clientes

```tsx
// cliente/login/page.tsx
export default function ClienteLogin() {
  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
      <div className="max-w-md w-full bg-zinc-800 p-8 rounded-lg">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Acceso Clientes
        </h1>

        <form className="space-y-4">
          <div>
            <label className="block text-zinc-400 mb-2">Email</label>
            <input
              type="email"
              className="w-full bg-zinc-700 text-white p-3 rounded-lg"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-2">Código de evento</label>
            <input
              type="text"
              className="w-full bg-zinc-700 text-white p-3 rounded-lg"
              placeholder="Código proporcionado"
            />
          </div>

          <button className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700">
            Acceder a mis eventos
          </button>
        </form>
      </div>
    </div>
  );
}
```

## 📱 **Experiencia Móvil Optimizada**

### Diseño Responsivo para Sesiones en Vivo

```tsx
// Componente optimizado para móvil
const ResponsiveSesionView = () => {
  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Header fijo */}
      <div className="fixed top-0 left-0 right-0 bg-zinc-800 p-4 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-white truncate">
            Cotización XV Años
          </h1>
          <div className="text-green-400 text-sm">● En vivo</div>
        </div>
      </div>

      {/* Contenido con scroll */}
      <div className="pt-20 pb-24 px-4">{/* Lista de servicios */}</div>

      {/* Footer fijo con total */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-800 p-4">
        <div className="flex justify-between items-center">
          <span className="text-zinc-400">Total estimado:</span>
          <span className="text-2xl font-bold text-white">$45,000</span>
        </div>
      </div>
    </div>
  );
};
```

## 🎯 **Preguntas de Decisión**

### 1. **¿Cliente puede editar cotización?**

**Recomendación:** NO

- Cliente solo visualiza
- Cambios solo a través del negocio
- Mantiene control de precios mínimos
- Evita confusiones en tiempo real

### 2. **¿Tiempo real vs Link estático?**

**Recomendación:** HÍBRIDO

- Tiempo real durante sesión de 40 min
- Link estático para revisión posterior
- Best of both worlds

### 3. **¿Manejo de fechas ocupadas?**

**Recomendación:** Validación al intentar pago

```typescript
if (evento.fechaOcupada) {
  return {
    error: "La fecha seleccionada ya ha sido reservada por otro cliente",
    alternatives: fechasAlternativas,
  };
}
```

## 📋 **Plan de Implementación**

### Fase 1: Estructura Base (1-2 días)

- [ ] Crear nueva estructura de carpetas
- [ ] Migrar componentes existentes
- [ ] Configurar Supabase Realtime

### Fase 2: Lógica de Negocio (2-3 días)

- [ ] Validaciones de rutas
- [ ] Estados de cotización
- [ ] Integración Stripe

### Fase 3: Tiempo Real (2-3 días)

- [ ] Componente sesión en vivo
- [ ] Suscripciones Supabase
- [ ] Optimización móvil

### Fase 4: Cliente Dashboard (1-2 días)

- [ ] Login de clientes
- [ ] Panel de eventos contratados
- [ ] Testing completo

**Total estimado:** 6-10 días de desarrollo

## 🔗 **Compatibilidad**

- Mantener `/cotizacion/[cotizacionId]` para enlaces existentes
- Redirección automática a nueva estructura
- Migración gradual sin romper funcionalidad actual
