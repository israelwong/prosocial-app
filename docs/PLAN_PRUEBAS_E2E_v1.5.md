# 🧪 Plan de Pruebas de Extremo a Extremo (E2E) - v1.5

## 📅 Fecha: 30 de agosto de 2025
## 🎯 Objetivo: Validar todo el flujo completo del sistema ProSocial

## 🔄 Flujo Completo a Probar

### 1. **ADMINISTRADOR - Creación y Gestión**
- ✅ Crear cotización desde cero
- ✅ Crear cotización desde paquete base
- ✅ Editar cotización existente (con sistema de análisis inteligente)
- ✅ Autorizar cotización
- ✅ Compartir cotización con cliente

### 2. **CLIENTE - Portal y Pagos**
- ✅ Recibir link de cotización
- ✅ Ver cotización en portal cliente
- ✅ Aceptar/rechazar cotización
- ✅ Realizar pago inicial/reserva
- ✅ Acceder al portal del cliente
- ✅ Realizar abonos adicionales desde portal

### 3. **SEGUIMIENTO Y GESTIÓN**
- ✅ Ver evento en seguimiento
- ✅ Gestionar pagos desde admin
- ✅ Actualizar estado del evento
- ✅ Navegación completa entre secciones

---

## 🗂️ Casos de Prueba Específicos

### **CASO 1: Cotización Nueva desde Cero**
```
ADMIN → Eventos → Nuevo Evento → Cotización Nueva
- Agregar servicios manualmente
- Personalizar precios
- Agregar costos adicionales
- Guardar cotización
- ✅ Verificar navegación con router.back()
```

### **CASO 2: Cotización desde Paquete Base**
```
ADMIN → Eventos → Nuevo Evento → Cotización desde Paquete
- Seleccionar paquete XV Años/Boda
- Modificar servicios del paquete
- ✅ Verificar precio automático se actualice
- Personalizar precio total
- ✅ Verificar sistema de análisis inteligente
```

### **CASO 3: Edición de Cotización (NUEVO)**
```
ADMIN → Seguimiento/Eventos → Editar Cotización
- ✅ Modificar servicios y verificar protección de margen
- ✅ Cambiar precio manualmente y ver análisis M/U/EST
- ✅ Verificar warnings en tiempo real
- ✅ Guardar y verificar router.back()
```

### **CASO 4: Autorización y Compartir**
```
ADMIN → Autorizar Cotización → Compartir
- Autorizar cotización
- Generar link público
- Verificar que el link funcione
- Verificar estado "autorizada"
```

### **CASO 5: Portal Cliente - Primera Vista**
```
CLIENTE → Link de Cotización
- Ver detalles de cotización
- Ver servicios incluidos
- Ver precios claros
- Botones de acción visibles
```

### **CASO 6: Proceso de Pago Inicial**
```
CLIENTE → Aceptar Cotización → Pago
- Aceptar cotización
- Seleccionar método de pago
- Realizar pago inicial/anticipo
- Confirmar pago exitoso
- ✅ Verificar creación de acceso al portal
```

### **CASO 7: Portal Cliente - Acceso y Abonos**
```
CLIENTE → Portal del Cliente
- Acceder con credenciales
- Ver estado del evento
- Ver balance pendiente
- Realizar abono adicional
- Ver historial de pagos
```

### **CASO 8: Administración de Seguimiento**
```
ADMIN → Seguimiento
- Ver evento autorizado
- Gestionar pagos
- Ver historial completo
- Actualizar estado del evento
- ✅ Verificar navegación entre secciones
```

---

## 🔍 Puntos Críticos a Validar

### **Navegación (NUEVAS MEJORAS)**
- [ ] Botón "Cancelar" en formularios usa `router.back()`
- [ ] Guardar en modo edición regresa a pantalla anterior
- [ ] Funciona desde seguimiento y desde eventos
- [ ] Timeouts de navegación respetan mensajes de éxito

### **Sistema de Análisis Inteligente (NUEVO)**
- [ ] Análisis discreto M/U/EST se muestra en modo edición
- [ ] Protección de margen funciona (≤5% o ≤$1000 Y ≥25%)
- [ ] Warnings en tiempo real mientras se edita precio
- [ ] Estados visuales correctos: OK/RISK/MANUAL
- [ ] Tooltip con información detallada

### **Flujos de Pago Críticos**
- [ ] Stripe funciona correctamente
- [ ] PayPal funciona correctamente
- [ ] Pagos en efectivo se registran
- [ ] MSI (Meses Sin Intereses) funciona
- [ ] Balance se actualiza correctamente

### **Portal del Cliente**
- [ ] Autenticación funciona
- [ ] Vista de cotización es clara
- [ ] Pagos se procesan correctamente
- [ ] Historial es preciso
- [ ] Responsive en móvil

### **Estados y Notificaciones**
- [ ] Estados de cotización se actualizan
- [ ] Estados de evento son correctos
- [ ] Emails de notificación se envían
- [ ] Toasts y mensajes son apropiados

---

## 🚀 Plan de Ejecución

### **Fase 1: Preparación (30 min)**
- [ ] Revisar datos de prueba
- [ ] Configurar métodos de pago en sandbox
- [ ] Preparar navegadores y dispositivos

### **Fase 2: Flujo Administrador (45 min)**
- [ ] Ejecutar CASOS 1, 2, 3, 4
- [ ] Documentar cualquier issue encontrado
- [ ] Verificar nuevas funcionalidades

### **Fase 3: Flujo Cliente (30 min)**
- [ ] Ejecutar CASOS 5, 6, 7
- [ ] Probar en móvil y desktop
- [ ] Verificar UX completa

### **Fase 4: Seguimiento Admin (15 min)**
- [ ] Ejecutar CASO 8
- [ ] Verificar consistencia de datos
- [ ] Validar reportes

### **Fase 5: Casos Edge (30 min)**
- [ ] Probar con datos límite
- [ ] Verificar manejo de errores
- [ ] Probar conexión lenta

---

## 📊 Criterios de Éxito

### **✅ PASS: Todo funciona perfectamente**
- Todos los flujos completan sin errores
- Navegación mejorada funciona correctamente
- Sistema de análisis inteligente opera como esperado
- Experiencia de usuario es fluida

### **⚠️ MINOR: Problemas menores**
- Funcionalidad core funciona
- Issues menores de UX o cosmético
- Requiere ajustes pequeños

### **❌ FAIL: Problemas críticos**
- Funcionalidad core rota
- Pagos no funcionan
- Navegación rota
- Requiere fixes importantes

---

## 🐛 Tracking de Issues

### **Issues Encontrados**
| # | Severidad | Descripción | Estado | Asignado |
|---|-----------|-------------|--------|----------|
|   |           |             |        |          |

### **Mejoras Identificadas**
| # | Prioridad | Descripción | Estado | Asignado |
|---|-----------|-------------|--------|----------|
|   |           |             |        |          |

---

## 📝 Notas de Desarrollo

- **Rama actual**: v-1.5 (para pruebas y ajustes)
- **Rama estable**: v-1.4 (respaldo intacto)
- **Próximos pasos**: Según resultados de pruebas

---

## 🔗 Enlaces Útiles

- **Admin Dashboard**: http://localhost:3000/admin/dashboard
- **Portal Cliente**: http://localhost:3000/cliente/[clienteId]
- **Cotización Pública**: http://localhost:3000/cotizacion/[cotizacionId]
- **GitHub Branch**: https://github.com/israelwong/prosocial-app/tree/v-1.5

---

**🎯 Meta**: Tener un sistema robusto y completamente funcional listo para producción.
