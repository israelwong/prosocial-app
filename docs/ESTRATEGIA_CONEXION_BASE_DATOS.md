# Estrategia de Conexión Exitosa a Base de Datos - ProSocial App

## Resumen Ejecutivo

Este documento analiza y documenta la estrategia de conexión a base de datos implementada en el proyecto ProSocial App, que utiliza una arquitectura híbrida con **PostgreSQL** como base de datos principal (via Prisma ORM) y **Supabase** para funcionalidades en tiempo real y autenticación.

## Arquitectura de Base de Datos

### 1. Configuración Principal

#### Base de Datos Principal: PostgreSQL

- **ORM**: Prisma Client v6.0.1
- **Proveedor**: PostgreSQL
- **Configuración**: Dual URL (connection pooling + direct connection)

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")      // Connection pooling
  directUrl = env("DIRECT_URL")        // Direct connection
}
```

#### Base de Datos en Tiempo Real: Supabase

- **Cliente**: @supabase/supabase-js v2.47.0
- **Funcionalidades**: Realtime subscriptions, autenticación, storage
- **Configuración**: Optimizada para performance y estabilidad

## 2. Estrategias de Conexión Implementadas

### A. Gestión de Instancias Prisma (Singleton Pattern)

**Archivo**: `app/admin/_lib/prismaClient.ts`

```typescript
// Patrón Singleton para evitar múltiples instancias en desarrollo
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma =
  global.prisma ||
  new PrismaClient({
    // Configuración opcional de logs
    // log: ['query', 'info', 'warn', 'error'],
  });

// Reutilización en desarrollo para evitar agotamiento de conexiones
if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
```

**Beneficios**:

- ✅ Previene agotamiento de conexiones en desarrollo
- ✅ Optimiza el hot-reloading de Next.js
- ✅ Mantiene una sola instancia activa

### B. Configuración Optimizada de Supabase

**Archivo**: `lib/supabase-realtime.ts`

```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 5, // Límite de eventos por segundo
      heartbeatIntervalMs: 30000, // Heartbeat cada 30s
      reconnectAfterMs: function (tries: number) {
        return [1000, 2000, 5000, 10000][tries - 1] || 10000;
      },
    },
    log_level: "info",
    timeout: 20000,
  },
  auth: {
    persistSession: false, // No persistir sesiones
    autoRefreshToken: false, // No auto-refresh
  },
  db: {
    schema: "public",
  },
});
```

**Características Clave**:

- ✅ Backoff exponencial para reconexiones
- ✅ Límites de eventos para evitar sobrecarga
- ✅ Timeouts configurables
- ✅ Logging estructurado

### C. Sistema de Reintentos Automáticos

**Archivo**: `app/admin/_lib/utils/database-retry.ts`

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

**Características**:

- ✅ Máximo 3 reintentos por defecto
- ✅ Backoff exponencial (1s, 2s, 4s, 8s...)
- ✅ Detección de errores recuperables
- ✅ Logging detallado para debugging

### D. Gestión Inteligente de Conexiones Realtime

**Archivo**: `lib/realtime-cleanup.ts`

```typescript
export function initRealtimeCleanup() {
  // Limpieza inicial después de 1 segundo
  // Limpieza periódica cada 5 minutos
  // Limpieza al cerrar/recargar página
  // Monitoreo de salud de conexiones
}
```

**Funcionalidades**:

- ✅ Limpieza automática de conexiones huérfanas
- ✅ Monitoreo de salud de conexiones
- ✅ Prevención de memory leaks
- ✅ Gestión del ciclo de vida de conexiones

## 3. Variables de Entorno Requeridas

### Variables de Prisma/PostgreSQL

```bash
DATABASE_URL="postgresql://user:password@host:port/database?schema=public&pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:port/database?schema=public"
```

### Variables de Supabase

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

## 4. Scripts de Build y Deploy

### Package.json Scripts

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "migrate": "prisma migrate deploy",
    "dev": "next dev"
  }
}
```

**Flujo de Deploy**:

1. `prisma generate` - Genera el cliente Prisma
2. `prisma migrate deploy` - Aplica migraciones
3. `next build` - Construye la aplicación

## 5. Patrones de Uso Recomendados

### A. Para Operaciones CRUD Básicas

```typescript
import prisma from "@/app/admin/_lib/prismaClient";

// Usar directamente la instancia singleton
const users = await prisma.user.findMany();
```

### B. Para Operaciones con Reintentos

```typescript
import { retryDatabaseOperation } from "@/app/admin/_lib/utils/database-retry";

const result = await retryDatabaseOperation(async () => {
  return await prisma.complexOperation();
});
```

### C. Para Funcionalidades en Tiempo Real

```typescript
import {
  suscribirCotizacion,
  desuscribirCotizacion,
} from "@/lib/supabase-realtime";

const channel = suscribirCotizacion(cotizacionId, (payload) => {
  console.log("Actualización recibida:", payload);
});

// Limpiar al desmontar componente
useEffect(() => {
  return () => desuscribirCotizacion(channel);
}, []);
```

## 6. Mejores Prácticas Implementadas

### A. Gestión de Conexiones

- ✅ **Singleton Pattern** para Prisma Client
- ✅ **Connection Pooling** con pgbouncer
- ✅ **Límites de conexiones** en Supabase Realtime
- ✅ **Limpieza automática** de conexiones huérfanas

### B. Manejo de Errores

- ✅ **Reintentos automáticos** con backoff exponencial
- ✅ **Detección inteligente** de errores recuperables
- ✅ **Logging estructurado** para debugging
- ✅ **Timeouts configurables**

### C. Performance

- ✅ **Límites de eventos** en tiempo real
- ✅ **Heartbeat optimizado** (30s)
- ✅ **Reconexión inteligente** con backoff
- ✅ **Monitoreo de salud** de conexiones

### D. Seguridad

- ✅ **Variables de entorno** para credenciales
- ✅ **Separación de URLs** (pooling vs direct)
- ✅ **Validación de configuración** al inicio
- ✅ **Headers de identificación** en Supabase

## 7. Monitoreo y Debugging

### A. Logs de Prisma

```typescript
const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});
```

### B. Monitoreo de Supabase

```typescript
export const verificarConexionRealtime = () => {
  const isConnected = supabase.realtime.isConnected();
  const channelCount = supabase.realtime.channels.length;

  return {
    isConnected,
    channelCount,
    status: isConnected ? "conectado" : "desconectado",
    warning: channelCount > 5 ? "Demasiadas conexiones activas" : null,
  };
};
```

### C. Métricas de Performance

- Número de conexiones activas
- Tiempo de respuesta de consultas
- Frecuencia de reconexiones
- Errores de timeout

## 8. Migraciones y Versionado

### Estructura de Migraciones

```
prisma/migrations/
├── 20250824024043_add_comision_stripe_to_pagos/
├── 20250824024410_add_comision_stripe_to_payments/
├── 20250827195240_add_solicitud_paquete_model/
└── migration_lock.toml
```

### Scripts de Migración

- **Desarrollo**: `prisma migrate dev`
- **Producción**: `prisma migrate deploy`
- **Reset**: `prisma migrate reset`

## 9. Consideraciones de Escalabilidad

### A. Connection Pooling

- Uso de pgbouncer para optimizar conexiones
- Configuración de pool size según carga
- Monitoreo de conexiones activas

### B. Realtime Scaling

- Límite de 5 eventos por segundo
- Máximo 5 conexiones simultáneas
- Limpieza automática de conexiones

### C. Caching Strategy

- Prisma Client caching automático
- Supabase realtime para actualizaciones
- Invalidación inteligente de cache

## 10. Troubleshooting Común

### A. Errores de Conexión

```bash
# Verificar variables de entorno
echo $DATABASE_URL
echo $DIRECT_URL

# Verificar conectividad
npx prisma db pull
```

### B. Problemas de Realtime

```typescript
// Verificar estado de conexiones
const status = verificarConexionRealtime();
console.log("Estado:", status);

// Limpiar conexiones si es necesario
if (status.channelCount > 5) {
  limpiarConexionesRealtime();
}
```

### C. Performance Issues

- Revisar logs de Prisma
- Monitorear conexiones activas
- Verificar timeouts de Supabase
- Analizar patrones de reconexión

## 11. Conclusión

La estrategia de conexión implementada en ProSocial App demuestra un enfoque robusto y escalable que combina:

1. **PostgreSQL + Prisma** para operaciones CRUD robustas
2. **Supabase** para funcionalidades en tiempo real
3. **Patrones de diseño** (Singleton, Retry, Cleanup)
4. **Monitoreo y debugging** comprehensivo
5. **Gestión inteligente** de recursos

Esta arquitectura híbrida permite aprovechar las fortalezas de cada tecnología mientras mantiene la estabilidad y performance necesarias para una aplicación de producción.

---

**Fecha de Documentación**: Enero 2025  
**Versión**: 1.0  
**Autor**: Análisis de ProSocial App
