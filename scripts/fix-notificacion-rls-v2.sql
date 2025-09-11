-- =====================================================
-- Script de corrección de políticas RLS para Notificacion
-- =====================================================

-- Paso 1: Limpiar todas las políticas existentes
DROP POLICY IF EXISTS "Users can view own notifications" ON "Notificacion";
DROP POLICY IF EXISTS "Users can create notifications" ON "Notificacion";
DROP POLICY IF EXISTS "Users can update own notifications" ON "Notificacion";
DROP POLICY IF EXISTS "Allow authenticated users to read notifications" ON "Notificacion";
DROP POLICY IF EXISTS "Allow authenticated users to insert notifications" ON "Notificacion";
DROP POLICY IF EXISTS "Allow authenticated users to update notifications" ON "Notificacion";
DROP POLICY IF EXISTS "Allow authenticated read access" ON "Notificacion";
DROP POLICY IF EXISTS "Allow authenticated insert access" ON "Notificacion";
DROP POLICY IF EXISTS "Allow authenticated update access" ON "Notificacion";
DROP POLICY IF EXISTS "Allow authenticated delete access" ON "Notificacion";

-- Paso 2: Crear políticas nuevas y permisivas
CREATE POLICY "notificacion_select_policy" ON "Notificacion"
  FOR SELECT USING (true);

CREATE POLICY "notificacion_insert_policy" ON "Notificacion"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "notificacion_update_policy" ON "Notificacion"
  FOR UPDATE USING (true);

CREATE POLICY "notificacion_delete_policy" ON "Notificacion"
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
