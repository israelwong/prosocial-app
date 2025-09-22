-- =====================================================
-- Script de corrección FORZADA de políticas RLS para Notificacion
-- =====================================================

-- Paso 1: Obtener y eliminar TODAS las políticas existentes
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Recorrer todas las políticas de la tabla Notificacion
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'Notificacion'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON "Notificacion"', policy_record.policyname);
        RAISE NOTICE 'Eliminada política: %', policy_record.policyname;
    END LOOP;
END
$$;

-- Paso 2: Crear políticas nuevas y permisivas para Notificacion
CREATE POLICY "notificacion_select_policy_v2" ON "Notificacion"
  FOR SELECT USING (true);

CREATE POLICY "notificacion_insert_policy_v2" ON "Notificacion"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "notificacion_update_policy_v2" ON "Notificacion"
  FOR UPDATE USING (true);

CREATE POLICY "notificacion_delete_policy_v2" ON "Notificacion"
  FOR DELETE USING (true);

-- Paso 3: Asegurar que RLS esté habilitado
ALTER TABLE "Notificacion" ENABLE ROW LEVEL SECURITY;

-- Paso 4: Grant permisos a roles básicos (por si acaso)
GRANT SELECT, INSERT, UPDATE, DELETE ON "Notificacion" TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON "Notificacion" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "Notificacion" TO service_role;

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
WHERE tablename = 'Notificacion'
ORDER BY policyname;

-- Paso 6: Verificar permisos en la tabla
SELECT 
  grantee, 
  privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'Notificacion'
ORDER BY grantee, privilege_type;
