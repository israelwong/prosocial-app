# 🎯 PLAN DE MIGRACIÓN SEGURO \_lib → \_lib/actions

## 📈 PROGRESO ACTUAL

- ✅ **Análisis completado**: 24 archivos .actions.ts identificados
- ✅ **Conflictos mapeados**: 10 conflictos de nombres identificados
- ✅ **Archivos obsoletos detectados**: 2 archivos con @deprecated

## 🟢 FASE 1: ARCHIVOS SEGUROS (SIN CONFLICTOS)

### MOVIMIENTO INMEDIATO - 14 ARCHIVOS

Estos pueden moverse sin riesgo porque no tienen conflictos de nombres:

```bash
# Crear directorios y mover archivos seguros
mkdir -p app/admin/_lib/actions/EventoBitacora
mkdir -p app/admin/_lib/actions/EventoEtapa
mkdir -p app/admin/_lib/actions/User
mkdir -p app/admin/_lib/actions/agendaTipos
mkdir -p app/admin/_lib/actions/autorizarCotizacion
mkdir -p app/admin/_lib/actions/cliente
mkdir -p app/admin/_lib/actions/conteo
mkdir -p app/admin/_lib/actions/correo
mkdir -p app/admin/_lib/actions/cotizacionCongelada
mkdir -p app/admin/_lib/actions/cotizacionVisita
mkdir -p app/admin/_lib/actions/gastos
mkdir -p app/admin/_lib/actions/notificacion
mkdir -p app/admin/_lib/actions/pago
mkdir -p app/admin/_lib/actions/servicio
```

## 🟡 FASE 2: ARCHIVOS OBSOLETOS (LIMPIEZA)

### ELIMINACIÓN SEGURA - 2 ARCHIVOS

Estos están marcados como @deprecated y pueden eliminarse:

1. **autorizarCotizacion.actions.ts** - Migrado a actions/cotizacion/
2. **cotizacion.actions.ts** - Funciones comentadas/migradas

## 🔴 FASE 3: RESOLUCIÓN DE CONFLICTOS

### ANÁLISIS DETALLADO REQUERIDO - 10 ARCHIVOS

#### 🔍 PRIORIDAD ALTA (Archivos grandes/complejos):

1. **evento.actions.ts** (563 líneas) vs **actions/evento/**
2. **cotizacion.actions.ts** (691 líneas - OBSOLETO) vs **actions/cotizacion/**
3. **agenda.actions.ts** (210 líneas) vs **actions/agenda/**

#### 🔍 PRIORIDAD MEDIA:

4. **paquete.actions.ts** (155 líneas) vs **actions/paquete/**
5. **condicionesComerciales.actions.ts** (140 líneas) vs **actions/condicionesComerciales/**
6. **categorias.actions.ts** (99 líneas) vs **actions/categorias/**

#### 🔍 PRIORIDAD BAJA (Archivos pequeños):

7. **metodoPago.actions.ts** (71 líneas) vs **actions/metodoPago/**
8. **configuracion.actions.ts** (65 líneas) vs **actions/configuracion/**
9. **eventoTipo.actions.ts** (49 líneas) vs **actions/eventoTipo/**
10. **canal.actions.ts** (0 líneas - VACÍO) vs **actions/canal/**

## 🛠️ ESTRATEGIAS POR CONFLICTO

### A. **MERGE**: Combinar funciones complementarias

- Si ambos tienen funciones únicas y útiles

### B. **REPLACE**: Reemplazar versión obsoleta

- Si una versión es claramente mejor/más actualizada

### C. **RENAME**: Renombrar para evitar conflicto

- Si ambos son necesarios pero diferentes

### D. **DELETE**: Eliminar versión obsoleta

- Si una está marcada como deprecated

## ⚡ EJECUCIÓN RECOMENDADA

### PASO 1: Empezar con Fase 1 (Seguros)

- Riesgo: **MÍNIMO** ✅
- Tiempo: **15 minutos**
- Impacto: **14 archivos organizados**

### PASO 2: Limpiar obsoletos (Fase 2)

- Riesgo: **BAJO** ✅
- Tiempo: **10 minutos**
- Impacto: **-2 archivos innecesarios**

### PASO 3: Resolver conflictos uno por uno (Fase 3)

- Riesgo: **CONTROLADO** ⚠️
- Tiempo: **30-60 minutos**
- Impacto: **Estructura limpia y organizada**

## 🎯 BENEFICIOS ESPERADOS

- **Estructura consistente**: Todo en \_lib/actions/
- **Menos confusión**: Elimina archivos duplicados
- **Mejor mantenibilidad**: Organización por dominio
- **Imports más claros**: Rutas predecibles

¿Procedemos con la **Fase 1** para empezar con los movimientos seguros?
