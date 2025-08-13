# 🔄 Plan de Refactorización - Dashboard Eventos

## 📋 Objetivo Principal

Unificar interfaces, mejorar UX/UI y optimizar la gestión de información manteniendo todas las funcionalidades existentes.

## 🎨 Principios de Diseño

- **Modo Oscuro Consistente**: Paleta zinc monocromática
- **Responsive Mobile-First**: Adaptación automática a diferentes pantallas
- **Información Contextual**: Datos relevantes siempre visibles
- **Acciones Rápidas**: Workflows optimizados

## 🏗️ Arquitectura Propuesta

### 1. **Vista Unificada de Evento** (`/eventos/[eventoId]`)

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER: Cliente + Evento + Acciones Rápidas                │
├─────────────────────────────────────────────────────────────┤
│ GRID RESPONSIVO (3 cols desktop → 1 col mobile)            │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│ │ GESTIÓN      │ │ COTIZACIONES │ │ SEGUIMIENTO  │        │
│ │ - Cliente    │ │ - Lista      │ │ - Bitácora   │        │
│ │ - Evento     │ │ - Nueva      │ │ - Etapas     │        │
│ │ - Etapas     │ │ - Editar     │ │ - Actividad  │        │
│ └──────────────┘ └──────────────┘ └──────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### 2. **Componentes Rediseñados**

#### A. **EventoDetailView** (Componente Principal)

- Header con información crítica
- Navegación contextual (tabs/sections)
- Estado global del evento

#### B. **ModuloGestion** (Columna 1)

- `FichaClienteUnificada` - Datos + edición inline
- `FichaEventoUnificada` - Info evento + gestión etapas
- `AccionesRapidas` - WhatsApp, seguimiento, etc.

#### C. **ModuloCotizaciones** (Columna 2)

- `ListaCotizacionesOptimizada` - Vista compacta + acciones
- `CotizacionQuickActions` - Crear, duplicar, enviar
- `EstadoCotizaciones` - Resumen financiero

#### D. **ModuloSeguimiento** (Columna 3)

- `BitacoraUnificada` - Timeline + quick notes
- `EtapasVisuales` - Progress indicator
- `NotificacionesEventos` - Alertas y recordatorios

## 🚀 Fases de Implementación

### **Fase 1: Componentes Base**

- [ ] `EventoDetailView` - Contenedor principal
- [ ] `EventoHeader` - Header unificado
- [ ] `NavigationTabs` - Sistema de navegación

### **Fase 2: Módulo Gestión**

- [ ] `FichaClienteUnificada` - Refactor + mejoras UX
- [ ] `FichaEventoUnificada` - Consolidar funcionalidades
- [ ] `AccionesRapidas` - Accesos directos

### **Fase 3: Módulo Cotizaciones**

- [ ] `ListaCotizacionesOptimizada` - Performance + UX
- [ ] `CotizacionBuilder` - Creación simplificada
- [ ] `CotizacionActions` - Gestión completa

### **Fase 4: Módulo Seguimiento**

- [ ] `BitacoraUnificada` - Timeline mejorado
- [ ] `EtapasManager` - Gestión visual de etapas
- [ ] `EventoTimeline` - Historial completo

### **Fase 5: Optimizaciones**

- [ ] Performance (React.memo, useMemo)
- [ ] Loading states
- [ ] Error boundaries
- [ ] Tests unitarios

## 🎯 Mejoras UX/UI Específicas

### **Información Contextual**

- Cliente y evento siempre visibles en header
- Estado actual prominente (etapa, cotizaciones pendientes)
- Indicadores visuales de progreso

### **Acciones Optimizadas**

- Edición inline para datos frecuentes
- Quick actions en hover/focus
- Shortcuts de teclado para acciones comunes
- Confirmaciones inteligentes

### **Responsive Design**

- Desktop: 3 columnas
- Tablet: 2 columnas + navegación por tabs
- Mobile: 1 columna + bottom navigation

### **Performance**

- Lazy loading de componentes pesados
- Optimistic updates
- Real-time con Supabase optimizado
- Cache inteligente

## 🔧 Stack Técnico Mantenido

- **Framework**: Next.js 14 (App Router)
- **UI**: Tailwind CSS + shadcn/ui
- **State**: React hooks + Context para estado global
- **Real-time**: Supabase subscriptions
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Sonner (toast)

## 📊 Métricas de Éxito

- Reducción del tiempo de gestión de eventos (objetivo: -30%)
- Mejora en satisfacción de usuario (feedback directo)
- Reducción de errores de datos (validaciones)
- Mejora en velocidad de carga (Core Web Vitals)

## 🔄 Plan de Migración

1. **Coexistencia**: Mantener estructura actual funcionando
2. **Implementación Incremental**: Por módulos
3. **Testing Paralelo**: Comparar funcionalidades
4. **Migración Gradual**: Feature flags para transición
5. **Deprecación**: Remover código antiguo post-validación
