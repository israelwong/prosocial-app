#!/bin/bash

# FASE 1.2 - ANÁLISIS EXHAUSTIVO DE ESTRUCTURA _lib
# Análisis seguro para reestructuración sin romper funcionalidad

echo "🔍 ANÁLISIS EXHAUSTIVO DE ESTRUCTURA _lib"
echo "========================================"
echo ""

# Directorios de análisis
LIB_DIRS=(
    "app/admin/_lib"
    "app/(main)/_lib" 
    "app/cliente/_lib"
    "app/_lib"
)

# Crear directorio de reportes
mkdir -p lib-analysis-reports
cd lib-analysis-reports

echo "📁 PASO 1: MAPEO DE ESTRUCTURA ACTUAL"
echo "====================================="

# 1. Mapear estructura completa de _lib
echo "🗂️ Estructura completa de directorios _lib:" > structure-map.txt
for dir in "${LIB_DIRS[@]}"; do
    if [ -d "../$dir" ]; then
        echo "" >> structure-map.txt
        echo "📂 $dir:" >> structure-map.txt
        find "../$dir" -name "*.ts" -o -name "*.js" | sort >> structure-map.txt
    fi
done

echo "✅ Mapa de estructura creado en structure-map.txt"

# 2. Identificar archivos en _lib raíz vs _lib/actions
echo "" > lib-root-vs-actions.txt
echo "🆚 COMPARACIÓN _lib RAÍZ vs _lib/actions" >> lib-root-vs-actions.txt
echo "=========================================" >> lib-root-vs-actions.txt

for dir in "${LIB_DIRS[@]}"; do
    if [ -d "../$dir" ]; then
        echo "" >> lib-root-vs-actions.txt
        echo "📂 Analizando: $dir" >> lib-root-vs-actions.txt
        
        # Archivos en raíz de _lib
        echo "🔸 Archivos en raíz de _lib:" >> lib-root-vs-actions.txt
        find "../$dir" -maxdepth 1 -name "*.ts" -o -name "*.js" | sort >> lib-root-vs-actions.txt
        
        # Archivos en _lib/actions
        if [ -d "../$dir/actions" ]; then
            echo "🔹 Archivos en _lib/actions:" >> lib-root-vs-actions.txt
            find "../$dir/actions" -name "*.ts" -o -name "*.js" | sort >> lib-root-vs-actions.txt
        else
            echo "🔹 No existe directorio actions en $dir" >> lib-root-vs-actions.txt
        fi
        
        echo "---" >> lib-root-vs-actions.txt
    fi
done

echo "✅ Comparación creada en lib-root-vs-actions.txt"

# 3. Detectar conflictos de nombres potenciales
echo "" > name-conflicts.txt
echo "⚠️ DETECCIÓN DE CONFLICTOS DE NOMBRES" >> name-conflicts.txt
echo "=====================================" >> name-conflicts.txt

for dir in "${LIB_DIRS[@]}"; do
    if [ -d "../$dir" ]; then
        echo "" >> name-conflicts.txt
        echo "🔍 Analizando conflictos en: $dir" >> name-conflicts.txt
        
        # Obtener nombres base de archivos en raíz
        if ls "../$dir"/*.{ts,js} 1> /dev/null 2>&1; then
            echo "📁 Archivos en raíz _lib:" >> name-conflicts.txt
            for file in "../$dir"/*.{ts,js}; do
                if [ -f "$file" ]; then
                    basename "$file" >> name-conflicts.txt
                fi
            done
        fi
        
        # Obtener nombres base de archivos en actions
        if [ -d "../$dir/actions" ] && ls "../$dir/actions"/*.{ts,js} 1> /dev/null 2>&1; then
            echo "📁 Archivos en _lib/actions:" >> name-conflicts.txt
            for file in "../$dir/actions"/*.{ts,js}; do
                if [ -f "$file" ]; then
                    basename "$file" >> name-conflicts.txt
                fi
            done
            
            # Detectar nombres duplicados
            echo "🚨 CONFLICTOS POTENCIALES:" >> name-conflicts.txt
            temp_file=$(mktemp)
            
            # Listar todos los archivos base
            for file in "../$dir"/*.{ts,js}; do
                if [ -f "$file" ]; then
                    basename "$file" >> "$temp_file"
                fi
            done
            
            for file in "../$dir/actions"/*.{ts,js}; do
                if [ -f "$file" ]; then
                    basename "$file" >> "$temp_file"
                fi
            done
            
            # Buscar duplicados
            sort "$temp_file" | uniq -d | while read duplicate; do
                if [ -n "$duplicate" ]; then
                    echo "  - CONFLICTO: $duplicate existe en ambos lugares" >> name-conflicts.txt
                fi
            done
            
            rm "$temp_file"
        fi
        
        echo "---" >> name-conflicts.txt
    fi
done

echo "✅ Análisis de conflictos creado en name-conflicts.txt"

# 4. Análizar importaciones y dependencias
echo "" > import-analysis.txt
echo "📥 ANÁLISIS DE IMPORTACIONES Y DEPENDENCIAS" >> import-analysis.txt
echo "===========================================" >> import-analysis.txt

echo "🔍 Buscando importaciones desde _lib..." >> import-analysis.txt

# Buscar todas las importaciones que apuntan a _lib
find .. -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs grep -l "from.*_lib" | while read file; do
    echo "" >> import-analysis.txt
    echo "📄 Archivo: $file" >> import-analysis.txt
    grep "from.*_lib" "$file" | sed 's/^/  /' >> import-analysis.txt
done

echo "✅ Análisis de importaciones creado en import-analysis.txt"

# 5. Análizar tamaño y complejidad de archivos
echo "" > file-complexity.txt
echo "📊 ANÁLISIS DE COMPLEJIDAD DE ARCHIVOS" >> file-complexity.txt
echo "=====================================" >> file-complexity.txt

for dir in "${LIB_DIRS[@]}"; do
    if [ -d "../$dir" ]; then
        echo "" >> file-complexity.txt
        echo "📂 Complejidad en: $dir" >> file-complexity.txt
        echo "Archivo | Líneas | Funciones | Exports" >> file-complexity.txt
        echo "--------|--------|-----------|--------" >> file-complexity.txt
        
        for file in "../$dir"/*.{ts,js}; do
            if [ -f "$file" ]; then
                lines=$(wc -l < "$file")
                functions=$(grep -c "function\|const.*=.*=>\|export.*function" "$file" 2>/dev/null || echo 0)
                exports=$(grep -c "export" "$file" 2>/dev/null || echo 0)
                filename=$(basename "$file")
                
                echo "$filename | $lines | $functions | $exports" >> file-complexity.txt
                
                # Marcar archivos complejos
                if [ "$lines" -gt 200 ]; then
                    echo "  🔴 ARCHIVO COMPLEJO: $filename ($lines líneas)" >> file-complexity.txt
                elif [ "$lines" -gt 100 ]; then
                    echo "  🟡 ARCHIVO MEDIANO: $filename ($lines líneas)" >> file-complexity.txt
                fi
            fi
        done
        
        # Analizar también actions si existe
        if [ -d "../$dir/actions" ]; then
            echo "" >> file-complexity.txt
            echo "📂 Complejidad en: $dir/actions" >> file-complexity.txt
            echo "Archivo | Líneas | Funciones | Exports" >> file-complexity.txt
            echo "--------|--------|-----------|--------" >> file-complexity.txt
            
            for file in "../$dir/actions"/*.{ts,js}; do
                if [ -f "$file" ]; then
                    lines=$(wc -l < "$file")
                    functions=$(grep -c "function\|const.*=.*=>\|export.*function" "$file" 2>/dev/null || echo 0)
                    exports=$(grep -c "export" "$file" 2>/dev/null || echo 0)
                    filename=$(basename "$file")
                    
                    echo "$filename | $lines | $functions | $exports" >> file-complexity.txt
                    
                    if [ "$lines" -gt 200 ]; then
                        echo "  🔴 ARCHIVO COMPLEJO: $filename ($lines líneas)" >> file-complexity.txt
                    elif [ "$lines" -gt 100 ]; then
                        echo "  🟡 ARCHIVO MEDIANO: $filename ($lines líneas)" >> file-complexity.txt
                    fi
                fi
            done
        fi
        
        echo "---" >> file-complexity.txt
    fi
done

echo "✅ Análisis de complejidad creado en file-complexity.txt"

# 6. Crear plan de acción recomendado
echo "" > action-plan.txt
echo "🎯 PLAN DE ACCIÓN RECOMENDADO" >> action-plan.txt
echo "============================" >> action-plan.txt
echo "" >> action-plan.txt
echo "📋 ESTRATEGIA DE MIGRACIÓN SEGURA:" >> action-plan.txt
echo "" >> action-plan.txt
echo "1️⃣ ARCHIVOS SEGUROS PARA MOVER:" >> action-plan.txt
echo "   - Archivos en _lib raíz sin conflictos de nombres" >> action-plan.txt
echo "   - Archivos pequeños (<100 líneas)" >> action-plan.txt
echo "   - Archivos con pocas dependencias" >> action-plan.txt
echo "" >> action-plan.txt
echo "2️⃣ ARCHIVOS QUE REQUIEREN ANÁLISIS:" >> action-plan.txt
echo "   - Archivos con nombres conflictivos" >> action-plan.txt
echo "   - Archivos complejos (>200 líneas)" >> action-plan.txt
echo "   - Archivos con muchas dependencias" >> action-plan.txt
echo "" >> action-plan.txt
echo "3️⃣ ARCHIVOS QUE REQUIEREN REFACTOR:" >> action-plan.txt
echo "   - Archivos muy complejos" >> action-plan.txt
echo "   - Archivos con funcionalidad solapada" >> action-plan.txt
echo "" >> action-plan.txt
echo "4️⃣ ESTRATEGIA DE NOMBRES:" >> action-plan.txt
echo "   - Para conflictos: usar prefijos de dominio" >> action-plan.txt
echo "   - Ejemplo: userAuth.actions.ts vs adminAuth.actions.ts" >> action-plan.txt
echo "" >> action-plan.txt

echo "✅ Plan de acción creado en action-plan.txt"

# 7. Resumen ejecutivo
echo "" > executive-summary.txt
echo "📊 RESUMEN EJECUTIVO - ANÁLISIS _lib" >> executive-summary.txt
echo "====================================" >> executive-summary.txt
echo "" >> executive-summary.txt

# Contar archivos totales
total_lib_files=0
total_actions_files=0

for dir in "${LIB_DIRS[@]}"; do
    if [ -d "../$dir" ]; then
        lib_count=$(find "../$dir" -maxdepth 1 -name "*.ts" -o -name "*.js" | wc -l)
        total_lib_files=$((total_lib_files + lib_count))
        
        if [ -d "../$dir/actions" ]; then
            actions_count=$(find "../$dir/actions" -name "*.ts" -o -name "*.js" | wc -l)
            total_actions_files=$((total_actions_files + actions_count))
        fi
    fi
done

echo "📈 ESTADÍSTICAS GENERALES:" >> executive-summary.txt
echo "- Total archivos en _lib raíz: $total_lib_files" >> executive-summary.txt
echo "- Total archivos en _lib/actions: $total_actions_files" >> executive-summary.txt
echo "- Total archivos a analizar: $((total_lib_files + total_actions_files))" >> executive-summary.txt
echo "" >> executive-summary.txt

echo "📁 REPORTES GENERADOS:" >> executive-summary.txt
echo "1. structure-map.txt - Mapa completo de estructura" >> executive-summary.txt
echo "2. lib-root-vs-actions.txt - Comparación raíz vs actions" >> executive-summary.txt
echo "3. name-conflicts.txt - Conflictos de nombres potenciales" >> executive-summary.txt
echo "4. import-analysis.txt - Análisis de importaciones" >> executive-summary.txt
echo "5. file-complexity.txt - Complejidad de archivos" >> executive-summary.txt
echo "6. action-plan.txt - Plan de acción recomendado" >> executive-summary.txt
echo "" >> executive-summary.txt

echo "🔄 SIGUIENTE PASO:" >> executive-summary.txt
echo "Revisar todos los reportes antes de proceder con cualquier movimiento" >> executive-summary.txt

echo "✅ Resumen ejecutivo creado en executive-summary.txt"

cd ..

echo ""
echo "🎉 ANÁLISIS COMPLETADO"
echo "======================"
echo ""
echo "📁 Todos los reportes están en: lib-analysis-reports/"
echo ""
echo "📋 Reportes generados:"
echo "1. 📊 executive-summary.txt - Resumen ejecutivo"
echo "2. 🗂️ structure-map.txt - Mapa de estructura"
echo "3. 🆚 lib-root-vs-actions.txt - Comparación"
echo "4. ⚠️ name-conflicts.txt - Conflictos potenciales"
echo "5. 📥 import-analysis.txt - Análisis de dependencias"
echo "6. 📊 file-complexity.txt - Complejidad de archivos"
echo "7. 🎯 action-plan.txt - Plan de acción"
echo ""
echo "🔍 REVISAR REPORTES ANTES DE PROCEDER"
echo "======================================"
echo ""
echo "Para ver el resumen ejecutivo:"
echo "cat lib-analysis-reports/executive-summary.txt"
echo ""
echo "Para ver conflictos potenciales:"
echo "cat lib-analysis-reports/name-conflicts.txt"
