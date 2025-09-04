# ✅ CHECKLIST EMV - ECOSISTEMA MÍNIMO VIABLE

## Fase 1: Foundations (Semanas 1-4) - "Time-to-Revenue"

---

## 🎯 OBJETIVO EMV

Lanzar un **Ecosistema Mínimo Viable** donde:

- ✅ Estudio se puede registrar y pagar plan
- ✅ Tiene su espacio aislado con URL personalizada
- ✅ Puede crear proyectos respetando límites de plan
- ✅ ProSocial está listo para revenue share

---

## 📋 CHECKLIST DETALLADO

### **🗓️ SEMANA 1: SCHEMA Y MULTI-TENANT**

#### **Día 1-2: Database Schema Revenue Share**

- [ ] **1.1** Crear nuevas entidades en Prisma

```prisma
model Studio {
  id                    String @id @default(cuid())
  slug                  String @unique  // estudio-luna
  name                  String          // "Estudio Luna Photography"
  email                 String @unique
  plan_id               String
  stripe_connect_id     String?         // Para revenue share
  active_projects_limit Int             // Control límites

  plan                  Plan @relation(fields: [plan_id], references: [id])
  projects              Project[]
  b2b2c_services        StudioService[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Plan {
  id                    String @id @default(cuid())
  name                  String          // "Starter", "Professional"
  active_project_limit  Int             // 5, 15, 50
  price_monthly         Decimal         // 29, 79, 199
  price_yearly          Decimal         // 290, 790, 1990 (2 meses gratis)

  studios               Studio[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Project {
  id          String @id @default(cuid())
  studio_id   String
  name        String
  status      ProjectStatus @default(ACTIVE)
  event_date  DateTime
  archived_at DateTime?

  studio      Studio @relation(fields: [studio_id], references: [id], onDelete: Cascade)

  // Migrar datos existentes aquí
  cotizaciones Cotizacion[]
  clientes     Cliente[]
  eventos      Evento[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum ProjectStatus {
  ACTIVE
  ARCHIVED
  PENDING_DELETION
}

// B2B2C Services Infrastructure
model B2B2C_Service {
  id                    String @id @default(cuid())
  service_code          String @unique  // "VIRTUAL_SPACE_PRO"
  name                  String          // "Espacio Virtual Pro"
  description           Text
  price_end_user        Decimal         // Precio cliente final
  studio_commission_rate Decimal        // 0.30 (30% para estudio)
  duration_days         Int?            // 365 para espacio virtual

  studio_services       StudioService[]
  purchases             EndUserPurchase[]
}

model StudioService {
  studio_id    String
  service_id   String
  is_enabled   Boolean @default(false)

  studio       Studio @relation(fields: [studio_id], references: [id])
  service      B2B2C_Service @relation(fields: [service_id], references: [id])

  @@id([studio_id, service_id])
}

model EndUserPurchase {
  id                      String @id @default(cuid())
  project_id              String
  service_id              String
  purchase_date           DateTime @default(now())
  expires_at              DateTime?
  amount_paid             Decimal
  studio_commission_amount Decimal
  payout_status           PayoutStatus @default(PENDING)
  stripe_transaction_id   String?

  project                 Project @relation(fields: [project_id], references: [id])
  service                 B2B2C_Service @relation(fields: [service_id], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum PayoutStatus {
  PENDING
  PROCESSED
  FAILED
}
```

- [ ] **1.2** Migración de datos existentes a modelo multi-tenant
- [ ] **1.3** Crear planes base (Starter, Professional, Enterprise)

#### **Día 3-4: Row Level Security**

- [ ] **1.4** Implementar RLS policies en Supabase

```sql
-- Política de aislamiento por studio
CREATE POLICY "studio_isolation" ON projects
  FOR ALL USING (studio_id = current_setting('app.current_studio_id'));

CREATE POLICY "studio_data_access" ON cotizaciones
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = cotizaciones.project_id
      AND p.studio_id = current_setting('app.current_studio_id')
    )
  );
```

- [ ] **1.5** Context middleware para establecer tenant

```typescript
export async function studioMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const studioSlug = req.params.studioSlug;
  const studio = await validateStudio(studioSlug);

  // Set tenant context para todas las queries
  await supabase.rpc("set_current_studio_id", { studio_id: studio.id });
  req.studio = studio;
  next();
}
```

#### **Día 5: Validación y Testing**

- [ ] **1.6** Tests de aislamiento multi-tenant
- [ ] **1.7** Validar migración datos sin pérdida

---

### **🗓️ SEMANA 2: ONBOARDING Y AUTENTICACIÓN**

#### **Día 1-2: Registration Wizard**

- [ ] **2.1** Página de registro estudio

```typescript
// /register - Wizard multi-step
Step 1: Información básica (name, email, password)
Step 2: Configuración estudio (name, slug, category)
Step 3: Selección plan (Starter, Professional, Enterprise)
Step 4: Setup Stripe Connect (opcional inicialmente)
Step 5: Welcome + onboarding checklist
```

- [ ] **2.2** Validación slug único y disponibilidad
- [ ] **2.3** Setup inicial configuraciones por defecto

#### **Día 3-4: Authentication Multi-tenant**

- [ ] **2.4** JWT con studio context

```typescript
// Token includes studio context
const token = jwt.sign(
  {
    userId: user.id,
    studioId: user.studio_id,
    studioSlug: user.studio.slug,
    planLimits: user.studio.plan,
  },
  JWT_SECRET
);
```

- [ ] **2.5** Middleware protección rutas
- [ ] **2.6** URLs personalizadas: `prosocial.mx/[studioSlug]/dashboard`

#### **Día 5: Límites y Validaciones**

- [ ] **2.7** Enforcement límites proyectos activos

```typescript
// Middleware creación proyecto
async function checkProjectLimits(studioId: string) {
  const activeCount = await prisma.project.count({
    where: { studio_id: studioId, status: "ACTIVE" },
  });

  const studio = await prisma.studio.findUnique({
    where: { id: studioId },
    include: { plan: true },
  });

  if (activeCount >= studio.plan.active_project_limit) {
    throw new Error("Plan limit reached. Please upgrade or archive projects.");
  }
}
```

---

### **🗓️ SEMANA 3: DASHBOARD Y CORE FEATURES**

#### **Día 1-2: Dashboard Multi-tenant**

- [ ] **3.1** Dashboard principal con studio context

```typescript
// Widget plan y límites
<PlanWidget>
  Proyectos activos: {activeProjects} / {planLimit}
  Plan actual: {studio.plan.name}
  {activeProjects/planLimit > 0.8 && <UpgradeButton />}
</PlanWidget>
```

- [ ] **3.2** Lista proyectos filtrada por studio
- [ ] **3.3** Navegación con studio slug en URLs

#### **Día 3-4: Project Management**

- [ ] **3.4** CRUD proyectos respetando límites
- [ ] **3.5** Status management (ACTIVE, ARCHIVED)
- [ ] **3.6** Auto-archiving logic preparada

```typescript
// CRON job diario (preparación)
async function checkProjectsForArchiving() {
  const projectsToArchive = await prisma.project.findMany({
    where: {
      status: "ACTIVE",
      event_date: { lt: subDays(new Date(), 60) },
    },
    include: { studio: true },
  });

  // Check si tiene servicios B2B2C activos
  // Si no → PENDING_DELETION + notificación
  // Si sí → ARCHIVED
}
```

#### **Día 5: Settings y Configuración**

- [ ] **3.7** Configuraciones básicas por studio
- [ ] **3.8** Branding inicial (logo, colores)
- [ ] **3.9** Profile management

---

### **🗓️ SEMANA 4: STRIPE Y PREPARACIÓN REVENUE SHARE**

#### **Día 1-2: Stripe Subscriptions**

- [ ] **4.1** Configuración planes en Stripe

```typescript
// Crear productos y precios en Stripe
const plans = [
  { name: "Starter", projects: 5, price: 2900 }, // $29 USD
  { name: "Professional", projects: 15, price: 7900 },
  { name: "Enterprise", projects: 50, price: 19900 },
];
```

- [ ] **4.2** Subscription flow completo
- [ ] **4.3** Webhook handling para subscription events

#### **Día 3-4: Stripe Connect Preparation**

- [ ] **4.4** Onboarding flow Stripe Connect

```typescript
// Express accounts para estudios
async function createStripeConnectAccount(studio: Studio) {
  const account = await stripe.accounts.create({
    type: "express",
    country: "MX",
    email: studio.email,
    business_profile: {
      name: studio.name,
      product_description: "Photography and videography services",
    },
  });

  return account.id;
}
```

- [ ] **4.5** Connect account linking en dashboard
- [ ] **4.6** Test transaction flow (preparación)

#### **Día 5: Validación EMV Completo**

- [ ] **4.7** Testing completo flujo registro → pago → uso
- [ ] **4.8** Performance testing multi-tenant
- [ ] **4.9** Security audit básico

---

## ✅ CRITERIOS DE ÉXITO SEMANA 4

### **Funcionalidades Core:**

- [ ] **Registro completo**: Estudio se puede registrar sin errores
- [ ] **Pago funcional**: Puede seleccionar plan y pagar suscripción
- [ ] **URL personalizada**: `prosocial.mx/estudio-test/dashboard` funcionando
- [ ] **Aislamiento**: Datos completamente separados entre studios
- [ ] **Límites aplicados**: No puede exceder proyectos de su plan

### **Métricas Target:**

- [ ] **3 estudios piloto** registrados y usando activamente
- [ ] **100% uptime** durante testing intensivo
- [ ] **<2 segundos** load time en dashboard
- [ ] **0 bugs críticos** de seguridad o pérdida de datos

### **Preparación Fase 2:**

- [ ] **Stripe Connect** configurado y probado
- [ ] **Database schema** soporta B2B2C services
- [ ] **Early adopters** identificados para beta programa

---

## 🚨 BLOQUEADORES IDENTIFICADOS

### **Posibles Riesgos:**

1. **Migración datos** más compleja de lo estimado
2. **Stripe Connect** approval delays en México
3. **Performance issues** con RLS en queries complejas
4. **Early adopters** no disponibles para beta

### **Plan de Mitigación:**

1. **Backup completo** antes de cada migración mayor
2. **Stripe sandbox** para testing mientras espera approval
3. **Query optimization** proactiva y caching strategy
4. **Network interno** como first beta users si es necesario

---

## 🎯 ENTREGABLES SEMANA 4

### **Para Stakeholders:**

- [ ] **Demo funcional** completo del EMV
- [ ] **Métricas de performance** documentadas
- [ ] **Feedback de beta users** recopilado
- [ ] **Plan Fase 2** refinado con learnings

### **Para Desarrollo:**

- [ ] **Codebase limpio** y documentado
- [ ] **Tests automated** para funcionalidades core
- [ ] **Deployment pipeline** estable
- [ ] **Monitoring** básico implementado

---

_Checklist EMV - Objetivo: Producto mínimo viable en 4 semanas_
_Próximo: Fase 2 - Motor de Monetización y Revenue Share_
