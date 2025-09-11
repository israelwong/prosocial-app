-- =====================================================
-- Script de corrección FORZADA de políticas RLS para CotizacionVisita
-- =====================================================

-- Paso 1: Obtener y eliminar TODAS las políticas existentes de CotizacionVisita
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Recorrer todas las políticas de la tabla CotizacionVisita
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'CotizacionVisita'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON "CotizacionVisita"', policy_record.policyname);
        RAISE NOTICE 'Eliminada política: %', policy_record.policyname;
    END LOOP;
END
$$;

-- Paso 2: Crear políticas nuevas y permisivas para CotizacionVisita
CREATE POLICY "cotizacion_visita_select_policy_v2" ON "CotizacionVisita"
  FOR SELECT USING (true);

CREATE POLICY "cotizacion_visita_insert_policy_v2" ON "CotizacionVisita"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "cotizacion_visita_update_policy_v2" ON "CotizacionVisita"
  FOR UPDATE USING (true);

CREATE POLICY "cotizacion_visita_delete_policy_v2" ON "CotizacionVisita"
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
