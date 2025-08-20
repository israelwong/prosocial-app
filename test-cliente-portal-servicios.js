const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testClientePortalServicios() {
  try {
    console.log("🔍 Probando estructura de servicios en Cliente Portal...\n");

    // Simular la misma consulta que hace la API
    const evento = await prisma.evento.findFirst({
      include: {
        Cotizacion: {
          where: {
            status: {
              in: ["aprobada", "enviada"],
            },
          },
          include: {
            Servicio: {
              include: {
                Servicio: {
                  include: {
                    ServicioCategoria: {
                      include: {
                        seccionCategoria: {
                          include: {
                            Seccion: true,
                          },
                        },
                      },
                    },
                  },
                },
                ServicioCategoria: {
                  include: {
                    seccionCategoria: {
                      include: {
                        Seccion: true,
                      },
                    },
                  },
                },
              },
              orderBy: [{ Servicio: { posicion: "asc" } }, { posicion: "asc" }],
            },
            Pago: {
              where: {
                status: "succeeded",
              },
              select: {
                monto: true,
              },
            },
          },
          take: 1,
        },
      },
    });

    if (!evento || !evento.Cotizacion[0]) {
      console.log("❌ No se encontró evento con cotización aprobada/enviada");
      return;
    }

    const cotizacion = evento.Cotizacion[0];
    console.log(`✅ Evento encontrado: ${evento.nombre}`);
    console.log(`📋 Cotización ID: ${cotizacion.id} (${cotizacion.status})`);
    console.log(`🛠️ Servicios: ${cotizacion.Servicio.length}\n`);

    // Mapear servicios igual que en la API
    const servicios = cotizacion.Servicio.map((cotizacionServicio) => {
      const nombreServicio =
        cotizacionServicio.nombre_snapshot &&
        cotizacionServicio.nombre_snapshot !== "Servicio migrado"
          ? cotizacionServicio.nombre_snapshot
          : cotizacionServicio.Servicio?.nombre || "Servicio sin nombre";

      const categoriaNombre =
        cotizacionServicio.categoria_nombre_snapshot ||
        cotizacionServicio.Servicio?.ServicioCategoria?.nombre ||
        cotizacionServicio.ServicioCategoria?.nombre ||
        "Sin categoría";

      const seccionNombre =
        cotizacionServicio.seccion_nombre_snapshot ||
        cotizacionServicio.Servicio?.ServicioCategoria?.seccionCategoria
          ?.Seccion?.nombre ||
        cotizacionServicio.ServicioCategoria?.seccionCategoria?.Seccion
          ?.nombre ||
        "Servicios Generales";

      return {
        id: cotizacionServicio.id,
        nombre: nombreServicio,
        cantidad: cotizacionServicio.cantidad || 1,
        precio_unitario:
          cotizacionServicio.precio_unitario_snapshot ||
          cotizacionServicio.precioUnitario ||
          0,
        subtotal: cotizacionServicio.subtotal || 0,
        seccion: seccionNombre,
        categoria: categoriaNombre,
      };
    });

    console.log("📊 Estructura de servicios mapeados:\n");

    // Agrupar servicios igual que en el componente
    const agrupados = {};

    servicios.forEach((servicio) => {
      const seccion = servicio.seccion || "Servicios Incluidos";
      const categoria = servicio.categoria || "General";

      if (!agrupados[seccion]) {
        agrupados[seccion] = {
          posicion: 1,
          categorias: {},
        };
      }

      if (!agrupados[seccion].categorias[categoria]) {
        agrupados[seccion].categorias[categoria] = {
          posicion: 1,
          servicios: [],
        };
      }

      agrupados[seccion].categorias[categoria].servicios.push(servicio);
    });

    // Mostrar estructura agrupada
    Object.entries(agrupados).forEach(([seccionNombre, seccionData]) => {
      console.log(`📁 ${seccionNombre}`);
      Object.entries(seccionData.categorias).forEach(
        ([categoriaNombre, categoriaData]) => {
          console.log(`  📂 ${categoriaNombre}`);
          categoriaData.servicios.forEach((servicio, index) => {
            console.log(
              `    ${index + 1}. ${servicio.nombre} (Cantidad: ${servicio.cantidad})`
            );
          });
        }
      );
      console.log("");
    });

    console.log(
      "✅ Estructura de servicios anidados funcionando correctamente!"
    );
    console.log(`Total de secciones: ${Object.keys(agrupados).length}`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testClientePortalServicios();
