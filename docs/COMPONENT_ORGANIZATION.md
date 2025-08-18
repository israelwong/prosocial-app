# Convenciones de Organización de Componentes

## 📁 Estructura Unificada

### 1. **Componentes Globales/Reutilizables**

```
app/components/
├── ui/                    # Componentes de UI base (buttons, cards, etc.)
│   ├── Button.tsx
│   ├── Card.tsx
│   └── carousel/          # Sistema de carruseles
├── forms/                 # Formularios reutilizables
├── layout/                # Componentes de layout global
└── shared/                # Otros componentes compartidos
```

### 2. **Componentes de Página/Ruta Específica**

```
app/[ruta]/
├── components/            # Componentes específicos de esta ruta
│   ├── layout/           # Layout específico (headers, footers)
│   ├── sections/         # Secciones de la página
│   ├── cards/            # Tarjetas específicas
│   └── ui/               # Elementos UI específicos
└── page.tsx
```

## ✅ **Convención Decidida: Solo `components/`**

**Razones:**

1. **Consistencia**: Una sola convención en todo el proyecto
2. **Simplicidad**: Menos confusión para desarrolladores
3. **Escalabilidad**: Estructura organizada por subcarpetas
4. **Next.js Best Practices**: Alineado con convenciones de Next.js 13+

## 📋 **Estado Actual por Ruta**

### ✅ Rutas ya unificadas (usar como referencia):

- `app/evento/[eventoId]/components/` - ✅ Estructura moderna y organizada
- `app/cotizacion/components/` - ✅ Ya unificado
- `app/checkout/components/` - ✅ Ya unificado

### 🔄 Rutas a migrar:

- `app/admin/_components/` → `app/admin/components/`
- `app/admin/configurar/_components/` → `app/admin/configurar/components/`
- `app/admin/dashboard/_components/` → `app/admin/dashboard/components/`
- `app/cliente/_components/` → `app/cliente/components/`
- `app/(main)/contacto/_components/` → `app/(main)/contacto/components/`

## 🎯 **Plan de Migración**

1. **Mover archivos** de `_components/` a `components/`
2. **Actualizar imports** en archivos que referencian las rutas antiguas
3. **Verificar funcionalidad** en cada ruta migrada
4. **Documentar** la nueva estructura

## 📖 **Estructura Recomendada por Tipo de Ruta**

### Admin Routes

```
app/admin/
├── components/
│   ├── layout/          # Navbar, Sidebar
│   ├── forms/           # Formularios específicos de admin
│   └── charts/          # Gráficos y dashboards
├── configurar/
│   └── components/      # Componentes de configuración
└── dashboard/
    └── components/      # Componentes del dashboard
```

### Client Routes

```
app/cliente/
├── components/
│   ├── forms/           # LoginForm, RegisterForm
│   ├── profile/         # Componentes de perfil
│   └── ui/              # UI específica de cliente
```

### Public Routes

```
app/(main)/
├── contacto/
│   └── components/      # LeadForm, ContactInfo
├── weddings/
│   └── components/
└── fifteens/
    └── components/
```

## 🚀 **Siguiente Paso**

Ejecutar migración sistemática manteniendo funcionalidad completa.
