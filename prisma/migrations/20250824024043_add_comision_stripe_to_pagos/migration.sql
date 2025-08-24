-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "username" TEXT,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "telefono" TEXT,
    "status" TEXT NOT NULL DEFAULT 'inactive',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Sesion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sesion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Cliente" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "status" TEXT NOT NULL DEFAULT 'activo',
    "canalId" TEXT,
    "userId" TEXT,
    "passwordHash" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Evento" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "eventoTipoId" TEXT,
    "nombre" TEXT DEFAULT 'Pendiente',
    "fecha_evento" TIMESTAMP(3) NOT NULL,
    "sede" TEXT,
    "direccion" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "eventoEtapaId" TEXT,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EventoBitacora" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "comentario" TEXT NOT NULL,
    "importancia" TEXT NOT NULL DEFAULT '1',
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventoBitacora_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EventoTipo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "posicion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventoTipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EventoEtapa" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "posicion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventoEtapa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Canal" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "posicion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Canal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Pago" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT,
    "cotizacionId" TEXT,
    "condicionesComercialesId" TEXT,
    "condicionesComercialesMetodoPagoId" TEXT,
    "metodoPagoId" TEXT,
    "metodo_pago" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "comisionStripe" DOUBLE PRECISION,
    "concepto" TEXT NOT NULL,
    "descripcion" TEXT,
    "stripe_session_id" TEXT,
    "stripe_payment_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "tipo_transaccion" TEXT DEFAULT 'ingreso',
    "categoria_transaccion" TEXT DEFAULT 'abono',

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Cotizacion" (
    "id" TEXT NOT NULL,
    "eventoTipoId" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "descripcion" TEXT,
    "condicionesComercialesId" TEXT,
    "condicionesComercialesMetodoPagoId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pendiente',
    "archivada" BOOLEAN NOT NULL DEFAULT false,
    "visible_cliente" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) DEFAULT now() + interval '10 day',

    CONSTRAINT "Cotizacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CotizacionServicio" (
    "id" TEXT NOT NULL,
    "cotizacionId" TEXT NOT NULL,
    "servicioId" TEXT,
    "servicioCategoriaId" TEXT,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "posicion" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT,
    "fechaAsignacion" TIMESTAMP(3),
    "FechaEntrega" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pendiente',
    "seccion_nombre_snapshot" TEXT,
    "categoria_nombre_snapshot" TEXT,
    "nombre_snapshot" TEXT NOT NULL DEFAULT 'Servicio migrado',
    "descripcion_snapshot" TEXT,
    "precio_unitario_snapshot" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "costo_snapshot" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gasto_snapshot" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "utilidad_snapshot" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "precio_publico_snapshot" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tipo_utilidad_snapshot" TEXT NOT NULL DEFAULT 'servicio',
    "precioUnitario" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nombre" TEXT,
    "descripcion" TEXT,
    "costo" DOUBLE PRECISION DEFAULT 0,
    "gasto" DOUBLE PRECISION DEFAULT 0,
    "utilidad" DOUBLE PRECISION DEFAULT 0,
    "precio_publico" DOUBLE PRECISION DEFAULT 0,
    "tipo_utilidad" TEXT DEFAULT 'servicio',
    "categoria_nombre" TEXT,
    "seccion_nombre" TEXT,
    "es_personalizado" BOOLEAN NOT NULL DEFAULT false,
    "servicio_original_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CotizacionServicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CotizacionCosto" (
    "id" TEXT NOT NULL,
    "cotizacionId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "costo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tipo" TEXT NOT NULL DEFAULT 'adicional',
    "posicion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CotizacionCosto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CotizacionVisita" (
    "id" TEXT NOT NULL,
    "cotizacionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CotizacionVisita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Servicio" (
    "id" TEXT NOT NULL,
    "servicioCategoriaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "costo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gasto" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "utilidad" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "precio_publico" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tipo_utilidad" TEXT NOT NULL DEFAULT 'servicio',
    "posicion" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "visible_cliente" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ServicioSeccion" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "posicion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServicioSeccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SeccionCategoria" (
    "id" TEXT NOT NULL,
    "seccionId" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,

    CONSTRAINT "SeccionCategoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ServicioGasto" (
    "id" TEXT NOT NULL,
    "servicioId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "costo" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServicioGasto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ServicioCategoria" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "posicion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServicioCategoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Paquete" (
    "id" TEXT NOT NULL,
    "eventoTipoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "costo" DOUBLE PRECISION,
    "gasto" DOUBLE PRECISION,
    "utilidad" DOUBLE PRECISION,
    "precio" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'active',
    "posicion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Paquete_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PaqueteServicio" (
    "id" TEXT NOT NULL,
    "paqueteId" TEXT NOT NULL,
    "servicioId" TEXT NOT NULL,
    "servicioCategoriaId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "posicion" INTEGER NOT NULL DEFAULT 0,
    "visible_cliente" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaqueteServicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Configuracion" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "utilidad_servicio" DOUBLE PRECISION NOT NULL,
    "utilidad_producto" DOUBLE PRECISION NOT NULL,
    "comision_venta" DOUBLE PRECISION NOT NULL,
    "sobreprecio" DOUBLE PRECISION NOT NULL,
    "claveAutorizacion" TEXT,
    "numeroMaximoServiciosPorDia" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Configuracion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MetodoPago" (
    "id" TEXT NOT NULL,
    "metodo_pago" TEXT NOT NULL,
    "comision_porcentaje_base" DOUBLE PRECISION,
    "comision_fija_monto" DOUBLE PRECISION,
    "num_msi" INTEGER,
    "comision_msi_porcentaje" DOUBLE PRECISION,
    "orden" INTEGER DEFAULT 0,
    "payment_method" TEXT DEFAULT 'card',
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetodoPago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CondicionesComerciales" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "descuento" DOUBLE PRECISION,
    "porcentaje_anticipo" DOUBLE PRECISION DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "orden" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CondicionesComerciales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CondicionesComercialesMetodoPago" (
    "id" TEXT NOT NULL,
    "condicionesComercialesId" TEXT NOT NULL,
    "metodoPagoId" TEXT NOT NULL,
    "orden" INTEGER DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CondicionesComercialesMetodoPago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Campania" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campania_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AnuncioPlataforma" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnuncioPlataforma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AnuncioTipo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnuncioTipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AnuncioCategoria" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnuncioCategoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Anuncio" (
    "id" TEXT NOT NULL,
    "campaniaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "anuncioTipoId" TEXT NOT NULL,
    "anuncioCategoriaId" TEXT NOT NULL,
    "anuncioPlataformaId" TEXT NOT NULL,
    "imagen_url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Anuncio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AnuncioVisita" (
    "id" TEXT NOT NULL,
    "anuncioId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnuncioVisita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Agenda" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "eventoId" TEXT NOT NULL,
    "concepto" TEXT,
    "descripcion" TEXT,
    "googleMapsUrl" TEXT,
    "direccion" TEXT,
    "fecha" TIMESTAMP(3),
    "hora" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pendiente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "agendaTipo" TEXT,

    CONSTRAINT "Agenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AgendaTipo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgendaTipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notificacion" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "cotizacionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Nomina" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventoId" TEXT,
    "concepto" TEXT NOT NULL,
    "descripcion" TEXT,
    "monto_bruto" DOUBLE PRECISION NOT NULL,
    "deducciones" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monto_neto" DOUBLE PRECISION NOT NULL,
    "tipo_pago" TEXT NOT NULL DEFAULT 'individual',
    "servicios_incluidos" INTEGER NOT NULL DEFAULT 1,
    "fecha_asignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_autorizacion" TIMESTAMP(3),
    "fecha_pago" TIMESTAMP(3),
    "periodo_inicio" TIMESTAMP(3),
    "periodo_fin" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pendiente',
    "autorizado_por" TEXT,
    "pagado_por" TEXT,
    "metodo_pago" TEXT DEFAULT 'transferencia',
    "costo_total_snapshot" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gasto_total_snapshot" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "comision_porcentaje" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Nomina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NominaServicio" (
    "id" TEXT NOT NULL,
    "nominaId" TEXT NOT NULL,
    "cotizacionServicioId" TEXT,
    "servicio_nombre" TEXT NOT NULL,
    "seccion_nombre" TEXT,
    "categoria_nombre" TEXT,
    "costo_asignado" DOUBLE PRECISION NOT NULL,
    "cantidad_asignada" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NominaServicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Suscripcion" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'evento',
    "status" TEXT NOT NULL DEFAULT 'activa',
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaVencimiento" TIMESTAMP(3),
    "precio" DOUBLE PRECISION,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Suscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Gasto" (
    "id" TEXT NOT NULL,
    "concepto" TEXT NOT NULL,
    "descripcion" TEXT,
    "monto" DOUBLE PRECISION NOT NULL,
    "categoria" TEXT NOT NULL,
    "subcategoria" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaFactura" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'activo',
    "metodoPago" TEXT,
    "numeroFactura" TEXT,
    "proveedor" TEXT,
    "eventoId" TEXT,
    "usuarioId" TEXT NOT NULL,
    "comprobanteUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gasto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_CondicionesComercialesMetodoPagoToCotizacion" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CondicionesComercialesMetodoPagoToCotizacion_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sesion_token_key" ON "public"."Sesion"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_telefono_key" ON "public"."Cliente"("telefono");

-- CreateIndex
CREATE UNIQUE INDEX "Pago_stripe_session_id_key" ON "public"."Pago"("stripe_session_id");

-- CreateIndex
CREATE UNIQUE INDEX "Pago_stripe_payment_id_key" ON "public"."Pago"("stripe_payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "ServicioSeccion_nombre_key" ON "public"."ServicioSeccion"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "SeccionCategoria_categoriaId_key" ON "public"."SeccionCategoria"("categoriaId");

-- CreateIndex
CREATE UNIQUE INDEX "ServicioCategoria_nombre_key" ON "public"."ServicioCategoria"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "AgendaTipo_nombre_key" ON "public"."AgendaTipo"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "NominaServicio_nominaId_cotizacionServicioId_key" ON "public"."NominaServicio"("nominaId", "cotizacionServicioId");

-- CreateIndex
CREATE UNIQUE INDEX "Suscripcion_clienteId_key" ON "public"."Suscripcion"("clienteId");

-- CreateIndex
CREATE INDEX "Gasto_fecha_categoria_idx" ON "public"."Gasto"("fecha", "categoria");

-- CreateIndex
CREATE INDEX "Gasto_eventoId_idx" ON "public"."Gasto"("eventoId");

-- CreateIndex
CREATE INDEX "_CondicionesComercialesMetodoPagoToCotizacion_B_index" ON "public"."_CondicionesComercialesMetodoPagoToCotizacion"("B");

-- AddForeignKey
ALTER TABLE "public"."Sesion" ADD CONSTRAINT "Sesion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cliente" ADD CONSTRAINT "Cliente_canalId_fkey" FOREIGN KEY ("canalId") REFERENCES "public"."Canal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Evento" ADD CONSTRAINT "Evento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Evento" ADD CONSTRAINT "Evento_eventoTipoId_fkey" FOREIGN KEY ("eventoTipoId") REFERENCES "public"."EventoTipo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Evento" ADD CONSTRAINT "Evento_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Evento" ADD CONSTRAINT "Evento_eventoEtapaId_fkey" FOREIGN KEY ("eventoEtapaId") REFERENCES "public"."EventoEtapa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventoBitacora" ADD CONSTRAINT "EventoBitacora_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "public"."Evento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pago" ADD CONSTRAINT "Pago_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pago" ADD CONSTRAINT "Pago_cotizacionId_fkey" FOREIGN KEY ("cotizacionId") REFERENCES "public"."Cotizacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pago" ADD CONSTRAINT "Pago_condicionesComercialesId_fkey" FOREIGN KEY ("condicionesComercialesId") REFERENCES "public"."CondicionesComerciales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pago" ADD CONSTRAINT "Pago_condicionesComercialesMetodoPagoId_fkey" FOREIGN KEY ("condicionesComercialesMetodoPagoId") REFERENCES "public"."CondicionesComercialesMetodoPago"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pago" ADD CONSTRAINT "Pago_metodoPagoId_fkey" FOREIGN KEY ("metodoPagoId") REFERENCES "public"."MetodoPago"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pago" ADD CONSTRAINT "Pago_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cotizacion" ADD CONSTRAINT "Cotizacion_eventoTipoId_fkey" FOREIGN KEY ("eventoTipoId") REFERENCES "public"."EventoTipo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cotizacion" ADD CONSTRAINT "Cotizacion_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "public"."Evento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cotizacion" ADD CONSTRAINT "Cotizacion_condicionesComercialesId_fkey" FOREIGN KEY ("condicionesComercialesId") REFERENCES "public"."CondicionesComerciales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CotizacionServicio" ADD CONSTRAINT "CotizacionServicio_cotizacionId_fkey" FOREIGN KEY ("cotizacionId") REFERENCES "public"."Cotizacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CotizacionServicio" ADD CONSTRAINT "CotizacionServicio_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "public"."Servicio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CotizacionServicio" ADD CONSTRAINT "CotizacionServicio_servicioCategoriaId_fkey" FOREIGN KEY ("servicioCategoriaId") REFERENCES "public"."ServicioCategoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CotizacionServicio" ADD CONSTRAINT "CotizacionServicio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CotizacionCosto" ADD CONSTRAINT "CotizacionCosto_cotizacionId_fkey" FOREIGN KEY ("cotizacionId") REFERENCES "public"."Cotizacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CotizacionVisita" ADD CONSTRAINT "CotizacionVisita_cotizacionId_fkey" FOREIGN KEY ("cotizacionId") REFERENCES "public"."Cotizacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Servicio" ADD CONSTRAINT "Servicio_servicioCategoriaId_fkey" FOREIGN KEY ("servicioCategoriaId") REFERENCES "public"."ServicioCategoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SeccionCategoria" ADD CONSTRAINT "SeccionCategoria_seccionId_fkey" FOREIGN KEY ("seccionId") REFERENCES "public"."ServicioSeccion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SeccionCategoria" ADD CONSTRAINT "SeccionCategoria_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "public"."ServicioCategoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServicioGasto" ADD CONSTRAINT "ServicioGasto_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "public"."Servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Paquete" ADD CONSTRAINT "Paquete_eventoTipoId_fkey" FOREIGN KEY ("eventoTipoId") REFERENCES "public"."EventoTipo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaqueteServicio" ADD CONSTRAINT "PaqueteServicio_paqueteId_fkey" FOREIGN KEY ("paqueteId") REFERENCES "public"."Paquete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaqueteServicio" ADD CONSTRAINT "PaqueteServicio_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "public"."Servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaqueteServicio" ADD CONSTRAINT "PaqueteServicio_servicioCategoriaId_fkey" FOREIGN KEY ("servicioCategoriaId") REFERENCES "public"."ServicioCategoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CondicionesComercialesMetodoPago" ADD CONSTRAINT "CondicionesComercialesMetodoPago_condicionesComercialesId_fkey" FOREIGN KEY ("condicionesComercialesId") REFERENCES "public"."CondicionesComerciales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CondicionesComercialesMetodoPago" ADD CONSTRAINT "CondicionesComercialesMetodoPago_metodoPagoId_fkey" FOREIGN KEY ("metodoPagoId") REFERENCES "public"."MetodoPago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Anuncio" ADD CONSTRAINT "Anuncio_campaniaId_fkey" FOREIGN KEY ("campaniaId") REFERENCES "public"."Campania"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Anuncio" ADD CONSTRAINT "Anuncio_anuncioTipoId_fkey" FOREIGN KEY ("anuncioTipoId") REFERENCES "public"."AnuncioTipo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Anuncio" ADD CONSTRAINT "Anuncio_anuncioCategoriaId_fkey" FOREIGN KEY ("anuncioCategoriaId") REFERENCES "public"."AnuncioCategoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Anuncio" ADD CONSTRAINT "Anuncio_anuncioPlataformaId_fkey" FOREIGN KEY ("anuncioPlataformaId") REFERENCES "public"."AnuncioPlataforma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Agenda" ADD CONSTRAINT "Agenda_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Agenda" ADD CONSTRAINT "Agenda_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "public"."Evento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Nomina" ADD CONSTRAINT "Nomina_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Nomina" ADD CONSTRAINT "Nomina_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "public"."Evento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Nomina" ADD CONSTRAINT "Nomina_autorizado_por_fkey" FOREIGN KEY ("autorizado_por") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Nomina" ADD CONSTRAINT "Nomina_pagado_por_fkey" FOREIGN KEY ("pagado_por") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NominaServicio" ADD CONSTRAINT "NominaServicio_nominaId_fkey" FOREIGN KEY ("nominaId") REFERENCES "public"."Nomina"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NominaServicio" ADD CONSTRAINT "NominaServicio_cotizacionServicioId_fkey" FOREIGN KEY ("cotizacionServicioId") REFERENCES "public"."CotizacionServicio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Suscripcion" ADD CONSTRAINT "Suscripcion_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Gasto" ADD CONSTRAINT "Gasto_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "public"."Evento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Gasto" ADD CONSTRAINT "Gasto_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CondicionesComercialesMetodoPagoToCotizacion" ADD CONSTRAINT "_CondicionesComercialesMetodoPagoToCotizacion_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."CondicionesComercialesMetodoPago"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CondicionesComercialesMetodoPagoToCotizacion" ADD CONSTRAINT "_CondicionesComercialesMetodoPagoToCotizacion_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Cotizacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
