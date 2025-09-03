# 🔧 CONSIDERACIONES TÉCNICAS - SAAS v1.7

## Decisiones de Arquitectura y Implementación

---

## 🏗️ ARQUITECTURA MULTI-TENANT

### **Modelo Seleccionado: Shared Database + Tenant Isolation**

#### **Justificación:**

- ✅ **Costo-eficiencia**: Una BD para todos los tenants
- ✅ **Simplicidad operativa**: Un deployment, un backup
- ✅ **Escalabilidad controlada**: Fácil monitoring y optimización
- ✅ **Migración gradual**: Sin downtime significativo

#### **Estructura de Datos:**

```typescript
// Arquitectura multi-tenant simplificada
ClientePlatform → Negocio (1:1) → Datos Operativos

// Ejemplo estructura datos:
ClientePlatform {
  id: "clp_001"
  slug: "estudio-luna"      // → prosocial.mx/estudio-luna/
  nombre: "Estudio Luna"
  email: "admin@estudioluna.com"
  plan: "professional"

  negocio: Negocio          // Relación 1:1 (escalable a 1:N)
}

Negocio {
  id: "neg_001"
  clienteId: "clp_001"
  nombre: "Sede Principal"   // Ahora mismo = cliente
  configuracion: {...}

  // Todos los datos operativos tienen negocioId
  eventos: Evento[]
  cotizaciones: Cotizacion[]
  clientes: Cliente[]
  // ...
}
```

---

## � MODELO DE NEGOCIO B2B2C - SERVICIOS ADICIONALES

### **Arquitectura de Ingresos Multi-Nivel**

```typescript
ProSocial Platform (SaaS Principal)
├── Suscripción Mensual (Negocio)
└── Servicios Adicionales B2B2C
    ├── Invitaciones Digitales
    ├── Espacio Virtual (Cloud Storage)
    └── Portal Cliente Premium

// 💰 FLUJO DE INGRESOS CON COSTOS CONTEMPLADOS:
Cliente Final → Paga al Negocio → Comisión a ProSocial Platform
                                 ↓
                          Cubre: Storage + Infraestructura + Utilidad
```

### **🏦 MODELO ECONÓMICO VIABLE - CONSIDERACIONES CRÍTICAS**

#### **1. Estructura de Costos por Cliente Final**

```typescript
CostosInfraestructura {
  // Costos directos por cliente final del negocio
  storage: {
    supabaseStorage: 0.021,      // USD/GB/mes (Supabase pricing)
    cloudflareDataTransfer: 0.01, // USD/GB/mes
    backupStorage: 0.005         // USD/GB/mes
  },

  emailService: {
    sendGrid: 0.0006,            // USD/email (hasta 40K gratis)
    smsCost: 0.05               // USD/SMS notificación
  },

  processing: {
    cpuTime: 0.001,             // USD/hora procesamiento
    databaseOperations: 0.0001   // USD/query
  }
}

// 📊 EJEMPLO REAL:
// Cliente final con 5GB storage + 100 emails/mes = $0.165/mes en costos
// Comisión mínima viable: $0.50/mes (300% margen)
```

#### **2. Modelos de Cobranza Propuestos**

**Opción A: Comisión por Transacción**

```typescript
ComisionTransaccional {
  espacioVirtual: {
    hasta5GB: 2.99,             // USD/mes por cliente final
    hasta25GB: 9.99,            // USD/mes por cliente final
    hasta100GB: 24.99           // USD/mes por cliente final
  },

  invitacionesDigitales: {
    hasta100: 0,                // Incluido gratis
    hasta500: 4.99,             // USD/mes
    ilimitadas: 14.99           // USD/mes
  },

  // Comisión ProSocial: 30% de lo que cobra el negocio
  comisionProSocial: 0.30
}
```

**Opción B: Cobranza Directa al Negocio (Recomendada)**

```typescript
CobranzaDirectaNegocio {
  // El negocio paga a ProSocial por cada cliente final activo
  costoPorClienteFinal: {
    espacioBasico: 1.50,        // USD/mes (hasta 5GB)
    espacioPro: 4.99,           // USD/mes (hasta 25GB)
    espacioEnterprise: 12.99    // USD/mes (hasta 100GB)
  },

  // + El negocio cobra lo que quiera a su cliente final
  libertadPrecios: true,

  // Beneficios para ProSocial:
  ingresoPredecible: true,      // Facturación mensual garantizada
  escalabilidadControlada: true, // Costos cubiertos siempre
  margenSaludable: "200-300%"   // Margen sobre costos reales
}
```

### **Consideraciones Técnicas B2B2C**

#### **1. Facturación Multi-Nivel**

```typescript
// Estructura de facturación compleja
FacturacionNegocio {
  suscripcionMensual: number    // Plan base SaaS
  serviciosAdicionales: {
    invitacionesDigitales: number
    espacioVirtual: number
    portalPremium: number
  }
  comisionesBruto: number       // De ventas a clientes finales
}

FacturacionClienteFinal {
  negocioId: string
  servicios: ServicioAdicional[]
  montoTotal: number
  comisionProSocial: number     // % configurable por servicio
}
```

#### **2. Infraestructura Escalable**

- **Storage**: AWS S3 con limits por plan (5GB → 500GB)
- **Email Service**: Integración masiva para invitaciones (SendGrid/Mailgun)
- **CDN**: CloudFlare para galerías y contenido multimedia
- **Analytics**: Tracking de uso por servicio y negocio

#### **3. Implementación Técnica - Control de Costos**

```typescript
// Sistema de límites y alertas automáticas
LimitesAutomaticos {
  storage: {
    softLimit: 4.5,             // GB - Alerta al 90%
    hardLimit: 5.0,             // GB - Bloqueo automático
    upgradePrompt: true         // Sugerir plan superior
  },

  monitoring: {
    costosRealTime: true,       // Tracking costos en tiempo real
    alertasAutomaticas: {
      storageLimit: 0.9,        // 90% de límite
      monthlyBudget: 0.85       // 85% del presupuesto mensual
    }
  }
}

// Facturación automática con protección
FacturacionProtegida {
  preAutorizacion: true,        // Pre-auth antes de permitir uso
  suspensionAutomatica: true,   // Suspender si no hay pago
  migracionDatos: {
    periodoGracia: 30,          // días para pagar antes de borrar
    backupFinal: true           // Backup antes de eliminación
  }
}
```

#### **4. Métricas de Viabilidad**

```typescript
MetricasViabilidad {
  // KPIs críticos para sustainability
  costoPorClienteFinalPromedio: 0.25,    // USD/mes (target)
  ingresosPorClienteFinalPromedio: 1.50,  // USD/mes (target)
  margenObjetivo: 0.83,                   // 83% margen (6x costos)

  // Thresholds de alerta
  alertas: {
    margenBajo: 0.50,           // <50% margen = alerta
    margenCritico: 0.25,        // <25% margen = revisar precios
    crecimientoNegativo: -0.10  // -10% = investigar churn
  }
}
```

---

## �💡 DECISIONES CLAVE DE PRODUCTO

### **1. Modelo de Comisiones Stripe**

#### **Opción A: Sin comisión adicional**

- ✅ Más atractivo para clientes
- ✅ Modelo de negocio simple (solo SaaS)
- ❌ Menor ingreso por transacción

#### **Opción B: Comisión por transacción**

- ✅ Revenue adicional significativo
- ❌ Más complejo de implementar
- ❌ Puede ser barrera de entrada

**📋 DECISIÓN PENDIENTE**: Validar con modelo de negocio

### **2. Estructura de URLs - DECISIÓN FINAL**

#### **✅ SELECCIONADO: Path-based Simplificado**

```typescript
// Acceso principal del cliente
prosocial.mx / [clienteSlug] / dashboard;
prosocial.mx / [clienteSlug] / eventos;
prosocial.mx / [clienteSlug] / cotizaciones;

// URLs públicas
prosocial.mx / [clienteSlug] / evento / [eventoId]; // Cotización pública
prosocial.mx / [clienteSlug] / cliente / [clienteId]; // Portal cliente final
```

#### **Justificación:**

- ✅ **URL Simple**: Fácil acceso para clientes (`prosocial.mx/estudio-luna/`)
- ✅ **Branding Claro**: La marca del cliente visible en URL
- ✅ **Arquitectura Escalable**: Preparada para multi-negocio futuro
- ✅ **UX Intuitiva**: Sin confusión de paths largos
- ✅ **Un solo certificado SSL** y infraestructura simplificada

### **3. Límites por Plan**

```typescript
interface PlanLimits {
  eventos_mes: number; // Ej: 50, 200, ilimitado
  usuarios: number; // Ej: 2, 5, 10
  storage_gb: number; // Ej: 5GB, 20GB, 100GB
  cotizaciones_mes: number; // Ej: 100, 500, ilimitado
  integraciones: boolean; // ManyChat, FB Leads, etc.
  branding_custom: boolean; // Logo, colores personalizados
  api_access: boolean; // Acceso a API externa
}
```

---

## 🔐 SEGURIDAD MULTI-TENANT

### **1. Row-Level Security**

```sql
-- Ejemplo política RLS
CREATE POLICY "tenant_isolation" ON eventos
    FOR ALL USING (negocio_id = current_setting('app.current_tenant_id'));
```

### **2. Context Middleware**

```typescript
// Middleware que valida y establece tenant
export async function tenantMiddleware(req: Request) {
  const tenantSlug = req.params.tenantSlug;
  const negocio = await validateTenant(tenantSlug);

  // Set context para todas las queries
  await setTenantContext(negocio.id);
}
```

### **3. Validación de Acceso**

- Todo query DEBE incluir `negocioId`
- Middleware automático en todas las rutas
- Logging de intentos de acceso cross-tenant

---

## 📊 PERFORMANCE CONSIDERATIONS

### **1. Database Indexing**

```sql
-- Índices críticos para multi-tenancy
CREATE INDEX idx_eventos_negocio_id ON eventos(negocio_id);
CREATE INDEX idx_cotizaciones_negocio_id ON cotizaciones(negocio_id);
CREATE INDEX idx_clientes_negocio_id ON clientes(negocio_id);

-- Nuevos índices para Sistema Cotización Anexo
CREATE INDEX idx_cotizacion_anexo_cotizacion_id ON cotizacion_anexo(cotizacion_id);
CREATE INDEX idx_cotizacion_anexo_estado ON cotizacion_anexo(estado);
CREATE INDEX idx_cotizacion_anexo_negocio_fecha ON cotizacion_anexo(cotizacion_id, fecha_creacion);
```

### **2. Caching Strategy**

- Cache por tenant (Redis con prefijo por negocioId)
- Static assets compartidos
- Database connection pooling

### **3. Query Optimization**

- Todas las queries filtran por `negocioId` PRIMERO
- Uso de prepared statements
- Monitoring de slow queries por tenant

---

## 🎨 BRANDING SYSTEM

### **Configuración por Tenant**

```typescript
interface TenantBranding {
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  font_family?: string;
  custom_css?: string;
}
```

### **CSS Variables Dinámicas**

```css
:root {
  --brand-primary: var(--tenant-primary, #0066cc);
  --brand-secondary: var(--tenant-secondary, #6b7280);
  --brand-logo: url(var(--tenant-logo, "/default-logo.png"));
}
```

---

## 🔄 MIGRATION STRATEGY

### **Fase de Transición**

1. **Coexistencia**: Sistema actual + nuevo multi-tenant
2. **Feature flags**: Activar funcionalidades gradualmente
3. **Data validation**: Verificar integridad en paralelo
4. **Rollback plan**: Posibilidad de revertir en cada fase

### **Data Migration Script**

```typescript
async function migrateToMultiTenant() {
  // 1. Crear Negocio default para ProSocial
  const negocio = await createDefaultBusiness();

  // 2. Asignar negocioId a tablas existentes
  await assignTenantIds(negocio.id);

  // 3. Validar integridad
  await validateDataIntegrity();
}
```

---

## 💼 SISTEMA COTIZACIÓN ANEXO - CONSIDERACIONES TÉCNICAS

### **1. Arquitectura del Sistema Anexo**

```typescript
// Workflow completo Sistema Anexo
interface CotizacionAnexoWorkflow {
  // 1. Creación Admin
  crearAnexo: (
    cotizacionId: string,
    servicios: ServicioAdicional[]
  ) => Promise<CotizacionAnexo>;

  // 2. Notificación Cliente
  notificarCliente: (anexoId: string) => Promise<void>;

  // 3. Autorización Cliente
  autorizarAnexo: (
    anexoId: string,
    decision: "aprobar" | "rechazar"
  ) => Promise<void>;

  // 4. Integración a Cotización Original
  integrarServicios: (anexoId: string) => Promise<Cotizacion>;
}

// Estados y transiciones
type EstadoAnexo = "pendiente" | "autorizada" | "rechazada" | "integrada";

// Validaciones de negocio
const validarAnexo = {
  cotizacionDebeEstarAprobada: true,
  serviciosNoDuplicados: true,
  montoMaximoAnexo: "50% del monto original",
  limiteDiasParaAutorizar: 7,
};
```

### **2. Impacto en Base de Datos**

```sql
-- Estructura optimizada para queries frecuentes
CREATE TABLE cotizacion_anexo (
  id UUID PRIMARY KEY,
  cotizacion_id UUID NOT NULL REFERENCES cotizacion(id),
  negocio_id UUID NOT NULL REFERENCES negocio(id), -- Multi-tenant
  servicios_adicionales JSONB NOT NULL,
  monto_adicional DECIMAL(10,2) NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
  motivo_anexo TEXT,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_autorizacion TIMESTAMP,

  -- Índices para performance
  INDEX idx_anexo_cotizacion (cotizacion_id),
  INDEX idx_anexo_estado (estado),
  INDEX idx_anexo_tenant (negocio_id, fecha_creacion)
);

-- Trigger para actualizar monto total cotización
CREATE TRIGGER update_cotizacion_total
AFTER UPDATE ON cotizacion_anexo
WHEN NEW.estado = 'integrada';
```

### **3. Notificaciones y Comunicación**

- **Email automático** cuando se crea anexo
- **Portal cliente** muestra anexos pendientes
- **Dashboard admin** tracking de anexos por estado
- **WhatsApp/SMS** opcional para urgentes

### **4. Consideraciones UX/UI**

```typescript
// Componente visual para servicios anexados
interface ServicioConEstado {
  servicio: Servicio;
  origen: "original" | "anexado";
  fechaAgregado?: Date;
  anexoId?: string;
}

// Badge system para servicios
const BadgeServicio = {
  ORIGINAL: { color: "blue", text: "Original" },
  AGREGADO: { color: "green", text: "Agregado" },
  PENDIENTE: { color: "yellow", text: "Pendiente autorización" },
};
```

---

## 🧪 TESTING STRATEGY

### **1. Unit Tests**

- Helpers de tenant isolation
- Business logic por tenant
- Validación de permisos

### **2. Integration Tests**

- Multi-tenant data isolation
- Cross-tenant access prevention
- Performance bajo carga

### **3. E2E Tests**

- Onboarding completo
- Workflows críticos por tenant
- UI responsive

---

## 📈 MONITORING & ANALYTICS

### **Métricas por Tenant**

```typescript
interface TenantMetrics {
  active_users: number;
  events_created: number;
  revenue_generated: number;
  storage_used: number;
  api_calls: number;
}
```

### **Alertas**

- Límites de plan excedidos
- Performance degradation
- Failed payments
- Security incidents

---

## 🚀 DEPLOYMENT STRATEGY

### **Environment Setup**

```
Production: prosocial.mx
Staging: staging.prosocial.mx
Development: dev.prosocial.mx
```

### **CI/CD Pipeline**

1. **Tests**: Unit + Integration + E2E
2. **Security scan**: Dependency audit
3. **Performance**: Load testing
4. **Deploy**: Blue-green deployment
5. **Validation**: Smoke tests post-deploy

---

## 📋 PRÓXIMAS DECISIONES REQUERIDAS

### **1. Modelo de Pricing**

- [ ] Definir planes (Básico, Pro, Enterprise)
- [ ] Establecer límites por plan
- [ ] Decidir sobre comisiones Stripe

### **2. Integraciones Prioritarias**

- [ ] ManyChat (webhook structure)
- [ ] Facebook Lead Ads (API permissions)
- [ ] Analytics (GTM, Hotjar, etc.)

### **3. Compliance**

- [ ] GDPR considerations (EU tenants)
- [ ] Data retention policies
- [ ] Backup/disaster recovery

---

## ⚡ QUICK WINS IDENTIFICADOS

### **Implementación Rápida (< 1 semana)**

- [ ] Tenant context provider
- [ ] Basic branding system
- [ ] URL routing por tenant

### **Impacto Alto (< 2 semanas)**

- [ ] Multi-tenant authentication
- [ ] Pipeline configurable básico
- [ ] Onboarding wizard MVP

---

¿Te parece que este análisis técnico cubre las consideraciones importantes? ¿Hay algún aspecto específico que quieras que profundice más?
