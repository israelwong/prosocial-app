-- Script para verificar y arreglar políticas RLS en tabla Notificacion
-- Uso: Ejecutar en Supabase SQL Editor

-- 1. Verificar estado actual de RLS en tabla Notificacion
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    forcerlspolicy as force_rls
FROM pg_tables 
WHERE tablename = 'Notificacion' AND schemaname = 'public';

-- 2. Verificar políticas existentes
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
WHERE tablename = 'Notificacion' AND schemaname = 'public';

-- 3. Verificar permisos de la tabla para el rol anon (Supabase)
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'Notificacion' 
AND table_schema = 'public'
AND grantee IN ('anon', 'authenticated', 'service_role');

-- 4. Si no hay políticas RLS o están mal configuradas, crear las correctas
-- IMPORTANTE: Solo ejecutar si las verificaciones anteriores muestran problemas

-- Habilitar RLS si no está habilitado
-- ALTER TABLE public."Notificacion" ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir SELECT para usuarios autenticados
-- CREATE POLICY "Authenticated users can view notifications" ON public."Notificacion"
-- FOR SELECT 
-- TO authenticated 
-- USING (true);

-- Crear política para permitir INSERT para usuarios autenticados
-- CREATE POLICY "Authenticated users can create notifications" ON public."Notificacion"
-- FOR INSERT 
-- TO authenticated 
-- WITH CHECK (true);

-- Crear política para permitir UPDATE para usuarios autenticados
-- CREATE POLICY "Authenticated users can update notifications" ON public."Notificacion"
-- FOR UPDATE 
-- TO authenticated 
-- USING (true) 
-- WITH CHECK (true);

-- Crear política para permitir DELETE para usuarios autenticados
-- CREATE POLICY "Authenticated users can delete notifications" ON public."Notificacion"
-- FOR DELETE 
-- TO authenticated 
-- USING (true);

-- 5. Verificar que Realtime esté habilitado para la tabla
SELECT 
    table_name,
    is_realtime_enabled
FROM supabase_realtime.subscription_check_filters 
WHERE table_name = 'Notificacion';

-- 6. Si Realtime no está habilitado, habilitarlo
-- NOTA: Esto debe hacerse desde la interfaz de Supabase Dashboard > Database > Realtime
-- O usando la función:
-- SELECT realtime.subscription_check_filters('public', 'Notificacion');

-- 7. Para debugging: Ver estructura actual de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'Notificacion' 
AND table_schema = 'public'
ORDER BY ordinal_position;
