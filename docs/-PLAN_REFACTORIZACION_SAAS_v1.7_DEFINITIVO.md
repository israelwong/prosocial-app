# 🚀 PLAN DEFINITIVO - REFACTORIZACIÓN SAAS v1.7

## ProSocial Platform - Migración Multi-Tenant

---

## 📊 ANÁLISIS ACTUAL

### ✅ **Completado en v1.6:**

- [x] Refactorización `_lib` → `_lib/actions`
- [x] Sistema drag-and-drop del catálogo reparado
- [x] Gestión de cotizaciones mejorada
- [x] Correcciones de fechas y timezone
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

### 5.3 **Templates TODO List**

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

| Fase                        | Duración  | Acumulado |
| --------------------------- | --------- | --------- |
| 1. Multi-Tenant Foundations | 3 semanas | 3 sem     |
| 2. Middleware y Seguridad   | 2 semanas | 5 sem     |
| 3. Dashboard Kanban         | 3 semanas | 8 sem     |
| 4. Finanzas Mejorado        | 2 semanas | 10 sem    |
| 5. Configuración Avanzada   | 4 semanas | 14 sem    |
| 6. Onboarding               | 4 semanas | 18 sem    |
| 7. Branding                 | 3 semanas | 21 sem    |
| 8. Diseño Responsivo        | 4 semanas | 25 sem    |
| 9. Integraciones            | 2 semanas | 27 sem    |

**TOTAL ESTIMADO: ~6-7 meses**

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
