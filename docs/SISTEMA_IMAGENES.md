# 📸 Sistema de Gestión de Imágenes - ProSocial

## 📋 Resumen

Sistema completo de gestión de imágenes adaptado del proyecto ProMedia para ProSocial, incluyendo subida, eliminación y actualización de imágenes en Supabase Storage con organización automática por categorías.

## 🏗️ Arquitectura

### 📁 Estructura de Archivos

```
app/admin/
├── _lib/
│   ├── actions/
│   │   └── imageHandler.actions.ts    # Server actions para Supabase
│   └── hooks/
│       └── useImageUpload.ts          # Hook React para manejo de estado
├── components/
│   └── shared/
│       └── ImageUploader.tsx          # Componente reutilizable
└── configurar/
    └── negocio/
        └── page.tsx                   # Ejemplo de implementación
```

## 🚀 Componentes Principales

### 1. **imageHandler.actions.ts** - Server Actions

```typescript
// Funciones principales
-subirImagenStorage() - // Sube nueva imagen
  eliminarImagenStorage() - // Elimina imagen por URL
  actualizarImagenStorage() - // Reemplaza imagen existente
  generateImagePath() - // Genera paths organizados
  esUrlProSocial(); // Valida URLs del bucket
```

**Características:**

- ✅ Organización automática por categorías
- ✅ Validación de tipos y tamaños
- ✅ Manejo robusto de errores
- ✅ URLs con timestamp para cache-busting
- ✅ Upsert para sobrescribir archivos

### 2. **useImageUpload.ts** - React Hook

```typescript
const { uploading, progress, error, uploadImage, deleteImage, updateImage } =
  useImageUpload({
    category: "negocio",
    subcategory: "logotipo",
    onSuccess: (url) => console.log("Imagen subida:", url),
    onError: (error) => console.log("Error:", error),
  });
```

**Estados incluidos:**

- `uploading`: Boolean de estado de carga
- `progress`: Progreso 0-100%
- `error`: Mensajes de error
- Funciones: `uploadImage`, `deleteImage`, `updateImage`

### 3. **ImageUploader.tsx** - Componente UI

```typescript
<ImageUploader
  category="negocio"
  subcategory="logotipo"
  currentImageUrl={currentUrl}
  onImageChange={(url) => handleChange(url)}
  maxSize={5}
  aspectRatio="square"
  placeholder="Subir imagen"
  showPreview={true}
  allowDelete={true}
/>
```

**Características UI:**

- ✅ Drag & Drop support
- ✅ Vista previa en tiempo real
- ✅ Indicadores de progreso
- ✅ Mensajes de error/éxito
- ✅ Validación visual
- ✅ Ratios de aspecto predefinidos

## 📂 Organización de Storage

### Estructura del Bucket: `prosocial-assets`

```
prosocial-assets/
├── negocio/
│   ├── logotipo/
│   └── isotipo/
├── eventos/
│   ├── portadas/
│   └── galeria/
├── servicios/
│   └── imagenes/
├── clientes/
│   └── fotos/
└── perfil/
    └── avatares/
```

### Nomenclatura de Archivos

```
{categoria}/{subcategoria}/{nombre}-{timestamp}-{randomId}.{ext}

Ejemplo:
negocio/logotipo/mi-empresa-1735689432123-a4b7c2.png
```

## 🔧 Configuración

### Variables de Entorno (Ya configuradas)

```env
NEXT_PUBLIC_SUPABASE_URL="https://bgtapcutchryzhzooony.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIs..."
```

### Configuración de Supabase Storage

1. **Bucket**: `prosocial-assets`
2. **Políticas**: Permitir lectura pública, escritura autenticada
3. **CORS**: Configurado para el dominio de la app

## 💡 Ejemplos de Uso

### Básico - Subida Simple

```tsx
import ImageUploader from "@/app/admin/components/shared/ImageUploader";

function MiComponente() {
  const [imageUrl, setImageUrl] = useState<string>("");

  return (
    <ImageUploader
      category="eventos"
      subcategory="portadas"
      currentImageUrl={imageUrl}
      onImageChange={setImageUrl}
    />
  );
}
```

### Avanzado - Con Hook Personalizado

```tsx
import { useImageUpload } from "@/app/admin/_lib/hooks/useImageUpload";

function MiComponente() {
  const { uploading, uploadImage, error } = useImageUpload({
    category: "servicios",
    onSuccess: (url) => {
      console.log("¡Imagen subida!", url);
      // Actualizar estado, base de datos, etc.
    },
  });

  const handleFileSelect = async (file: File) => {
    await uploadImage(file);
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => handleFileSelect(e.target.files[0])}
      />
      {uploading && <p>Subiendo...</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

### Server Side - Actions Directas

```typescript
import { subirImagenStorage } from "@/app/admin/_lib/actions/imageHandler.actions";

export async function crearEvento(formData: FormData) {
  const imageFile = formData.get("portada") as File;

  if (imageFile) {
    const result = await subirImagenStorage(imageFile, "eventos", "portadas");

    if (result.success) {
      // Guardar result.publicUrl en base de datos
    }
  }
}
```

## 🔒 Validaciones y Límites

### Archivos Permitidos

- **Tipos**: JPG, PNG, WebP, SVG
- **Tamaño máximo**: 5MB (configurable)
- **Resolución**: Sin límite específico

### Categorías Disponibles

```typescript
type Category = "negocio" | "eventos" | "servicios" | "clientes" | "perfil";
```

## 🎨 Personalización

### Ratios de Aspecto

```typescript
aspectRatio: "square" | "landscape" | "portrait" | "auto";
```

### Temas y Estilos

- Totalmente compatible con Tailwind CSS
- Soporte para modo oscuro
- Colores personalizables vía CSS

## 🚀 Próximas Mejoras

### Funcionalidades Planificadas

- [ ] **Redimensionamiento automático** en el servidor
- [ ] **Formatos adicionales** (GIF, AVIF)
- [ ] **Compresión inteligente** basada en uso
- [ ] **Gestión de versiones** de imágenes
- [ ] **Integración con CDN** para mejor rendimiento
- [ ] **Análisis de metadatos** (EXIF, dimensiones)
- [ ] **Cropping y edición** básica en el cliente

### Archivos Multimedia (Roadmap)

- [ ] **Video Manager** - Subida y streaming
- [ ] **Audio Manager** - Gestión de archivos de audio
- [ ] **Document Manager** - PDFs y documentos
- [ ] **Gallery Manager** - Galerías organizadas

## 🛠️ Estado Actual

### ✅ Implementado

- ✅ Sistema básico de imágenes funcionando
- ✅ Integración con página de configuración de negocio
- ✅ Validaciones y manejo de errores
- ✅ Interfaz de usuario completa
- ✅ Organización automática de archivos

### 🔄 En Desarrollo

- 🔄 Testing en producción con bucket real
- 🔄 Optimización de rendimiento
- 🔄 Documentación de políticas de Supabase

### 📋 Pendiente

- ⏳ Implementación en otras páginas del sistema
- ⏳ Migración de archivos existentes (si los hay)
- ⏳ Configuración de políticas de retención
