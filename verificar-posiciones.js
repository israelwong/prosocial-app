const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function verificarPosicionesServicios() {
  try {
    console.log("🔍 Verificando posiciones en tabla Servicio:");

    const servicios = await prisma.servicio.findMany({
      where: {
        nombre: {
          contains: "Camarógrafo",
        },
      },
      select: {
        id: true,
        nombre: true,
        posicion: true,
        ServicioCategoria: {
          select: {
            nombre: true,
            seccionCategoria: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
      orderBy: {
        nombre: "asc",
      },
    });

    console.log('\n📋 Servicios que contienen "Camarógrafo":');
    servicios.forEach((servicio) => {
      const seccionNombre =
        servicio.ServicioCategoria?.seccionCategoria?.nombre || "Sin sección";
      const categoriaNombre =
        servicio.ServicioCategoria?.nombre || "Sin categoría";
      console.log(
        `ID: ${servicio.id} | Posición: ${servicio.posicion} | ${seccionNombre} > ${categoriaNombre} > ${servicio.nombre}`
      );
    });

    // Verificar si hay servicios con posición 0 o null
    const serviciosSinPosicion = await prisma.servicio.findMany({
      where: {
        OR: [{ posicion: 0 }, { posicion: null }],
      },
      select: {
        id: true,
        nombre: true,
        posicion: true,
        ServicioCategoria: {
          select: {
            nombre: true,
          },
        },
      },
    });

    console.log(
      `\n⚠️  Servicios sin posición (${serviciosSinPosicion.length} encontrados):`
    );
    serviciosSinPosicion.forEach((servicio) => {
      const categoriaNombre =
        servicio.ServicioCategoria?.nombre || "Sin categoría";
      console.log(
        `ID: ${servicio.id} | Posición: ${servicio.posicion} | ${categoriaNombre} > ${servicio.nombre}`
      );
    });
  } catch (error) {
    console.error("❌ Error al verificar posiciones:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarPosicionesServicios();
