-- =====================================================================
-- ANÁLISIS COTIZACIONES APROBADAS - PROYECCIÓN REVENUE SHARE MODEL
-- ProSocial Platform v1.7 - Time to Revenue Strategy
-- Fecha: 3 de septiembre de 2025
-- =====================================================================

-- =====================================================================
-- 1. CONSULTA BASE: COTIZACIONES APROBADAS CON DETALLES COMPLETOS
-- =====================================================================

WITH cotizaciones_aprobadas AS (
    SELECT 
        c.id as cotizacion_id,
        c.nombre as cotizacion_nombre,
        c.precio as precio_total,
        c.descuento,
        (c.precio - COALESCE(c.descuento, 0)) as precio_final,
        c.status,
        c.createdAt as fecha_creacion,
        c.updatedAt as fecha_actualizacion,
        
        -- Información del evento
        e.nombre as evento_nombre,
        e.fecha_evento,
        et.nombre as tipo_evento,
        
        -- Información del cliente
        cl.nombre as cliente_nombre,
        cl.email as cliente_email,
        cl.telefono as cliente_telefono,
        
        -- Análisis de servicios
        COUNT(cs.id) as total_servicios,
        SUM(cs.subtotal) as servicios_subtotal,
        AVG(cs.precioUnitario) as precio_promedio_servicio
        
    FROM "Cotizacion" c
    INNER JOIN "Evento" e ON c.eventoId = e.id
    INNER JOIN "EventoTipo" et ON c.eventoTipoId = et.id
    INNER JOIN "Cliente" cl ON e.clienteId = cl.id
    LEFT JOIN "CotizacionServicio" cs ON c.id = cs.cotizacionId
    
    -- FILTRO: Solo cotizaciones aprobadas/confirmadas
    WHERE c.status IN ('aprobada', 'confirmada', 'aceptada', 'pagada')
    AND c.archivada = false
    
    GROUP BY c.id, c.nombre, c.precio, c.descuento, c.status, c.createdAt, c.updatedAt,
             e.nombre, e.fecha_evento, et.nombre, cl.nombre, cl.email, cl.telefono
),

-- =====================================================================
-- 2. ANÁLISIS ESTADÍSTICO DE INGRESOS ACTUALES
-- =====================================================================
estadisticas_ingresos AS (
    SELECT 
        COUNT(*) as total_cotizaciones_aprobadas,
        
        -- Ingresos totales
        SUM(precio_final) as ingresos_totales_actuales,
        AVG(precio_final) as ticket_promedio,
        MIN(precio_final) as ticket_minimo,
        MAX(precio_final) as ticket_maximo,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY precio_final) as mediana_ticket,
        
        -- Análisis por rango de precios
        COUNT(CASE WHEN precio_final < 10000 THEN 1 END) as eventos_bajo_costo,
        COUNT(CASE WHEN precio_final BETWEEN 10000 AND 50000 THEN 1 END) as eventos_medio_costo,
        COUNT(CASE WHEN precio_final BETWEEN 50000 AND 100000 THEN 1 END) as eventos_alto_costo,
        COUNT(CASE WHEN precio_final > 100000 THEN 1 END) as eventos_premium,
        
        -- Análisis temporal
        COUNT(CASE WHEN fecha_creacion >= NOW() - INTERVAL '30 days' THEN 1 END) as cotizaciones_ultimo_mes,
        COUNT(CASE WHEN fecha_creacion >= NOW() - INTERVAL '90 days' THEN 1 END) as cotizaciones_ultimo_trimestre,
        
        -- Análisis de conversión temporal (asumiendo tiempo promedio de cotización a evento)
        AVG(EXTRACT(DAYS FROM fecha_evento - fecha_creacion)) as dias_promedio_cotizacion_evento
        
    FROM cotizaciones_aprobadas
),

-- =====================================================================
-- 3. PROYECCIÓN REVENUE SHARE MODEL - ESCENARIOS DE CRECIMIENTO
-- =====================================================================
proyeccion_revenue_share AS (
    SELECT 
        ei.*,
        
        -- ESCENARIO 1: 10 ESTUDIOS PROMEDIO
        -- Cada estudio con ticket promedio actual
        (ei.ticket_promedio * 10) as ingresos_mensuales_10_estudios,
        (ei.ticket_promedio * 10 * 0.30) as comision_prosocial_10_estudios, -- 30% Revenue Share
        (ei.ticket_promedio * 10 * 0.70) as ingresos_estudio_10_estudios,   -- 70% para estudio
        
        -- ESCENARIO 2: 100 ESTUDIOS PROMEDIO  
        (ei.ticket_promedio * 100) as ingresos_mensuales_100_estudios,
        (ei.ticket_promedio * 100 * 0.30) as comision_prosocial_100_estudios,
        (ei.ticket_promedio * 100 * 0.70) as ingresos_estudio_100_estudios,
        
        -- PROYECCIÓN ANUAL
        (ei.ticket_promedio * 10 * 12) as ingresos_anuales_10_estudios,
        (ei.ticket_promedio * 10 * 12 * 0.30) as comision_anual_10_estudios,
        
        (ei.ticket_promedio * 100 * 12) as ingresos_anuales_100_estudios,
        (ei.ticket_promedio * 100 * 12 * 0.30) as comision_anual_100_estudios,
        
        -- MODELO DE PROYECTOS ACTIVOS (complementario)
        -- 10 estudios = Plan Básico ($29/mes) = $290/mes + Revenue Share
        (290 + (ei.ticket_promedio * 10 * 0.30)) as ingresos_totales_plan_basico,
        
        -- 100 estudios = mix de planes (70% Profesional $79, 30% Enterprise $199)
        ((70 * 79 + 30 * 199) + (ei.ticket_promedio * 100 * 0.30)) as ingresos_totales_plan_mixto
        
    FROM estadisticas_ingresos ei
)

-- =====================================================================
-- 4. CONSULTA PRINCIPAL: REPORTE EJECUTIVO
-- =====================================================================

SELECT 
    -- SITUACIÓN ACTUAL
    'ANÁLISIS SITUACIÓN ACTUAL' as seccion,
    CONCAT('Total Cotizaciones Aprobadas: ', total_cotizaciones_aprobadas) as metrica_1,
    CONCAT('Ingresos Totales Registrados: $', ROUND(ingresos_totales_actuales, 2)) as metrica_2,
    CONCAT('Ticket Promedio: $', ROUND(ticket_promedio, 2)) as metrica_3,
    CONCAT('Rango de Tickets: $', ROUND(ticket_minimo, 2), ' - $', ROUND(ticket_maximo, 2)) as metrica_4,
    '' as separador_1

FROM proyeccion_revenue_share

UNION ALL

SELECT 
    -- DISTRIBUCIÓN POR SEGMENTOS
    'DISTRIBUCIÓN POR SEGMENTOS DE PRECIO' as seccion,
    CONCAT('Eventos Bajo Costo (<$10K): ', eventos_bajo_costo, ' eventos') as metrica_1,
    CONCAT('Eventos Costo Medio ($10K-$50K): ', eventos_medio_costo, ' eventos') as metrica_2,
    CONCAT('Eventos Alto Costo ($50K-$100K): ', eventos_alto_costo, ' eventos') as metrica_3,
    CONCAT('Eventos Premium (>$100K): ', eventos_premium, ' eventos') as metrica_4,
    '' as separador_1
    
FROM proyeccion_revenue_share

UNION ALL

SELECT 
    -- PROYECCIÓN 10 ESTUDIOS
    'PROYECCIÓN REVENUE SHARE - 10 ESTUDIOS' as seccion,
    CONCAT('Ingresos Mensuales Totales: $', ROUND(ingresos_mensuales_10_estudios, 2)) as metrica_1,
    CONCAT('Comisión ProSocial (30%): $', ROUND(comision_prosocial_10_estudios, 2)) as metrica_2,
    CONCAT('Ingresos para Estudios (70%): $', ROUND(ingresos_estudio_10_estudios, 2)) as metrica_3,
    CONCAT('Proyección Anual ProSocial: $', ROUND(comision_anual_10_estudios, 2)) as metrica_4,
    CONCAT('Con Plan Básico ($29/mes): $', ROUND(ingresos_totales_plan_basico, 2), ' mensuales') as separador_1

FROM proyeccion_revenue_share

UNION ALL

SELECT 
    -- PROYECCIÓN 100 ESTUDIOS
    'PROYECCIÓN REVENUE SHARE - 100 ESTUDIOS' as seccion,
    CONCAT('Ingresos Mensuales Totales: $', ROUND(ingresos_mensuales_100_estudios, 2)) as metrica_1,
    CONCAT('Comisión ProSocial (30%): $', ROUND(comision_prosocial_100_estudios, 2)) as metrica_2,
    CONCAT('Ingresos para Estudios (70%): $', ROUND(ingresos_estudio_100_estudios, 2)) as metrica_3,
    CONCAT('Proyección Anual ProSocial: $', ROUND(comision_anual_100_estudios, 2)) as metrica_4,
    CONCAT('Con Planes Mixtos: $', ROUND(ingresos_totales_plan_mixto, 2), ' mensuales') as separador_1

FROM proyeccion_revenue_share;

-- =====================================================================
-- 5. CONSULTA DETALLADA: TOP 20 COTIZACIONES PARA ANÁLISIS
-- =====================================================================

-- Ejecutar por separado para ver detalles específicos
/*
SELECT 
    cotizacion_nombre,
    precio_final,
    tipo_evento,
    cliente_nombre,
    fecha_evento,
    total_servicios,
    servicios_subtotal,
    precio_promedio_servicio,
    
    -- Simulación Revenue Share para esta cotización
    ROUND(precio_final * 0.30, 2) as comision_prosocial_30pct,
    ROUND(precio_final * 0.70, 2) as ingreso_estudio_70pct
    
FROM cotizaciones_aprobadas 
ORDER BY precio_final DESC 
LIMIT 20;
*/

-- =====================================================================
-- 6. ANÁLISIS ESTACIONAL Y TENDENCIAS
-- =====================================================================

/*
SELECT 
    EXTRACT(MONTH FROM fecha_evento) as mes_evento,
    EXTRACT(YEAR FROM fecha_evento) as año_evento,
    COUNT(*) as eventos_mes,
    SUM(precio_final) as ingresos_mes,
    AVG(precio_final) as ticket_promedio_mes,
    
    -- Proyección Revenue Share por mes
    SUM(precio_final * 0.30) as comision_prosocial_mes
    
FROM cotizaciones_aprobadas
WHERE fecha_evento >= '2024-01-01'
GROUP BY EXTRACT(MONTH FROM fecha_evento), EXTRACT(YEAR FROM fecha_evento)
ORDER BY año_evento, mes_evento;
*/

-- =====================================================================
-- 7. NOTAS IMPORTANTES PARA LA IMPLEMENTACIÓN
-- =====================================================================

/*
CONSIDERACIONES CLAVE:

1. STATUS DE COTIZACIONES:
   - Verificar los status exactos que maneja la aplicación
   - Los más comunes: 'aprobada', 'confirmada', 'aceptada', 'pagada'
   - Ajustar el WHERE según los status reales

2. REVENUE SHARE MODEL:
   - 30% ProSocial Platform
   - 70% Studio/Cliente
   - Modelo complementado con Proyectos Activos

3. PROYECTOS ACTIVOS PRICING:
   - Básico: 5 proyectos activos - $29/mes
   - Profesional: 15 proyectos activos - $79/mes  
   - Enterprise: 50 proyectos activos - $199/mes

4. MÉTRICAS CLAVE PARA SEGUIMIENTO:
   - LTV (Customer Lifetime Value)
   - CAC (Customer Acquisition Cost)
   - MRR (Monthly Recurring Revenue)
   - Churn Rate por segmento

5. TIME-TO-REVENUE:
   - Objetivo: Ingresos en 12 semanas vs 25 semanas original
   - Focus en EMV (Ecosistema Mínimo Viable)
   - Validación rápida con Revenue Share
*/
