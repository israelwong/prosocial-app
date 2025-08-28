# Implementación: Sistema de Solicitud de Paquetes para Reservar

          {/* Botón de solicitud */}
          <Button
            onClick={() => solicitarAgregarPaquete(paque  // Enviar notificación al asesor por email

await enviarNotificacionAsesor({
tipo: 'solicitud_paquete',
cliente: solicitud.clienteNombre,
telefono: solicitud.clienteTelefono,
paqueteActual: solicitud.cotizacionId,
paqueteDeseado: solicitud.paqueteDeseadoId,
mensaje: solicitud.mensaje,
diferenciaPrecio: solicitud.diferenciaPrecio,
});

// Enviar WhatsApp automático (opcional)
await enviarWhatsAppAsesor({
mensaje: `🎉 SOLICITUD DE PAQUETE PARA RESERVAR\n\nCliente: ${solicitud.clienteNombre}\nTeléfono: ${solicitud.clienteTelefono}\nPaquete solicitado: ${paquete.nombre}\nPrecio: $${paquete.precio.toLocaleString()}\n\n${solicitud.mensaje}`,
}); className="w-full mt-4 bg-blue-600 hover:bg-blue-700" >
� Solicita agregar este paquete para reservar
</Button>**Flujo Optimizado**

### **1. Vista de Comparación (Cliente)**

```tsx
const ComparadorPaquetes = () => {
  return (
    <div className="space-y-6">
      {/* Paquete Actual (Personalizado) */}
      <div className="border-2 border-green-500 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-green-400">
            Tu Paquete Personalizado
          </h3>
          <div className="text-2xl font-bold text-white">
            ${cotizacion.precio.toLocaleString()}
          </div>
        </div>

        {/* Estructura jerárquica actual */}
        <ServiciosAgrupados servicios={cotizacion.servicios} />

        <Button className="w-full mt-4 bg-green-600">Pagar Este Paquete</Button>
      </div>

      {/* Paquetes Sugeridos */}
      {paquetesSugeridos.map((paquete) => (
        <div
          key={paquete.id}
          className="border border-zinc-600 rounded-lg p-4 opacity-90"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-blue-400">
              {paquete.nombre} - Paquete Sugerido
            </h3>
            <div className="text-2xl font-bold text-white">
              ${paquete.precio.toLocaleString()}
            </div>
          </div>

          {/* Mostrar diferencia de precio */}
          <div className="mb-4">
            {paquete.precio < cotizacion.precio ? (
              <div className="text-green-400 text-sm">
                ✅ Ahorras $
                {(cotizacion.precio - paquete.precio).toLocaleString()}
              </div>
            ) : (
              <div className="text-orange-400 text-sm">
                💰 ${(paquete.precio - cotizacion.precio).toLocaleString()}{" "}
                adicional
              </div>
            )}
          </div>

          {/* Estructura jerárquica del paquete sugerido */}
          <ServiciosAgrupados servicios={paquete.servicios} readonly />

          {/* Botón de solicitud */}
          <Button
            onClick={() => solicitarCambio(paquete.id)}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
          >
            💬 Solicitar Cambio a Este Paquete
          </Button>
        </div>
      ))}
    </div>
  );
};
```

### **2. Modal de Solicitud de Paquete**

```tsx
const ModalSolicitudPaquete = ({ paquete, cotizacion, onClose }) => {
  const [mensaje, setMensaje] = useState("");

  const enviarSolicitud = async () => {
    const solicitud = {
      cotizacionId: cotizacion.id,
      paqueteDeseadoId: paquete.id,
      clienteNombre: cotizacion.cliente.nombre,
      clienteEmail: cotizacion.cliente.email,
      clienteTelefono: cotizacion.cliente.telefono,
      mensaje: mensaje,
      diferenciaPrecio: paquete.precio - cotizacion.precio,
      fechaSolicitud: new Date(),
    };

    // Enviar notificación al asesor
    await fetch("/api/solicitudes/agregar-paquete", {
      method: "POST",
      body: JSON.stringify(solicitud),
    });

    // Mostrar confirmación
    toast.success("Solicitud enviada. Te contactaremos pronto.");
    onClose();
  };

  return (
    <Modal isOpen onClose={onClose}>
      <div className="p-6 space-y-4">
        <h2 className="text-xl font-bold">
          Solicitar Agregar Paquete para Reservar
        </h2>

        <div className="bg-zinc-800 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Paquete Solicitado:</h3>
          <p className="text-blue-400">{paquete.nombre}</p>
          <p className="text-lg font-bold">
            ${paquete.precio.toLocaleString()}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Mensaje adicional (opcional):
          </label>
          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="¿Hay algún servicio que te gustaría modificar o agregar al paquete?"
            className="w-full bg-zinc-700 text-white p-3 rounded-lg resize-none"
            rows={3}
          />
        </div>

        <div className="text-sm text-zinc-400">
          🎉 Tu asesor te contactará pronto para confirmar los detalles y
          procesar la reserva de este paquete.
        </div>

        <div className="flex gap-2">
          <Button onClick={onClose} variant="outline">
            Cancelar
          </Button>
          <Button onClick={enviarSolicitud} className="flex-1 bg-blue-600">
            🎉 Solicitar Paquete para Reservar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
```

### **3. API Endpoint para Solicitudes**

```typescript
// /api/solicitudes/agregar-paquete/route.ts
export async function POST(request: Request) {
  const solicitud = await request.json();

  // Guardar solicitud en base de datos
  const nuevaSolicitud = await prisma.solicitudAgregarPaquete.create({
    data: {
      cotizacionId: solicitud.cotizacionId,
      paqueteDeseadoId: solicitud.paqueteDeseadoId,
      clienteNombre: solicitud.clienteNombre,
      clienteEmail: solicitud.clienteEmail,
      mensaje: solicitud.mensaje,
      estado: "pendiente",
      fechaSolicitud: new Date(),
    },
  });

  // Enviar notificación al asesor por email
  await enviarNotificacionAsesor({
    tipo: "cambio_paquete",
    cliente: solicitud.clienteNombre,
    telefono: solicitud.clienteTelefono,
    paqueteActual: solicitud.cotizacionId,
    paqueteDeseado: solicitud.paqueteDeseadoId,
    mensaje: solicitud.mensaje,
    diferenciaPrecio: solicitud.diferenciaPrecio,
  });

  // Enviar WhatsApp automático (opcional)
  await enviarWhatsAppAsesor({
    mensaje: `🔄 CAMBIO DE PAQUETE SOLICITADO\n\nCliente: ${solicitud.clienteNombre}\nTeléfono: ${solicitud.clienteTelefono}\nPaquete deseado: ${paquete.nombre}\nDiferencia: $${solicitud.diferenciaPrecio}\n\n${solicitud.mensaje}`,
  });

  return Response.json({ success: true, solicitudId: nuevaSolicitud.id });
}
```

### **4. Panel de Administración - Gestión de Solicitudes**

```tsx
const GestionSolicitudesPaquetes = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">
        Solicitudes de Paquetes para Reservar
      </h2>

      {solicitudesPendientes.map((solicitud) => (
        <div
          key={solicitud.id}
          className="bg-zinc-800 rounded-lg p-4 border-l-4 border-blue-500"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{solicitud.clienteNombre}</h3>
              <p className="text-sm text-zinc-400">
                📞 {solicitud.clienteTelefono}
              </p>
              <p className="text-sm text-zinc-400">
                📧 {solicitud.clienteEmail}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-zinc-400">Paquete solicitado:</div>
              <div className="font-bold text-blue-400">
                {solicitud.paqueteNombre}
              </div>
              <div className="text-lg font-bold text-white">
                ${solicitud.precioPaquete.toLocaleString()}
              </div>
            </div>
          </div>

          {solicitud.mensaje && (
            <div className="mt-2 p-2 bg-zinc-700 rounded text-sm">
              💬 "{solicitud.mensaje}"
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => crearCotizacionPaquete(solicitud)}
              className="bg-green-600"
            >
              ✅ Crear Cotización del Paquete
            </Button>
            <Button
              onClick={() => contactarCliente(solicitud)}
              className="bg-blue-600"
            >
              📞 Contactar Cliente
            </Button>
            <Button
              onClick={() => rechazarSolicitud(solicitud.id)}
              variant="outline"
            >
              ❌ Rechazar Solicitud
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
```

## 🎯 **Beneficios de Esta Implementación**

1. **🎪 Mejor Experiencia**: Cliente ve opciones de paquetes y puede solicitarlos fácilmente
2. **💼 Control Total**: Asesor valida y personaliza el paquete antes de crear cotización
3. **⚡ Implementación Simple**: No requiere lógica compleja de creación automática
4. **📈 Mayores Ventas**: Oportunidad de upselling y personalización durante la conversación
5. **🔒 Menor Riesgo**: No hay creaciones automáticas que puedan fallar
6. **🎉 Enfoque en Reserva**: El lenguaje está orientado a "reservar" el evento

## 📱 **Flujo Móvil Optimizado**

- Cards compactas para comparación de paquetes
- Botones grandes para "Solicitar agregar paquete para reservar"
- WhatsApp directo como alternativa de contacto
- Modal responsive para solicitudes con enfoque en reserva

## 🔄 **Flujo Completo Actualizado**

```
1. Cliente ve su cotización personalizada ✅
2. Sistema muestra paquetes sugeridos con estructura jerárquica 📋
3. Cliente presiona "🎉 Solicita agregar este paquete para reservar" 💬
4. Se envía notificación automática al asesor 📧📱
5. Asesor contacta cliente para confirmar detalles 📞
6. Asesor crea nueva cotización con el paquete en admin 🏗️
7. Cliente recibe link para pagar y reservar su evento 💳
```

Esta aproximación mantiene el control del negocio mientras facilita al cliente la solicitud de paquetes específicos para reservar su evento.
