-- CreateTable
CREATE TABLE "User" (
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
CREATE TABLE "Sesion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sesion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "status" TEXT NOT NULL DEFAULT 'activo',
    "canalId" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evento" (
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

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoBitacora" (
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
CREATE TABLE "EventoTipo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "posicion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventoTipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Canal" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "posicion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Canal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT,
    "cotizacionId" TEXT,
    "condicionesComercialesId" TEXT,
    "condicionesComercialesMetodoPagoId" TEXT,
    "metodoPagoId" TEXT,
    "metodo_pago" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "concepto" TEXT NOT NULL,
    "descripcion" TEXT,
    "stripe_session_id" TEXT,
    "stripe_payment_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cotizacion" (
    "id" TEXT NOT NULL,
    "eventoTipoId" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "condicionesComercialesId" TEXT,
    "condicionesComercialesMetodoPagoId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) DEFAULT now() + interval '10 day',
    "contratoId" TEXT,

    CONSTRAINT "Cotizacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CotizacionServicio" (
    "id" TEXT NOT NULL,
    "cotizacionId" TEXT NOT NULL,
    "servicioId" TEXT NOT NULL,
    "servicioCategoriaId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "posicion" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT,
    "fechaAsignacion" TIMESTAMP(3),
    "FechaEntrega" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pendiente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CotizacionServicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Servicio" (
    "id" TEXT NOT NULL,
    "servicioCategoriaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "costo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gasto" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "utilidad" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "precio_publico" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "posicion" INTEGER NOT NULL DEFAULT 0,
    "visible_cliente" BOOLEAN NOT NULL DEFAULT true,
    "tipo_utilidad" TEXT NOT NULL DEFAULT 'servicio',
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicioGasto" (
    "id" TEXT NOT NULL,
    "servicioId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "costo" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServicioGasto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicioCategoria" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "posicion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServicioCategoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paquete" (
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
CREATE TABLE "PaqueteServicio" (
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
CREATE TABLE "Configuracion" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "utilidad_servicio" DOUBLE PRECISION NOT NULL,
    "utilidad_producto" DOUBLE PRECISION NOT NULL,
    "comision_venta" DOUBLE PRECISION NOT NULL,
    "sobreprecio" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Configuracion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetodoPago" (
    "id" TEXT NOT NULL,
    "metodo_pago" TEXT NOT NULL,
    "comsion_porcentaje_base" DOUBLE PRECISION,
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
CREATE TABLE "CondicionesComerciales" (
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
CREATE TABLE "CondicionesComercialesMetodoPago" (
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
CREATE TABLE "CotizacionVisita" (
    "id" TEXT NOT NULL,
    "cotizacionId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CotizacionVisita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campania" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campania_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnuncioPlataforma" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnuncioPlataforma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnuncioTipo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnuncioTipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnuncioCategoria" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnuncioCategoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anuncio" (
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
CREATE TABLE "AnuncioVisita" (
    "id" TEXT NOT NULL,
    "anuncioId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnuncioVisita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CondicionesComercialesMetodoPagoToCotizacion" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CondicionesComercialesMetodoPagoToCotizacion_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sesion_token_key" ON "Sesion"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_telefono_key" ON "Cliente"("telefono");

-- CreateIndex
CREATE UNIQUE INDEX "Pago_stripe_session_id_key" ON "Pago"("stripe_session_id");

-- CreateIndex
CREATE UNIQUE INDEX "Pago_stripe_payment_id_key" ON "Pago"("stripe_payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "ServicioCategoria_nombre_key" ON "ServicioCategoria"("nombre");

-- CreateIndex
CREATE INDEX "_CondicionesComercialesMetodoPagoToCotizacion_B_index" ON "_CondicionesComercialesMetodoPagoToCotizacion"("B");

-- AddForeignKey
ALTER TABLE "Sesion" ADD CONSTRAINT "Sesion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_canalId_fkey" FOREIGN KEY ("canalId") REFERENCES "Canal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_eventoTipoId_fkey" FOREIGN KEY ("eventoTipoId") REFERENCES "EventoTipo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoBitacora" ADD CONSTRAINT "EventoBitacora_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_cotizacionId_fkey" FOREIGN KEY ("cotizacionId") REFERENCES "Cotizacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_condicionesComercialesId_fkey" FOREIGN KEY ("condicionesComercialesId") REFERENCES "CondicionesComerciales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_condicionesComercialesMetodoPagoId_fkey" FOREIGN KEY ("condicionesComercialesMetodoPagoId") REFERENCES "CondicionesComercialesMetodoPago"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_metodoPagoId_fkey" FOREIGN KEY ("metodoPagoId") REFERENCES "MetodoPago"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cotizacion" ADD CONSTRAINT "Cotizacion_eventoTipoId_fkey" FOREIGN KEY ("eventoTipoId") REFERENCES "EventoTipo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cotizacion" ADD CONSTRAINT "Cotizacion_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cotizacion" ADD CONSTRAINT "Cotizacion_condicionesComercialesId_fkey" FOREIGN KEY ("condicionesComercialesId") REFERENCES "CondicionesComerciales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CotizacionServicio" ADD CONSTRAINT "CotizacionServicio_cotizacionId_fkey" FOREIGN KEY ("cotizacionId") REFERENCES "Cotizacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CotizacionServicio" ADD CONSTRAINT "CotizacionServicio_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CotizacionServicio" ADD CONSTRAINT "CotizacionServicio_servicioCategoriaId_fkey" FOREIGN KEY ("servicioCategoriaId") REFERENCES "ServicioCategoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Servicio" ADD CONSTRAINT "Servicio_servicioCategoriaId_fkey" FOREIGN KEY ("servicioCategoriaId") REFERENCES "ServicioCategoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicioGasto" ADD CONSTRAINT "ServicioGasto_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paquete" ADD CONSTRAINT "Paquete_eventoTipoId_fkey" FOREIGN KEY ("eventoTipoId") REFERENCES "EventoTipo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaqueteServicio" ADD CONSTRAINT "PaqueteServicio_paqueteId_fkey" FOREIGN KEY ("paqueteId") REFERENCES "Paquete"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaqueteServicio" ADD CONSTRAINT "PaqueteServicio_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaqueteServicio" ADD CONSTRAINT "PaqueteServicio_servicioCategoriaId_fkey" FOREIGN KEY ("servicioCategoriaId") REFERENCES "ServicioCategoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CondicionesComercialesMetodoPago" ADD CONSTRAINT "CondicionesComercialesMetodoPago_condicionesComercialesId_fkey" FOREIGN KEY ("condicionesComercialesId") REFERENCES "CondicionesComerciales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CondicionesComercialesMetodoPago" ADD CONSTRAINT "CondicionesComercialesMetodoPago_metodoPagoId_fkey" FOREIGN KEY ("metodoPagoId") REFERENCES "MetodoPago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anuncio" ADD CONSTRAINT "Anuncio_campaniaId_fkey" FOREIGN KEY ("campaniaId") REFERENCES "Campania"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anuncio" ADD CONSTRAINT "Anuncio_anuncioTipoId_fkey" FOREIGN KEY ("anuncioTipoId") REFERENCES "AnuncioTipo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anuncio" ADD CONSTRAINT "Anuncio_anuncioCategoriaId_fkey" FOREIGN KEY ("anuncioCategoriaId") REFERENCES "AnuncioCategoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anuncio" ADD CONSTRAINT "Anuncio_anuncioPlataformaId_fkey" FOREIGN KEY ("anuncioPlataformaId") REFERENCES "AnuncioPlataforma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CondicionesComercialesMetodoPagoToCotizacion" ADD CONSTRAINT "_CondicionesComercialesMetodoPagoToCotizacion_A_fkey" FOREIGN KEY ("A") REFERENCES "CondicionesComercialesMetodoPago"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CondicionesComercialesMetodoPagoToCotizacion" ADD CONSTRAINT "_CondicionesComercialesMetodoPagoToCotizacion_B_fkey" FOREIGN KEY ("B") REFERENCES "Cotizacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
