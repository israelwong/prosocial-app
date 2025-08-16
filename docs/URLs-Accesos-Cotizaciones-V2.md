# URLs y Accesos - Sistema de Cotizaciones V2

**Fecha:** 16 de agosto de 2025  
**Estructura:** Mobile-first con diseño optimizado  
**Estado:** Implementado y listo para testing

## 📱 **Nuevas URLs Principales**

### 1. **Lista de Cotizaciones por Evento**

```
/evento/[eventoId]
```

**Comportamiento:**

- 0 cotizaciones → Mensaje "Sin cotizaciones" + WhatsApp
- 1 cotización → Redirección automática a detalle
- 2+ cotizaciones → Lista mobile-optimizada
- Evento contratado → Redirección a `/cliente/login`

**Ejemplo:**

```
https://localhost:3000/evento/abc123
```

### 2. **Detalle de Cotización Específica**

```
/evento/[eventoId]/cotizacion/[cotizacionId]
```

**Parámetros opcionales:**

- `?realtime=true` - Modo tiempo real
- `?admin=true` - Vista de administrador
- `?legacy=true` - Acceso desde URL legacy

**Ejemplos:**

```
https://localhost:3000/evento/abc123/cotizacion/xyz789
https://localhost:3000/evento/abc123/cotizacion/xyz789?realtime=true
https://localhost:3000/evento/abc123/cotizacion/xyz789?realtime=true&admin=true
```

### 3. **Sesión de Presentación Ejecutiva**

```
/evento/[eventoId]/session
```

**Parámetros:**

- `?admin=true` - Panel de administración (40 min timer)
- `?prospecto=true` - Vista de prospecto (tiempo real)
- `?cotizacionId=xyz` - Cotización específica en sesión

**Ejemplos:**

```
https://localhost:3000/evento/abc123/session?admin=true
https://localhost:3000/evento/abc123/session?prospecto=true
https://localhost:3000/evento/abc123/session?prospecto=true&cotizacionId=xyz789
```

### 4. **Acceso de Clientes**

```
/cliente/login
```

**Funcionalidad:**

- Login con email + código de evento
- Redirección a dashboard de clientes
- Validación de eventos contratados

**Ejemplo:**

```
https://localhost:3000/cliente/login
```

### 5. **URLs Legacy (Compatibilidad)**

```
/cotizacion/[cotizacionId]
```

**Comportamiento:**

- Redirección automática a nueva estructura
- Mantiene parámetro `?legacy=true`
- Fallback al componente original en caso de error

**Ejemplo:**

```
https://localhost:3000/cotizacion/xyz789
→ Redirecciona a: /evento/abc123/cotizacion/xyz789?legacy=true
```

## 🎯 **Flujos de Usuario**

### Flujo Prospecto (Sesión de Presentación)

```
1. Negocio comparte: /evento/abc123/session?prospecto=true
2. Prospecto ve pantalla de espera
3. Negocio inicia desde: /evento/abc123/session?admin=true
4. Prospecto ve cotización crearse en tiempo real
5. Al finalizar: acceso a /evento/abc123/cotizacion/xyz789 para pago
```

### Flujo Cliente Estándar

```
1. Cliente recibe: /evento/abc123
2. Ve lista de cotizaciones disponibles
3. Selecciona: /evento/abc123/cotizacion/xyz789
4. Procede al pago si está aprobada
```

### Flujo Cliente Contratado

```
1. Cliente intenta accesar cualquier URL de evento
2. Sistema detecta evento contratado
3. Redirección automática a: /cliente/login
4. Login exitoso → Dashboard de eventos contratados
```

## 📱 **Características Mobile-First**

### Lista de Cotizaciones

- **Header fijo** con información del evento
- **Cards compactas** con información esencial
- **Estados visuales** con iconos y colores
- **Botones prominentes** para acciones principales
- **WhatsApp integrado** para contacto directo

### Detalle de Cotización

- **Header fijo** con navegación
- **Footer fijo** con resumen de precio y acciones
- **Contenido scrolleable** entre header y footer
- **Indicadores de tiempo real** cuando aplica
- **Botones de acción** optimizados para pulgar

### Sesión de Tiempo Real

- **Timer de 40 minutos** visible para admin
- **Indicador de conexión** en tiempo real
- **Animaciones suaves** para nuevos elementos
- **Panel de control** simplificado para admin
- **Vista de prospecto** enfocada en observación

## 🔧 **Parámetros de URL**

### Parámetros de Control

```typescript
// Tiempo real
?realtime=true          // Activa suscripción Supabase
?admin=true             // Vista de administrador
?prospecto=true         // Vista de prospecto
?legacy=true            // Acceso desde URL legacy

// Datos
?cotizacionId=xyz789    // ID de cotización específica
?eventosId=abc,def      // IDs de eventos (para dashboard cliente)
```

### Estados de Validación

```typescript
// Evento
if (evento.status === 'contratado') → /cliente/login
if (!evento) → /404

// Cotización
if (cotizacion.eventoId !== eventoId) → /404
if (estaExpirada) → Mostrar mensaje de expiración
if (fechaOcupada) → Mostrar mensaje de fecha ocupada
```

## 🚀 **URLs de Testing Local**

### Desarrollo

```bash
# Base
http://localhost:3000

# Eventos (reemplazar con IDs reales)
http://localhost:3000/evento/[eventoId]
http://localhost:3000/evento/[eventoId]/cotizacion/[cotizacionId]
http://localhost:3000/evento/[eventoId]/session

# Clientes
http://localhost:3000/cliente/login

# Legacy
http://localhost:3000/cotizacion/[cotizacionId]
```

### Casos de Prueba

```bash
# Sin cotizaciones
http://localhost:3000/evento/evento-sin-cotizaciones

# Una cotización (redirección automática)
http://localhost:3000/evento/evento-una-cotizacion

# Múltiples cotizaciones
http://localhost:3000/evento/evento-multiples-cotizaciones

# Evento contratado (redirección a login)
http://localhost:3000/evento/evento-contratado

# Sesión de admin
http://localhost:3000/evento/abc123/session?admin=true

# Sesión de prospecto
http://localhost:3000/evento/abc123/session?prospecto=true
```

## 📋 **Checklist de Testing**

### URLs Básicas

- [ ] `/evento/[eventoId]` - Lista de cotizaciones
- [ ] `/evento/[eventoId]/cotizacion/[cotizacionId]` - Detalle
- [ ] `/evento/[eventoId]/session` - Sesión ejecutiva
- [ ] `/cliente/login` - Acceso de clientes
- [ ] `/cotizacion/[cotizacionId]` - Legacy (redirección)

### Responsive Design

- [ ] Navegación móvil fluida
- [ ] Headers y footers fijos funcionan
- [ ] Cards se adaptan a pantalla
- [ ] Botones tienen tamaño adecuado para touch
- [ ] Texto legible en móvil

### Tiempo Real

- [ ] Conexión Supabase exitosa
- [ ] Indicadores visuales funcionan
- [ ] Actualizaciones automáticas
- [ ] Reconexión tras desconexión
- [ ] Timer de 40 minutos

### Estados y Validaciones

- [ ] Evento sin cotizaciones
- [ ] Evento con una cotización
- [ ] Evento con múltiples cotizaciones
- [ ] Evento contratado
- [ ] Cotización expirada
- [ ] Fecha ocupada

## 🔗 **Próximos Desarrollos**

1. **Dashboard de Clientes** (`/cliente/dashboard`)
2. **Panel de Administración** para sesiones ejecutivas
3. **APIs de Servicios/Costos** para tiempo real
4. **Notificaciones Push** para actualizaciones
5. **Analytics** de sesiones y conversiones
