# Plan de Pruebas - Nueva Estructura de Cotizaciones

**Fecha:** 16 de agosto de 2025  
**Sistema:** Estructura de cotizaciones V2 con tiempo real  
**Estado:** En desarrollo - Fase 1 completada

## 🧪 **Casos de Prueba**

### 1. **Redirección Legacy**
**Objetivo:** Verificar que las URLs legacy redirigen correctamente

**Casos:**
- [ ] `/cotizacion/[cotizacionId]` → `/evento/cotizacion/[eventoId]/cotizacion/[cotizacionId]?legacy=true`
- [ ] Cotización inexistente → 404
- [ ] Cotización sin eventoId → Fallback a componente legacy

**URLs de prueba:**
```
http://localhost:3000/cotizacion/ejemplo123
http://localhost:3000/cotizacion/invalid-id
```

### 2. **Lista de Cotizaciones por Evento**
**Objetivo:** Validar comportamiento según número de cotizaciones

**Casos:**
- [ ] 0 cotizaciones → Mensaje "Sin cotizaciones disponibles"
- [ ] 1 cotización → Redirección automática a detalle
- [ ] 2+ cotizaciones → Lista de cotizaciones
- [ ] Evento contratado → Redirección a `/cliente/login`

**URLs de prueba:**
```
http://localhost:3000/evento/cotizacion/[eventoId-sin-cotizaciones]
http://localhost:3000/evento/cotizacion/[eventoId-una-cotizacion]
http://localhost:3000/evento/cotizacion/[eventoId-multiples-cotizaciones]
http://localhost:3000/evento/cotizacion/[eventoId-contratado]
```

### 3. **Detalle de Cotización**
**Objetivo:** Validar estados y funcionalidades del detalle

**Estados a probar:**
- [ ] Cotización pendiente
- [ ] Cotización aprobada (puede pagar)
- [ ] Cotización expirada
- [ ] Fecha ocupada
- [ ] Evento contratado

**Funcionalidades:**
- [ ] Botón "Proceder al pago" (solo si aprobada y disponible)
- [ ] Botón WhatsApp
- [ ] Información de servicios y costos
- [ ] Cálculo correcto de totales

### 4. **Tiempo Real (Supabase)**
**Objetivo:** Validar funcionalidad de tiempo real

**Casos:**
- [ ] Conexión inicial exitosa
- [ ] Actualización automática al cambiar cotización
- [ ] Actualización automática al agregar servicios
- [ ] Actualización automática al modificar costos
- [ ] Reconexión automática tras desconexión
- [ ] Indicador visual de estado de conexión

**URLs de prueba:**
```
http://localhost:3000/evento/cotizacion/[eventoId]/cotizacion/[cotizacionId]?realtime=true
http://localhost:3000/evento/cotizacion/[eventoId]/cotizacion/[cotizacionId]?realtime=true&admin=true
```

### 5. **Login de Clientes**
**Objetivo:** Validar acceso de clientes

**Casos:**
- [ ] Email válido + código correcto → Dashboard
- [ ] Email inválido → Error
- [ ] Código incorrecto → Error
- [ ] Cliente sin eventos contratados → Error
- [ ] Campos vacíos → Error de validación

**URL de prueba:**
```
http://localhost:3000/cliente/login
```

**Datos de prueba:**
```
Email: cliente@test.com
Código: DEMO2024
```

### 6. **API Routes**
**Objetivo:** Validar endpoints de API

**Endpoints:**
- [ ] `POST /api/cliente/login` - Login de clientes
- [ ] `POST /api/checkout/create-session` - Crear sesión de pago (existente)

## 📊 **Estado de Implementación**

### ✅ **Completado**
- [x] Estructura base de directorios
- [x] Configuración Supabase Realtime
- [x] Componente `EstadoDisponibilidad`
- [x] Componente `ListaCotizaciones`
- [x] Componente `CotizacionDetalle`
- [x] Página login de clientes
- [x] API route para login de clientes
- [x] Redirección legacy
- [x] Documentación completa

### ⏳ **Pendiente**
- [ ] Dashboard de clientes (`/cliente/dashboard`)
- [ ] Sesión de tiempo real para administradores
- [ ] Integración completa con Stripe
- [ ] Carga de servicios y costos en tiempo real
- [ ] Testing en navegadores
- [ ] Optimización móvil
- [ ] Variables de entorno para producción

### 🔧 **Ajustes Necesarios**

#### 1. **Base de Datos**
- Agregar campo `codigo_acceso` a tabla `Cliente` para generar códigos únicos
- Considerar agregar tabla `ClienteSesion` para manejar sesiones
- Evaluar agregar estado `en_sesion` a cotizaciones

#### 2. **Configuración**
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
STRIPE_SECRET_KEY=tu_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=tu_stripe_public_key
```

#### 3. **Seguridad**
- Validar permisos de acceso a cotizaciones
- Implementar rate limiting en APIs
- Sanitizar inputs de formularios
- Logs de auditoría para accesos

## 🚀 **Próximos Pasos**

### Prioridad Alta (1-2 días)
1. **Dashboard de Clientes**
   - Lista de eventos contratados
   - Estado de cada evento
   - Información de contacto

2. **Testing Básico**
   - Probar todos los flujos principales
   - Verificar redirecciones
   - Validar tiempo real

### Prioridad Media (3-5 días)
1. **Sesión de Administrador**
   - Interfaz para crear/editar cotizaciones en tiempo real
   - Panel de control durante sesiones de 40 min

2. **Optimizaciones**
   - Performance de queries
   - Caching de componentes
   - Optimización móvil

### Prioridad Baja (1-2 semanas)
1. **Funcionalidades Avanzadas**
   - Notificaciones push
   - Historial de cambios
   - Analytics de sesiones

## 📝 **Notas de Desarrollo**

### Comandos Útiles
```bash
# Desarrollo
npm run dev

# Generar tipos de Prisma
npx prisma generate

# Migrar base de datos
npx prisma migrate dev

# Ver base de datos
npx prisma studio
```

### URLs de Testing Local
```
Base: http://localhost:3000

Legacy: /cotizacion/[cotizacionId]
Evento: /evento/cotizacion/[eventoId]
Detalle: /evento/cotizacion/[eventoId]/cotizacion/[cotizacionId]
Tiempo real: ?realtime=true&admin=true
Cliente: /cliente/login
```

### Logs Importantes
- Conexiones Supabase Realtime
- Errores de redirección
- Intentos de login fallidos
- Transacciones de pago
