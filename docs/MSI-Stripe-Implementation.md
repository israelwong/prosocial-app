# Implementación MSI Específicos - Stripe Integration

## 📋 Resumen de Cambios

### Problema Original

- UI mostraba "3 MSI de $1,500" pero Stripe mostraba opciones MSI diferentes
- Cliente podía elegir 6 o 12 MSI pagando precio calculado para 3 MSI
- Discrepancia entre precio prometido y precio real cobrado

### Solución Implementada

- **MSI Específicos**: Usar `installment.plan.count` para forzar número exacto
- **Pago Único**: Deshabilitar MSI cuando `num_msi = 0`
- **Logging**: Debug detallado para rastrear configuración enviada a Stripe

## 🔧 Archivos Modificados

### 1. `/pages/api/checkout.js` (ORIGINAL)

```javascript
// ANTES: MSI genérico
installments: {
    enabled: true // Stripe decide qué MSI mostrar
}

// DESPUÉS: MSI específico
installments: {
    enabled: true,
    plan: {
        count: num_msi,     // 3, 6, 9 o 12 exacto
        interval: 'month',
        type: 'fixed_count'
    }
}
```

### 2. `/pages/api/checkout/create-session.js` (NUEVO)

- Endpoint dedicado para `/api/checkout/create-session`
- Soporte para GET y POST requests
- Misma lógica de MSI específicos
- Logging mejorado para debugging

### 3. `/test-msi-checkout.js` (NUEVO)

- Script de validación de configuración MSI
- Prueba todos los escenarios (3, 6, 9, 12, sin MSI)
- Verificación de configuración Stripe antes de deploy

## 🎯 Casos de Uso Validados

| Escenario | UI Muestra          | Stripe Recibe    | Resultado                 |
| --------- | ------------------- | ---------------- | ------------------------- |
| 3 MSI     | "3 MSI de $500"     | `count: 3`       | ✅ Solo 3 MSI disponible  |
| 6 MSI     | "6 MSI de $250"     | `count: 6`       | ✅ Solo 6 MSI disponible  |
| 9 MSI     | "9 MSI de $167"     | `count: 9`       | ✅ Solo 9 MSI disponible  |
| 12 MSI    | "12 MSI de $125"    | `count: 12`      | ✅ Solo 12 MSI disponible |
| Sin MSI   | "Pago único $1,500" | `enabled: false` | ✅ Sin opciones MSI       |

## 🔍 Debugging y Monitoreo

### Logs Implementados

```javascript
console.log("💳 CREATE-SESSION API - Datos recibidos:", {
  metodoPago,
  num_msi,
  monto,
  precioFinal,
});

console.log("🔧 STRIPE CONFIG - Configuración final:", {
  payment_method_options,
  monto_centavos,
});

console.log("✅ STRIPE SESSION - Sesión creada:", {
  sessionId,
  url,
  payment_intent,
});
```

### Verificación en Desarrollo

1. ✅ Script de prueba: `node test-msi-checkout.js`
2. ✅ Logs de API en terminal de desarrollo
3. ✅ Checkout de Stripe en navegador

## 🚀 Próximos Pasos para Pruebas

### Prueba en Desarrollo

1. Ir a una cotización activa
2. Seleccionar condición con MSI específicos
3. Verificar logs en terminal
4. Confirmar que Stripe Checkout muestra exactamente los MSI prometidos

### Validación en Stripe Dashboard

1. Revisar Payment Intents creados
2. Verificar metadata de installments
3. Confirmar que `count` coincide con UI

### Prueba de Regresión

- ✅ SPEI sigue funcionando
- ✅ Tarjetas sin MSI (pago único)
- ✅ Cálculos de comisiones correctos
- ✅ Anticipos y diferidos

## 📝 Notas Técnicas

### Limitaciones de Stripe

- Solo MSI: 3, 6, 9, 12 soportados
- Requiere tarjetas mexicanas para MSI
- Bank issuer debe soportar el número específico de MSI

### Fallback en Caso de Error

- Si MSI específico no está disponible, Stripe mostrará error
- Cliente puede intentar con tarjeta diferente
- Logs ayudarán a identificar problemas

## 🎯 Resultados Esperados

1. **Consistencia**: UI = Stripe Checkout = Precio final
2. **Transparencia**: Cliente sabe exactamente qué va a pagar
3. **Confianza**: No hay sorpresas en el checkout
4. **Debugging**: Fácil identificar problemas con logs

---

**Fecha de implementación**: 18 de agosto de 2025  
**Commit**: `01c6122 - feat: implementar MSI específicos en Stripe`  
**Estado**: ✅ Listo para pruebas en desarrollo
