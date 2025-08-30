const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function getPaquetes() {
  try {
    const paquetes = await prisma.paquete.findMany({
      select: {
        id: true,
        nombre: true,
      },
      take: 3,
    });

    console.log("Paquetes disponibles:");
    paquetes.forEach((p) => console.log(`ID: ${p.id}, Nombre: ${p.nombre}`));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

getPaquetes();
