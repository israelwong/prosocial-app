# Arquitectura y Mejores Prácticas - app/admin/\_lib

## Resumen Ejecutivo

Este documento analiza la arquitectura del directorio `app/admin/_lib` del proyecto ProSocial App legacy, que implementa un patrón de **Domain-Driven Design (DDD)** con **Server Actions** de Next.js 15, proporcionando una estructura escalable, mantenible y robusta para aplicaciones empresariales.

## Estructura de Directorios

```
app/admin/_lib/
├── actions/           # Server Actions organizadas por dominio
├── constants/         # Constantes y enums del sistema
├── helpers/          # Funciones auxiliares específicas
├── hooks/            # Custom hooks para funcionalidades complejas
├── services/         # Servicios de negocio y polling
├── utils/            # Utilidades generales y helpers
├── types.ts          # Definiciones de tipos TypeScript
├── prismaClient.ts   # Cliente singleton de Prisma
├── supabase.ts       # Cliente de Supabase
└── realtime-control.ts # Control de conexiones en tiempo real
```

## 1. Patrones de Arquitectura Implementados

### A. Domain-Driven Design (DDD)

**Organización por Dominios de Negocio**:

```
actions/
├── evento/           # Dominio de Eventos
├── cotizacion/       # Dominio de Cotizaciones
├── cliente/          # Dominio de Clientes
├── pagos/            # Dominio de Pagos
├── finanzas/         # Dominio de Finanzas
├── gestion/          # Dominio de Gestión
└── media/            # Dominio de Medios
```

**Beneficios**:

- ✅ Separación clara de responsabilidades
- ✅ Facilita el mantenimiento y escalabilidad
- ✅ Permite trabajo en equipo por dominios
- ✅ Reduce el acoplamiento entre módulos

### B. Server Actions Pattern (Next.js 15)

**Estructura Estándar de Actions**:

```typescript
// evento.actions.ts
"use server";

import prisma from "@/app/admin/_lib/prismaClient";
import { retryDatabaseOperation } from "@/app/admin/_lib/utils/database-retry";
import { EventoCreateSchema, type EventoCreateForm } from "./evento.schemas";

export async function crearEvento(data: EventoCreateForm) {
  return await retryDatabaseOperation(async () => {
    const validatedData = EventoCreateSchema.parse(data);
    return await prisma.evento.create({
      data: validatedData,
    });
  });
}
```

**Características**:

- ✅ Validación automática con Zod
- ✅ Manejo de errores con reintentos
- ✅ Type safety completo
- ✅ Optimización automática de Next.js

### C. Schema-First Development

**Patrón de Validación**:

```typescript
// evento.schemas.ts
import { z } from "zod";

export const EventoCreateSchema = z.object({
  clienteId: z.string().min(1, "Cliente requerido"),
  eventoTipoId: z.string().optional(),
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .optional(),
  fecha_evento: z.string().min(1, "La fecha del evento es requerida"),
  sede: z.string().optional(),
  direccion: z.string().optional(),
  userId: z.string().optional(),
  eventoEtapaId: z.string().optional(),
  status: z.string().default("active"),
});

export type EventoCreateForm = z.infer<typeof EventoCreateSchema>;
```

**Ventajas**:

- ✅ Validación consistente en frontend y backend
- ✅ Documentación automática de APIs
- ✅ Type safety en tiempo de compilación
- ✅ Mensajes de error personalizados

## 2. Organización de Actions por Dominio

### A. Estructura de Dominio Completo

Cada dominio sigue esta estructura:

```
dominio/
├── dominio.actions.ts      # Server Actions principales
├── dominio.schemas.ts      # Validaciones Zod
├── index.ts               # Exports públicos
└── subdominios/           # Subdominios específicos
    ├── subdominio.actions.ts
    └── subdominio.schemas.ts
```

### B. Ejemplo: Dominio de Eventos

```typescript
// actions/evento/evento.actions.ts
export async function obtenerEventos() {
  /* ... */
}
export async function obtenerEventoCompleto(eventoId: string) {
  /* ... */
}
export async function crearEvento(data: EventoCreateForm) {
  /* ... */
}
export async function actualizarEvento(data: EventoUpdateForm) {
  /* ... */
}
export async function eliminarEvento(eventoId: string) {
  /* ... */
}

// actions/evento/detalle/eventoDetalle.actions.ts
export async function obtenerEventoDetalle(eventoId: string) {
  /* ... */
}
export async function actualizarEventoDetalle(data: EventoDetalleForm) {
  /* ... */
}

// actions/evento/tipo/eventoTipo.actions.ts
export async function obtenerTiposEvento() {
  /* ... */
}
export async function crearTipoEvento(data: TipoEventoForm) {
  /* ... */
}
```

## 3. Sistema de Constantes y Estados

### A. Constantes Centralizadas

**Archivo**: `constants/status.ts`

```typescript
export const EVENTO_STATUS = {
  PENDIENTE: "pendiente",
  APROBADO: "aprobado",
  CANCELADO: "cancelado",
  COMPLETADO: "completado",
  ARCHIVADO: "archivado",
} as const;

export type EventoStatus = (typeof EVENTO_STATUS)[keyof typeof EVENTO_STATUS];
```

**Beneficios**:

- ✅ Fuente única de verdad para estados
- ✅ Type safety completo
- ✅ Facilita refactoring
- ✅ Previene errores de tipeo

### B. Sistema de Homologación

```typescript
// Mapeo para migrar datos legacy
export const EVENTO_STATUS_MAP: Record<string, EventoStatus> = {
  active: EVENTO_STATUS.ACTIVE,
  inactive: EVENTO_STATUS.ARCHIVED,
  cancelled: EVENTO_STATUS.CANCELLED,
};

// Función de homologación
export function homologarEventoStatus(status: string): EventoStatus {
  return EVENTO_STATUS_MAP[status.toLowerCase()] || EVENTO_STATUS.ACTIVE;
}
```

## 4. Utilidades y Helpers

### A. Utilidades de Base de Datos

**Archivo**: `utils/database-retry.ts`

```typescript
export async function retryDatabaseOperation<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 5000 } = options;

  // Lógica de reintento con backoff exponencial
  // Detección inteligente de errores recuperables
  // Logging detallado de intentos
}
```

### B. Utilidades de Fechas

**Archivo**: `utils/fechas.ts`

```typescript
export const crearFechaLocal = (fecha: Date | string): Date => {
  // Evita problemas de zona horaria
  // Crea fechas consistentes
};

export const formatearFecha = (
  fecha: Date | string,
  opciones: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }
): string => {
  // Formateo consistente en español
};
```

### C. Utilidades de Moneda

**Archivo**: `utils/moneda.ts`

```typescript
export const formatearMoneda = (
  cantidad: number,
  currency: string = "MXN"
): string => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cantidad);
};
```

## 5. Servicios de Negocio

### A. Sistema de Polling Inteligente

**Archivo**: `services/bitacora-polling.service.ts`

```typescript
export class BitacoraPollingService {
  private intervalId: NodeJS.Timeout | null = null;
  private lastCount = 0;

  start() {
    // Polling inteligente que solo actualiza cuando hay cambios
    // Evita actualizaciones innecesarias
  }

  stop() {
    // Limpieza automática de recursos
  }
}

// Hook personalizado
export function useBitacoraPolling(
  eventoId: string,
  onUpdate: (bitacoras: any[]) => void
) {
  // Integración con React
}
```

**Características**:

- ✅ Polling inteligente (solo actualiza si hay cambios)
- ✅ Limpieza automática de recursos
- ✅ Configuración flexible
- ✅ Integración con React hooks

### B. Sistema de Notificaciones

**Archivo**: `helpers/notificacionConMetadata.ts`

```typescript
export async function crearNotificacionConMetadata(data: NotificacionConMetadata) {
    try {
        // Usar SQL raw para campos nuevos
        const result = await prisma.$queryRaw`...`;
        return { success: true, result };
    } catch (error) {
        // Fallback a método tradicional
        const notificacionFallback = await prisma.notificacion.create({...});
        return { success: true, result: notificacionFallback, fallback: true };
    }
}
```

## 6. Custom Hooks

### A. Hook de Upload de Imágenes

**Archivo**: `hooks/useImageUpload.ts`

```typescript
export function useImageUpload(
  options: UseImageUploadOptions
): UseImageUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = useCallback(async (file: File) => {
    // Validación de archivo
    // Upload con progreso
    // Manejo de errores
  }, []);

  return {
    uploading,
    progress,
    error,
    uploadImage,
    deleteImage,
    updateImage,
    resetError,
  };
}
```

**Características**:

- ✅ Validación de archivos
- ✅ Progreso de upload
- ✅ Manejo de errores
- ✅ Reutilizable en toda la aplicación

## 7. Gestión de Tipos TypeScript

### A. Tipos Centralizados

**Archivo**: `types.ts`

```typescript
export interface User {
  id?: string;
  username: string | null;
  email: string | null;
  password?: string | null;
  role?: string;
  telefono?: string | null;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
  token?: string;
}

export interface Evento {
  id?: string;
  clienteId?: string;
  eventoTipoId?: string | null;
  tipoEvento?: string;
  nombre: string | null;
  fecha_evento: Date;
  status?: string;
  // ... más campos
}
```

**Beneficios**:

- ✅ Tipos consistentes en toda la aplicación
- ✅ IntelliSense mejorado
- ✅ Detección temprana de errores
- ✅ Documentación automática

## 8. Mejores Prácticas Implementadas

### A. Manejo de Errores

```typescript
export async function operacionCritica(data: FormData) {
  try {
    return await retryDatabaseOperation(async () => {
      const validatedData = Schema.parse(data);
      return await prisma.operacion.create({ data: validatedData });
    });
  } catch (error) {
    console.error("Error en operación crítica:", error);
    throw new Error("No se pudo completar la operación");
  }
}
```

### B. Optimización de Consultas

```typescript
export async function obtenerDatosCompletos(eventoId: string) {
  // Cargar datos en paralelo para máxima eficiencia
  const [evento, tiposEvento, catalogo, configuracion] = await Promise.all([
    obtenerEventoCompleto(eventoId),
    obtenerTiposEvento(),
    obtenerCatalogoCompleto(),
    getGlobalConfiguracion(),
  ]);

  return { evento, tiposEvento, catalogo, configuracion };
}
```

### C. Revalidación de Cache

```typescript
export async function actualizarEvento(data: EventoUpdateForm) {
    const resultado = await prisma.evento.update({...});

    // Revalidar cache de Next.js
    revalidatePath('/admin/eventos');
    revalidatePath(`/admin/evento/${data.id}`);

    return resultado;
}
```

## 9. Patrones de Naming y Organización

### A. Convenciones de Naming

```typescript
// Actions: verbo + sustantivo
export async function obtenerEventos() { }
export async function crearEvento() { }
export async function actualizarEvento() { }
export async function eliminarEvento() { }

// Schemas: sustantivo + Schema
export const EventoCreateSchema = z.object({...});
export const EventoUpdateSchema = z.object({...});

// Types: sustantivo + Form/Data
export type EventoCreateForm = z.infer<typeof EventoCreateSchema>;
export type EventoUpdateForm = z.infer<typeof EventoUpdateSchema>;
```

### B. Organización de Exports

```typescript
// index.ts - Exports públicos del dominio
export {
  obtenerEventos,
  crearEvento,
  actualizarEvento,
} from "./evento.actions";
export { EventoCreateSchema, EventoUpdateSchema } from "./evento.schemas";
export type { EventoCreateForm, EventoUpdateForm } from "./evento.schemas";
```

## 10. Integración con Next.js 15

### A. Server Actions

```typescript
"use server";

// Server Actions automáticamente optimizadas por Next.js
export async function serverAction(data: FormData) {
  // Ejecuta en el servidor
  // Optimización automática
  // Type safety completo
}
```

### B. Revalidación de Cache

```typescript
import { revalidatePath, revalidateTag } from 'next/cache';

export async function actualizarDatos() {
    // Actualizar datos
    await prisma.datos.update({...});

    // Revalidar cache específico
    revalidatePath('/admin/dashboard');
    revalidateTag('eventos');
}
```

## 11. Escalabilidad y Mantenibilidad

### A. Separación de Responsabilidades

- **Actions**: Lógica de negocio y operaciones de base de datos
- **Schemas**: Validación y tipos
- **Utils**: Funciones auxiliares reutilizables
- **Services**: Servicios complejos y polling
- **Hooks**: Lógica de UI reutilizable

### B. Modularidad

```typescript
// Cada dominio es independiente
import { obtenerEventos } from "@/app/admin/_lib/actions/evento";
import { crearCotizacion } from "@/app/admin/_lib/actions/cotizacion";
import { formatearMoneda } from "@/app/admin/_lib/utils/moneda";
```

### C. Testabilidad

```typescript
// Actions son funciones puras fáciles de testear
export async function calcularPrecio(servicios: Servicio[]): Promise<number> {
  return servicios.reduce((total, servicio) => {
    return total + (servicio.precio_publico || 0);
  }, 0);
}
```

## 12. Recomendaciones para Futuros Proyectos

### A. Estructura Base Recomendada

```
app/admin/_lib/
├── actions/
│   ├── dominio/
│   │   ├── dominio.actions.ts
│   │   ├── dominio.schemas.ts
│   │   └── index.ts
│   └── shared/
│       ├── database.actions.ts
│       └── validation.actions.ts
├── constants/
│   ├── status.ts
│   ├── enums.ts
│   └── config.ts
├── utils/
│   ├── database.ts
│   ├── validation.ts
│   └── formatting.ts
├── services/
│   ├── polling.service.ts
│   └── notification.service.ts
├── hooks/
│   ├── useDataFetching.ts
│   └── useFormHandling.ts
└── types/
    ├── domain.ts
    └── shared.ts
```

### B. Patrones a Implementar

1. **Server Actions Pattern**
   - Validación con Zod
   - Manejo de errores consistente
   - Revalidación de cache

2. **Domain-Driven Design**
   - Organización por dominios de negocio
   - Separación clara de responsabilidades
   - Agregados bien definidos

3. **Type Safety**
   - Tipos centralizados
   - Schemas de validación
   - Inferencia de tipos

4. **Error Handling**
   - Sistema de reintentos
   - Logging estructurado
   - Fallbacks apropiados

### C. Herramientas Recomendadas

- **Zod**: Validación de esquemas
- **Prisma**: ORM con type safety
- **Next.js 15**: Server Actions y App Router
- **TypeScript**: Type safety completo
- **Sonner**: Notificaciones toast

## 13. Conclusión

La arquitectura de `app/admin/_lib` demuestra un enfoque maduro y escalable para aplicaciones empresariales modernas:

### Fortalezas Identificadas:

- ✅ **Arquitectura DDD** bien implementada
- ✅ **Server Actions** optimizadas
- ✅ **Type Safety** completo
- ✅ **Validación robusta** con Zod
- ✅ **Manejo de errores** sofisticado
- ✅ **Separación de responsabilidades** clara
- ✅ **Reutilización** de código
- ✅ **Escalabilidad** demostrada

### Patrones Replicables:

1. Organización por dominios de negocio
2. Server Actions con validación
3. Sistema de constantes centralizado
4. Utilidades reutilizables
5. Custom hooks especializados
6. Servicios de negocio complejos

Esta arquitectura puede servir como **template base** para futuros proyectos empresariales que requieran escalabilidad, mantenibilidad y robustez.

---

**Fecha de Documentación**: Enero 2025  
**Versión**: 1.0  
**Autor**: Análisis de ProSocial App
