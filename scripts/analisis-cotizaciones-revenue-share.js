// =====================================================================
// ANÁLISIS COTIZACIONES APROBADAS - PROYECCIÓN REVENUE SHARE MODEL
// ProSocial Platform v1.7 - Time to Revenue Strategy
// Fecha: 3 de septiembre de 2025
// =====================================================================

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function analizarCotizacionesAprobadas() {
  try {
    console.log(
      "\n🔍 ANÁLISIS COTIZACIONES APROBADAS - REVENUE SHARE PROJECTION\n"
    );
    console.log("=".repeat(80));

    // ================================================================
    // 1. OBTENER COTIZACIONES APROBADAS
    // ================================================================

    const cotizacionesAprobadas = await prisma.cotizacion.findMany({
      where: {
        status: {
          in: ["aprobada", "confirmada", "aceptada", "pagada"],
        },
        archivada: false,
      },
      include: {
        Evento: {
          include: {
            Cliente: {
              select: {
                nombre: true,
                email: true,
                telefono: true,
              },
            },
            EventoTipo: {
              select: {
                nombre: true,
              },
            },
          },
        },
        Servicio: {
          select: {
            id: true,
            subtotal: true,
            precioUnitario: true,
            cantidad: true,
          },
        },
      },
    });

    console.log(
      `📊 Total Cotizaciones Aprobadas Encontradas: ${cotizacionesAprobadas.length}\n`
    );

    if (cotizacionesAprobadas.length === 0) {
      console.log("⚠️  No se encontraron cotizaciones aprobadas.");
      console.log(
        "💡 Sugerencia: Verificar los status exactos en la base de datos."
      );
      console.log(
        '   Status comunes: "aprobada", "confirmada", "aceptada", "pagada"\n'
      );

      // Mostrar todos los status existentes para referencia
      const todosStatus = await prisma.cotizacion.groupBy({
        by: ["status"],
        _count: {
          status: true,
        },
      });

      console.log("📋 Status de Cotizaciones Existentes:");
      todosStatus.forEach((item) => {
        console.log(`   - ${item.status}: ${item._count.status} cotizaciones`);
      });

      return;
    }

    // ================================================================
    // 2. CÁLCULOS ESTADÍSTICOS
    // ================================================================

    const precios = cotizacionesAprobadas.map((c) => {
      const precioFinal = c.precio - (c.descuento || 0);
      return precioFinal;
    });

    const estadisticas = {
      totalCotizaciones: cotizacionesAprobadas.length,
      ingresosTotales: precios.reduce((sum, precio) => sum + precio, 0),
      ticketPromedio:
        precios.reduce((sum, precio) => sum + precio, 0) / precios.length,
      ticketMinimo: Math.min(...precios),
      ticketMaximo: Math.max(...precios),
      mediana: precios.sort((a, b) => a - b)[Math.floor(precios.length / 2)],
    };

    // Segmentación por rangos de precio
    const segmentacion = {
      bajoCosto: precios.filter((p) => p < 10000).length, // < $10K
      medioCosto: precios.filter((p) => p >= 10000 && p < 50000).length, // $10K-$50K
      altoCosto: precios.filter((p) => p >= 50000 && p < 100000).length, // $50K-$100K
      premium: precios.filter((p) => p >= 100000).length, // > $100K
    };

    // ================================================================
    // 3. PROYECCIONES REVENUE SHARE
    // ================================================================

    const proyecciones = {
      // ESCENARIO 10 ESTUDIOS
      escenario10: {
        ingresosMensuales: estadisticas.ticketPromedio * 10,
        comisionProSocial: estadisticas.ticketPromedio * 10 * 0.3,
        ingresosEstudios: estadisticas.ticketPromedio * 10 * 0.7,
        comisionAnual: estadisticas.ticketPromedio * 10 * 12 * 0.3,
        conPlanBasico: 290 + estadisticas.ticketPromedio * 10 * 0.3, // $29*10 estudios + revenue share
      },

      // ESCENARIO 100 ESTUDIOS
      escenario100: {
        ingresosMensuales: estadisticas.ticketPromedio * 100,
        comisionProSocial: estadisticas.ticketPromedio * 100 * 0.3,
        ingresosEstudios: estadisticas.ticketPromedio * 100 * 0.7,
        comisionAnual: estadisticas.ticketPromedio * 100 * 12 * 0.3,
        conPlanesMixtos:
          70 * 79 + 30 * 199 + estadisticas.ticketPromedio * 100 * 0.3, // Mix de planes + revenue share
      },
    };

    // ================================================================
    // 4. MOSTRAR RESULTADOS
    // ================================================================

    console.log("📈 SITUACIÓN ACTUAL");
    console.log("-".repeat(50));
    console.log(
      `💰 Ingresos Totales Registrados: $${estadisticas.ingresosTotales.toLocaleString("es-MX")}`
    );
    console.log(
      `🎯 Ticket Promedio: $${estadisticas.ticketPromedio.toLocaleString("es-MX")}`
    );
    console.log(
      `📊 Rango de Tickets: $${estadisticas.ticketMinimo.toLocaleString("es-MX")} - $${estadisticas.ticketMaximo.toLocaleString("es-MX")}`
    );
    console.log(`📊 Mediana: $${estadisticas.mediana.toLocaleString("es-MX")}`);

    console.log("\n🎯 DISTRIBUCIÓN POR SEGMENTOS");
    console.log("-".repeat(50));
    console.log(
      `🟢 Bajo Costo (<$10K): ${segmentacion.bajoCosto} eventos (${((segmentacion.bajoCosto / estadisticas.totalCotizaciones) * 100).toFixed(1)}%)`
    );
    console.log(
      `🟡 Costo Medio ($10K-$50K): ${segmentacion.medioCosto} eventos (${((segmentacion.medioCosto / estadisticas.totalCotizaciones) * 100).toFixed(1)}%)`
    );
    console.log(
      `🟠 Alto Costo ($50K-$100K): ${segmentacion.altoCosto} eventos (${((segmentacion.altoCosto / estadisticas.totalCotizaciones) * 100).toFixed(1)}%)`
    );
    console.log(
      `🔴 Premium (>$100K): ${segmentacion.premium} eventos (${((segmentacion.premium / estadisticas.totalCotizaciones) * 100).toFixed(1)}%)`
    );

    console.log("\n🚀 PROYECCIÓN REVENUE SHARE - 10 ESTUDIOS");
    console.log("-".repeat(50));
    console.log(
      `💎 Ingresos Mensuales Totales: $${proyecciones.escenario10.ingresosMensuales.toLocaleString("es-MX")}`
    );
    console.log(
      `💰 Comisión ProSocial (30%): $${proyecciones.escenario10.comisionProSocial.toLocaleString("es-MX")}`
    );
    console.log(
      `🎨 Ingresos para Estudios (70%): $${proyecciones.escenario10.ingresosEstudios.toLocaleString("es-MX")}`
    );
    console.log(
      `📅 Proyección Anual ProSocial: $${proyecciones.escenario10.comisionAnual.toLocaleString("es-MX")}`
    );
    console.log(
      `⭐ Con Plan Básico ($29/mes): $${proyecciones.escenario10.conPlanBasico.toLocaleString("es-MX")} mensuales`
    );

    console.log("\n🎯 PROYECCIÓN REVENUE SHARE - 100 ESTUDIOS");
    console.log("-".repeat(50));
    console.log(
      `💎 Ingresos Mensuales Totales: $${proyecciones.escenario100.ingresosMensuales.toLocaleString("es-MX")}`
    );
    console.log(
      `💰 Comisión ProSocial (30%): $${proyecciones.escenario100.comisionProSocial.toLocaleString("es-MX")}`
    );
    console.log(
      `🎨 Ingresos para Estudios (70%): $${proyecciones.escenario100.ingresosEstudios.toLocaleString("es-MX")}`
    );
    console.log(
      `📅 Proyección Anual ProSocial: $${proyecciones.escenario100.comisionAnual.toLocaleString("es-MX")}`
    );
    console.log(
      `⭐ Con Planes Mixtos: $${proyecciones.escenario100.conPlanesMixtos.toLocaleString("es-MX")} mensuales`
    );

    // ================================================================
    // 5. TOP 10 COTIZACIONES PARA ANÁLISIS
    // ================================================================

    console.log("\n🏆 TOP 10 COTIZACIONES (Mayor Valor)");
    console.log("-".repeat(80));

    const topCotizaciones = cotizacionesAprobadas
      .map((c) => ({
        nombre: c.nombre,
        precioFinal: c.precio - (c.descuento || 0),
        tipoEvento: c.Evento.EventoTipo?.nombre || "N/A",
        cliente: c.Evento.Cliente.nombre,
        comisionProSocial: (c.precio - (c.descuento || 0)) * 0.3,
        ingresoEstudio: (c.precio - (c.descuento || 0)) * 0.7,
      }))
      .sort((a, b) => b.precioFinal - a.precioFinal)
      .slice(0, 10);

    topCotizaciones.forEach((cot, index) => {
      console.log(`${(index + 1).toString().padStart(2)}. ${cot.nombre}`);
      console.log(
        `    💰 Valor: $${cot.precioFinal.toLocaleString("es-MX")} | Tipo: ${cot.tipoEvento}`
      );
      console.log(
        `    🤝 ProSocial (30%): $${cot.comisionProSocial.toLocaleString("es-MX")} | Estudio (70%): $${cot.ingresoEstudio.toLocaleString("es-MX")}`
      );
      console.log(`    👤 Cliente: ${cot.cliente}`);
      console.log("");
    });

    // ================================================================
    // 6. MÉTRICAS CLAVE PARA TIME-TO-REVENUE
    // ================================================================

    console.log("\n⚡ MÉTRICAS TIME-TO-REVENUE STRATEGY");
    console.log("-".repeat(50));

    const metricas = {
      ltvPromedio: estadisticas.ticketPromedio * 2.5, // Asumiendo 2.5 eventos por cliente
      cacObjetivo: estadisticas.ticketPromedio * 0.2, // 20% del ticket promedio
      mrrEscenario10: proyecciones.escenario10.conPlanBasico,
      mrrEscenario100: proyecciones.escenario100.conPlanesMixtos,
      roiProyectado: (proyecciones.escenario100.comisionAnual / 100000) * 100, // ROI sobre inversión de $100K
    };

    console.log(
      `📊 LTV Promedio Estimado: $${metricas.ltvPromedio.toLocaleString("es-MX")}`
    );
    console.log(
      `🎯 CAC Objetivo (20% LTV): $${metricas.cacObjetivo.toLocaleString("es-MX")}`
    );
    console.log(
      `📈 MRR Escenario 10: $${metricas.mrrEscenario10.toLocaleString("es-MX")}`
    );
    console.log(
      `🚀 MRR Escenario 100: $${metricas.mrrEscenario100.toLocaleString("es-MX")}`
    );
    console.log(
      `💎 ROI Proyectado (100 estudios): ${metricas.roiProyectado.toFixed(1)}%`
    );

    console.log("\n✅ PRÓXIMOS PASOS EMV");
    console.log("-".repeat(50));
    console.log(
      "1. 📋 Implementar schema Revenue Share (Studio, Plan, Project)"
    );
    console.log("2. 🔧 Configurar Stripe Connect para revenue splitting");
    console.log("3. 📊 Dashboard de métricas en tiempo real");
    console.log("4. 🎯 Sistema de onboarding para 10 estudios piloto");
    console.log("5. 📈 Tracking de conversión y churn por segmento");

    console.log("\n" + "=".repeat(80));
    console.log("🎉 ANÁLISIS COMPLETADO - Datos listos para EMV Phase 1");
    console.log("=".repeat(80) + "\n");
  } catch (error) {
    console.error("❌ Error en el análisis:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Función para análisis estacional (opcional)
async function analizarTendenciasEstacionales() {
  try {
    console.log("\n📅 ANÁLISIS ESTACIONAL Y TENDENCIAS\n");

    const tendenciasPorMes = await prisma.cotizacion.groupBy({
      by: ["createdAt"],
      where: {
        status: {
          in: ["aprobada", "confirmada", "aceptada", "pagada"],
        },
        archivada: false,
        createdAt: {
          gte: new Date("2024-01-01"),
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        precio: true,
      },
      _avg: {
        precio: true,
      },
    });

    console.log("📊 Tendencias por período:");
    tendenciasPorMes.forEach((periodo) => {
      const fecha = new Date(periodo.createdAt);
      const mes = fecha.toLocaleDateString("es-MX", {
        month: "long",
        year: "numeric",
      });
      console.log(
        `📈 ${mes}: ${periodo._count.id} cotizaciones, $${(periodo._sum.precio || 0).toLocaleString("es-MX")} ingresos`
      );
    });
  } catch (error) {
    console.error("❌ Error en análisis estacional:", error);
  }
}

// Exportar funciones para uso modular
module.exports = {
  analizarCotizacionesAprobadas,
  analizarTendenciasEstacionales,
};

// Ejecutar si es llamado directamente
if (require.main === module) {
  analizarCotizacionesAprobadas()
    .then(() => {
      console.log("🎯 ¿Deseas ver también el análisis estacional? Ejecuta:");
      console.log(
        "   node scripts/analisis-cotizaciones-revenue-share.js --estacional"
      );
    })
    .catch(console.error);

  // Si se pasa --estacional como argumento
  if (process.argv.includes("--estacional")) {
    analizarTendenciasEstacionales();
  }
}
