/**
 * Script para validar cálculos de comisiones
 * Simula el proceso completo: frontend -> API -> BD
 */

function calcularComisionStripe(montoBase, metodoPago) {
  if (metodoPago === "spei") {
    return {
      montoAbonoCliente: montoBase,
      montoCobroStripe: montoBase,
      comisionStripe: 0,
    };
  }

  // Tarjeta: 3.6% + 16% IVA = 4.176% total
  const porcentajeComision = 3.6; // 3.6%
  const porcentajeIVA = 16; // 16%

  const comisionBase = montoBase * (porcentajeComision / 100);
  const iva = comisionBase * (porcentajeIVA / 100);
  const comisionTotal = comisionBase + iva;

  return {
    montoAbonoCliente: montoBase,
    montoCobroStripe: montoBase + comisionTotal,
    comisionStripe: comisionTotal,
    detalles: {
      comisionBase: comisionBase,
      iva: iva,
      porcentajeTotal: ((comisionTotal / montoBase) * 100).toFixed(3) + "%",
    },
  };
}

// 🧪 CASOS DE PRUEBA

console.log("🧪 VALIDANDO CÁLCULOS DE COMISIÓN STRIPE\n");

const casosPrueba = [
  { monto: 1000, metodo: "tarjeta" },
  { monto: 1000, metodo: "spei" },
  { monto: 4946.01, metodo: "tarjeta" },
  { monto: 500.5, metodo: "tarjeta" },
  { monto: 2500, metodo: "spei" },
];

casosPrueba.forEach((caso, index) => {
  console.log(
    `\n📊 CASO ${index + 1}: ${caso.metodo.toUpperCase()} - $${caso.monto}`
  );
  console.log("=".repeat(50));

  const resultado = calcularComisionStripe(caso.monto, caso.metodo);

  console.log(
    `💰 Monto abono cliente:  $${resultado.montoAbonoCliente.toFixed(2)}`
  );
  console.log(
    `💳 Monto cobra Stripe:   $${resultado.montoCobroStripe.toFixed(2)}`
  );
  console.log(
    `🎯 Comisión Stripe:      $${resultado.comisionStripe.toFixed(2)}`
  );

  if (resultado.detalles) {
    console.log(
      `📈 Comisión base (3.6%): $${resultado.detalles.comisionBase.toFixed(2)}`
    );
    console.log(
      `📊 IVA (16%):            $${resultado.detalles.iva.toFixed(2)}`
    );
    console.log(
      `🔢 Porcentaje total:     ${resultado.detalles.porcentajeTotal}`
    );
  }

  // Validar que la suma sea correcta
  const sumaValidacion = resultado.montoAbonoCliente + resultado.comisionStripe;
  const diferencia = Math.abs(sumaValidacion - resultado.montoCobroStripe);

  if (diferencia < 0.01) {
    console.log(`✅ VALIDACIÓN: Suma correcta`);
  } else {
    console.log(
      `❌ ERROR: Suma incorrecta. Diferencia: $${diferencia.toFixed(2)}`
    );
  }
});

console.log("\n🎯 RESUMEN:");
console.log("- SPEI: Sin comisión (empresa absorbe)");
console.log("- Tarjeta: 3.6% + 16% IVA = 4.176% total");
console.log("- Cliente paga: Abono + Comisión");
console.log(
  '- BD registra: Abono real en "monto", comisión en "comisionStripe"'
);
console.log('- Balance cliente: Solo suma "monto" (abonos reales)');
