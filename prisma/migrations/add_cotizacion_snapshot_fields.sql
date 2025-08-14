-- Migración no destructiva para completar snapshot de cotización
-- Agregar campos faltantes a CotizacionServicio para snapshot completo

BEGIN;

-- Agregar campos adicionales para snapshot completo en CotizacionServicio
ALTER TABLE "CotizacionServicio" 
ADD COLUMN IF NOT EXISTS "gasto" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN IF NOT EXISTS "utilidad" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN IF NOT EXISTS "precio_publico" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN IF NOT EXISTS "tipo_utilidad" TEXT DEFAULT 'servicio',
ADD COLUMN IF NOT EXISTS "descripcion" TEXT,
ADD COLUMN IF NOT EXISTS "categoria_nombre" TEXT,
ADD COLUMN IF NOT EXISTS "seccion_nombre" TEXT,
ADD COLUMN IF NOT EXISTS "es_personalizado" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "servicio_original_id" TEXT;

-- Crear tabla para costos adicionales de cotización
CREATE TABLE IF NOT EXISTS "CotizacionCosto" (
    "id" TEXT NOT NULL,
    "cotizacionId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "costo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tipo" TEXT NOT NULL DEFAULT 'adicional', -- adicional, descuento, impuesto
    "posicion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CotizacionCosto_pkey" PRIMARY KEY ("id")
);

-- Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS "CotizacionCosto_cotizacionId_idx" ON "CotizacionCosto"("cotizacionId");
CREATE INDEX IF NOT EXISTS "CotizacionServicio_es_personalizado_idx" ON "CotizacionServicio"("es_personalizado");

-- Agregar foreign key para CotizacionCosto
ALTER TABLE "CotizacionCosto" 
ADD CONSTRAINT "CotizacionCosto_cotizacionId_fkey" 
FOREIGN KEY ("cotizacionId") REFERENCES "Cotizacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Actualizar registros existentes con valores por defecto seguros
UPDATE "CotizacionServicio" 
SET 
    "gasto" = 0,
    "utilidad" = 0,
    "precio_publico" = "precioUnitario",
    "tipo_utilidad" = 'servicio',
    "es_personalizado" = false
WHERE 
    "gasto" IS NULL 
    OR "utilidad" IS NULL 
    OR "precio_publico" IS NULL 
    OR "tipo_utilidad" IS NULL
    OR "es_personalizado" IS NULL;

COMMIT;
