-- =====================================================
-- Script AGRESIVO para EventoBitacora - Reseteo completo
-- =====================================================

-- Paso 1: Deshabilitar RLS temporalmente
ALTER TABLE "EventoBitacora" DISABLE ROW LEVEL SECURITY;

-- Paso 2: Eliminar TODAS las políticas sin excepción
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'EventoBitacora'
    LOOP
        EXECUTE format('DROP POLICY %I ON "EventoBitacora"', policy_record.policyname);
        RAISE NOTICE 'Eliminada política: %', policy_record.policyname;
    END LOOP;
END
$$;

-- Paso 3: Revocar TODOS los permisos existentes
REVOKE ALL ON "EventoBitacora" FROM anon;
REVOKE ALL ON "EventoBitacora" FROM authenticated;
REVOKE ALL ON "EventoBitacora" FROM service_role;

-- Paso 4: Otorgar permisos completamente abiertos
GRANT ALL ON "EventoBitacora" TO anon;
GRANT ALL ON "EventoBitacora" TO authenticated;
GRANT ALL ON "EventoBitacora" TO service_role;
GRANT ALL ON "EventoBitacora" TO postgres;

-- Paso 5: Crear políticas ultra-permisivas
CREATE POLICY "evento_bitacora_allow_all" ON "EventoBitacora" FOR ALL USING (true) WITH CHECK (true);

-- Paso 6: Reactivar RLS
ALTER TABLE "EventoBitacora" ENABLE ROW LEVEL SECURITY;

-- Paso 7: Verificar resultado
SELECT 'EventoBitacora RLS Status' as info, 
       CASE WHEN relrowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
FROM pg_class 
WHERE relname = 'EventoBitacora';

SELECT * FROM pg_policies WHERE tablename = 'EventoBitacora';
