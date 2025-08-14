-- Migración para corregir congruencia del modelo
-- Convierte campos existentes a la nueva nomenclatura snapshot
-- Preserva todos los datos existentes

-- 1. Agregar nuevos campos snapshot con valores por defecto
ALTER TABLE "CotizacionServicio" 
  ADD COLUMN IF NOT EXISTS "seccion_nombre_snapshot" TEXT,
  ADD COLUMN IF NOT EXISTS "categoria_nombre_snapshot" TEXT,
  ADD COLUMN IF NOT EXISTS "nombre_snapshot" TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS "descripcion_snapshot" TEXT,
  ADD COLUMN IF NOT EXISTS "precio_unitario_snapshot" DOUBLE PRECISION DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "costo_snapshot" DOUBLE PRECISION DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "gasto_snapshot" DOUBLE PRECISION DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "utilidad_snapshot" DOUBLE PRECISION DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "precio_publico_snapshot" DOUBLE PRECISION DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "tipo_utilidad_snapshot" TEXT DEFAULT 'servicio';

-- 2. Migrar datos existentes a campos snapshot
UPDATE "CotizacionServicio" SET 
  "nombre_snapshot" = COALESCE("nombre", 'Servicio migrado'),
  "descripcion_snapshot" = "descripcion",
  "precio_unitario_snapshot" = COALESCE("precioUnitario", 0),
  "costo_snapshot" = COALESCE("costo", 0),
  "gasto_snapshot" = COALESCE("gasto", 0),
  "utilidad_snapshot" = COALESCE("utilidad", 0),
  "precio_publico_snapshot" = COALESCE("precio_publico", 0),
  "tipo_utilidad_snapshot" = COALESCE("tipo_utilidad", 'servicio'),
  "categoria_nombre_snapshot" = "categoria_nombre",
  "seccion_nombre_snapshot" = "seccion_nombre"
WHERE "nombre_snapshot" = '';

-- 3. Hacer nombre_snapshot NOT NULL después de migrar datos
ALTER TABLE "CotizacionServicio" 
  ALTER COLUMN "nombre_snapshot" SET NOT NULL;

-- 4. Eliminar campos antiguos después de confirmar migración exitosa
-- (Se puede hacer después de confirmar que todo funciona)
-- ALTER TABLE "CotizacionServicio" 
--   DROP COLUMN IF EXISTS "nombre",
--   DROP COLUMN IF EXISTS "descripcion",
--   DROP COLUMN IF EXISTS "costo",
--   DROP COLUMN IF EXISTS "gasto",
--   DROP COLUMN IF EXISTS "utilidad",
--   DROP COLUMN IF EXISTS "precio_publico",
--   DROP COLUMN IF EXISTS "tipo_utilidad",
--   DROP COLUMN IF EXISTS "categoria_nombre",
--   DROP COLUMN IF EXISTS "seccion_nombre";
