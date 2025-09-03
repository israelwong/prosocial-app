# ✅ CHECKLIST EJECUTABLE - FASE 1

## Multi-Tenant Foundations (Semanas 1-3)

---

## 🎯 OBJETIVOS FASE 1

- [x] Crear modelo de datos multi-tenant
- [x] Implementar entidades ClientePlatform y Negocio
- [x] Migrar datos existentes a estructura multi-tenant
- [x] Validar integridad y funcionamiento

---

## 📋 CHECKLIST DETALLADO

### **🗓️ SEMANA 1: DISEÑO Y SCHEMA**

#### **Día 1-2: Schema Design**

- [ ] **1.1** Analizar tablas existentes que necesitan `negocioId`

  ```bash
  # Crear lista de tablas críticas
  echo "Cliente, Evento, Cotizacion, Pago, Agenda, User, Configuracion" > tablas-tenant.txt
  echo "Servicio, Categoria, Seccion, Paquete" >> tablas-tenant.txt
  ```

- [ ] **1.2** Diseñar schema completo en Prisma - **ARQUITECTURA SIMPLIFICADA**
  - [ ] Entidad `ClientePlatform` (con slug único)
  - [ ] Entidad `Negocio` (relación 1:1 con Cliente, escalable a 1:N)
  - [ ] URLs: `prosocial.mx/[clienteSlug]/` (simplificado)
  - [ ] Relaciones entre entidades

**📋 Schema Base:**
```prisma
model ClientePlatform {
  id    String @id @default(cuid())
  slug  String @unique  // "estudio-luna" → URL directa
  nombre String         // "Estudio Luna"  
  email String @unique
  plan  String         // "starter", "professional"
  
  negocio Negocio?     // 1:1 relación (escalable después)
}

model Negocio {
  id        String @id @default(cuid())
  clienteId String @unique
  nombre    String
  
  clientePlatform ClientePlatform @relation(fields: [clienteId], references: [id])
  eventos         Evento[]
  // ... resto entidades con negocioId
}
```

- [ ] **1.3** Definir constraints y validaciones
  - [ ] Unique constraints
  - [ ] Cascade rules
  - [ ] Default values

#### **Día 3-4: Implementación Schema**

- [ ] **1.4** Modificar `schema.prisma` con arquitectura simplificada

  ```prisma
  // ✅ Arquitectura Cliente 1:1 Negocio
  model ClientePlatform {
    id     String @id @default(cuid())
    slug   String @unique  // URL: prosocial.mx/[slug]/
    nombre String
    email  String @unique
    plan   String
    
    negocio Negocio?
    
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
  }
  
  model Negocio {
    id        String @id @default(cuid())
    clienteId String @unique
    nombre    String
    
    clientePlatform ClientePlatform @relation(fields: [clienteId], references: [id], onDelete: Cascade)
    
    // Todas las entidades operativas
    eventos      Evento[]
    cotizaciones Cotizacion[]
    clientes     Cliente[]
    
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
  }
  ```

- [ ] **1.5** Agregar `negocioId` a tablas existentes

  ```prisma
  model Cliente {
    id String @id @default(cuid())
    negocioId String
    negocio Negocio @relation(fields: [negocioId], references: [id])
    // ... campos existentes
  }
  ```

- [ ] **1.6** Crear migraciones Prisma
  ```bash
  npx prisma migrate dev --name "add-multi-tenant-structure"
  ```

#### **Día 5: Validación y Tests**

- [ ] **1.7** Validar schema con Prisma Studio
- [ ] **1.8** Crear tests básicos de modelo
- [ ] **1.9** Documentar cambios en schema

---

### **🗓️ SEMANA 2: MIGRACIÓN DE DATOS**

#### **Día 1-2: Scripts de Migración**

- [ ] **2.1** Crear script de migración de datos

  ```typescript
  // scripts/migrate-to-multitenant.ts
  async function migrateExistingData() {
    // Crear Negocio default para ProSocial
    const defaultNegocio = await createDefaultBusiness();

    // Asignar negocioId a todas las tablas
    await assignTenantIds(defaultNegocio.id);
  }
  ```

- [ ] **2.2** Implementar función `createDefaultBusiness()`
- [ ] **2.3** Implementar función `assignTenantIds()`
- [ ] **2.4** Crear backup completo antes de migración

#### **Día 3-4: Ejecución y Validación**

- [ ] **2.5** Ejecutar migración en ambiente dev

  ```bash
  npm run migrate:to-multitenant
  ```

- [ ] **2.6** Validar integridad de datos
  - [ ] Verificar que todos los registros tienen `negocioId`
  - [ ] Validar relaciones foráneas
  - [ ] Comprobar counts de registros

- [ ] **2.7** Ejecutar tests de regresión
- [ ] **2.8** Documentar proceso de migración

#### **Día 5: Ambiente Staging**

- [ ] **2.9** Replicar migración en staging
- [ ] **2.10** Tests de smoke en staging
- [ ] **2.11** Plan de rollback documentado

---

### **🗓️ SEMANA 3: MIDDLEWARE Y VALIDACIÓN**

#### **Día 1-2: Context Providers**

- [ ] **3.1** Crear `TenantProvider`

  ```typescript
  // app/providers/TenantProvider.tsx
  export const TenantProvider = ({ children }) => {
    const [currentNegocio, setCurrentNegocio] = useState(null);
    // ... lógica de tenant
  };
  ```

- [ ] **3.2** Implementar `useTenant()` hook
- [ ] **3.3** Integrar providers en layout principal

#### **Día 3-4: Middleware de Seguridad**

- [ ] **3.4** Crear middleware de tenant isolation

  ```typescript
  // middleware.ts
  export function middleware(request: NextRequest) {
    const tenantSlug = request.nextUrl.pathname.split("/")[1];
    // Validar tenant y set context
  }
  ```

- [ ] **3.5** Implementar validación automática en actions
- [ ] **3.6** Agregar logging de accesos cross-tenant

#### **Día 5: Testing Integral**

- [ ] **3.7** Tests de aislamiento de datos

  ```typescript
  // Verificar que Tenant A no ve datos de Tenant B
  test("tenant data isolation", async () => {
    // Test implementation
  });
  ```

- [ ] **3.8** Performance testing con múltiples tenants
- [ ] **3.9** Security audit básico
- [ ] **3.10** Documentación técnica completa

---

## 🧪 CRITERIOS DE ÉXITO FASE 1

### **Funcionales:**

- [ ] ✅ Datos migrados sin pérdida (100% integridad)
- [ ] ✅ Aislamiento perfecto entre tenants
- [ ] ✅ Performance equivalente al sistema actual
- [ ] ✅ Zero downtime durante migración

### **Técnicos:**

- [ ] ✅ Todas las queries filtran por `negocioId`
- [ ] ✅ Middleware funciona en todas las rutas
- [ ] ✅ Tests de regresión al 100%
- [ ] ✅ No hay warnings de Prisma

### **Documentación:**

- [ ] ✅ Schema documentado completamente
- [ ] ✅ Proceso de migración documentado
- [ ] ✅ Rollback plan validado
- [ ] ✅ Security considerations documentadas

---

## 🚨 PUNTOS DE CONTROL

### **🔍 Checkpoint Semana 1**

**Criterio GO/NO-GO:**

- Schema compila sin errores ✅
- Migraciones se ejecutan exitosamente ✅
- Tests básicos pasan ✅

### **🔍 Checkpoint Semana 2**

**Criterio GO/NO-GO:**

- Datos migrados íntegramente ✅
- Validación 100% exitosa ✅
- Rollback plan probado ✅

### **🔍 Checkpoint Semana 3**

**Criterio GO/NO-GO:**

- Middleware funciona perfectamente ✅
- Aislamiento de tenants validado ✅
- Performance mantenido ✅

---

## ⚡ COMANDOS ÚTILES

### **Desarrollo:**

```bash
# Generar migración
npx prisma migrate dev --name "descriptive-name"

# Reset database (DEV only)
npx prisma migrate reset

# Ver estado migrations
npx prisma migrate status

# Generar client
npx prisma generate
```

### **Testing:**

```bash
# Tests específicos de multi-tenancy
npm run test -- --grep "multi-tenant"

# Tests de migración
npm run test:migration

# Performance tests
npm run test:performance
```

---

## 📞 PUNTOS DE ESCALACIÓN

### **🚨 Si algo sale mal:**

1. **Stop**: Parar el proceso inmediatamente
2. **Assess**: Evaluar impacto y causa raíz
3. **Rollback**: Usar plan de rollback si es necesario
4. **Document**: Documentar incident y lessons learned
5. **Plan**: Re-planificar approach si es requerido

---

## 🎯 ENTREGABLES FASE 1

- [ ] **Schema Prisma** actualizado y funcionando
- [ ] **Scripts de migración** probados y documentados
- [ ] **Middleware de seguridad** implementado
- [ ] **Tests de aislamiento** funcionando
- [ ] **Documentación técnica** completa
- [ ] **Plan de rollback** validado

---

**🚀 READY PARA FASE 2**: Una vez completados todos los checkboxes anteriores, podemos proceder con **Middleware y Seguridad** donde implementaremos autenticación multi-tenant y features avanzadas de seguridad.

**¿Comenzamos con el Día 1 - Análisis de tablas existentes?**
