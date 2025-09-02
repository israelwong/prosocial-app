#!/bin/bash

echo "🔍 AUDIT DE ARCHIVOS NO UTILIZADOS - Fase 1 SaaS Refactor"
echo "=========================================================="
echo ""

# Crear directorio de reports
mkdir -p audit-reports

# 1. Buscar archivos con nombres sospechosos (backup, old, temp, etc.)
echo "1️⃣ ARCHIVOS CON NOMBRES SOSPECHOSOS:"
echo "-----------------------------------"
find . -type f \( -name "*.backup.*" -o -name "*_backup.*" -o -name "*.old.*" -o -name "*_old.*" -o -name "*.temp.*" -o -name "*_temp.*" -o -name "*-backup.*" -o -name "*-old.*" -o -name "*-temp.*" -o -name "*copy*" -o -name "*Copy*" -o -name "*duplicate*" -o -name "*test*" -o -name "*Test*" -o -name "*debug*" -o -name "*Debug*" \) | grep -v node_modules | grep -v .next | sort > audit-reports/suspicious-files.txt

cat audit-reports/suspicious-files.txt
echo ""
echo "Total archivos sospechosos: $(wc -l < audit-reports/suspicious-files.txt)"
echo ""

# 2. Buscar archivos con extensiones múltiples (.tsx.bak, .ts.old, etc.)
echo "2️⃣ ARCHIVOS CON EXTENSIONES MÚLTIPLES:"
echo "-------------------------------------"
find . -type f -name "*.ts.*" -o -name "*.tsx.*" -o -name "*.js.*" -o -name "*.jsx.*" | grep -v node_modules | grep -v .next | sort > audit-reports/multiple-extensions.txt

cat audit-reports/multiple-extensions.txt
echo ""
echo "Total archivos con extensiones múltiples: $(wc -l < audit-reports/multiple-extensions.txt)"
echo ""

# 3. Buscar componentes con versiones (v1, v2, v3, etc.)
echo "3️⃣ COMPONENTES CON VERSIONES:"
echo "-----------------------------"
find . -type f \( -name "*v[0-9]*" -o -name "*V[0-9]*" -o -name "*-[0-9]*" -o -name "*_[0-9]*" \) \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) | grep -v node_modules | grep -v .next | sort > audit-reports/versioned-components.txt

cat audit-reports/versioned-components.txt
echo ""
echo "Total componentes versionados: $(wc -l < audit-reports/versioned-components.txt)"
echo ""

# 4. Buscar archivos en docs/ que puedan ser obsoletos
echo "4️⃣ ARCHIVOS DE DOCUMENTACIÓN:"
echo "-----------------------------"
find ./docs -type f -name "*.md" 2>/dev/null | sort > audit-reports/docs-files.txt

if [ -f audit-reports/docs-files.txt ]; then
    cat audit-reports/docs-files.txt
    echo ""
    echo "Total archivos de docs: $(wc -l < audit-reports/docs-files.txt)"
else
    echo "No se encontró directorio docs/"
fi
echo ""

# 5. Estructura actual de _lib
echo "5️⃣ ESTRUCTURA ACTUAL DE _LIB:"
echo "-----------------------------"
find ./app/admin/_lib -type f \( -name "*.ts" -o -name "*.tsx" \) | head -20
echo ""
echo "Total archivos en _lib: $(find ./app/admin/_lib -type f \( -name "*.ts" -o -name "*.tsx" \) | wc -l)"
echo ""

# 6. Archivos con TODO, FIXME, HACK
echo "6️⃣ ARCHIVOS CON MARCADORES DE REVISIÓN:"
echo "--------------------------------------"
grep -r "TODO\|FIXME\|HACK\|XXX" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . | grep -v node_modules | grep -v .next | wc -l > audit-reports/review-markers-count.txt
echo "Total archivos con marcadores de revisión: $(cat audit-reports/review-markers-count.txt)"
echo ""

echo "📊 RESUMEN DEL AUDIT:"
echo "==================="
echo "- Archivos sospechosos: $(wc -l < audit-reports/suspicious-files.txt)"
echo "- Extensiones múltiples: $(wc -l < audit-reports/multiple-extensions.txt)"  
echo "- Componentes versionados: $(wc -l < audit-reports/versioned-components.txt)"
echo "- Archivos de docs: $(wc -l < audit-reports/docs-files.txt 2>/dev/null || echo 0)"
echo "- Archivos en _lib: $(find ./app/admin/_lib -type f \( -name "*.ts" -o -name "*.tsx" \) | wc -l)"
echo "- Marcadores de revisión: $(cat audit-reports/review-markers-count.txt)"
echo ""
echo "📁 Reports guardados en: ./audit-reports/"
echo ""
