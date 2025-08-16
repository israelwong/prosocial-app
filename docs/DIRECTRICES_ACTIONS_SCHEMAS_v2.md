# 🔧 DIRECTRICES PARA CREACIÓN DE ACTIONS Y SCHEMAS

---

## 📋 **ESTRUCTURA BASE**

### **📁 Organización de Archivos**

```
app/admin/_lib/actions/
├── [modulo]/
│   ├── [modulo].actions.ts    # Funciones server-side
│   ├── [modulo].schemas.ts    # Validaciones con Zod
│   └── index.ts               # Exports centralizados (opcional)
```

### **🎯 Ejemplo de Estructura**

```
app/admin/_lib/actions/
├── evento/
│   ├── evento.actions.ts
│   ├── evento.schemas.ts
│   └── index.ts
├── cliente/
│   ├── cliente.actions.ts
│   ├── cliente.schemas.ts
│   └── index.ts
└── paquete/
    ├── paquete.actions.ts
    ├── paquete.schemas.ts
    └── index.ts
```

---

## 🧩 **ESTRUCTURA DE SCHEMAS**

### **📝 Template Base para Schemas**

```typescript
// Ruta: app/admin/_lib/actions/[modulo]/[modulo].schemas.ts

import { z } from 'zod';

// ========================================
// SCHEMAS DE VALIDACIÓN
// ========================================

// Schema para búsqueda y filtros
export const [Modulo]BusquedaSchema = z.object({
    search: z.string().optional(),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20),
    // Filtros específicos del módulo
});

// Schema para crear entidad
export const [Modulo]CreateSchema = z.object({
    // Campos requeridos
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    // Campos opcionales
    descripcion: z.string().optional(),
    status: z.string().default('active'),
});

// Schema para actualizar entidad
export const [Modulo]UpdateSchema = [Modulo]CreateSchema.extend({
    id: z.string().min(1, 'ID requerido'),
}).partial().required({ id: true });

// Schema para eliminar entidad
export const [Modulo]DeleteSchema = z.object({
    id: z.string().min(1, 'ID requerido'),
});

// ========================================
// TIPOS INFERIDOS
// ========================================

export type [Modulo]BusquedaForm = z.infer<typeof [Modulo]BusquedaSchema>;
export type [Modulo]CreateForm = z.infer<typeof [Modulo]CreateSchema>;
export type [Modulo]UpdateForm = z.infer<typeof [Modulo]UpdateSchema>;
export type [Modulo]DeleteForm = z.infer<typeof [Modulo]DeleteSchema>;

// ========================================
// TIPOS EXTENDIDOS (para datos con joins)
// ========================================

export type [Modulo]Extendido = {
    // Campos base de la entidad
    id: string;
    nombre: string;
    // Campos de relaciones
    categoriaId?: string;
    categoriaNombre?: string;
    // Campos calculados
    precio?: number;
    balance?: number;
};
```

### **🔍 Patrones de Validación Comunes**

```typescript
// Strings con longitud mínima
nombre: z.string().min(2, 'Mínimo 2 caracteres'),

// Emails
email: z.string().email('Email inválido'),

// Números positivos
precio: z.number().min(0, 'Debe ser mayor a 0'),

// Fechas
fecha: z.string().min(1, 'Fecha requerida'),

// Enums
status: z.enum(['active', 'inactive'], {
    errorMap: () => ({ message: 'Status debe ser active o inactive' })
}),

// Arrays
items: z.array(z.string()).min(1, 'Al menos un item requerido'),

// Opcionales con defaults
activo: z.boolean().default(true),

// Validaciones condicionales
.refine((data) => {
    if (data.tipo === 'especial') {
        return data.configuracion !== undefined;
    }
    return true;
}, {
    message: 'Configuración requerida para tipo especial',
    path: ['configuracion']
})
```

---

## ⚡ **ESTRUCTURA DE ACTIONS**

### **📝 Template Base para Actions**

```typescript
// Ruta: app/admin/_lib/actions/[modulo]/[modulo].actions.ts

'use server';

import prisma from '@/app/admin/_lib/prismaClient';
import { revalidatePath } from 'next/cache';
import {
    [Modulo]BusquedaSchema,
    [Modulo]CreateSchema,
    [Modulo]UpdateSchema,
    [Modulo]DeleteSchema,
    type [Modulo]BusquedaForm,
    type [Modulo]CreateForm,
    type [Modulo]UpdateForm,
    type [Modulo]DeleteForm,
    type [Modulo]Extendido
} from './[modulo].schemas';

// ========================================
// FUNCIONES DE CONSULTA
// ========================================

/**
 * Obtener todas las entidades con filtros
 */
export async function obtener[Modulos](
    params?: [Modulo]BusquedaForm
): Promise<[Modulo]Extendido[]> {
    try {
        const validatedParams = [Modulo]BusquedaSchema.parse(params || {});

        const where: any = {};

        // Aplicar filtros
        if (validatedParams.search) {
            where.nombre = {
                contains: validatedParams.search,
                mode: 'insensitive'
            };
        }

        const entidades = await prisma.[modulo].findMany({
            where,
            orderBy: { nombre: 'asc' },
            skip: (validatedParams.page - 1) * validatedParams.limit,
            take: validatedParams.limit,
            include: {
                // Relaciones necesarias
                categoria: true
            }
        });

        return entidades.map(entidad => ({
            ...entidad,
            categoriaNombre: entidad.categoria?.nombre
        }));

    } catch (error) {
        console.error('Error al obtener [modulos]:', error);
        throw new Error('Error al obtener [modulos]');
    }
}

/**
 * Obtener entidad por ID
 */
export async function obtener[Modulo](id: string) {
    try {
        const entidad = await prisma.[modulo].findUnique({
            where: { id },
            include: {
                // Relaciones necesarias
            }
        });

        return entidad;

    } catch (error) {
        console.error('Error al obtener [modulo]:', error);
        throw new Error('Error al obtener [modulo]');
    }
}

// ========================================
// FUNCIONES DE MUTACIÓN
// ========================================

/**
 * Crear nueva entidad
 */
export async function crear[Modulo](data: [Modulo]CreateForm) {
    try {
        const validatedData = [Modulo]CreateSchema.parse(data);

        const nueva[Modulo] = await prisma.[modulo].create({
            data: validatedData
        });

        revalidatePath('/admin/[ruta]');

        return {
            success: true,
            data: nueva[Modulo],
            message: '[Modulo] creado exitosamente'
        };

    } catch (error) {
        console.error('Error al crear [modulo]:', error);
        return {
            success: false,
            error: 'Error al crear [modulo]'
        };
    }
}

/**
 * Actualizar entidad existente
 */
export async function actualizar[Modulo](data: [Modulo]UpdateForm) {
    try {
        const validatedData = [Modulo]UpdateSchema.parse(data);
        const { id, ...updateData } = validatedData;

        const [modulo]Actualizado = await prisma.[modulo].update({
            where: { id },
            data: updateData
        });

        revalidatePath('/admin/[ruta]');

        return {
            success: true,
            data: [modulo]Actualizado,
            message: '[Modulo] actualizado exitosamente'
        };

    } catch (error) {
        console.error('Error al actualizar [modulo]:', error);
        return {
            success: false,
            error: 'Error al actualizar [modulo]'
        };
    }
}

/**
 * Eliminar entidad
 */
export async function eliminar[Modulo](data: [Modulo]DeleteForm) {
    try {
        const validatedData = [Modulo]DeleteSchema.parse(data);

        await prisma.[modulo].delete({
            where: { id: validatedData.id }
        });

        revalidatePath('/admin/[ruta]');

        return {
            success: true,
            message: '[Modulo] eliminado exitosamente'
        };

    } catch (error) {
        console.error('Error al eliminar [modulo]:', error);
        return {
            success: false,
            error: 'Error al eliminar [modulo]'
        };
    }
}

// ========================================
// FUNCIONES ESPECÍFICAS DEL MÓDULO
// ========================================

/**
 * Validar nombre único (ejemplo de función específica)
 */
export async function validarNombre[Modulo]Unico(
    nombre: string,
    categoriaId?: string,
    excludeId?: string
): Promise<boolean> {
    try {
        const where: any = {
            nombre: {
                equals: nombre,
                mode: 'insensitive'
            }
        };

        if (categoriaId) {
            where.categoriaId = categoriaId;
        }

        if (excludeId) {
            where.id = { not: excludeId };
        }

        const existente = await prisma.[modulo].findFirst({ where });

        return !existente;

    } catch (error) {
        console.error('Error al validar nombre:', error);
        return false;
    }
}
```

---

## 📐 **CONVENCIONES Y BUENAS PRÁCTICAS**

### **🏷️ Nomenclatura**

#### **Schemas**

- `[Modulo]CreateSchema` - Para crear entidades
- `[Modulo]UpdateSchema` - Para actualizar entidades
- `[Modulo]DeleteSchema` - Para eliminar entidades
- `[Modulo]BusquedaSchema` - Para filtros y búsquedas

#### **Types**

- `[Modulo]CreateForm` - Datos para crear
- `[Modulo]UpdateForm` - Datos para actualizar
- `[Modulo]Extendido` - Entidad con datos de relaciones

#### **Functions**

- `obtener[Modulos]()` - Listar entidades (plural)
- `obtener[Modulo]()` - Obtener por ID (singular)
- `crear[Modulo]()` - Crear nueva entidad
- `actualizar[Modulo]()` - Actualizar existente
- `eliminar[Modulo]()` - Eliminar entidad

### **🔒 Validaciones**

#### **En Schemas**

```typescript
// Siempre usar mensajes descriptivos
nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),

// Validar datos según el contexto
precio: z.number().min(0.01, 'El precio debe ser mayor a 0'),

// Usar enums para valores limitados
status: z.enum(['active', 'inactive', 'pending']),
```

#### **En Actions**

```typescript
// Siempre validar entrada con schema
const validatedData = [Modulo]CreateSchema.parse(data);

// Manejar errores de forma consistente
try {
    // lógica
} catch (error) {
    console.error('Error descriptivo:', error);
    return {
        success: false,
        error: 'Mensaje user-friendly'
    };
}
```

### **🔄 Revalidation**

```typescript
// Siempre revalidar después de mutaciones
revalidatePath("/admin/[ruta-especifica]");

// Para actualizaciones que afectan múltiples páginas
revalidatePath("/admin/[modulo]", "layout");
```

### **📊 Respuestas Consistentes**

```typescript
// Respuestas exitosas
return {
  success: true,
  data: resultado,
  message: "Operación exitosa",
};

// Respuestas de error
return {
  success: false,
  error: "Mensaje de error user-friendly",
};
```

---

## 🎯 **EJEMPLOS ESPECÍFICOS**

### **📝 Ejemplo: Módulo Cliente**

```typescript
// cliente.schemas.ts
export const ClienteCreateSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  telefono: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
  email: z.string().email("Email inválido").optional(),
  direccion: z.string().optional(),
  status: z.string().default("active"),
});

// cliente.actions.ts
export async function crearCliente(data: ClienteCreateForm) {
  try {
    const validatedData = ClienteCreateSchema.parse(data);

    // Validar email único si se proporciona
    if (validatedData.email) {
      const existente = await prisma.cliente.findFirst({
        where: { email: validatedData.email },
      });

      if (existente) {
        return {
          success: false,
          error: "Ya existe un cliente con este email",
        };
      }
    }

    const nuevoCliente = await prisma.cliente.create({
      data: validatedData,
    });

    revalidatePath("/admin/clientes");

    return {
      success: true,
      data: nuevoCliente,
      message: "Cliente creado exitosamente",
    };
  } catch (error) {
    console.error("Error al crear cliente:", error);
    return {
      success: false,
      error: "Error al crear cliente",
    };
  }
}
```

---

## 🔄 **MIGRACIÓN GRADUAL**

### **🎯 Proceso de Migración**

1. **Crear nueva estructura** actions/schemas
2. **Migrar funciones** una por una
3. **Actualizar imports** en componentes
4. **Probar funcionalidad** antes de eliminar código legacy
5. **Mantener compatibilidad** hasta migración completa

### **📋 Checklist de Migración**

- [ ] Schemas creados con validaciones apropiadas
- [ ] Actions implementadas con manejo de errores
- [ ] Types exportados correctamente
- [ ] Funciones probadas en componentes
- [ ] Revalidation paths configurados
- [ ] Mensajes de error user-friendly
- [ ] Documentación actualizada

---

## 📚 **RECURSOS ADICIONALES**

### **🔗 Enlaces Útiles**

- [Zod Documentation](https://zod.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

### **🎯 Principios Clave**

- **Consistencia**: Usar siempre la misma estructura
- **Validación**: Nunca confiar en datos del cliente
- **Errors**: Mensajes claros y user-friendly
- **Performance**: Optimizar queries y revalidaciones
- **Mantenibilidad**: Código limpio y bien documentado

---

_**Nota:** Estas directrices deben seguirse consistentemente en todo el proyecto para mantener la calidad y consistencia del código._
