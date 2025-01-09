/*
  Warnings:

  - You are about to drop the column `fecha` on the `CotizacionVisita` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cotizacion" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '10 day';

-- AlterTable
ALTER TABLE "CotizacionVisita" DROP COLUMN "fecha";
