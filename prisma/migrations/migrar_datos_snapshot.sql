-- Script de migración segura de datos
-- Migra datos de campos legacy a campos snapshot sin pérdida de información

UPDATE "CotizacionServicio" 
SET 
  -- Migrar nombres y descripciones
  "nombre_snapshot" = COALESCE("nombre", 'Servicio migrado'),
  "descripcion_snapshot" = "descripcion",
  
  -- Migrar jerarquía
  "categoria_nombre_snapshot" = "categoria_nombre",
  "seccion_nombre_snapshot" = "seccion_nombre",
  
  -- Migrar precios y costos
  "precio_unitario_snapshot" = COALESCE("precioUnitario", 0),
  "costo_snapshot" = COALESCE("costo", 0),
  "gasto_snapshot" = COALESCE("gasto", 0),
  "utilidad_snapshot" = COALESCE("utilidad", 0),
  "precio_publico_snapshot" = COALESCE("precio_publico", 0),
  "tipo_utilidad_snapshot" = COALESCE("tipo_utilidad", 'servicio')

WHERE "id" IS NOT NULL;

-- Verificar que la migración fue exitosa
SELECT 
  COUNT(*) as total_registros,
  COUNT("nombre_snapshot") as con_nombre_snapshot,
  COUNT("costo_snapshot") as con_costo_snapshot,
  COUNT("precio_unitario_snapshot") as con_precio_snapshot
FROM "CotizacionServicio";
