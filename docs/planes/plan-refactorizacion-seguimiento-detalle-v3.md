# Plan de Refactorización: Seguimiento/[eventoId] v3

## 📋 Análisis de la Situación Actual

### 🔍 **Estructura Actual Identificada**

```
seguimiento/[eventoId]/
├── page.tsx (simple wrapper)
├── components/
    ├── FichaDetalle.tsx (309 líneas - COMPLEJO ⚠️)
    ├── FichaAgenda.tsx (242 líneas)
    ├── FichaBalanceFinanciero.tsx (201 líneas)
    ├── FichaPresupuesto.tsx
    ├── FichaServicio.tsx
    ├── Wishlist.tsx (51 líneas)
    ├── AgendaOptimizada-v2.tsx
    ├── WishlistOptimizado-v2.tsx
    ├── ModalFormPagoNuevo.tsx
    ├── ModalFormPagoEditar.tsx
    ├── ResponsableModal.tsx
    └── FichaServicioContrato.tsx
```

### ⚠️ **Problemas Identificados**

1. **FichaDetalle.tsx es un monolito**:
   - 309 líneas de código
   - 15+ states diferentes
   - Múltiples useEffect complejos
   - Lógica de negocio mezclada con UI
   - Múltiples llamadas a APIs client-side

2. **Duplicación de componentes**:
   - AgendaOptimizada-v2.tsx vs FichaAgenda.tsx
   - WishlistOptimizado-v2.tsx vs Wishlist.tsx
   - Versiones sin versionado vs versiones v2

3. **Data fetching fragmentado**:
   - Cada componente hace sus propias llamadas
   - No hay centralización de datos
   - Estados loading desincronizados

4. **Falta de tipado centralizado**:
   - Types importados de diferentes ubicaciones
   - Sin schemas de validación unificados

## 🎯 Objetivos de la Refactorización

### ✅ **Principios a Seguir**

1. **Server-side data fetching** centralizado en page.tsx
2. **Separación de responsabilidades** por componente
3. **Props drilling** para pasar datos iniciales
4. **Versionado v3** para nuevos componentes
5. **Actions/Schemas pattern** consistente
6. **Eliminar componentes obsoletos** al final

### ✅ **Resultados Esperados**

- Page.tsx con data fetching completo
- Componentes v3 simples y enfocados
- Lógica de negocio en actions
- Estados locales mínimos
- Performance mejorada
- Código mantenible

## 📐 Plan de Implementación

### **FASE 1: Crear Actions y Schemas**

#### 1.1 Crear schemas centralizados

```typescript
// app/admin/_lib/actions/seguimiento/seguimiento-detalle.schemas.ts

export const EventoDetalleSchema = z.object({
  eventoId: z.string(),
});

export type EventoDetalleCompleto = {
  // Datos del evento
  evento: Evento;
  cliente: Cliente;
  tipoEvento: string;
  etapaActual: EventoEtapa;
  etapasDisponibles: EventoEtapa[];

  // Datos financieros
  cotizacion: Cotizacion | null;
  pagos: Pago[];
  condicionComercial: string | null;

  // Datos de servicios
  serviciosCategorias: ServicioCategoria[];
  cotizacionServicios: CotizacionServicio[];
  usuarios: User[];

  // Datos de agenda
  agenda: Agenda[];
  agendaTipos: AgendaTipo[];

  // Métricas calculadas
  resumenFinanciero: {
    precio: number;
    totalPagado: number;
    balance: number;
    porcentajePagado: number;
  };
};
```

#### 1.2 Crear action centralizada

```typescript
// app/admin/_lib/actions/seguimiento/seguimiento-detalle.actions.ts

export async function obtenerEventoDetalleCompleto(
  eventoId: string
): Promise<EventoDetalleCompleto> {
  // Única función que obtiene TODOS los datos necesarios
  // con includes optimizados y una sola query cuando sea posible
}
```

### **FASE 2: Refactorizar page.tsx**

#### 2.1 Convertir a server component

```typescript
// app/admin/dashboard/seguimiento/[eventoId]/page.tsx

export default async function EventoDetallePage({ params }: PageProps) {
  const { eventoId } = await params

  // Obtener TODOS los datos en el servidor
  const datosCompletos = await obtenerEventoDetalleCompleto(eventoId)

  return <EventoDetalleV3 datosIniciales={datosCompletos} />
}
```

### **FASE 3: Crear componentes v3**

#### 3.1 Componente principal

```typescript
// components/EventoDetalleV3.tsx
- Recibe todos los datos como props
- Maneja solo estados de UI local
- Delega a subcomponentes especializados
```

#### 3.2 Subcomponentes especializados

```typescript
// components/v3/
├── EventoHeaderV3.tsx        # Header y navegación
├── EventoInfoV3.tsx          # Info básica del evento
├── ClienteInfoV3.tsx         # Info del cliente
├── EtapaControlV3.tsx        # Selector de etapa
├── PresupuestoV3.tsx         # Información de presupuesto
├── BalanceFinancieroV3.tsx   # Pagos y balance
├── ServiciosV3.tsx           # Lista de servicios
├── AgendaV3.tsx              # Agenda del evento
└── BitacoraV3.tsx            # Bitácora
```

### **FASE 4: Implementación Detallada**

#### 4.1 EventoHeaderV3

```typescript
interface Props {
  evento: Evento;
  onClose: () => void;
  onEditEvento: (id: string) => void;
  onGenerarContrato: (id: string) => void;
}
```

#### 4.2 EtapaControlV3

```typescript
interface Props {
  etapaActual: EventoEtapa;
  etapasDisponibles: EventoEtapa[];
  onCambiarEtapa: (etapaId: string) => void;
  actualizando?: boolean;
}
```

#### 4.3 BalanceFinancieroV3

```typescript
interface Props {
  cotizacion: Cotizacion | null;
  pagos: Pago[];
  resumenFinanciero: ResumenFinanciero;
  onNuevoPago: (pago: PagoCreateForm) => void;
  onEditarPago: (pagoId: string, data: PagoUpdateForm) => void;
  onEliminarPago: (pagoId: string) => void;
}
```

### **FASE 5: Gestión de Estados y Acciones**

#### 5.1 Server Actions para mutaciones

```typescript
// seguimiento-detalle.actions.ts

export async function actualizarEtapaEventoDetalle();
export async function crearPagoEvento();
export async function actualizarPagoEvento();
export async function eliminarPagoEvento();
export async function crearAgendaEvento();
export async function actualizarAgendaEvento();
```

#### 5.2 Estados locales mínimos

```typescript
// Solo para UI, no para datos de negocio
const [showClienteDetails, setShowClienteDetails] = useState(false);
const [modalPagoOpen, setModalPagoOpen] = useState(false);
const [etapaActualizando, setEtapaActualizando] = useState(false);
```

### **FASE 6: Migración y Limpieza**

#### 6.1 Plan de migración

1. Crear todos los componentes v3
2. Probar funcionalidad completa
3. Actualizar imports en page.tsx
4. Verificar que todo funciona
5. Eliminar componentes obsoletos

#### 6.2 Componentes a eliminar

```
❌ FichaDetalle.tsx
❌ AgendaOptimizada-v2.tsx
❌ WishlistOptimizado-v2.tsx
❌ Componentes sin usar identificados
```

## 🗂️ Estructura Final Propuesta

```
seguimiento/[eventoId]/
├── page.tsx (server component con data fetching)
├── components/
    ├── EventoDetalleV3.tsx (componente principal)
    ├── v3/
    │   ├── EventoHeaderV3.tsx
    │   ├── EventoInfoV3.tsx
    │   ├── ClienteInfoV3.tsx
    │   ├── EtapaControlV3.tsx
    │   ├── PresupuestoV3.tsx
    │   ├── BalanceFinancieroV3.tsx
    │   ├── ServiciosV3.tsx
    │   ├── AgendaV3.tsx
    │   └── BitacoraV3.tsx
    ├── modals/
    │   ├── ModalPagoV3.tsx
    │   ├── ModalAgendaV3.tsx
    │   └── ModalResponsableV3.tsx
    └── [archivos obsoletos marcados para eliminación]
```

## 📊 Cronograma de Implementación

### **Sprint 1 (2-3 días)**

- ✅ Crear schemas y types centralizados
- ✅ Implementar action principal obtenerEventoDetalleCompleto
- ✅ Refactorizar page.tsx con server-side fetching

### **Sprint 2 (3-4 días)**

- ✅ Crear EventoDetalleV3 component principal
- ✅ Implementar componentes v3 básicos (Header, Info, Cliente)
- ✅ Implementar EtapaControlV3

### **Sprint 3 (3-4 días)**

- ✅ Implementar BalanceFinancieroV3 con CRUD de pagos
- ✅ Implementar ServiciosV3 y AgendaV3
- ✅ Crear modales v3

### **Sprint 4 (1-2 días)**

- ✅ Testing completo de funcionalidad
- ✅ Migración final y eliminación de obsoletos
- ✅ Documentación y commit

## 🎯 Beneficios Esperados

### **Performance**

- ✅ Una sola query inicial vs múltiples calls
- ✅ Server-side rendering mejorado
- ✅ Menos re-renders client-side

### **Mantenibilidad**

- ✅ Componentes pequeños y enfocados
- ✅ Lógica de negocio centralizada en actions
- ✅ Tipado robusto con schemas

### **Developer Experience**

- ✅ Debugging más fácil
- ✅ Testing más simple
- ✅ Código más predecible

### **User Experience**

- ✅ Loading inicial más rápido
- ✅ UI más responsive
- ✅ Estados de loading coherentes

---

**¿Proceder con la implementación siguiendo este plan?**

---

## 📊 Estado de Implementación

### ✅ FASE 1: COMPLETADA - Actions y Schemas

- ✅ **seguimiento-detalle.schemas.ts**: Tipos y esquemas centralizados
- ✅ **seguimiento-detalle.actions.ts**: Actions con función principal operativa
- ✅ **obtenerEventoDetalleCompleto()**: Carga todos los datos en una llamada
- ✅ **Validación**: Probado con página de test exitosamente
- ✅ **Correcciones**: Prisma schema alineado y funcionando

### ✅ FASE 2: COMPLETADA - Server-side Data Fetching

- ✅ **page.tsx refactorizado**: Ahora carga datos en el servidor
- ✅ **FichaDetalleV3 creado**: Componente principal con placeholders
- ✅ **Server-side loading**: Funcionando correctamente (logs confirmados)
- ✅ **Props iniciales**: Datos pasados exitosamente al componente
- ✅ **Performance**: Eliminadas múltiples API calls del cliente

### 🔄 FASE 3: SIGUIENTE - Componentes v3

- ⏳ Crear directorio `/v3/` para componentes modulares
- ⏳ Desarrollar 6 componentes especializados
- ⏳ Implementar optimistic updates
- ⏳ Integrar componentes reales en `FichaDetalleV3`

### ⏳ FASE 4: PENDIENTE - Migración y Cleanup

- ⏳ Backup del componente original
- ⏳ Renombrado y limpieza de archivos
- ⏳ Documentación final

**Estado actual**: 2/4 fases completadas (50% progreso)
**Siguiente paso**: Proceder con FASE 3 - Componentes v3
