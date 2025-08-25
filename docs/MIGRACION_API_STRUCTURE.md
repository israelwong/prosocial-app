# 📋 Plan de Migración y Limpieza de APIs

## ✅ COMPLETADO:

- [x] Crear estructura /app/api/cotizacion/payments/
- [x] Migrar create-payment-intent a App Router
- [x] Migrar cancel-payment-intent a App Router
- [x] Actualizar CotizacionDetalle.tsx para usar nuevos endpoints
- [x] Verificar funcionamiento

## 🧹 LIMPIEZA PENDIENTE (Después de validar):

### Archivos a eliminar:

- [ ] /pages/api/checkout/create-payment-intent.js (viejo)
- [ ] /pages/api/checkout/cancel-payment-intent.js (viejo)
- [ ] /pages/api/checkout/create-payment-intent-v2.js (duplicado)

### Archivos a mantener:

- [x] /pages/api/checkout/create-session.js (legacy, puede ser útil)
- [x] /pages/api/webhooks/ (webhooks de Stripe)
- [x] /app/api/cliente/ (sistema de clientes)

## 🎯 VENTAJAS DE LA NUEVA ESTRUCTURA:

1. **Separación clara por dominio**
   - /api/cliente/ → Todo lo relacionado con clientes
   - /api/cotizacion/ → Todo lo relacionado con cotizaciones

2. **App Router (más moderno)**
   - TypeScript nativo
   - Mejor performance
   - Sintaxis más clara

3. **Escalabilidad**
   - Fácil agregar nuevas funcionalidades
   - Estructura predecible
   - Mantenimiento separado

4. **Consistencia**
   - Misma lógica, mejor organización
   - Patrones repetibles
   - Documentación clara

## 📊 ANTES vs DESPUÉS:

### ANTES:

```
❌ pages/api/checkout/create-payment-intent.js (cotizaciones)
❌ app/api/cliente/create-payment-intent/ (clientes)
❌ Mezclado en /checkout/ genérico
```

### DESPUÉS:

```
✅ app/api/cotizacion/payments/create-payment-intent/ (cotizaciones)
✅ app/api/cliente/create-payment-intent/ (clientes)
✅ Clara separación por dominio
```
