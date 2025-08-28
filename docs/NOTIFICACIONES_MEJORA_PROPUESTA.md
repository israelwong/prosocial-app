# 🔔 Propuesta de Mejora - Sistema de Notificaciones

## 🎯 Problema Identificado

El sistema actual de notificaciones necesita:

1. **Rutas dinámicas** basadas en el tipo de notificación
2. **Información contextual** para navegación (eventoId, etc.)
3. **Acciones automáticas** como agregar notas a bitácora

## 💡 Solución Propuesta: Campo JSON `metadata`

### 📝 **1. Modificación del Schema**

```prisma
model Notificacion {
  id           String   @id @default(cuid())
  userId       String?
  titulo       String
  mensaje      String
  tipo         String   @default("general")  // 🆕 NUEVO: tipo de notificación
  metadata     Json?                         // 🆕 NUEVO: datos estructurados
  status       String   @default("active")
  cotizacionId String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### 📊 **2. Tipos de Notificaciones y Metadata**

#### 🎁 **Solicitud de Paquete**

```typescript
{
  tipo: "solicitud_paquete",
  metadata: {
    eventoId: "evt_123",
    paqueteId: "paq_456",
    clienteId: "cli_789",
    rutaDestino: "/admin/dashboard/eventos/{eventoId}",
    accionBitacora: {
      habilitada: true,
      mensaje: "Cliente solicitó información sobre paquete: {paqueteName}"
    }
  }
}
```

#### 💰 **Notificación de Pago**

```typescript
{
  tipo: "pago_recibido",
  metadata: {
    eventoId: "evt_123",
    pagoId: "pay_456",
    monto: 15000,
    rutaDestino: "/admin/dashboard/seguimiento/{eventoId}",
    accionBitacora: {
      habilitada: true,
      mensaje: "Pago recibido por ${monto} - {metodoPago}"
    }
  }
}
```

### 🔧 **3. Implementación del Componente**

```tsx
// Función para determinar la ruta destino
const obtenerRutaDestino = (notificacion: Notificacion) => {
  if (!notificacion.metadata) return null;

  const metadata = notificacion.metadata as any;

  switch (notificacion.tipo) {
    case "solicitud_paquete":
      return metadata.eventoId
        ? `/admin/dashboard/eventos/${metadata.eventoId}`
        : null;

    case "pago_recibido":
      return metadata.eventoId
        ? `/admin/dashboard/seguimiento/${metadata.eventoId}`
        : null;

    default:
      return metadata.rutaDestino || null;
  }
};

// Función para agregar nota a bitácora automáticamente
const procesarAccionBitacora = async (notificacion: Notificacion) => {
  if (!notificacion.metadata) return;

  const metadata = notificacion.metadata as any;

  if (metadata.accionBitacora?.habilitada && metadata.eventoId) {
    await agregarNotaBitacora(
      metadata.eventoId,
      metadata.accionBitacora.mensaje,
      "info"
    );
  }
};
```

## 🚀 **Migración Gradual**

1. **Fase 1**: Agregar campos nuevos (backward compatible)
2. **Fase 2**: Actualizar creación de notificaciones para usar metadata
3. **Fase 3**: Migrar notificaciones existentes (opcional)

## 🎯 **Ventajas de esta Solución**

✅ **Flexible**: Permite diferentes tipos de notificaciones  
✅ **Escalable**: Fácil agregar nuevos tipos sin cambiar schema  
✅ **Estructurada**: Datos organizados y tipados  
✅ **Automática**: Acciones como bitácora se ejecutan automáticamente  
✅ **Retrocompatible**: No rompe funcionalidad existente

## 🔄 **Alternativa Rápida: Parsing de Contenido**

Si prefieres no cambiar la BD ahora, podemos usar parsing:

```typescript
const determinarTipoYRuta = (notificacion: Notificacion) => {
  const titulo = notificacion.titulo.toLowerCase();
  const mensaje = notificacion.mensaje.toLowerCase();

  // Solicitud de paquete
  if (titulo.includes("solicitud") && titulo.includes("paquete")) {
    const eventoIdMatch = notificacion.mensaje.match(
      /evento.*?([a-z0-9-]{25})/i
    );
    return {
      tipo: "solicitud_paquete",
      eventoId: eventoIdMatch?.[1],
      ruta: eventoIdMatch
        ? `/admin/dashboard/eventos/${eventoIdMatch[1]}`
        : null,
    };
  }

  // Pago recibido
  if (titulo.includes("pago")) {
    // Usar cotizacionId existente para buscar eventoId
    return {
      tipo: "pago_recibido",
      cotizacionId: notificacion.cotizacionId,
      ruta: null, // Necesitaría query adicional para obtener eventoId
    };
  }

  return { tipo: "general", ruta: null };
};
```
