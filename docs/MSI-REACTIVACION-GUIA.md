# 🔧 Guía de Reactivación MSI (Meses Sin Intereses)

## Estado Actual

- ✅ **MSI TEMPORALMENTE DESHABILITADO** para control total del flujo de pago
- ✅ **Solo pagos únicos** de tarjeta y SPEI funcionando
- ✅ **Código MSI preservado** en comentarios para futuras reactivaciones

## ¿Por qué se deshabilitó MSI?

Stripe controla automáticamente qué opciones de MSI mostrar según la tarjeta del cliente. Esto significa que aunque configuremos `num_msi = 6` en nuestro backend, el cliente podría seleccionar 3 o 12 meses en la interfaz de Stripe, creando inconsistencias.

**Ejemplo del problema:**

- Backend espera: 6 MSI
- Stripe muestra: 3, 6, 9, 12 MSI (según la tarjeta)
- Cliente selecciona: 12 MSI
- Resultado: Inconsistencia entre backend y pago real

## Cómo Reactivar MSI

### 1. Backend (API)

**Archivo:** `pages/api/checkout/create-session.js`

**Buscar la sección:**

```javascript
} else if (metodoPago === "card") {
```

**Cambios requeridos:**

1. **Descomentar** el bloque MSI (líneas entre `/*` y `*/`)
2. **Comentar** la configuración actual de "solo pagos únicos"

**Código a descomentar:**

```javascript
// Configuración oficial MSI según documentación de Stripe
sessionParams.payment_method_options = {
  card: {
    installments: {
      enabled: true,
    },
  },
};
```

### 2. Frontend (Opcional)

**Archivos afectados:**

- `app/evento/[eventoId]/cotizacion/[cotizacionId]/components/CondicionesComerciales.tsx`
- `app/evento/[eventoId]/cotizacion/[cotizacionId]/components/CotizacionDetalle.tsx`

**Nota:** El frontend ya maneja MSI correctamente. Solo es necesario reactivar el backend.

### 3. Pruebas de MSI

**Tarjetas de prueba para MSI en México:**

- `4000004840000008` - Soporta MSI (3, 6, 9, 12, 18, 24 meses)
- `4242424242424242` - No soporta MSI

**Comando de prueba:**

```bash
curl -X POST http://localhost:3000/api/checkout/create-session \
  -H "Content-Type: application/json" \
  -d '{
    "cotizacionId": 123,
    "monto": 1500.00,
    "paymentMethod": "card",
    "num_msi": 6,
    "metodoPagoId": "test_msi",
    "clienteId": "test_client",
    "nombreCliente": "Cliente Test",
    "emailCliente": "test@example.com"
  }'
```

## Consideraciones Importantes

### Limitaciones de MSI con Stripe

- ❌ **No control específico** sobre qué MSI mostrar (3, 6, 9, 12)
- ❌ **Stripe decide** las opciones según la tarjeta del cliente
- ❌ **Posibles inconsistencias** entre configuración backend y selección cliente

### Ventajas de Pagos Únicos (Estado Actual)

- ✅ **Control total** sobre el flujo de pago
- ✅ **Sin inconsistencias** entre backend y frontend
- ✅ **Simplicidad** en implementación y debugging
- ✅ **Experiencia clara** para el cliente

## Recomendación

Mantener MSI deshabilitado hasta que:

1. Se requiera específicamente por necesidades de negocio
2. Se implemente un sistema robusto de validación post-pago
3. Se acepten las limitaciones de control que impone Stripe

---

**Última actualización:** 18 de agosto de 2025  
**Estado:** MSI deshabilitado, solo pagos únicos activos
