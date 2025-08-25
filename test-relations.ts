import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testRelations() {
    // Test para ver qué campos están disponibles en ServicioSeccion
    const test = await prisma.servicioSeccion.findFirst({
        include: {
            seccionCategoria: true  // Probamos con singular
        }
    });

    console.log("Available relations:", Object.keys(test || {}));
}

// No ejecutar, solo para verificar tipos
export default testRelations;
