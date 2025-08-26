# Plan de Escalabilidad a SaaS: ProSocial Platform (PSP)

## 1. Análisis del Sistema Actual

### 1.1. Stack Tecnológico

- **Frontend:** Next.js 15 con TypeScript y React 19
- **Backend:** Next.js API Routes (Serverless Functions)
- **Base de Datos:** PostgreSQL
- **ORM:** Prisma Client v6.0.1
- **Autenticación:** JWT con Jose + bcrypt
- **Pagos:** Stripe con soporte MSI México
- **UI Framework:** React + Radix UI + Tailwind CSS
- **Storage:** Supabase (archivos y real-time)
- **Email:** Nodemailer + React Email
- **Deployment:** Vercel (inferido por configuración)

### 1.2. Arquitectura de Datos Actual

La aplicación actual implementa un **modelo single-tenant** donde todos los datos pertenecen a una sola organización (ProSocial). El esquema presenta una arquitectura bien estructurada con las siguientes características:

#### **Fortalezas del Esquema Actual:**

- **Modelo de datos robusto:** 20+ entidades interconectadas que cubren todo el ciclo de negocio
- **Integridad referencial sólida:** Uso consistente de claves foráneas y relaciones CASCADE
- **Separación de responsabilidades:** Módulos claramente definidos (CRM, Cotizaciones, Finanzas, Operaciones)
- **Trazabilidad completa:** Campos de auditoría (createdAt, updatedAt) en todas las entidades
- **Flexibilidad comercial:** Sistema configurable de precios, utilidades y condiciones comerciales
- **Snapshot pattern:** Implementado en `CotizacionServicio` para mantener historial de precios

#### **Debilidades para Modelo SaaS:**

- **Falta de aislamiento de datos:** No existe una entidad que agrupe datos por cliente del SaaS
- **Configuración global:** Tabla `Configuracion` es única y no permite personalización por tenant
- **Usuarios sin segregación:** El modelo `User` no distingue entre usuarios de diferentes organizaciones
- **Datos compartidos:** Catálogos como `ServicioCategoria`, `MetodoPago` son globales

### 1.3. Módulos Funcionales

#### **CRM (Gestión de Clientes y Prospectos)**

- Gestión completa de clientes con pipeline de estados (prospecto → cliente)
- Segmentación por canales de adquisición
- Portal de cliente con autenticación independiente
- Sistema de suscripciones para funcionalidades futuras

#### **Sistema de Cotizaciones Avanzado**

- Generación de cotizaciones por tipo de evento (XV años, bodas, bautizos, etc.)
- Catálogo de servicios organizados en secciones → categorías → servicios
- Cálculo automático de costos, gastos, utilidades y precios públicos
- Sistema de paquetes predefinidos y servicios personalizados
- Snapshot de precios para trazabilidad histórica
- Condiciones comerciales flexibles (descuentos, MSI, anticipos)

#### **Portal de Cliente**

- Acceso independiente para clientes finales
- Visualización de cotizaciones y seguimiento de eventos
- Restricciones de acceso por cliente (solo ven sus datos)
- Sistema de autenticación separado del panel administrativo

#### **Gestión Financiera Integral**

- **Módulo de Pagos:** Integración con Stripe, soporte MSI, múltiples métodos de pago
- **Sistema de Nómina:** Gestión de pagos a empleados y proveedores por servicios específicos
- **Control de Gastos:** Registro independiente de gastos operativos con categorización
- **Reportes Financieros:** Trazabilidad completa de ingresos, egresos y comisiones

#### **Gestión Operativa**

- Sistema de agenda integrado con eventos
- Control de etapas de eventos (pipeline operativo)
- Bitácora de seguimiento por evento
- Gestión de servicios con asignación de personal

#### **Marketing y Analytics**

- Sistema de campañas publicitarias
- Tracking de anuncios por plataforma (Facebook, Instagram, Google)
- Métricas de conversión y ROI por canal

## 2. Estrategia de Migración a Multi-Tenant

### 2.1. El Modelo de Aislamiento de Datos

Para la migración a SaaS de ProSocial Platform, recomendamos implementar un **modelo de aislamiento a nivel de aplicación con clave foránea (Row-Level Security)** por las siguientes razones:

#### **Ventajas del Enfoque Seleccionado:**

- **Costo-eficiencia:** Una sola base de datos compartida reduce costos operativos
- **Simplicidad de deployment:** No requiere provisioning dinámico de recursos
- **Escalabilidad controlada:** Fácil monitoreo y optimización del rendimiento
- **Backup centralizado:** Una sola base de datos para respaldar
- **Migración gradual:** Permite migración sin downtime significativo

#### **Consideraciones de Seguridad:**

- Implementación de middleware obligatorio para filtrado por `negocioId`
- Row-Level Security a nivel de base de datos como segunda capa
- Auditoría completa de accesos cross-tenant

### 2.2. Introducción de la Entidad `Negocio`

La entidad central `Negocio` representará cada cliente del SaaS (tenant) y servirá como punto de aislamiento de datos. Esta entidad debe incluir:

#### **Atributos de la Entidad Negocio:**

```prisma
model Negocio {
  id                    String   @id @default(cuid())
  nombre                String   // "Eventos Élite", "ProSocial Original"
  slug                  String   @unique // URL personalizada
  dominio_personalizado String?  @unique // eventos-elite.com

  // === INFORMACIÓN COMERCIAL ===
  razon_social          String?
  rfc                   String?
  direccion             String?
  telefono              String?
  email_contacto        String?

  // === CONFIGURACIÓN DE SUSCRIPCIÓN ===
  plan_suscripcion      String   @default("basico") // basico, profesional, premium
  fecha_suscripcion     DateTime @default(now())
  fecha_vencimiento     DateTime?
  limite_usuarios       Int      @default(5)
  limite_eventos_mes    Int      @default(50)
  limite_almacenamiento Int      @default(1024) // MB

  // === CONFIGURACIÓN PERSONALIZADA ===
  configuracion_json    Json?    // Configuraciones específicas del tenant
  tema_colores          Json?    // Personalización de marca
  logo_url              String?

  // === PROPIETARIO Y CONTROL ===
  owner_id              String   // Usuario propietario principal
  Owner                 User     @relation("NegocioPropietario", fields: [owner_id], references: [id])

  // === STATUS Y CONTROL ===
  status                String   @default("activo") // activo, suspendido, cancelado, trial
  fecha_trial           DateTime? // Para período de prueba

  // === METADATOS ===
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  // === RELACIONES ===
  Usuarios              NegocioUser[]
  Clientes              Cliente[]
  Eventos               Evento[]
  Configuraciones       ConfiguracionNegocio[]
  // ... todas las demás entidades
}
```

### 2.3. Modificaciones al Esquema de Prisma

#### **Paso 1: Nuevas Entidades de Control Multi-Tenant**

```prisma
// === ENTIDAD PRINCIPAL DE TENANT ===
model Negocio {
  // [Definición completa mostrada arriba]
}

// === TABLA INTERMEDIA USUARIOS-NEGOCIO ===
model NegocioUser {
  id          String   @id @default(cuid())
  negocioId   String
  Negocio     Negocio  @relation(fields: [negocioId], references: [id], onDelete: Cascade)
  userId      String
  User        User     @relation(fields: [userId], references: [id])

  // === ROLES Y PERMISOS POR NEGOCIO ===
  role        String   @default("empleado") // propietario, admin, empleado, contador
  permisos    Json?    // Permisos específicos: {"cotizaciones": "rw", "clientes": "r"}
  status      String   @default("activo") // activo, inactivo, invitado

  // === FECHAS DE CONTROL ===
  fecha_invitacion DateTime?
  fecha_activacion DateTime?
  invitado_por     String?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([negocioId, userId]) // Un usuario solo puede tener un rol por negocio
}

// === CONFIGURACIÓN PERSONALIZADA POR NEGOCIO ===
model ConfiguracionNegocio {
  id                          String   @id @default(cuid())
  negocioId                   String
  Negocio                     Negocio  @relation(fields: [negocioId], references: [id], onDelete: Cascade)

  // === CONFIGURACIONES FINANCIERAS ===
  utilidad_servicio           Float    @default(30.0)
  utilidad_producto           Float    @default(20.0)
  comision_venta              Float    @default(10.0)
  sobreprecio                 Float    @default(0.0)
  moneda_base                 String   @default("MXN")

  // === CONFIGURACIONES OPERATIVAS ===
  dias_validez_cotizacion     Int      @default(10)
  limite_servicios_por_dia    Int      @default(100)
  requiere_autorizacion_descuento Boolean @default(true)

  // === CONFIGURACIONES DE NEGOCIO ===
  tipos_evento_habilitados    Json     // ["boda", "xv_anos", "bautizo"]
  metodos_pago_habilitados    Json     // IDs de métodos de pago permitidos

  status      String   @default("activo")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([negocioId]) // Una configuración por negocio
}
```

#### **Paso 2: Modificación de Entidades Principales**

```prisma
// === USUARIOS (MODIFICADO) ===
model User {
  id        String   @id @default(cuid())
  username  String?
  email     String?  @unique  // ¡IMPORTANTE! Ahora debe ser único global
  password  String

  // === CAMPOS GLOBALES (NO POR TENANT) ===
  telefono  String?  @unique
  status    String   @default("inactive") // activo, inactivo, suspendido

  // === DATOS PERSONALES ===
  nombre_completo  String?
  avatar_url       String?
  timezone         String?  @default("America/Mexico_City")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // === RELACIONES MULTI-TENANT ===
  NegociosOwner     Negocio[]     @relation("NegocioPropietario")
  NegociosUsuario   NegocioUser[]

  // === RELACIONES EXISTENTES (AHORA REQUIEREN VALIDACIÓN DE TENANT) ===
  Sesion            Sesion[]
  // ... otras relaciones existentes
}

// === CLIENTES (MODIFICADO) ===
model Cliente {
  id        String   @id @default(cuid())

  // === CLAVE DE TENANT ===
  negocioId String
  Negocio   Negocio  @relation(fields: [negocioId], references: [id], onDelete: Cascade)

  // === CAMPOS EXISTENTES ===
  nombre    String
  email     String?
  telefono  String?
  direccion String?
  status    String   @default("activo")
  canalId   String?
  Canal     Canal?   @relation(fields: [canalId], references: [id])
  userId    String?

  // === CAMPOS DE AUTENTICACIÓN CLIENTE ===
  passwordHash    String?
  emailVerified   Boolean   @default(false)
  isActive        Boolean   @default(true)
  lastLogin       DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // === RELACIONES EXISTENTES ===
  Evento    Evento[]
  Pago      Pago[]
  Suscripcion Suscripcion?

  // === ÍNDICES PARA PERFORMANCE ===
  @@index([negocioId, status])
  @@index([negocioId, telefono])
  @@unique([negocioId, telefono]) // Teléfono único por negocio
}

// === EVENTOS (MODIFICADO) ===
model Evento {
  id           String      @id @default(cuid())

  // === CLAVE DE TENANT ===
  negocioId    String
  Negocio      Negocio     @relation(fields: [negocioId], references: [id], onDelete: Cascade)

  // === CAMPOS EXISTENTES ===
  clienteId    String
  Cliente      Cliente     @relation(fields: [clienteId], references: [id])
  eventoTipoId String?
  EventoTipo   EventoTipo? @relation(fields: [eventoTipoId], references: [id])

  nombre       String?     @default("Pendiente")
  fecha_evento DateTime
  sede         String?
  direccion    String?
  status       String      @default("active")

  userId String?
  User   User?   @relation(fields: [userId], references: [id])

  eventoEtapaId String?
  EventoEtapa   EventoEtapa? @relation(fields: [eventoEtapaId], references: [id])

  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  // === RELACIONES EXISTENTES ===
  EventoBitacora EventoBitacora[]
  Cotizacion     Cotizacion[]
  Agenda         Agenda[]
  Nomina         Nomina[]
  Gasto          Gasto[]

  // === ÍNDICES PARA PERFORMANCE ===
  @@index([negocioId, status])
  @@index([negocioId, fecha_evento])
  @@index([negocioId, clienteId])
}

// === COTIZACIONES (MODIFICADO) ===
model Cotizacion {
  id                                 String                             @id @default(cuid())

  // === CLAVE DE TENANT ===
  negocioId                          String
  Negocio                            Negocio                            @relation(fields: [negocioId], references: [id], onDelete: Cascade)

  // === CAMPOS EXISTENTES ===
  eventoTipoId                       String
  EventoTipo                         EventoTipo                         @relation(fields: [eventoTipoId], references: [id])
  eventoId                           String
  Evento                             Evento                             @relation(fields: [eventoId], references: [id])

  nombre                             String
  precio                             Float
  descuento                          Float?
  descripcion                        String?

  condicionesComercialesId           String?
  CondicionesComerciales             CondicionesComerciales?            @relation(fields: [condicionesComercialesId], references: [id])

  status                             String                             @default("pendiente")
  archivada                          Boolean                            @default(false)
  visible_cliente                    Boolean?                           @default(true)

  createdAt                          DateTime                           @default(now())
  updatedAt                          DateTime                           @updatedAt
  expiresAt                          DateTime?                          @default(dbgenerated("now() + interval '10 day'"))

  // === RELACIONES EXISTENTES ===
  Servicio                           CotizacionServicio[]
  Costos                             CotizacionCosto[]
  Pago                               Pago[]
  CotizacionVisita                   CotizacionVisita[]

  // === ÍNDICES PARA PERFORMANCE ===
  @@index([negocioId, status])
  @@index([negocioId, eventoId])
}
```

#### **Paso 3: Modificación de Catálogos Compartidos**

```prisma
// === SERVICIO CATEGORIA (MODIFICADO PARA PERMITIR COMPARTIDO O POR TENANT) ===
model ServicioCategoria {
  id                 String               @id @default(cuid())

  // === TENANT (NULL = COMPARTIDO GLOBALMENTE) ===
  negocioId          String?              // NULL = catálogo global, String = específico del negocio
  Negocio            Negocio?             @relation(fields: [negocioId], references: [id], onDelete: Cascade)

  nombre             String
  descripcion        String?
  posicion           Int                  @default(0)
  tipo               String               @default("personalizada") // "global", "personalizada"

  createdAt          DateTime             @default(now())
  updatedAt          DateTime             @updatedAt

  // === RELACIONES EXISTENTES ===
  seccionCategoria  SeccionCategoria?
  Servicio           Servicio[]
  PaqueteServicio    PaqueteServicio[]
  CotizacionServicio CotizacionServicio[]

  // === ÍNDICES ===
  @@index([negocioId])
  @@unique([negocioId, nombre]) // Nombre único por negocio (o global si negocioId es null)
}

// === MÉTODO DE PAGO (MODIFICADO) ===
model MetodoPago {
  id                               String                             @id @default(cuid())

  // === TENANT (NULL = DISPONIBLE PARA TODOS) ===
  negocioId                        String?
  Negocio                          Negocio?                           @relation(fields: [negocioId], references: [id], onDelete: Cascade)

  metodo_pago                      String
  comision_porcentaje_base         Float?
  comision_fija_monto              Float?
  num_msi                          Int?
  comision_msi_porcentaje          Float?
  orden                            Int?                               @default(0)
  payment_method                   String?                            @default("card")
  status                           String                             @default("active")

  createdAt                        DateTime                           @default(now())
  updatedAt                        DateTime                           @updatedAt

  // === RELACIONES EXISTENTES ===
  CondicionesComercialesMetodoPago CondicionesComercialesMetodoPago[]
  Pago                             Pago[]

  @@index([negocioId])
}
```

## 3. Hoja de Ruta y Próximos Pasos

### **Fase 1: Preparación de la Base de Datos (Semanas 1-2)**

#### **1.1 Creación del Nuevo Esquema**

```bash
# Generar migración para nuevas entidades
npx prisma migrate dev --name "add-multi-tenant-entities"

# Aplicar cambios
npx prisma generate
```

#### **1.2 Migración de Datos Existentes**

```sql
-- Script de migración para convertir ProSocial en el primer tenant
BEGIN;

-- 1. Crear el primer negocio (ProSocial original)
INSERT INTO "Negocio" (id, nombre, slug, owner_id, status)
VALUES ('prosocial-001', 'ProSocial Original', 'prosocial',
        (SELECT id FROM "User" WHERE role = 'admin' LIMIT 1),
        'activo');

-- 2. Asignar todos los usuarios existentes al negocio ProSocial
INSERT INTO "NegocioUser" (negocioId, userId, role, status)
SELECT 'prosocial-001', id,
       CASE
         WHEN role = 'admin' THEN 'propietario'
         ELSE 'empleado'
       END,
       'activo'
FROM "User";

-- 3. Migrar todos los clientes
UPDATE "Cliente" SET negocioId = 'prosocial-001';

-- 4. Migrar todos los eventos
UPDATE "Evento" SET negocioId = 'prosocial-001';

-- 5. Migrar todas las cotizaciones
UPDATE "Cotizacion" SET negocioId = 'prosocial-001';

-- 6. Crear configuración por defecto para ProSocial
INSERT INTO "ConfiguracionNegocio" (negocioId, utilidad_servicio, utilidad_producto)
SELECT 'prosocial-001', utilidad_servicio, utilidad_producto
FROM "Configuracion" LIMIT 1;

COMMIT;
```

### **Fase 2: Adaptación de la Lógica de Negocio (Semanas 3-4)**

#### **2.1 Middleware de Tenant Context**

```typescript
// app/lib/tenant-middleware.ts
import { NextRequest } from "next/server";
import { verifyToken } from "./auth";
import prisma from "./prismaClient";

export interface TenantContext {
  negocioId: string;
  usuario: any;
  permisos: string[];
}

export async function getTenantContext(
  request: NextRequest
): Promise<TenantContext> {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    throw new Error("Token no encontrado");
  }

  const { payload } = await verifyToken(token);

  // Obtener el contexto del negocio para el usuario
  const negocioUser = await prisma.negocioUser.findFirst({
    where: {
      userId: payload.id,
      status: "activo",
    },
    include: { Negocio: true },
  });

  if (!negocioUser) {
    throw new Error("Usuario no asociado a ningún negocio");
  }

  return {
    negocioId: negocioUser.negocioId,
    usuario: payload,
    permisos: negocioUser.permisos || [],
  };
}
```

#### **2.2 Actualización de Actions del Servidor**

```typescript
// app/admin/_lib/cliente.actions.ts (ACTUALIZADO)
"use server";
import prisma from "./prismaClient";
import { Cliente } from "./types";
import { getTenantContext } from "@/app/lib/tenant-context";

export async function obtenerClientes(negocioId: string) {
  // Validar contexto de tenant
  const context = await getTenantContext();

  if (context.negocioId !== negocioId) {
    throw new Error("Acceso no autorizado al negocio");
  }

  return await prisma.cliente.findMany({
    where: {
      negocioId: negocioId, // ¡FILTRO OBLIGATORIO!
      status: { not: "eliminado" },
    },
    include: { Canal: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function crearCliente(cliente: Cliente, negocioId: string) {
  const context = await getTenantContext();

  return await prisma.cliente.create({
    data: {
      ...cliente,
      negocioId: context.negocioId, // ¡ASIGNACIÓN OBLIGATORIA!
    },
  });
}
```

#### **2.3 Actualización de Componentes UI**

```typescript
// Hooks para manejo de contexto de tenant
// app/hooks/useTenant.ts
"use client";
import { useContext } from "react";
import { TenantContext } from "@/app/contexts/TenantContext";

export function useTenant() {
  const context = useContext(TenantContext);

  if (!context) {
    throw new Error("useTenant debe usarse dentro de TenantProvider");
  }

  return context;
}
```

### **Fase 3: Gestión de Autenticación y Autorización (Semanas 5-6)**

#### **3.1 Sistema de Invitaciones**

```typescript
// app/admin/_lib/invitacion.actions.ts
export async function invitarUsuario(
  email: string,
  role: string,
  negocioId: string
) {
  const context = await getTenantContext();

  // Solo propietarios y admins pueden invitar
  if (!["propietario", "admin"].includes(context.usuario.role)) {
    throw new Error("Sin permisos para invitar usuarios");
  }

  // Crear token de invitación
  const invitationToken = generateInvitationToken({
    email,
    negocioId,
    role,
    invitedBy: context.usuario.id,
  });

  // Enviar email de invitación
  await sendInvitationEmail(email, invitationToken);

  return { success: true, token: invitationToken };
}
```

#### **3.2 Middleware de Autorización**

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getTenantContext } from "./app/lib/tenant-middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas que requieren autenticación de tenant
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    try {
      const tenantContext = await getTenantContext(request);

      // Agregar contexto a los headers para uso en componentes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-tenant-id", tenantContext.negocioId);
      requestHeaders.set("x-user-id", tenantContext.usuario.id);

      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    } catch (error) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
```

### **Fase 4: Testing y Validación (Semanas 7-8)**

#### **4.1 Tests de Aislamiento de Datos**

```typescript
// tests/tenant-isolation.test.ts
import { prisma } from "../app/lib/prismaClient";

describe("Aislamiento de Datos Multi-Tenant", () => {
  test("Usuario no puede acceder a datos de otro tenant", async () => {
    const negocio1 = await crearNegocioTest("Negocio 1");
    const negocio2 = await crearNegocioTest("Negocio 2");

    const cliente1 = await crearClienteTest(negocio1.id);
    const cliente2 = await crearClienteTest(negocio2.id);

    // Intentar acceder a cliente de otro tenant
    const clientesNegocio1 = await prisma.cliente.findMany({
      where: { negocioId: negocio1.id },
    });

    expect(clientesNegocio1).toHaveLength(1);
    expect(clientesNegocio1[0].id).toBe(cliente1.id);
    expect(clientesNegocio1).not.toContain(
      expect.objectContaining({ id: cliente2.id })
    );
  });
});
```

#### **4.2 Performance Testing**

```typescript
// tests/performance.test.ts
describe("Performance Multi-Tenant", () => {
  test("Consultas con filtro de tenant mantienen performance", async () => {
    const start = performance.now();

    const clientes = await prisma.cliente.findMany({
      where: { negocioId: "test-tenant" },
      take: 100,
    });

    const end = performance.now();
    const executionTime = end - start;

    expect(executionTime).toBeLessThan(100); // < 100ms
    expect(clientes.every((c) => c.negocioId === "test-tenant")).toBe(true);
  });
});
```

### **Fase 5: Deployment y Monitoreo (Semanas 9-10)**

#### **5.1 Variables de Entorno Adicionales**

```bash
# .env.production
# === CONFIGURACIÓN MULTI-TENANT ===
ENABLE_MULTI_TENANT=true
DEFAULT_PLAN=basico
MAX_TENANTS_PER_USER=3

# === LÍMITES POR PLAN ===
PLAN_BASICO_MAX_USERS=5
PLAN_BASICO_MAX_EVENTS=50
PLAN_PROFESIONAL_MAX_USERS=25
PLAN_PROFESIONAL_MAX_EVENTS=200
PLAN_PREMIUM_MAX_USERS=100
PLAN_PREMIUM_MAX_EVENTS=1000

# === CONFIGURACIÓN DE SUBDOMINIOS ===
ENABLE_CUSTOM_DOMAINS=true
BASE_DOMAIN=prosocial.app
```

#### **5.2 Monitoreo y Alertas**

```typescript
// app/lib/monitoring.ts
export async function trackTenantUsage(negocioId: string, action: string) {
  await prisma.tenantUsage.create({
    data: {
      negocioId,
      action,
      timestamp: new Date(),
      metadata: {
        userAgent: headers().get("user-agent"),
        ip: headers().get("x-forwarded-for"),
      },
    },
  });

  // Verificar límites del plan
  await checkPlanLimits(negocioId);
}

async function checkPlanLimits(negocioId: string) {
  const negocio = await prisma.negocio.findUnique({
    where: { id: negocioId },
  });

  const currentUsage = await getCurrentUsage(negocioId);

  if (currentUsage.usuarios > negocio.limite_usuarios) {
    await notifyLimitExceeded(negocioId, "usuarios");
  }
}
```

### **Consideraciones Adicionales**

#### **Seguridad**

- Implementar Row-Level Security en PostgreSQL como capa adicional
- Auditoría completa de todas las operaciones cross-tenant
- Encriptación de datos sensibles por tenant

#### **Performance**

- Índices optimizados para consultas multi-tenant
- Connection pooling por tenant para casos de alta carga
- Cache distribuido con prefijos por tenant

#### **Escalabilidad**

- Preparación para sharding horizontal por región
- CDN configurado para assets por tenant
- Auto-scaling basado en uso por tenant

Este plan proporciona una ruta clara y estructurada para migrar ProSocial Platform de single-tenant a un modelo SaaS multi-tenant robusto, manteniendo la funcionalidad existente mientras agrega la capacidad de servir múltiples clientes de manera aislada y segura.
