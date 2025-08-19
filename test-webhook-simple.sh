#!/bin/bash
# Test simple del webhook usando curl - no necesita instalar nada

echo "🧪 TESTING WEBHOOK STRIPE"
echo "========================="
echo ""

# Test 1: Payment Intent exitoso con MSI
echo "🔥 Test 1: Payment Intent con 6 MSI"
echo "------------------------------------"

curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{
    "id": "evt_test_webhook",
    "type": "payment_intent.succeeded",
    "data": {
      "object": {
        "id": "pi_test_123456789",
        "amount": 6723895,
        "currency": "mxn",
        "status": "succeeded",
        "metadata": {
          "cotizacionId": "cmehube0k0024gu7pj7fjjsmp",
          "cliente_nombre": "Israel Wong",
          "evento_id": "cmehua7dd0022gu7pdl07u0kg"
        },
        "charges": {
          "data": [
            {
              "id": "ch_test_charge_msi",
              "payment_method_details": {
                "card": {
                  "installments": {
                    "plan": {
                      "count": 6,
                      "interval": "month",
                      "type": "fixed_count"
                    }
                  },
                  "brand": "visa",
                  "last4": "4242"
                }
              }
            }
          ]
        }
      }
    }
  }'

echo ""
echo ""

# Test 2: Payment Intent exitoso sin MSI
echo "🔥 Test 2: Payment Intent - Pago Único"
echo "-------------------------------------"

curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{
    "id": "evt_test_single",
    "type": "payment_intent.succeeded",
    "data": {
      "object": {
        "id": "pi_test_single_123",
        "amount": 6723895,
        "currency": "mxn",
        "status": "succeeded",
        "metadata": {
          "cotizacionId": "cmehube0k0024gu7pj7fjjsmp",
          "cliente_nombre": "Israel Wong",
          "evento_id": "cmehua7dd0022gu7pdl07u0kg"
        },
        "charges": {
          "data": [
            {
              "id": "ch_test_single",
              "payment_method_details": {
                "card": {
                  "brand": "visa",
                  "last4": "4242"
                }
              }
            }
          ]
        }
      }
    }
  }'

echo ""
echo ""
echo "✅ Tests completados!"
echo "📝 Revisa los logs del servidor Next.js para ver los resultados"
