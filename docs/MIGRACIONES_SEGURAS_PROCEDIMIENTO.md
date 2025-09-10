# 🛡️ Procedimiento Seguro para Migraciones de Base de Datos

## 📋 Resumen Ejecutivo

Este documento establece el procedimiento estándar para aplicar migraciones de Prisma sin pérdida de datos, basado en la resolución exitosa del schema drift realizada el 10 de septiembre de 2025.

## ⚠️ Cuándo usar este procedimiento

- Error: "mismatch between server and client bindings for postgres changes"
- Error: "relation already exists" en migraciones
- Drift detectado entre schema local y base de datos
- Migraciones pendientes en producción

## 🔄 Procedimiento Estándar (Probado y Seguro)

### **Paso 1: Verificar Estado Actual**

```bash
# Verificar migraciones pendientes
npx prisma migrate status
```

### **Paso 2: Sincronizar Schema Local**

```bash
# Actualizar schema local con estado real de la BD
npx prisma db pull
```

**✅ Resultado esperado:** Schema actualizado sin errores

### **Paso 3: Generar Cliente Actualizado**

```bash
# Regenerar cliente Prisma con schema sincronizado
npx prisma generate
```

**✅ Resultado esperado:** Cliente generado exitosamente

### **Paso 4: Resolver Migraciones Conflictivas**

```bash
# Marcar migraciones como aplicadas (una por una)
npx prisma migrate resolve --applied NOMBRE_MIGRACION_1
npx prisma migrate resolve --applied NOMBRE_MIGRACION_2
npx prisma migrate resolve --applied NOMBRE_MIGRACION_N
```

**✅ Resultado esperado:** Cada migración marcada como aplicada

### **Paso 5: Confirmar Sincronización**

```bash
# Verificar que no hay drift
npx prisma migrate status
```

**✅ Resultado esperado:** "Database schema is up to date!"

### **Paso 6: Validar Compilación**

```bash
# Verificar que todo compila correctamente
npm run build
```

**✅ Resultado esperado:** Build exitoso sin errores

## 🚨 Qué NO hacer

❌ **NO usar `prisma migrate reset`** - Borra todos los datos
❌ **NO usar `prisma migrate dev`** cuando hay drift - Puede fallar
❌ **NO aplicar migraciones** sin verificar el estado actual
❌ **NO ignorar** los errores de drift - Pueden causar problemas mayores

## 📊 Caso de Estudio - Septiembre 2025

### Problema Inicial

- Error: "mismatch between server and client bindings"
- 3 migraciones pendientes
- Schema drift detectado
- Realtime deshabilitado temporalmente

### Aplicación del Procedimiento

```bash
# 1. Estado inicial
npx prisma migrate status
# → 3 migrations pending

# 2. Sincronización
npx prisma db pull
# → ✔ Introspected 44 models and wrote them into prisma/schema.prisma

# 3. Generación
npx prisma generate
# → ✔ Generated Prisma Client

# 4. Resolución
npx prisma migrate resolve --applied 20250824024043_add_comision_stripe_to_pagos
npx prisma migrate resolve --applied 20250824024410_add_comision_stripe_to_payments
npx prisma migrate resolve --applied 20250827195240_add_solicitud_paquete_model

# 5. Verificación
npx prisma migrate status
# → Database schema is up to date!
```

### Resultado

- ✅ Cero pérdida de datos
- ✅ Schema sincronizado
- ✅ Realtime restaurado
- ✅ Build exitoso
- ✅ Todas las funcionalidades operativas

## 🔍 Diagnóstico de Problemas

### Error: "relation already exists"

**Causa:** La tabla ya existe en la BD pero la migración intenta crearla
**Solución:** Usar `migrate resolve --applied` para marcarla como aplicada

### Error: "drift detected"

**Causa:** Cambios aplicados directamente en BD fuera de migraciones
**Solución:** Seguir el procedimiento completo desde el paso 1

### Error: "mismatch in realtime"

**Causa:** Schema local desactualizado vs BD real
**Solución:** `db pull` + `generate` + resolver migraciones

## 📈 Ventajas de este Procedimiento

1. **Seguridad de Datos:** Cero riesgo de pérdida
2. **Reversibilidad:** Proceso no destructivo
3. **Validación:** Cada paso tiene verificación
4. **Eficiencia:** Tiempo mínimo de inactividad
5. **Simplicidad:** Comandos claros y directos

## 🔧 Herramientas de Respaldo

### Backups Automáticos Supabase

- Backups diarios automáticos
- Point-in-time recovery disponible
- Acceso via Dashboard → Database → Backups

### Comandos de Emergencia

```bash
# Si algo sale mal, verificar conexión
npx prisma db pull --force

# Limpiar cliente corrupto
rm -rf node_modules/.prisma
npm install
npx prisma generate
```

## 📝 Checklist Pre-Migración

- [ ] Verificar que hay backup reciente (< 24hrs)
- [ ] Confirmar que no hay usuarios activos críticos
- [ ] Revisar el contenido de migraciones pendientes
- [ ] Tener acceso a Supabase Dashboard
- [ ] Rama de desarrollo actualizada y pusheada

## 📞 Escalación

Si el procedimiento falla:

1. **NO continuar** con comandos destructivos
2. Documentar el error exacto
3. Verificar estado de backup más reciente
4. Considerar Point-in-time recovery si es necesario

## 📅 Historial de Aplicación

| Fecha      | Proyecto         | Resultado  | Notas                                              |
| ---------- | ---------------- | ---------- | -------------------------------------------------- |
| 2025-09-10 | ProSocial v1.9.1 | ✅ Exitoso | Resuelto drift + 3 migraciones. Cero pérdida datos |

---

**Documentado por:** Sistema de IA - GitHub Copilot  
**Fecha:** 10 de septiembre de 2025  
**Proyecto:** ProSocial Platform v1.9.1  
**Estado:** Procedimiento validado y probado
