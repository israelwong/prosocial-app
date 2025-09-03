# 🔍 ANÁLISIS DE CONFLICTOS \_lib vs \_lib/actions

## 📊 RESUMEN EJECUTIVO

- **Archivos .actions.ts en \_lib/ (root)**: 24 archivos
- **Directorios en \_lib/actions/**: 27 directorios
- **Conflictos identificados**: 10 nombres duplicados

## ⚠️ CONFLICTOS CRÍTICOS IDENTIFICADOS

Los siguientes nombres existen tanto como archivo en `_lib/` como directorio en `_lib/actions/`:

### 🔴 **CONFLICTOS DE NOMBRES:**

1. **agenda** - `agenda.actions.ts` vs `actions/agenda/`
2. **canal** - `canal.actions.ts` vs `actions/canal/`
3. **categorias** - `categorias.actions.ts` vs `actions/categorias/`
4. **condicionesComerciales** - `condicionesComerciales.actions.ts` vs `actions/condicionesComerciales/`
5. **configuracion** - `configuracion.actions.ts` vs `actions/configuracion/`
6. **cotizacion** - `cotizacion.actions.ts` vs `actions/cotizacion/`
7. **evento** - `evento.actions.ts` vs `actions/evento/`
8. **eventoTipo** - `eventoTipo.actions.ts` vs `actions/eventoTipo/`
9. **metodoPago** - `metodoPago.actions.ts` vs `actions/metodoPago/`
10. **paquete** - `paquete.actions.ts` vs `actions/paquete/`

## 📋 ARCHIVOS SIN CONFLICTO EN \_lib/

Estos pueden moverse directamente sin riesgo:

### 🟢 **SEGUROS PARA MOVER:**

1. **EventoBitacora.actions.ts** - No existe directorio equivalente
2. **EventoEtapa.actions.ts** - No existe directorio equivalente
3. **User.actions.ts** - Existe `users/` pero no `User/`
4. **agendaTipos.actions.ts** - No existe directorio equivalente
5. **autorizarCotizacion.actions.ts** - No existe directorio equivalente
6. **cliente.actions.ts** - No existe directorio `cliente/`
7. **conteo.actions.ts** - No existe directorio equivalente
8. **correo.actions.ts** - No existe directorio equivalente
9. **cotizacion.congelada.actions.ts** - Nombre específico, sin conflicto
10. **cotizacionVisita.actions.ts** - No existe directorio equivalente
11. **gastos.actions.ts** - No existe directorio equivalente
12. **notificacion.actions.ts** - No existe directorio equivalente
13. **pago.actions.ts** - Existe `pagos/` pero no `pago/`
14. **servicio.actions.ts** - Existe `servicios/` pero no `servicio/`

## 🎯 ESTRATEGIA RECOMENDADA

### FASE 1: MOVIMIENTO SEGURO

Mover primero los 14 archivos sin conflicto.

### FASE 2: RESOLUCIÓN DE CONFLICTOS

Para los 10 conflictos, analizar contenido y decidir:

- **Merge**: Si funciones complementarias
- **Rename**: Si funciones diferentes
- **Replace**: Si una versión es obsoleta

### FASE 3: VERIFICACIÓN

Probar imports y funcionalidad después de cada movimiento.
