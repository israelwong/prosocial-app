# 🚀 ROADMAP V1.9 - REFACTORIZACIÓN FUNNEL COMPLETO

---

## 📋 **ANTECEDENTES Y CONTEXTO**

### 🏗️ **ESTADO ACTUAL DEL PROYECTO (PRE-V1.9)**

#### **✅ FUNCIONALIDADES IMPLEMENTADAS:**

- **Sistema JWT completo** (reemplazó Clerk authentication)
- **Dashboard administrativo optimizado** con widgets responsivos:
  - ProspectosNuevosWidget (sin teléfono, enlace a kanban)
  - BalanceFinancieroWidget (sin sección "Total facturado")
  - DistribucionEtapasWidget (optimizado a columna única)
  - CitasProgramadasWidget y MetricasRendimientoWidget
- **KanbanBoard mobile-optimized**:
  - Filtros colapsables (ocultos por defecto en móvil)
  - Botones responsivos (solo íconos en móvil)
  - Botón "Nuevo Evento" integrado
- **Sistema de citas MOFU** con validación de fechas
- **FichaCitasWidget** completo (465 líneas, CRUD, modales)
- **Comparador de paquetes** funcional
- **Sistema de notificaciones** avanzado
- **Base de datos optimizada** con filtros por status correctos

#### **🎯 ARQUITECTURA ACTUAL:**

- **Next.js 14** con App Router
- **PostgreSQL + Prisma** ORM
- **Tailwind CSS** para styling
- **Estructura modular** en `/admin` y `/cliente`
- **APIs RESTful** organizadas por funcionalidad
- **Componentes reutilizables** con TypeScript

#### **📊 ESTADO DE RAMAS:**

- **main**: Contiene todas las funcionalidades base estables
- **v1.8**: Completamente merged a main (dashboard + optimizaciones móviles)
- **v1.9**: Nueva rama de trabajo para refactorización de funnel

#### **🔧 CONFIGURACIONES ACTUALES:**

- **Stripe integration** configurado para pagos
- **Email notifications** implementado
- **File upload** funcional para documentos
- **Responsive design** optimizado para móvil/desktop
- **Performance** optimizado (build sin errores)

---

## 📅 **TIMELINE CAMPAÑA: 8-12 SEPTIEMBRE 2025**

### 🎯 **OBJETIVO PRINCIPAL**

Optimizar funnel completo TOP → MIDDLE → BOTTOM para lanzamiento de campaña del **viernes 12 de septiembre**.

---

## 📋 **FASE 1: OPTIMIZACIÓN FUNNEL (PRIORIDAD ALTA)**

### 🔥 **TOP OF FUNNEL - Landing Pages Cerradoras**

- [ ] **Refactorizar `/fifteens`**
  - [ ] Hero impactante con CTA principal
  - [ ] Social proof destacado (testimonios)
  - [ ] Portfolio visual atractivo
  - [ ] Elementos de urgencia/escasez
  - [ ] Lead magnet optimizado
- [ ] **Refactorizar `/weddings`**
  - [ ] Hero impactante con CTA principal
  - [ ] Social proof destacado (testimonios)
  - [ ] Portfolio visual atractivo
  - [ ] Elementos de urgencia/escasez
  - [ ] Lead magnet optimizado

### 🎯 **MIDDLE OF FUNNEL - Optimización Conversión**

- [ ] **Mejorar `/evento/[eventoId]`**
  - [ ] UX optimizada para conversión
  - [ ] Comparador de paquetes mejorado
  - [ ] Validación de fechas en tiempo real
  - [ ] Cotizaciones instantáneas
  - [ ] Checkout flow optimizado

### 💬 **INTEGRACIÓN MANYCHAT**

- [ ] **API Validación de Fechas**
  - [ ] Endpoint para validar disponibilidad desde WhatsApp
  - [ ] **Límite de 3 intentos de búsqueda** (evitar exposición de falta de trabajo)
  - [ ] Respuestas automáticas optimizadas
- [ ] **Creación de Eventos desde Chat**
  - [ ] Webhook para crear eventos desde ManyChat
  - [ ] Redirección automática a `/evento/[eventoId]`
  - [ ] Integración directa con CRM
- [ ] **Workflow Completo**
  - [ ] Campaña → Landing → Captura → ManyChat → Validación → Evento → CRM

---

## ⚙️ **FASE 2: CONFIGURACIONES ADMIN (PRIORIDAD MEDIA)**

### 📊 **Panel de Configuración Comercial**

- [ ] **Gestión de Capacidad**
  - [ ] Configurar cantidad máxima de eventos por día
  - [ ] Calendar blocking para fechas no disponibles
  - [ ] Configuración por tipo de evento
- [ ] **Gestión de Pagos**
  - [ ] Días mínimos para recordatorios de liquidación
  - [ ] Configuración de plazos por tipo de evento
  - [ ] Notificaciones automáticas de vencimiento
- [ ] **Limitaciones de Búsqueda**
  - [ ] Máximo 3 intentos de búsqueda de fecha
  - [ ] Mensaje optimizado después del límite
  - [ ] Redirección a contacto directo

---

## 🎥 **FASE 3: EVOLUCIÓN TIPOS DE EVENTO (FUTURO)**

### 📍 **Diferenciación de Servicios**

- [ ] **Tipos de Evento Principales**
  - [ ] **Cobertura de Evento** (actual)
    - [ ] Eventos en locación del cliente
    - [ ] Fotografía/video en vivo
    - [ ] Limitaciones por fecha y disponibilidad
  - [ ] **Sesión de Estudio** (futuro)
    - [ ] Sesiones en estudio controlado
    - [ ] Mayor flexibilidad de fechas
    - [ ] Configuración independiente

- [ ] **Base de Datos Actualizada**
  - [ ] Campo `tipo_servicio` en tabla eventos
  - [ ] Valores: `cobertura_evento`, `sesion_estudio`
  - [ ] Migración de datos existentes

- [ ] **Lógica de Negocio Diferenciada**
  - [ ] Validación de fechas según tipo
  - [ ] Pricing diferenciado
  - [ ] Workflows específicos por tipo

---

## 🎨 **FASE 4: GESTIÓN MULTIMEDIA (POST-CAMPAÑA)**

### 📁 **Sistema de Archivos**

- [ ] **Organización por Evento**
  - [ ] Estructura de carpetas automática
  - [ ] Upload masivo de fotos/videos
  - [ ] Categorización por momento del evento
- [ ] **Procesamiento Automático**
  - [ ] Compresión automática de imágenes
  - [ ] Generación de thumbnails
  - [ ] Watermarking automático

### 💌 **Invitaciones Digitales**

- [ ] **Editor de Invitaciones**
  - [ ] Templates personalizables
  - [ ] Branding del cliente
  - [ ] Vista previa en tiempo real
- [ ] **Distribución Automática**
  - [ ] Envío masivo por WhatsApp/Email
  - [ ] Tracking de entregas
  - [ ] RSVP integrado

---

## 🏢 **FASE 5: MIGRACIÓN SAAS (ESTRATÉGICO)**

### 🔄 **Preparación Arquitectura**

- [ ] **Clonación de Repositorio**
  - [ ] Nuevo repo para versión SaaS
  - [ ] Limpieza de código específico de ProSocial
  - [ ] Configuración multi-tenant
- [ ] **Estructura de Carpetas SaaS**
  ```
  prosocial-saas/
  ├── packages/
  │   ├── core/           # Lógica de negocio compartida
  │   ├── admin/          # Panel administrativo
  │   ├── client/         # Portal de clientes
  │   └── api/            # APIs centralizadas
  ├── apps/
  │   ├── studio-a/       # Instancia cliente A
  │   ├── studio-b/       # Instancia cliente B
  │   └── prosocial/      # Instancia original
  └── shared/
      ├── ui/             # Componentes compartidos
      ├── utils/          # Utilidades comunes
      └── types/          # Tipos TypeScript
  ```

### 🗄️ **Migración de Base de Datos**

- [ ] **Nueva Estructura Multi-tenant**
  - [ ] Schema base compartido
  - [ ] Datos específicos por tenant
  - [ ] Sistema de configuración por cliente
- [ ] **Migración de Datos Reales**
  - [ ] Exportar datos actuales de ProSocial
  - [ ] Transformar a formato SaaS
  - [ ] Importar como datos de ejemplo/demo
  - [ ] Anonimización de datos sensibles

---

## 📊 **CRONOGRAMA DETALLADO**

### **SEMANA 1 (9-13 SEPTIEMBRE)**

| Día              | Tareas                              | Responsable | Status |
| ---------------- | ----------------------------------- | ----------- | ------ |
| **Lunes 9**      | Landing Fifteens + API ManyChat     | Dev         | 🔄     |
| **Martes 10**    | Landing Weddings + Integración Chat | Dev         | ⏳     |
| **Miércoles 11** | Testing E2E + Configuraciones Admin | Dev         | ⏳     |
| **Jueves 12**    | Deploy + Configuración Final        | Dev         | ⏳     |
| **Viernes 13**   | **🚀 LANZAMIENTO CAMPAÑA**          | Marketing   | ⏳     |

### **SEMANA 2 (16-20 SEPTIEMBRE)**

- Monitoring de campaña
- Optimizaciones basadas en métricas
- Preparación Fase 2

### **SEMANA 3-4 (23 SEP - 4 OCT)**

- Configuraciones Admin avanzadas
- Preparación tipos de evento diferenciados

---

## 🎯 **MÉTRICAS DE ÉXITO**

### **Funnel Conversion**

- [ ] Landing Page CVR > 15%
- [ ] Lead to Quote CVR > 30%
- [ ] Quote to Sale CVR > 25%

### **ManyChat Performance**

- [ ] Response Rate > 80%
- [ ] Chat to Lead CVR > 60%
- [ ] Automated Booking Rate > 40%

### **Technical Performance**

- [ ] Page Load Speed < 2s
- [ ] Mobile Performance Score > 90
- [ ] API Response Time < 500ms

---

## 🔧 **CONFIGURACIONES TÉCNICAS REQUERIDAS**

### **Variables de Entorno**

```env
# ManyChat Integration
MANYCHAT_API_KEY=
MANYCHAT_WEBHOOK_SECRET=

# Business Rules
MAX_EVENTS_PER_DAY=3
MIN_PAYMENT_REMINDER_DAYS=7
MAX_DATE_SEARCH_ATTEMPTS=3

# Feature Flags
ENABLE_STUDIO_SESSIONS=false
ENABLE_MULTIMEDIA_MANAGEMENT=false
ENABLE_DIGITAL_INVITATIONS=false
```

### **Database Schema Updates**

```sql
-- Fase 3: Tipos de Evento
ALTER TABLE eventos ADD COLUMN tipo_servicio ENUM('cobertura_evento', 'sesion_estudio') DEFAULT 'cobertura_evento';

-- Fase 2: Configuraciones
CREATE TABLE configuraciones_comerciales (
  id INT PRIMARY KEY AUTO_INCREMENT,
  max_eventos_por_dia INT DEFAULT 3,
  dias_minimos_recordatorio INT DEFAULT 7,
  max_intentos_busqueda INT DEFAULT 3,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 📝 **NOTAS IMPORTANTES**

### **Decisiones de Producto**

- **3 intentos máximo** para búsqueda de fechas (evitar exposición de baja disponibilidad)
- **Diferenciación futura** entre cobertura y sesiones de estudio
- **Multimedia y invitaciones** como features post-campaña
- **SaaS migration** como objetivo estratégico a largo plazo

### **Dependencias Críticas**

- ManyChat API configuration
- Stripe webhook optimization
- Database performance tuning
- CDN setup for media files

---

## ✅ **CHECKLIST DE COMPLETION**

### **Pre-Launch (12 Sep)**

- [ ] Landing pages optimizadas
- [ ] ManyChat integration funcional
- [ ] APIs de validación ready
- [ ] Testing E2E completo
- [ ] Performance optimization
- [ ] Backup y rollback plan

### **Post-Launch Monitoring**

- [ ] Funnel metrics tracking
- [ ] Error monitoring active
- [ ] Customer feedback collection
- [ ] Performance metrics dashboard

---

**Última actualización**: 7 de septiembre de 2025  
**Versión**: v1.9  
**Responsable**: Equipo de Desarrollo  
**Revisión siguiente**: 9 de septiembre de 2025
