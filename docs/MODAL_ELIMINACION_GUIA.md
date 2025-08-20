# MODAL DE CONFIRMACIÓN DE ELIMINACIÓN - GUÍA DE USO

## 🎯 Componentes Creados

### 1. `ModalConfirmacionEliminacion.tsx`

Modal reutilizable con diseño profesional para confirmaciones de eliminación.

### 2. `useModalEliminacion.ts`

Hook personalizado con helpers para simplificar el uso del modal.

### 3. `useEliminacionCotizacion.ts`

Hook específico para cotizaciones (incluido en `useModalEliminacion.ts`).

---

## 🚀 Uso Básico

### Para Cotizaciones (Ya implementado)

```tsx
import { useEliminacionCotizacion } from "@/app/hooks/useModalEliminacion";

const modalEliminacion = useEliminacionCotizacion();

// Abrir modal
const handleEliminar = (cotizacion) => {
  const datos = modalEliminacion.prepararDatosCotizacion(cotizacion);
  modalEliminacion.abrirModal(datos);
};

// En el JSX
{
  modalEliminacion.datos && (
    <ModalConfirmacionEliminacion
      isOpen={modalEliminacion.isOpen}
      onClose={modalEliminacion.cerrarModal}
      onConfirm={confirmarEliminacion}
      titulo="Eliminar Cotización"
      entidad={modalEliminacion.datos.entidad}
      dependencias={modalEliminacion.datos.dependencias}
      advertencias={modalEliminacion.datos.advertencias}
      bloqueos={modalEliminacion.datos.bloqueos}
      isLoading={modalEliminacion.isLoading}
      loadingText="Eliminando..."
    />
  );
}
```

---

## 🔧 Uso para Otras Entidades

### Ejemplo: Eliminar Evento

```tsx
import { useModalEliminacion } from "@/app/hooks/useModalEliminacion";

const modalEliminacion = useModalEliminacion();

const handleEliminarEvento = (evento) => {
  const datos = {
    entidad: {
      nombre: evento.nombre,
      valor: evento.fecha_evento,
      descripcion: `Cliente: ${evento.Cliente?.nombre} • Status: ${evento.status}`,
    },
    dependencias: [
      {
        tipo: "cotizaciones",
        cantidad: evento.cotizaciones?.length || 0,
        accion: "eliminar",
        descripcion: "Todas las cotizaciones y sus servicios",
      },
      {
        tipo: "agendas programadas",
        cantidad: evento.agendas?.length || 0,
        accion: "eliminar",
        descripcion: "Todas las tareas y citas programadas",
      },
      {
        tipo: "bitácora del evento",
        cantidad: 1,
        accion: "eliminar",
        descripcion: "Historial de comentarios y notas",
      },
      {
        tipo: "pagos relacionados",
        cantidad: 1,
        accion: "desvincular",
        descripcion: "Se mantienen para auditoría",
      },
    ],
    advertencias: [
      "Esta acción eliminará TODA la información del evento",
      "Los pagos se preservarán pero se desvincularan del evento",
      "Esta acción NO se puede deshacer",
    ],
    bloqueos:
      evento.status === "completado"
        ? ["No se pueden eliminar eventos completados"]
        : [],
  };

  modalEliminacion.abrirModal(datos);
};

const confirmarEliminacion = async () => {
  await modalEliminacion.ejecutarEliminacion(
    () => eliminarEvento(evento.id),
    (resultado) => {
      toast.success("Evento eliminado exitosamente");
      router.push("/admin/dashboard/eventos");
    },
    (error) => {
      toast.error("Error al eliminar el evento");
    }
  );
};
```

### Ejemplo: Eliminar Servicio

```tsx
const handleEliminarServicio = (servicio) => {
  const datos = {
    entidad: {
      nombre: servicio.nombre,
      valor: `$${servicio.precio_publico.toLocaleString("es-MX")}`,
      descripcion: `Categoría: ${servicio.categoria} • Status: ${servicio.status}`,
    },
    dependencias: [
      {
        tipo: "cotizaciones que lo usan",
        cantidad: servicio.cotizaciones?.length || 0,
        accion: "desvincular",
        descripcion: "Se mantendrán como servicios personalizados",
      },
      {
        tipo: "gastos asociados",
        cantidad: servicio.gastos?.length || 0,
        accion: "eliminar",
        descripcion: "Configuración de costos internos",
      },
    ],
    advertencias: [
      "Las cotizaciones existentes mantendrán una copia del servicio",
      "Los datos de costos y precios se preservan en las cotizaciones",
    ],
    bloqueos: [],
  };

  modalEliminacion.abrirModal(datos);
};
```

---

## 🎨 Características del Modal

### Estados Visuales

- **🔴 Elementos que se eliminan**: Fondo rojo, icono de basura
- **🟡 Elementos que se desvinculan**: Fondo amarillo, icono de enlace
- **🔵 Elementos que se preservan**: Fondo azul, icono de disco
- **❌ Bloqueos críticos**: Fondo rojo intenso, botón deshabilitado

### Funcionalidades

- ✅ **Responsive**: Se adapta a pantallas móviles
- ✅ **Accesible**: Navegación por teclado y screen readers
- ✅ **Loading states**: Spinner y texto personalizable
- ✅ **Bloqueo automático**: Botón se deshabilita si hay bloqueos
- ✅ **Cierre seguro**: Click fuera del modal o botón X
- ✅ **Categorización**: Dependencias organizadas por tipo de acción

---

## 🔧 Helpers Disponibles

### Del hook `useModalEliminacion`:

```tsx
// Crear dependencias comunes
modalEliminacion.crearDependenciaServicio(cantidad);
modalEliminacion.crearDependenciaVisitas();
modalEliminacion.crearDependenciaCostos();
modalEliminacion.crearDependenciaPagos();
modalEliminacion.crearDependenciaAgendas();

// Advertencias predefinidas
modalEliminacion.advertenciasCotizacion;

// Gestión del modal
modalEliminacion.abrirModal(datos);
modalEliminacion.cerrarModal();
modalEliminacion.actualizarBloqueos(["nuevo bloqueo"]);
modalEliminacion.ejecutarEliminacion(accion, onSuccess, onError);
```

---

## 🚨 Casos de Uso Recomendados

### Usar BLOQUEOS para:

- Entidades con dependencias críticas activas
- Estados que no permiten eliminación (ej: "completado", "facturado")
- Validaciones de negocio específicas

### Usar ADVERTENCIAS para:

- Información importante pero no bloqueante
- Consejos sobre consecuencias de la eliminación
- Recordatorios de procesos relacionados

### Usar DEPENDENCIAS para:

- Mostrar impacto exacto de la eliminación
- Distinguir entre eliminar, desvincular y preservar
- Informar sobre la cascada de eliminación

---

## 🎯 Beneficios de esta Implementación

1. **Reutilizable**: Un solo modal para toda la aplicación
2. **Consistente**: UX uniforme en todas las eliminaciones
3. **Informativo**: Usuario siempre sabe qué va a pasar
4. **Seguro**: Bloqueos automáticos previenen errores
5. **Profesional**: Diseño moderno y accesible
6. **Mantenible**: Lógica centralizada en hooks

Esta implementación reemplaza completamente los `alert()` y `confirm()` nativos con una experiencia mucho más rica y profesional.
