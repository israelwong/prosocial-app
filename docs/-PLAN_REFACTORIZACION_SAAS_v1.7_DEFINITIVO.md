# 🚀 PLAN DEFINITIVO - REFACTORIZACIÓN SAAS v1.7

## ProSocial Platform - Migración Multi-Tenant

---

## 📊 ANÁLISIS ACTUAL

### ✅ **Completado en v1.6:**

- [x] Refactorización `_lib` → `_lib/actions`
- [x] Sistema drag-and-drop del catálogo reparado
- [x] Gestión de cotizaciones mejorada
- [x---

## 🚀 FASE 8: MODELO B2B2C - SERVICIOS ADICIONALES

**Duración estimada: 3-4 semanas**

### 8.1 **Servicios White-Label para Clientes Finales**

#### **A. Invitaciones Digitales**

- [ ] **InvitacionDigital** (nueva entidad)
  - [ ] Plantillas personalizables por negocio
  - [ ] Branding del estudio (colores, logos)
  - [ ] Sistema de envío masivo
  - [ ] Tracking de visualizaciones/confirmaciones
  - [ ] Integración con evento y lista de invitados

- [ ] **PlantillaInvitacion**
  - [ ] Editor visual drag-and-drop
  - [ ] Variables dinámicas (nombres, fechas, ubicación)
  - [ ] Responsive design automático
  - [ ] Preview en tiempo real

#### **B. Espacio Virtual (Cloud Storage)**

- [ ] **EspacioVirtual** (nueva entidad)
  - [ ] Límites de almacenamiento por plan
  - [ ] Organización por evento/cliente
  - [ ] Galería privada con contraseña
  - [ ] Descarga individual y masiva
  - [ ] Streaming de videos

- [ ] **GaleriaPrivada**
  - [ ] URLs únicas por evento: `prosocial.mx/[negocio]/galeria/[token]`
  - [ ] Caducidad automática configurable
  - [ ] Notificaciones al cliente cuando se suben fotos
  - [ ] Comentarios y favoritos del cliente

#### **C. Sistema de Monetización B2B2C - MODELO VIABLE**

- [ ] **PlanServicioAdicional** con estructura de costos contemplada
  - [ ] Invitaciones: Gratis (50), Pro ($4.99 - ilimitadas + analytics)
  - [ ] Espacio Virtual: Básico (5GB - $2.99), Pro (25GB - $9.99), Enterprise (100GB - $24.99)
  - [ ] Portal Cliente: Básico (incluido), Premium ($7.99 - chat + timeline + solicitudes)

- [ ] **💰 Cobranza a Negocios ProSocial** (Recommended Model)

  ```typescript
  // Negocio paga directamente a ProSocial Platform
  costoPorClienteFinal: {
    espacioBasico: 1.50,     // USD/mes (cubre 5GB + procesamiento)
    espacioPro: 4.99,        // USD/mes (cubre 25GB + features avanzadas)
    espacioEnterprise: 12.99 // USD/mes (cubre 100GB + soporte premium)
  }

  // Beneficios:
  // - Ingreso predecible para ProSocial
  // - Costos de infraestructura siempre cubiertos
  // - Negocio tiene libertad de precios a cliente final
  // - Margen saludable 200-300% sobre costos reales
  ```

#### **D. Facturación y Control de Costos**

- [ ] **FacturacionClienteFinal** con protección automática
  - [ ] Monitoreo costos tiempo real (Storage + Email + Processing)
  - [ ] Límites automáticos por plan (Soft limit 90%, Hard limit 100%)
  - [ ] Alertas automáticas a negocio cuando se aproxima límite
  - [ ] Suspensión automática si excede límites sin upgrade
  - [ ] Sistema de backup antes de eliminación (30 días gracia)

- [ ] **MetricasViabilidad** - Dashboard ProSocial Platform
  - [ ] Costo promedio por cliente final: Target $0.25/mes
  - [ ] Ingreso promedio por cliente final: Target $1.50/mes
  - [ ] Margen objetivo: 83% (6x sobre costos)
  - [ ] Alertas automáticas si margen <50% (revisar precios)

#### **E. Configuración por Negocio - White Label**

- [ ] **ConfiguracionServiciosAdicionales**
  - [ ] Activar/desactivar servicios por negocio
  - [ ] Precios personalizados por negocio (libertad total pricing)
  - [ ] Branding white-label completo (logos, colores, dominio)
  - [ ] Términos y condiciones personalizables
  - [ ] **Límites personalizados por plan** (storage, invitaciones, clientes)

#### **⚠️ CRÍTICO - Sostenibilidad Financiera**

```
🚨 PROBLEMA: Sin modelo viable, ProSocial absorbe costos infrastructure
✅ SOLUCIÓN: Cobranza directa por cliente final activo
📊 NÚMEROS: $0.25 costo real → $1.50 cobranza → 83% margen
🎯 OBJETIVO: Cada cliente final del negocio es rentable desde día 1
```

### 8.3 **UX/UI B2B2C**

#### **A. Dashboard Negocio - Gestión Servicios**

- [ ] Panel "Servicios Adicionales" en dashboard
- [ ] Métricas de uso por cliente final
- [ ] Configuración de precios y límites
- [ ] Reportes de ingresos adicionales

#### **B. Cliente Final - Experiencia**

- [ ] Onboarding automático post-contratación
- [ ] URLs branded: `prosocial.mx/[negocio]/invitaciones/mi-boda`
- [ ] Notificaciones por email/SMS cuando aplique
- [ ] Soporte técnico escalado (Cliente Final → Negocio → ProSocial)

---

## 🎨 FASE 9: DISEÑO RESPONSIVO Y MOBILE Correcciones de fechas y timezone

- [x] Footer dinámico implementado
- [x] Edición de sede/dirección de eventos
- [x] Sistema de balance en agenda
- [x] UI/UX improvements generales

### 🎯 **Arquitectura Objetivo SaaS - SIMPLIFICADA:**

**ProSocial Platform** → **Cliente SaaS** → **Negocio Principal** → **Datos operativos**

```
ProSocial Platform (Empresa SaaS)
├── Cliente A → prosocial.mx/estudio-luna/
│   └── Negocio Principal (1:1 relación)
├── Cliente B → prosocial.mx/foto-express/
│   └── Negocio Principal (1:1 relación)
└── Cliente C → prosocial.mx/agencia-norte/
    └── Negocio Principal (1:1 relación)
```

**📋 DECISIÓN ARQUITECTURAL**: Estructura URL simplificada para mejor UX

---

## 🏗️ FASE 1: FUNDAMENTOS MULTI-TENANT

**Duración estimada: 2-3 semanas**

### 1.1 📋 **Modelo de Datos Multi-Tenant**

#### **A. Entidades Principales**

- [ ] **ClientePlatform** (Cliente del SaaS)
  - [ ] Información de suscripción
  - [ ] Plan contratado
  - [ ] Configuración de facturación
  - [ ] Configuración Stripe Connect
- [ ] **Negocio** (Tenant operativo)
  - [ ] Datos del negocio (nombre, logo, colores)
  - [ ] Configuración operativa
  - [ ] Relación con ClientePlatform
- [ ] **SuscripcionPlan**
  - [ ] Planes disponibles con funcionalidades
  - [ ] Pricing por plan
  - [ ] Límites por funcionalidad

#### **B. Schema Prisma**

- [ ] Modificar schema.prisma con nuevas entidades
- [ ] Agregar `negocioId` a tablas existentes críticas:
  - [ ] Cliente, Evento, Cotizacion, Pago
  - [ ] Agenda, User, Configuracion
  - [ ] Catálogo (Servicio, Categoria, Seccion)
- [ ] Crear migraciones Prisma
- [ ] Implementar Row-Level Security

#### **C. Migración de Datos**

- [ ] Script de migración para datos existentes
- [ ] Crear Negocio default para ProSocial actual
- [ ] Asignar `negocioId` a datos existentes
- [ ] Validar integridad post-migración

---

## 🔐 FASE 2: MIDDLEWARE Y SEGURIDAD

**Duración estimada: 1-2 semanas**

### 2.1 **Context y Providers**

- [ ] `TenantProvider` - Context para negocio actual
- [ ] `SubscriptionProvider` - Context para plan y límites
- [ ] `BrandingProvider` - Context para personalización UI

### 2.2 **Middleware de Aislamiento**

- [ ] Middleware automático para filtrar por `negocioId`
- [ ] Validación de acceso cross-tenant
- [ ] Rate limiting por tenant
- [ ] Audit logging por tenant

### 2.3 **Autenticación Multi-Tenant**

- [ ] Login con identificación de tenant
- [ ] JWT con claims de `negocioId`
- [ ] Roles y permisos por tenant

---

## 🎨 FASE 3: DASHBOARD KANBAN FLEXIBLE

**Duración estimada: 2-3 semanas**

### 3.1 **Pipeline Configurable**

#### **A. Etapas de Sistema (No eliminables)**

- [ ] **Nuevo** - Eventos creados manualmente/campañas marketing
- [ ] **Seguimiento** - Leads validados vía ManyChat
- [ ] **Aprobado** - Cotización aprobada (crítico para finanzas)
- [ ] **Entregado** - Evento completado (oculto, botón mostrar)
- [ ] **Archivado** - Prospectos no convertidos

#### **B. Etapas Personalizables**

- [ ] **Promesa** - "Lo va a pensar" (configurable)
- [ ] **Edición** - Post-evento en edición (configurable)
- [ ] **En Revisión** - Revisión por cliente (configurable)
- [ ] **En Garantía** - Cliente solicita cambios (configurable)

#### **C. Funcionalidades Pipeline**

- [ ] Drag & drop entre etapas
- [ ] Reglas automáticas de transición
- [ ] Validaciones por etapa
- [ ] Métricas por pipeline
- [ ] Configuración visual de etapas

### 3.2 **Automatizaciones**

- [ ] Auto-mover a "Edición" si agenda pasó fecha
- [ ] Triggers por cambio de etapa
- [ ] Notificaciones automáticas

---

## 💰 FASE 4: DASHBOARD FINANZAS MEJORADO

**Duración estimada: 2 semanas**

### 4.1 **Reportes Multi-Tenant**

- [ ] Filtros por período y negocio
- [ ] Proyecciones financieras
- [ ] Comparativas entre negocios (si aplica)
- [ ] Exportación de reportes

### 4.2 **Integración Stripe Connect**

- [ ] Configuración por tenant
- [ ] Dashboard de transacciones
- [ ] Manejo de comisiones (si aplica)

---

## ⚙️ FASE 5: CONFIGURACIÓN AVANZADA

**Duración estimada: 3-4 semanas**

### 5.1 **Tipos de Evento y Agenda**

- [ ] **TipoEventoAgenda** (nueva entidad)
  - [ ] Validación tiempo mínimo contratación
  - [ ] Tipo de medición (por día/por hora)
  - [ ] Límites por día/hora
- [ ] **ConfiguracionAgenda**
  - [ ] Días no laborables por negocio
  - [ ] Horarios disponibles
  - [ ] Límites de capacidad

### 5.2 **Catálogo Multimedia**

- [ ] **ServicioMultimedia** (nueva entidad)
  - [ ] Tipos: foto, galería fotos, video, galería videos
  - [ ] Storage de archivos por tenant
  - [ ] Preview en cotizaciones públicas
- [ ] **CategoriaMultimedia** (opcional)
  - [ ] Multimedia a nivel categoría

### 5.3 **Sistema de Cotización Anexo** ⭐ **NUEVA FUNCIONALIDAD**

- [ ] **CotizacionAnexo** (nueva entidad)

  ```prisma
  model CotizacionAnexo {
    id              String @id @default(cuid())
    cotizacionId    String
    serviciosAdicionales Json[]  // Array de servicios propuestos
    montoAdicional  Float
    estado          String      // "pendiente", "autorizada", "rechazada"
    motivoAnexo     String?     // Razón del anexo
    fechaCreacion   DateTime @default(now())
    fechaAutorizacion DateTime?

    cotizacion      Cotizacion @relation(fields: [cotizacionId], references: [id])
  }
  ```

- [ ] **Workflow Cotización Anexo:**
  1. **Admin crea anexo** para cotización aprobada
  2. **Cliente revisa** servicios adicionales propuestos
  3. **Cliente autoriza/rechaza** anexo
  4. **Si autorizada:** Servicios se integran a cotización original
  5. **Status visual:** Servicios anexados destacados con badge "AGREGADO"

- [ ] **UI/UX Funcionalidades:**
  - [ ] Botón "Crear Anexo" en cotizaciones aprobadas
  - [ ] Modal para seleccionar servicios adicionales
  - [ ] Vista previa para el cliente con servicios originales + anexos
  - [ ] Notificación automática al cliente cuando hay anexo pendiente
  - [ ] Badge visual en servicios: `ORIGINAL` | `AGREGADO` | `PENDIENTE`
  - [ ] Timeline de anexos en historial de cotización

- [ ] **Integración con Sistema Actual:**
  - [ ] Servicios anexados se agregan a Sección/Categoría correspondiente
  - [ ] Monto total actualizado automáticamente
  - [ ] Estado de cotización mantiene "Aprobado" pero muestra "Con anexos"
  - [ ] Sistema de pagos contempla montos adicionales

### 5.4 **Templates TODO List**

- [ ] **TodoTemplate** (nueva entidad)
  - [ ] Templates generales por evento
  - [ ] Templates por actividad específica
  - [ ] Templates por tipo de evento
- [ ] Asignación automática en eventos aprobados
- [ ] UI para gestión de templates

### 5.4 **UI Configuration Homologada**

- [ ] Design system consistente
- [ ] Componentes reutilizables
- [ ] Temas por tenant (colores, logos)

---

## 🌐 FASE 6: ONBOARDING Y CLIENTE PLATFORM

**Duración estimada: 3-4 semanas**

### 6.1 **Onboarding Wizard**

- [ ] Registro de ClientePlatform
- [ ] Selección de plan
- [ ] Configuración inicial del Negocio
- [ ] Precarga de datos básicos:
  - [ ] Pipeline default
  - [ ] Catálogo básico
  - [ ] Configuraciones iniciales

### 6.2 **Gestión de Suscripciones**

- [ ] Panel de suscripción para ClientePlatform
- [ ] Cambio de planes
- [ ] Historial de facturación
- [ ] Gestión de métodos de pago

### 6.3 **Stripe Integration**

- [ ] Stripe Connect setup
- [ ] Webhooks management
- [ ] Facturación automática
- [ ] Manejo de failed payments

---

## 🎨 FASE 7: BRANDING Y SUBDOMINIOS

**Duración estimada: 2-3 semanas**

### 7.1 **URL Structure**

```
**URLs Simplificadas:**
prosocial.mx/[clienteSlug]/dashboard             ← Admin principal
prosocial.mx/[clienteSlug]/eventos               ← Gestión eventos
prosocial.mx/[clienteSlug]/cotizaciones          ← Gestión cotizaciones

**URLs Públicas:**
prosocial.mx/[clienteSlug]/evento/[eventoId]     ← Cotizaciones públicas
prosocial.mx/[clienteSlug]/cliente/[clienteId]   ← Portal del cliente
prosocial.mx/[clienteSlug]/pago/[pagoId]         ← Proceso de pago
```

### 7.2 **Branding por Tenant**

- [ ] Logo personalizable
- [ ] Colores del tema
- [ ] Información de contacto
- [ ] Footer personalizado

---

## 📱 FASE 8: DISEÑO RESPONSIVO DEFINITIVO

**Duración estimada: 3-4 semanas**

### 8.1 **Design System**

- [ ] Tokens de design consistentes
- [ ] Componentes responsive
- [ ] Dark/light mode
- [ ] Accessibility compliance

### 8.2 **Mobile-First Approach**

- [ ] Dashboard mobile optimizado
- [ ] Cotizaciones mobile-friendly
- [ ] Portal cliente responsivo

---

## 🚀 FASE 9: INTEGACIONES Y API

**Duración estimada: 2 semanas**

### 9.1 **ManyChat Integration**

- [ ] Webhooks para leads
- [ ] API endpoints para validación
- [ ] Sync de estados

### 9.2 **Marketing Integrations**

- [ ] Facebook Lead Forms
- [ ] Landing page lead capture
- [ ] Analytics tracking

---

## ✅ CRITERIOS DE ÉXITO

### **Funcionales:**

- [ ] Multi-tenancy completamente funcional
- [ ] Migración de datos sin pérdida
- [ ] Pipeline configurable operativo
- [ ] Onboarding completo funcionando
- [ ] Facturación automática activa

### **Técnicos:**

- [ ] Performance mantenido (<2s load time)
- [ ] Seguridad auditada
- [ ] Tests de regresión pasando
- [ ] Documentación técnica completa

### **UX:**

- [ ] Design system implementado
- [ ] Responsive en todos los dispositivos
- [ ] Onboarding intuitivo (<10 min setup)

---

## 📅 CRONOGRAMA ESTIMADO

| Fase                            | Duración      | Acumulado  |
| ------------------------------- | ------------- | ---------- |
| 1. Multi-Tenant Foundations     | 3 semanas     | 3 sem      |
| 2. Middleware y Seguridad       | 2 semanas     | 5 sem      |
| 3. Dashboard Kanban             | 3 semanas     | 8 sem      |
| 4. Finanzas Mejorado            | 2 semanas     | 10 sem     |
| 5. Configuración Avanzada       | 4 semanas     | 14 sem     |
| 6. Onboarding                   | 4 semanas     | 18 sem     |
| 7. Branding                     | 3 semanas     | 21 sem     |
| 8. **Modelo B2B2C - Servicios** | **4 semanas** | **25 sem** |
| 9. Diseño Responsivo            | 4 semanas     | 29 sem     |
| 10. Integraciones               | 2 semanas     | 31 sem     |

**TOTAL ESTIMADO: ~7-8 meses**

### 🎯 **HITOS CRÍTICOS B2B2C:**

- **Semana 25**: Invitaciones digitales funcionando
- **Semana 26**: Espacio virtual con límites por plan
- **Semana 27**: Portal cliente premium con facturación
- **Semana 28**: Sistema completo white-label operativo

---

## 🔄 METODOLOGÍA

1. **Desarrollo por fases incrementales**
2. **Coexistencia durante transición**
3. **Testing continuo en cada fase**
4. **Rollback plan por fase**
5. **Documentación en paralelo**

---

## 🎯 PRÓXIMO PASO INMEDIATO

**¿Comenzamos con la Fase 1: Modelo de Datos Multi-Tenant?**

Específicamente:

1. Diseñar schema Prisma para ClientePlatform y Negocio
2. Definir qué tablas necesitan `negocioId`
3. Crear primera migración

¿Procedemos con esto o prefieres ajustar algún aspecto del plan?
