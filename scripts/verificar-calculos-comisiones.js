/**
 * 🧮 Verificación de Cálculos de Comisiones
 * Análisis detallado de los cálculos presentados por el usuario
 */

console.log("🧮 === VERIFICACIÓN DE CÁLCULOS ===\n");

// 📊 DATOS PROPORCIONADOS POR EL USUARIO
const datosUsuario = {
  totalCotizacion: 34933.68,
  porcentajeAnticipo: 10,
  anticipoCalculado: 3493.37,
  aDiferir: 31440.32,
  anticipoAPagar: 3622.13,
  comisionProcesamiento: 128.76,
  montoPagadoRealCliente: 3476.93,
  comisionMostrada: 145.2,
};

console.log("📋 Datos del flujo del usuario:");
console.log(
  "• Total cotización:",
  datosUsuario.totalCotizacion.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  })
);
console.log(
  "• Anticipo (10%):",
  datosUsuario.anticipoCalculado.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  })
);
console.log(
  "• A diferir:",
  datosUsuario.aDiferir.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  })
);
console.log(
  "• Anticipo a pagar (con comisión):",
  datosUsuario.anticipoAPagar.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  })
);
console.log(
  "• Comisión procesamiento:",
  datosUsuario.comisionProcesamiento.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  })
);
console.log(
  "• Monto pagado real (cliente):",
  datosUsuario.montoPagadoRealCliente.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  })
);
console.log(
  "• Comisión mostrada final:",
  datosUsuario.comisionMostrada.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  })
);

console.log("\n🔍 === VERIFICACIONES ===\n");

// ✅ VERIFICACIÓN 1: Cálculo del anticipo (10%)
console.log("1️⃣ VERIFICACIÓN: Anticipo del 10%");
const anticipoCalculado = datosUsuario.totalCotizacion * 0.1;
const diferenciaAnticipo = Math.abs(
  anticipoCalculado - datosUsuario.anticipoCalculado
);
console.log(`   Calculado: ${anticipoCalculado.toFixed(2)}`);
console.log(`   Mostrado: ${datosUsuario.anticipoCalculado}`);
console.log(`   Diferencia: ${diferenciaAnticipo.toFixed(2)}`);
console.log(`   ✅ ${diferenciaAnticipo < 0.01 ? "CORRECTO" : "INCORRECTO"}`);

// ✅ VERIFICACIÓN 2: Monto a diferir
console.log("\n2️⃣ VERIFICACIÓN: Monto a diferir");
const aDiferirCalculado =
  datosUsuario.totalCotizacion - datosUsuario.anticipoCalculado;
const diferenciaADiferir = Math.abs(aDiferirCalculado - datosUsuario.aDiferir);
console.log(`   Calculado: ${aDiferirCalculado.toFixed(2)}`);
console.log(`   Mostrado: ${datosUsuario.aDiferir}`);
console.log(`   Diferencia: ${diferenciaADiferir.toFixed(2)}`);
console.log(`   ✅ ${diferenciaADiferir < 0.01 ? "CORRECTO" : "INCORRECTO"}`);

// ✅ VERIFICACIÓN 3: Comisión de procesamiento vs Anticipo a pagar
console.log("\n3️⃣ VERIFICACIÓN: Comisión de procesamiento");
const comisionCalculada1 =
  datosUsuario.anticipoAPagar - datosUsuario.anticipoCalculado;
const diferenciaComision1 = Math.abs(
  comisionCalculada1 - datosUsuario.comisionProcesamiento
);
console.log(
  `   Comisión calculada (3622.13 - 3493.37): ${comisionCalculada1.toFixed(2)}`
);
console.log(`   Comisión mostrada: ${datosUsuario.comisionProcesamiento}`);
console.log(`   Diferencia: ${diferenciaComision1.toFixed(2)}`);
console.log(`   ✅ ${diferenciaComision1 < 0.01 ? "CORRECTO" : "INCORRECTO"}`);

// ⚠️ VERIFICACIÓN 4: Discrepancia en el monto final del cliente
console.log("\n4️⃣ VERIFICACIÓN: Monto abonado al cliente");
console.log(
  `   Anticipo calculado: ${datosUsuario.anticipoCalculado.toFixed(2)}`
);
console.log(
  `   Monto pagado mostrado: ${datosUsuario.montoPagadoRealCliente.toFixed(2)}`
);
const diferenciaAbono = Math.abs(
  datosUsuario.anticipoCalculado - datosUsuario.montoPagadoRealCliente
);
console.log(`   Diferencia: ${diferenciaAbono.toFixed(2)}`);
console.log(
  `   ❌ ${diferenciaAbono > 0.01 ? "DISCREPANCIA ENCONTRADA" : "CORRECTO"}`
);

// ⚠️ VERIFICACIÓN 5: Comisión final mostrada
console.log("\n5️⃣ VERIFICACIÓN: Comisión final mostrada");
const comisionReal =
  datosUsuario.anticipoAPagar - datosUsuario.montoPagadoRealCliente;
const diferenciaComisionFinal = Math.abs(
  comisionReal - datosUsuario.comisionMostrada
);
console.log(`   Comisión real (3622.13 - 3476.93): ${comisionReal.toFixed(2)}`);
console.log(`   Comisión mostrada: ${datosUsuario.comisionMostrada}`);
console.log(`   Diferencia: ${diferenciaComisionFinal.toFixed(2)}`);
console.log(
  `   ✅ ${diferenciaComisionFinal < 0.01 ? "CORRECTO" : "INCORRECTO"}`
);

// 🎯 ANÁLISIS DE LA DISCREPANCIA
console.log("\n🎯 === ANÁLISIS DE LA DISCREPANCIA ===\n");

if (diferenciaAbono > 0.01) {
  console.log("⚠️ PROBLEMA IDENTIFICADO:");
  console.log(
    `   • El anticipo del 10% debería ser: $${datosUsuario.anticipoCalculado.toFixed(2)}`
  );
  console.log(
    `   • Pero el cliente pagó: $${datosUsuario.montoPagadoRealCliente.toFixed(2)}`
  );
  console.log(`   • Diferencia: $${diferenciaAbono.toFixed(2)}`);

  const porcentajeReal =
    (datosUsuario.montoPagadoRealCliente / datosUsuario.totalCotizacion) * 100;
  console.log(`   • Porcentaje real pagado: ${porcentajeReal.toFixed(2)}%`);

  console.log("\n🔍 POSIBLES CAUSAS:");
  console.log("   1. Error en el cálculo del 10% en el frontend");
  console.log("   2. Redondeo incorrecto");
  console.log("   3. Aplicación de descuentos no mostrados");
  console.log("   4. Bug en la separación de comisiones");
}

// 💡 VERIFICACIÓN DE CONSISTENCIA TOTAL
console.log("\n💡 === VERIFICACIÓN DE CONSISTENCIA TOTAL ===\n");

const sumaVerificacion =
  datosUsuario.montoPagadoRealCliente + datosUsuario.comisionMostrada;
console.log(`Cliente pagó: ${datosUsuario.montoPagadoRealCliente.toFixed(2)}`);
console.log(`Comisión: ${datosUsuario.comisionMostrada.toFixed(2)}`);
console.log(`Suma total: ${sumaVerificacion.toFixed(2)}`);
console.log(`Anticipo a pagar: ${datosUsuario.anticipoAPagar.toFixed(2)}`);
console.log(
  `Diferencia: ${Math.abs(sumaVerificacion - datosUsuario.anticipoAPagar).toFixed(2)}`
);

if (Math.abs(sumaVerificacion - datosUsuario.anticipoAPagar) < 0.01) {
  console.log("✅ La suma de abono + comisión coincide con el total a pagar");
} else {
  console.log(
    "❌ La suma de abono + comisión NO coincide con el total a pagar"
  );
}

// 🎯 RECOMENDACIONES
console.log("\n🎯 === RECOMENDACIONES ===\n");

if (diferenciaAbono > 0.01) {
  console.log("1. Revisar el cálculo del 10% en el frontend");
  console.log("2. Verificar que el monto base sea exactamente $3,493.37");
  console.log("3. Comprobar si hay redondeos incorrectos");
  console.log("4. Validar la lógica de separación de comisiones en el backend");
} else {
  console.log("✅ Los cálculos son correctos");
  console.log("✅ La separación de comisiones funciona bien");
  console.log("✅ El sistema está calculando todo correctamente");
}
