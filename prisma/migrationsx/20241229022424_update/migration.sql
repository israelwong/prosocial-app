/*
  Warnings:

  - You are about to drop the column `etapa` on the `Cliente` table. All the data in the column will be lost.
  - You are about to drop the column `contratoId` on the `Pago` table. All the data in the column will be lost.
  - You are about to drop the column `fecha` on the `Pago` table. All the data in the column will be lost.
  - You are about to drop the `EventoComentario` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[stripe_session_id]` on the table `Pago` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripe_payment_id]` on the table `Pago` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `concepto` to the `Pago` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "EventoComentario" DROP CONSTRAINT "EventoComentario_eventoId_fkey";

-- DropForeignKey
ALTER TABLE "Pago" DROP CONSTRAINT "Pago_contratoId_fkey";

-- AlterTable
ALTER TABLE "Cliente" DROP COLUMN "etapa",
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "CondicionesComerciales" ADD COLUMN     "orden" INTEGER DEFAULT 0,
ADD COLUMN     "porcentaje_anticipo" DOUBLE PRECISION DEFAULT 0;

-- AlterTable
ALTER TABLE "Cotizacion" ADD COLUMN     "expiresAt" TIMESTAMP(3) DEFAULT now() + interval '10 day',
ALTER COLUMN "status" SET DEFAULT 'pending';

-- AlterTable
ALTER TABLE "Evento" ADD COLUMN     "userId" TEXT,
ALTER COLUMN "nombre" DROP NOT NULL,
ALTER COLUMN "nombre" SET DEFAULT 'Pendiente';

-- AlterTable
ALTER TABLE "MetodoPago" ADD COLUMN     "payment_method" TEXT DEFAULT 'card';

-- AlterTable
ALTER TABLE "Pago" DROP COLUMN "contratoId",
DROP COLUMN "fecha",
ADD COLUMN     "clienteId" TEXT,
ADD COLUMN     "concepto" TEXT NOT NULL,
ADD COLUMN     "condicionesComercialesId" TEXT,
ADD COLUMN     "condicionesComercialesMetodoPagoId" TEXT,
ADD COLUMN     "cotizacionId" TEXT,
ADD COLUMN     "descripcion" TEXT,
ADD COLUMN     "stripe_payment_id" TEXT,
ADD COLUMN     "stripe_session_id" TEXT,
ALTER COLUMN "status" SET DEFAULT 'pending';

-- DropTable
DROP TABLE "EventoComentario";

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
CREATE TABLE "EventoStatus" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "posicion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventoStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pago_stripe_session_id_key" ON "Pago"("stripe_session_id");

-- CreateIndex
CREATE UNIQUE INDEX "Pago_stripe_payment_id_key" ON "Pago"("stripe_payment_id");

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
