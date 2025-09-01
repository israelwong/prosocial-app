# 🚀 Migración a Stripe LIVE

## Variables que necesitas actualizar:

### En .env.local (desarrollo local):

```bash
STRIPE_SECRET_KEY="sk_live_TU_CLAVE_AQUÍ"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_TU_CLAVE_AQUÍ"
STRIPE_PUBLISHABLE_KEY="pk_live_TU_CLAVE_AQUÍ"
STRIPE_WEBHOOK_SECRET="whsec_TU_WEBHOOK_SECRET_LIVE"
```

### En Vercel (producción):

```bash
STRIPE_SECRET_KEY="sk_live_TU_CLAVE_AQUÍ"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_TU_CLAVE_AQUÍ"
STRIPE_PUBLISHABLE_KEY="pk_live_TU_CLAVE_AQUÍ"
STRIPE_WEBHOOK_SECRET="whsec_TU_WEBHOOK_SECRET_LIVE"
```

## ⚠️ IMPORTANTE - Configuración de Webhook LIVE:

1. Ve a https://dashboard.stripe.com/webhooks
2. Crea/actualiza webhook con URL: `https://tu-dominio.vercel.app/api/webhooks/stripe`
3. Agrega estos eventos:
   - payment_intent.succeeded
   - payment_intent.payment_failed
   - payment_intent.canceled
   - payment_intent.processing
   - charge.succeeded
   - charge.failed

## 🔄 Pasos para migrar:

1. **Obtén las claves LIVE** de Stripe Dashboard
2. **Actualiza .env.local** con las nuevas claves
3. **Actualiza variables en Vercel**
4. **Configura webhook LIVE** apuntando a tu dominio de producción
5. **Reinicia desarrollo local**: `npm run dev`
6. **Redeploy en Vercel**

## ✅ Verificación:

- [ ] Claves LIVE en desarrollo local
- [ ] Claves LIVE en Vercel
- [ ] Webhook LIVE configurado
- [ ] Pagos funcionando en desarrollo
- [ ] Pagos funcionando en producción
