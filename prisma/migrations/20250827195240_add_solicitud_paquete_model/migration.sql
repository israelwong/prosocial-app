-- AlterTable
ALTER TABLE "public"."Cotizacion" ADD COLUMN     "descuento" DOUBLE PRECISION,
ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '10 day';

-- CreateTable
CREATE TABLE "public"."Negocio" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "sitioWeb" TEXT,
    "logoUrl" TEXT,
    "isotipoUrl" TEXT,
    "moneda" TEXT NOT NULL DEFAULT 'MXN',
    "timezone" TEXT NOT NULL DEFAULT 'America/Mexico_City',
    "idioma" TEXT NOT NULL DEFAULT 'es',
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Negocio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NegocioRRSS" (
    "id" TEXT NOT NULL,
    "negocioId" TEXT NOT NULL,
    "plataforma" TEXT NOT NULL,
    "username" TEXT,
    "url" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NegocioRRSS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NegocioHorarios" (
    "id" TEXT NOT NULL,
    "negocioId" TEXT NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "horaInicio" TEXT,
    "horaFin" TEXT,
    "cerrado" BOOLEAN NOT NULL DEFAULT false,
    "fechaEspecial" TIMESTAMP(3),
    "notas" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NegocioHorarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SolicitudPaquete" (
    "id" TEXT NOT NULL,
    "cotizacionId" TEXT NOT NULL,
    "paqueteId" TEXT NOT NULL,
    "clienteNombre" TEXT NOT NULL,
    "clienteEmail" TEXT NOT NULL,
    "clienteTelefono" TEXT,
    "mensaje" TEXT,
    "paqueteNombre" TEXT NOT NULL,
    "precioPaquete" DOUBLE PRECISION NOT NULL,
    "diferenciaPrecio" DOUBLE PRECISION,
    "eventoFecha" TIMESTAMP(3),
    "eventoLugar" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "notas" TEXT,
    "fechaSolicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaProcesada" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SolicitudPaquete_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NegocioRRSS_negocioId_activo_idx" ON "public"."NegocioRRSS"("negocioId", "activo");

-- CreateIndex
CREATE UNIQUE INDEX "NegocioRRSS_negocioId_plataforma_key" ON "public"."NegocioRRSS"("negocioId", "plataforma");

-- CreateIndex
CREATE INDEX "NegocioHorarios_negocioId_activo_idx" ON "public"."NegocioHorarios"("negocioId", "activo");

-- CreateIndex
CREATE UNIQUE INDEX "NegocioHorarios_negocioId_diaSemana_key" ON "public"."NegocioHorarios"("negocioId", "diaSemana");

-- CreateIndex
CREATE INDEX "SolicitudPaquete_cotizacionId_idx" ON "public"."SolicitudPaquete"("cotizacionId");

-- CreateIndex
CREATE INDEX "SolicitudPaquete_paqueteId_idx" ON "public"."SolicitudPaquete"("paqueteId");

-- CreateIndex
CREATE INDEX "SolicitudPaquete_estado_idx" ON "public"."SolicitudPaquete"("estado");

-- CreateIndex
CREATE INDEX "SolicitudPaquete_fechaSolicitud_idx" ON "public"."SolicitudPaquete"("fechaSolicitud");

-- AddForeignKey
ALTER TABLE "public"."NegocioRRSS" ADD CONSTRAINT "NegocioRRSS_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "public"."Negocio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NegocioHorarios" ADD CONSTRAINT "NegocioHorarios_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "public"."Negocio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SolicitudPaquete" ADD CONSTRAINT "SolicitudPaquete_cotizacionId_fkey" FOREIGN KEY ("cotizacionId") REFERENCES "public"."Cotizacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SolicitudPaquete" ADD CONSTRAINT "SolicitudPaquete_paqueteId_fkey" FOREIGN KEY ("paqueteId") REFERENCES "public"."Paquete"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
