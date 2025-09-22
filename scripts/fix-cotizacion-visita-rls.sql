-- =====================================================
-- Script de corrección de políticas RLS para CotizacionVisita
-- =====================================================

-- Paso 1: Limpiar todas las políticas existentes de CotizacionVisita
DROP POLICY IF EXISTS "Users can view own cotizacion visitas" ON "CotizacionVisita";
DROP POLICY IF EXISTS "Users can create cotizacion visitas" ON "CotizacionVisita";
DROP POLICY IF EXISTS "Users can update own cotizacion visitas" ON "CotizacionVisita";
DROP POLICY IF EXISTS "Allow authenticated users to read cotizacion visitas" ON "CotizacionVisita";
DROP POLICY IF EXISTS "Allow authenticated users to insert cotizacion visitas" ON "CotizacionVisita";
DROP POLICY IF EXISTS "Allow authenticated users to update cotizacion visitas" ON "CotizacionVisita";
DROP POLICY IF EXISTS "Allow authenticated read access" ON "CotizacionVisita";
DROP POLICY IF EXISTS "Allow authenticated insert access" ON "CotizacionVisita";
DROP POLICY IF EXISTS "Allow authenticated update access" ON "CotizacionVisita";
DROP POLICY IF EXISTS "Allow authenticated delete access" ON "CotizacionVisita";

-- Paso 2: Crear políticas nuevas y permisivas para CotizacionVisita
CREATE POLICY "cotizacion_visita_select_policy" ON "CotizacionVisita"
  FOR SELECT USING (true);

CREATE POLICY "cotizacion_visita_insert_policy" ON "CotizacionVisita"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "cotizacion_visita_update_policy" ON "CotizacionVisita"
  FOR UPDATE USING (true);

CREATE POLICY "cotizacion_visita_delete_policy" ON "CotizacionVisita"
  FOR DELETE USING (true);

-- Paso 3: Asegurar que RLS esté habilitado
ALTER TABLE "CotizacionVisita" ENABLE ROW LEVEL SECURITY;

-- Paso 4: Grant permisos a roles básicos (por si acaso)
GRANT SELECT, INSERT, UPDATE, DELETE ON "CotizacionVisita" TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON "CotizacionVisita" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "CotizacionVisita" TO service_role;

-- Paso 5: Verificar que las políticas se crearon correctamente
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE tablename = 'CotizacionVisita'
ORDER BY policyname;

-- Paso 6: Verificar permisos en la tabla
SELECT 
  grantee, 
  privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'CotizacionVisita'
ORDER BY grantee, privilege_type;
