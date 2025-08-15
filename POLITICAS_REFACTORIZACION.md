# 🔧 POLÍTICAS DE REFACTORIZACIÓN - PROSOCIAL APP

## 📋 PLAN GENERAL

### Objetivo Principal

Refactorizar el sistema completo sección por sección, implementando una arquitectura limpia con separación clara de responsabilidades usando actions y schemas estructurados.

---

## 🚀 METODOLOGÍA DE TRABAJO

### 1. **Proceso por Secciones**

- ✅ Revisar y refactorizar **una sección a la vez**
- ✅ Analizar componentes principales y subcomponentes de cada sección
- ✅ Cuando una sección esté **completamente funcional** → hacer commit
- ✅ Al finalizar toda una sección → **preguntar antes de hacer commit**

### 2. **Estructura de Actions y Schemas**

#### 📁 Ubicación de Actions Existentes

```
@/app/admin/_lib/
├── archivo.actions.ts (mantener como referencia)
└── types.ts
```

#### 📁 Nueva Estructura (Target)

```
@/app/admin/_lib/actions/
├── carpetanombre/
│   ├── nombre.actions.ts
│   └── nombre.schemas.ts
└── ...
```

#### 🔄 Política de Migración

- **SI** existen actions en `@/app/admin/_lib/` → crear versión nueva en `@/app/admin/_lib/actions/`
- **CONSERVAR** lógica existente usable
- **AGREGAR** nuevas funciones al final para client components
- **NO MODIFICAR** funciones existentes (evitar breaking changes)

---

## 📐 REGLAS DE REFACTORIZACIÓN

### ✅ **DO (Hacer)**

1. **Usar exclusivamente** la nueva estructura de actions y schemas
2. **Analizar dependencias** antes de refactorizar
3. **Mantener funcionalidad existente** mientras se migra
4. **Documentar cambios** en cada commit
5. **Probar funcionalidad** antes de hacer commit

### ❌ **DON'T (No Hacer)**

1. **NO modificar** funciones existentes que otros componentes usan
2. **NO eliminar** actions existentes hasta verificar que no se usan
3. **NO hacer commits** de secciones incompletas
4. **NO refactorizar** múltiples secciones simultáneamente

---

## 🎯 OBJETIVO FINAL

Al terminar todas las refactorizaciones:

- ✅ **100% Nueva estructura** de actions y schemas
- ✅ **Separación clara** de responsabilidades
- ✅ **Código mantenible** y escalable
- ✅ **Zero breaking changes** en funcionalidad existente

---

## 📊 PROCESO DE COMMIT

### Antes del Commit

1. ✅ Sección completamente funcional
2. ✅ Todas las funciones probadas
3. ✅ No hay errores de TypeScript
4. ✅ No hay breaking changes

### Mensaje de Commit

```
🔧 REFACTOR: [SECCIÓN] - [Descripción breve]

- Migrado a nueva estructura actions/schemas
- Funcionalidad preservada
- [Detalles específicos]
```

### Después del Commit

- ✅ Confirmar que todo sigue funcionando
- ✅ Continuar con siguiente sección

---

## 🗂️ ORGANIZACIÓN DE DOCUMENTACIÓN

### Carpeta `documentacion/` (ignorada en git)

Todos los archivos .md de planificación y documentación se han movido a:

```
documentacion/
├── REFACTORING_PLAN.md
├── GUIA_ESTILOS.md
├── NEXTJS_PARAMS_FIX.md
├── BITACORA_PROYECTO.md
└── DIRECTRICES_ACTIONS_SCHEMAS.md
```

### .gitignore

```
documentacion/
```

---

_Creado: 15 de agosto de 2025_  
_Proyecto: Prosocial App - Refactorización v2_
