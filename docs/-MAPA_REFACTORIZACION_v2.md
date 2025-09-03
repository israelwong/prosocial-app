# 🗺️ MAPA DE REFACTORIZACIÓN - PROSOCIAL APP

## 📊 SECCIONES IDENTIFICADAS

### 🏠 **Dashboard Principal**

- `layout.tsx` - Layout principal
- `page.tsx` - Página de inicio del dashboard

### 📋 **Secciones a Refactorizar**

#### 1. 🎯 **Seguimiento** (`/seguimiento/`)

- **Prioridad:** ALTA
- **Estado:** 🔄 Componentes v2 ya creados
- **Componentes:**
  - `page.tsx` - Página principal
  - `[eventoId]/page.tsx` - Detalle de evento
  - `components/ListaEventosAprobados.tsx`
  - `components/WishlistOptimizado-v2.tsx` ✅
  - `components/AgendaOptimizada-v2.tsx` ✅

#### 2. 📅 **Agenda** (`/agenda/`)

- **Prioridad:** ALTA
- **Estado:** 🔄 Actions v2 creados
- **Componentes por analizar:**
  - `page.tsx`
  - `components/FormAgenda.tsx`
  - `components/ListaAgenda.tsx`
  - Modales de edición y creación

#### 3. 💰 **Cotizaciones** (`/cotizaciones/`)

- **Prioridad:** MEDIA
- **Estado:** ✅ Ya optimizado en v2
- **Nota:** Revisar si necesita migración a nueva estructura

#### 4. 🎉 **Eventos** (`/eventos/`)

- **Prioridad:** ALTA
- **Estado:** 🔍 Por analizar
- **Componentes por revisar**

#### 5. 💳 **Pagos** (`/pagos/`)

- **Prioridad:** MEDIA
- **Estado:** 🔍 Por analizar

#### 6. 💼 **Finanzas** (`/finanzas/`)

- **Prioridad:** MEDIA
- **Estado:** 🔍 Por analizar

#### 7. 👥 **Contactos** (`/contactos/`)

- **Prioridad:** BAJA
- **Estado:** 🔍 Por analizar

#### 8. 📄 **Contrato** (`/contrato/`)

- **Prioridad:** BAJA
- **Estado:** 🔍 Por analizar

#### 9. 🛠️ **Gestión** (`/gestion/`)

- **Prioridad:** BAJA
- **Estado:** 🔍 Por analizar

#### 10. 🛒 **Checkout** (`/checkout/`)

- **Prioridad:** BAJA
- **Estado:** 🔍 Por analizar

---

## 🎯 ORDEN DE REFACTORIZACIÓN SUGERIDO

### Fase 1: Funcionalidad Principal

1. **Seguimiento** - Ya tiene componentes v2 parciales
2. **Agenda** - Ya tiene actions v2 creados
3. **Eventos** - Core del sistema

### Fase 2: Funcionalidad Financiera

4. **Cotizaciones** - Verificar migración necesaria
5. **Pagos** - Sistema de pagos
6. **Finanzas** - Reportes financieros

### Fase 3: Funcionalidad Secundaria

7. **Contactos** - Gestión de contactos
8. **Contrato** - Gestión contractual
9. **Gestión** - Herramientas administrativas
10. **Checkout** - Proceso de compra

---

## 📝 NOTAS

- ✅ **Completado:** Políticas de refactorización creadas
- ✅ **Completado:** Documentación organizada e ignorada en git
- 🔄 **En progreso:** Componentes v2 de seguimiento y agenda
- 🎯 **Siguiente:** Comenzar con sección **Seguimiento**

---

_Actualizado: 15 de agosto de 2025_
