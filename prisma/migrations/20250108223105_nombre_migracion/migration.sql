-- AlterTable
ALTER TABLE "Cotizacion" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '10 day';
