import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { cotizacionId } = req.query;

    if (!cotizacionId) {
      return res.status(400).json({ error: "cotizacionId es requerido" });
    }

    console.log("🔍 Buscando pago más reciente para cotización:", cotizacionId);

    // Buscar el pago más reciente de la cotización (incluir pending para SPEI)
    const pago = await prisma.pago.findFirst({
      where: {
        cotizacionId: cotizacionId,
        status: {
          in: ["paid", "completado", "pending", "pending_payment", "processing"],
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    if (!pago) {
      console.log(
        "❌ No se encontró pago para la cotización:",
        cotizacionId
      );
      return res
        .status(404)
        .json({ error: "No se encontró pago para esta cotización" });
    }

    console.log("✅ Pago encontrado:", pago.id);

    res.status(200).json({
      success: true,
      pago: {
        id: pago.id,
        cotizacionId: pago.cotizacionId,
        status: pago.status,
        monto: pago.monto,
      },
    });
  } catch (error) {
    console.error("❌ Error al buscar pago por cotización:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      details: error.message,
    });
  }
}
