#!/bin/bash

# 🚀 Script para migrar a Stripe LIVE
# Uso: ./migrate-to-live.sh

echo "🚀 Iniciando migración a Stripe LIVE..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}⚠️  IMPORTANTE: Este script actualizará tu entorno local a claves LIVE${NC}"
echo -e "${YELLOW}   Asegúrate de tener las claves LIVE de Stripe listas${NC}"
echo ""

# Pedir confirmación
read -p "¿Quieres continuar? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Migración cancelada"
    exit 1
fi

echo ""
echo "📝 Por favor, proporciona las siguientes claves LIVE de Stripe:"
echo ""

# Pedir Secret Key LIVE
echo -n "🔑 STRIPE_SECRET_KEY (sk_live_...): "
read -s SECRET_KEY
echo ""

# Pedir Publishable Key LIVE
echo -n "🔑 NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (pk_live_...): "
read PUBLISHABLE_KEY

# Pedir Webhook Secret LIVE
echo -n "🔑 STRIPE_WEBHOOK_SECRET (whsec_...): "
read -s WEBHOOK_SECRET
echo ""

# Validar que las claves no estén vacías
if [[ -z "$SECRET_KEY" || -z "$PUBLISHABLE_KEY" || -z "$WEBHOOK_SECRET" ]]; then
    echo -e "${RED}❌ Error: Todas las claves son requeridas${NC}"
    exit 1
fi

# Validar formato de claves
if [[ ! "$SECRET_KEY" =~ ^sk_live_ ]]; then
    echo -e "${RED}❌ Error: Secret Key debe comenzar con 'sk_live_'${NC}"
    exit 1
fi

if [[ ! "$PUBLISHABLE_KEY" =~ ^pk_live_ ]]; then
    echo -e "${RED}❌ Error: Publishable Key debe comenzar con 'pk_live_'${NC}"
    exit 1
fi

if [[ ! "$WEBHOOK_SECRET" =~ ^whsec_ ]]; then
    echo -e "${RED}❌ Error: Webhook Secret debe comenzar con 'whsec_'${NC}"
    exit 1
fi

echo ""
echo "🔧 Actualizando .env.local..."

# Backup del archivo actual
if [ -f .env.local ]; then
    cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)
    echo "📋 Backup creado: .env.local.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Actualizar .env.local
cat > .env.local << EOF
# 🚀 Stripe LIVE Configuration
STRIPE_SECRET_KEY="${SECRET_KEY}"
STRIPE_PUBLISHABLE_KEY="${PUBLISHABLE_KEY}"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="${PUBLISHABLE_KEY}"
STRIPE_WEBHOOK_SECRET="${WEBHOOK_SECRET}"

# Database URL (mantener existente)
$(grep "DATABASE_URL" .env.local 2>/dev/null || echo "# DATABASE_URL=tu_database_url_aqui")

# Otras variables (mantener existentes)
$(grep -v "STRIPE\|DATABASE_URL" .env.local 2>/dev/null || echo "")
EOF

echo -e "${GREEN}✅ .env.local actualizado con claves LIVE${NC}"

echo ""
echo -e "${YELLOW}📋 PRÓXIMOS PASOS MANUALES:${NC}"
echo ""
echo "1. 🌐 Actualiza las variables en Vercel:"
echo "   - Ve a https://vercel.com/tu-proyecto/settings/environment-variables"
echo "   - Actualiza STRIPE_SECRET_KEY con: ${SECRET_KEY:0:20}..."
echo "   - Actualiza NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY con: ${PUBLISHABLE_KEY:0:20}..."
echo "   - Actualiza STRIPE_WEBHOOK_SECRET con el nuevo valor"
echo ""
echo "2. 🔗 Configura el webhook LIVE en Stripe:"
echo "   - Ve a https://dashboard.stripe.com/webhooks"
echo "   - Crea/actualiza webhook con URL: https://tu-dominio.vercel.app/api/webhooks/stripe"
echo "   - Copia el signing secret y úsalo como STRIPE_WEBHOOK_SECRET"
echo ""
echo "3. 🚀 Reinicia el servidor de desarrollo:"
echo "   npm run dev"
echo ""
echo "4. 📦 Redeploy en Vercel después de actualizar las variables"
echo ""

echo -e "${GREEN}✅ Migración local completada${NC}"
echo -e "${YELLOW}⚠️  Recuerda completar los pasos manuales listados arriba${NC}"
