-- =====================================================
-- Script de corrección FORZADA de políticas RLS para EventoBitacora
-- =====================================================

-- Paso 1: Obtener y eliminar TODAS las políticas existentes de EventoBitacora
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Recorrer todas las políticas de la tabla EventoBitacora
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'EventoBitacora'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON "EventoBitacora"', policy_record.policyname);
        RAISE NOTICE 'Eliminada política: %', policy_record.policyname;
    END LOOP;
END
$$;

-- Paso 2: Crear políticas nuevas y permisivas para EventoBitacora
CREATE POLICY "evento_bitacora_select_policy_v2" ON "EventoBitacora"
  FOR SELECT USING (true);

CREATE POLICY "evento_bitacora_insert_policy_v2" ON "EventoBitacora"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "evento_bitacora_update_policy_v2" ON "EventoBitacora"
  FOR UPDATE USING (true);

CREATE POLICY "evento_bitacora_delete_policy_v2" ON "EventoBitacora"
  FOR DELETE USING (true);

-- Paso 3: Asegurar que RLS esté habilitado
ALTER TABLE "EventoBitacora" ENABLE ROW LEVEL SECURITY;

-- Paso 4: Grant permisos a roles básicos (por si acaso)
GRANT SELECT, INSERT, UPDATE, DELETE ON "EventoBitacora" TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON "EventoBitacora" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "EventoBitacora" TO service_role;

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
WHERE tablename = 'EventoBitacora'
ORDER BY policyname;

-- Paso 6: Verificar permisos en la tabla
SELECT 
  grantee, 
  privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'EventoBitacora'
ORDER BY grantee, privilege_type;
